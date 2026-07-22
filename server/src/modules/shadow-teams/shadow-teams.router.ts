import express, {Request, Response} from "express";
import {AppContext} from "../../context/types";
import {createActiveAuthMiddleware} from "../../middleware/auth-middleware";
import {handleControllerError} from "../../middleware/controller-error-handler";
import {createFeatureRequestLogger} from "../../middleware/feature-request-logger";
import {disablePrivateApiCaching} from "../../middleware/private-api-cache";
import {getAuthenticatedUserId, getRouteParam} from "../../shared/http";
import {
    createShadowTeam,
    deleteShadowTeam,
    getShadowTeam,
    listShadowTeams,
    updateShadowTeam,
} from "./shadow-teams.controller";

export default function createShadowTeamsRouter(context: AppContext) {
    const router = express.Router();
    router.use(disablePrivateApiCaching);
    router.use(createFeatureRequestLogger("shadow-team"));
    router.use(createActiveAuthMiddleware(context));

    router.get("/", async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res.status(200).json(await listShadowTeams(context, userId));
        } catch (error) {
            return handleControllerError("shadow-team", "list", error, req, res);
        }
    });

    router.post("/", async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res.status(201).json(await createShadowTeam(context, userId, req.body));
        } catch (error) {
            return handleControllerError("shadow-team", "create", error, req, res);
        }
    });

    router.get("/:id", async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res.status(200).json(await getShadowTeam(context, getRouteParam(req.params.id), userId));
        } catch (error) {
            return handleControllerError("shadow-team", "get-detail", error, req, res);
        }
    });

    router.put("/:id", async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            return res
                .status(200)
                .json(await updateShadowTeam(context, getRouteParam(req.params.id), userId, req.body));
        } catch (error) {
            return handleControllerError("shadow-team", "update", error, req, res);
        }
    });

    router.delete("/:id", async (req: Request, res: Response) => {
        const userId = getAuthenticatedUserId(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});
        try {
            await deleteShadowTeam(context, getRouteParam(req.params.id), userId);
            return res.status(204).send();
        } catch (error) {
            return handleControllerError("shadow-team", "delete", error, req, res);
        }
    });

    return router;
}
