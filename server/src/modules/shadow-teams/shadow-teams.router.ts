import express, {Request, Response} from "express";
import {ZodError} from "zod";
import {AppContext} from "../../context/types";
import {authMiddleware} from "../../middleware/auth-middleware";
import {createFeatureRequestLogger, logFeatureError} from "../../middleware/feature-request-logger";
import {disablePrivateApiCaching} from "../../middleware/private-api-cache";
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

function handleControllerError(error: unknown, req: Request, res: Response, operation: string) {
    if (error instanceof ApiError) {
        logFeatureError("shadow-team", operation, req, error, error.status);
        return res.status(error.status).json({error: error.message});
    }
    if (error instanceof ZodError) {
        logFeatureError("shadow-team", operation, req, error, 400);
        return res.status(400).json({error: "Invalid input", details: error.issues});
    }
    logFeatureError("shadow-team", operation, req, error, 500);
    return res.status(500).json({error: "Internal server error"});
}

export default function createShadowTeamsRouter(context: AppContext) {
    const router = express.Router();
    router.use(disablePrivateApiCaching);
    router.use(createFeatureRequestLogger("shadow-team"));
    router.use(authMiddleware);

    router.get("/", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res.status(200).json(await listShadowTeams(context, userId));
        } catch (error) {
            return handleControllerError(error, req, res, "list");
        }
    });

    router.post("/", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res.status(201).json(await createShadowTeam(context, userId, req.body));
        } catch (error) {
            return handleControllerError(error, req, res, "create");
        }
    });

    router.get("/:id", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res.status(200).json(await getShadowTeam(context, getRouteParam(req.params.id), userId));
        } catch (error) {
            return handleControllerError(error, req, res, "get-detail");
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
            return handleControllerError(error, req, res, "update");
        }
    });

    router.delete("/:id", async (req: Request, res: Response) => {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            await deleteShadowTeam(context, getRouteParam(req.params.id), userId);
            return res.status(204).send();
        } catch (error) {
            return handleControllerError(error, req, res, "delete");
        }
    });

    return router;
}
