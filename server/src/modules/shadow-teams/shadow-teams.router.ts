import express, {Request, Response} from "express";
import {ZodError} from "zod";
import {AppContext} from "../../context/types";
import logger from "../../logger/logger";
import {authMiddleware} from "../../middleware/auth-middleware";
import {AuthenticatedRequest} from "../../shared/auth";
import {ApiError} from "../players/scouting.controller";
import {
    createShadowTeam,
    deleteShadowTeam,
    getShadowTeam,
    listShadowTeams,
    updateShadowTeam,
} from "./shadow-teams.controller";

function getUserId(req: Request) {
    return (req as AuthenticatedRequest).user?.userId || null;
}

function getRouteParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] || "" : value || "";
}

function handleControllerError(error: unknown, res: Response) {
    if (error instanceof ApiError) {
        return res.status(error.status).json({error: error.message});
    }
    if (error instanceof ZodError) {
        return res.status(400).json({error: "Invalid input", details: error.issues});
    }
    logger.error("Shadow team route failed:", error);
    return res.status(500).json({error: "Internal server error"});
}

export default function createShadowTeamsRouter(context: AppContext) {
    const router = express.Router();
    router.use(authMiddleware);

    router.get("/", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res.status(200).json(await listShadowTeams(context, userId));
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.post("/", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res.status(201).json(await createShadowTeam(context, userId, req.body));
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.get("/:id", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res.status(200).json(await getShadowTeam(context, getRouteParam(req.params.id), userId));
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.put("/:id", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res
                .status(200)
                .json(await updateShadowTeam(context, getRouteParam(req.params.id), userId, req.body));
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    router.delete("/:id", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            await deleteShadowTeam(context, getRouteParam(req.params.id), userId);
            return res.status(204).send();
        } catch (error) {
            return handleControllerError(error, res);
        }
    });

    return router;
}
