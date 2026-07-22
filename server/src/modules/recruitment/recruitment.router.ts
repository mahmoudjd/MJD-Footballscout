import express, { Request, Response } from "express";
import { AppContext } from "../../context/types";
import { createActiveAuthMiddleware } from "../../middleware/auth-middleware";
import { handleControllerError } from "../../middleware/controller-error-handler";
import { createFeatureRequestLogger } from "../../middleware/feature-request-logger";
import { disablePrivateApiCaching } from "../../middleware/private-api-cache";
import { getAuthenticatedUserId, getRouteParam } from "../../shared/http";
import {
  createRecruitmentCandidate,
  deleteRecruitmentCandidate,
  getRecruitmentWorkspace,
  listRecruitmentCandidates,
  updateRecruitmentCandidate,
  updateRecruitmentWorkspace,
} from "./recruitment.controller";

export default function createRecruitmentRouter(context: AppContext) {
  const router = express.Router();
  router.use(disablePrivateApiCaching);
  router.use(createFeatureRequestLogger("recruitment"));
  router.use(createActiveAuthMiddleware(context));

  router.get("/candidates", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      return res.json(await listRecruitmentCandidates(context, userId));
    } catch (error) {
      return handleControllerError(
        "recruitment",
        "list-candidates",
        error,
        req,
        res,
      );
    }
  });

  router.get("/workspace", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      return res.json(await getRecruitmentWorkspace(context, userId));
    } catch (error) {
      return handleControllerError("recruitment", "get-workspace", error, req, res);
    }
  });

  router.put("/workspace", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      return res.json(
        await updateRecruitmentWorkspace(context, userId, req.body),
      );
    } catch (error) {
      return handleControllerError(
        "recruitment",
        "update-workspace",
        error,
        req,
        res,
      );
    }
  });

  router.post("/candidates", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      return res
        .status(201)
        .json(await createRecruitmentCandidate(context, userId, req.body));
    } catch (error) {
      return handleControllerError(
        "recruitment",
        "create-candidate",
        error,
        req,
        res,
      );
    }
  });

  router.put("/candidates/:id", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      return res.json(
        await updateRecruitmentCandidate(
          context,
          getRouteParam(req.params.id),
          userId,
          req.body,
        ),
      );
    } catch (error) {
      return handleControllerError(
        "recruitment",
        "update-candidate",
        error,
        req,
        res,
      );
    }
  });

  router.delete("/candidates/:id", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      await deleteRecruitmentCandidate(
        context,
        getRouteParam(req.params.id),
        userId,
      );
      return res.status(204).send();
    } catch (error) {
      return handleControllerError(
        "recruitment",
        "delete-candidate",
        error,
        req,
        res,
      );
    }
  });

  return router;
}
