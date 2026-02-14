import express, {Request, Response} from "express";
import {ZodError} from "zod";
import {AppContext} from "../models/context";
import {authMiddleware} from "../middleware/auth-middleware";
import logger from "../logger/logger";
import {
    addPlayerToWatchlist,
    createWatchlist,
    deleteWatchlist,
    getWatchlist,
    listWatchlists,
    removePlayerFromWatchlist,
    reorderWatchlistPlayers,
    updateWatchlist,
} from "../controllers/watchlistController";
import {ApiError} from "../controllers/scoutingController";

type AuthenticatedRequest = Request & {
    user?: {
        userId?: string;
        email?: string;
    };
};

function getUserId(req: Request) {
    return (req as AuthenticatedRequest).user?.userId || null;
}

function handleControllerError(error: unknown, res: Response) {
    if (error instanceof ApiError) {
        return res.status(error.status).json({error: error.message});
    }
    if (error instanceof ZodError) {
        return res.status(400).json({error: "Invalid input", details: error.issues});
    }
    logger.error("Watchlist route failed:", error);
    return res.status(500).json({error: "Internal server error"});
}

export default function createWatchlistsRouter(context: AppContext) {
    const router = express.Router();
    router.use(authMiddleware);

    router.get("/", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            const watchlists = await listWatchlists(context, userId);
            return res.status(200).json(watchlists);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.post("/", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            const watchlist = await createWatchlist(context, userId, req.body);
            return res.status(201).json(watchlist);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.get("/:id", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            const watchlist = await getWatchlist(context, req.params.id, userId);
            return res.status(200).json(watchlist);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.put("/:id", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            const watchlist = await updateWatchlist(context, req.params.id, userId, req.body);
            return res.status(200).json(watchlist);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.delete("/:id", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            await deleteWatchlist(context, req.params.id, userId);
            return res.status(204).send();
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.post("/:id/players", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            const watchlist = await addPlayerToWatchlist(context, req.params.id, userId, req.body);
            return res.status(200).json(watchlist);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.delete("/:id/players/:playerId", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            const watchlist = await removePlayerFromWatchlist(context, req.params.id, userId, req.params.playerId);
            return res.status(200).json(watchlist);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.put("/:id/players/reorder", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            const watchlist = await reorderWatchlistPlayers(context, req.params.id, userId, req.body);
            return res.status(200).json(watchlist);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    return router;
}
