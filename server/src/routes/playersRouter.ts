import express, {Request, Response} from "express";
import {
    createPlayer, deletePlayerById,
    getPlayerById,
    getPlayersHighlights,
    getPlayers,
    getPlayersStats,
    searchPlayers, updateAllPlayers,
    updatePlayerFromWebSites
} from "../controllers/playerController";
import {AppContext} from "../models/context";
import logger from "../logger/logger";
import {authMiddleware} from "../middleware/auth-middleware";
import {comparePlayers, getAdvancedPlayers} from "../controllers/playerQueryController";
import {
    ApiError,
    deleteScoutingReport,
    getPlayerHistory,
    getPlayerReports,
    updateScoutingReport,
    upsertPlayerReport,
} from "../controllers/scoutingController";
import {ZodError} from "zod";
import {AuthenticatedRequest} from "../models/auth";
import {requireRole} from "../middleware/role-middleware";

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
    logger.error("Request failed: ", error);
    return res.status(500).json({error: "Internal server error"});
}

const createPlayersRouter = (context: AppContext) => {
    const router = express.Router();

    router.get("/players", async (req: Request, res: Response) => {
        try {
            const players = await getPlayers(context);
            res.status(200).json(players);
        } catch (error) {
            logger.error("Failed to get players: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.get("/players/stats", async (_req: Request, res: Response) => {
        try {
            const stats = await getPlayersStats(context);
            res.status(200).json(stats);
        } catch (error) {
            logger.error("Failed to get players stats: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.get("/players/highlights", async (_req: Request, res: Response) => {
        try {
            const highlights = await getPlayersHighlights(context);
            res.status(200).json(highlights);
        } catch (error) {
            logger.error("Failed to get players highlights: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.get("/players/advanced", async (req: Request, res: Response) => {
        try {
            const result = await getAdvancedPlayers(context, req.query as Record<string, unknown>);
            return res.status(200).json(result);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.get("/players/compare", authMiddleware, async (req: Request, res: Response) => {
        try {
            const comparison = await comparePlayers(context, req.query as Record<string, unknown>);
            return res.status(200).json(comparison);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.post("/players/compare", authMiddleware, async (req: Request, res: Response) => {
        try {
            const comparison = await comparePlayers(context, req.body as Record<string, unknown>);
            return res.status(200).json(comparison);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    // Authentifizierte Routen
    router.post("/players", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const {data} = req.body;
        try {
            const player = await createPlayer(context, data);
            return res.status(200).json(player);
        } catch (error) {
            logger.error("Failed to save player: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.get("/players/:id/history", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        try {
            const history = await getPlayerHistory(context, req.params.id, req.query as Record<string, unknown>);
            return res.status(200).json(history);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.get("/players/:id", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const playerId = req.params.id;
        try {
            const player = await getPlayerById(context, playerId);
            if (!player) return res.status(404).json("not found player");
            return res.status(200).json(player);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.get("/players/:id/reports", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        try {
            const reports = await getPlayerReports(context, req.params.id);
            return res.status(200).json(reports);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.post("/players/:id/reports", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        try {
            const report = await upsertPlayerReport(context, req.params.id, userId, req.body);
            return res.status(201).json(report);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.put("/reports/:reportId", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        try {
            const report = await updateScoutingReport(context, req.params.reportId, userId, req.body);
            return res.status(200).json(report);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.delete("/reports/:reportId", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        try {
            await deleteScoutingReport(context, req.params.reportId, userId);
            return res.status(204).send();
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.put("/players/:id", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const playerId = req.params.id;
        try {
            const player = await updatePlayerFromWebSites(context, playerId);
            if (!player) return res.status(404).json("not found player");
            return res.status(202).json(player);
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.post("/search", async (req: Request, res: Response): Promise<any> => {
        const {name} = req.body;
        try {
            if (!name || typeof name !== "string") {
                return res.status(400).json({error: "Invalid name parameter"});
            }

            const foundedPlayers = await searchPlayers(context, name);
            res.status(200).json(foundedPlayers);
        } catch (error) {
            logger.error("Search Failed with error: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.delete("/players/:id", authMiddleware, requireRole(context, ["admin"]), async (req: Request, res: Response): Promise<any> => {
        const playerId = req.params.id;
        try {
            const player = await deletePlayerById(context, playerId);
            if (!player) return res.status(404).json("not found player");
            return res.status(204).send();
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.put("/update-players", authMiddleware, requireRole(context, ["admin"]), async (_req: Request, res: Response) => {
        try {
            const updatedPlayers = await updateAllPlayers(context);
            res.status(200).json({
                message: `Successfully updated ${updatedPlayers.length} players`,
                players: updatedPlayers,
            });
        } catch (error) {
            logger.error("Failed to update all players: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    return router;
};

export default createPlayersRouter;
