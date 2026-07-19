import express, { Request, Response } from "express";
import { ZodError } from "zod";
import { AppContext } from "../../context/types";
import { authMiddleware } from "../../middleware/auth-middleware";
import {
  createFeatureRequestLogger,
  logFeatureError,
} from "../../middleware/feature-request-logger";
import { createPremiumAccessMiddleware } from "../../middleware/premium-middleware";
import { AuthenticatedRequest } from "../../shared/auth";
import { ApiError } from "../players/scouting.controller";
import {
  createRecruitmentCandidate,
  deleteRecruitmentCandidate,
  getRecruitmentWorkspace,
  listRecruitmentCandidates,
  updateRecruitmentCandidate,
  updateRecruitmentWorkspace,
} from "./recruitment.controller";

function userId(req: Request) {
  return (req as AuthenticatedRequest).user?.userId || "";
}

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function fail(
  error: unknown,
  req: Request,
  res: Response,
  operation: string,
) {
  if (error instanceof ApiError) {
    logFeatureError("recruitment", operation, req, error, error.status);
    return res.status(error.status).json({ error: error.message });
  }
  if (error instanceof ZodError) {
    logFeatureError("recruitment", operation, req, error, 400);
    return res
      .status(400)
      .json({ error: "Invalid input", details: error.issues });
  }
  logFeatureError("recruitment", operation, req, error, 500);
  return res.status(500).json({ error: "Internal server error" });
}

export default function createRecruitmentRouter(context: AppContext) {
  const router = express.Router();
  router.use(createFeatureRequestLogger("recruitment"));
  router.use(authMiddleware);
  router.use(createPremiumAccessMiddleware(context, "recruitment"));

  router.get("/candidates", async (req, res) => {
    try {
      return res.json(await listRecruitmentCandidates(context, userId(req)));
    } catch (error) {
      return fail(error, req, res, "list-candidates");
    }
  });
  router.get("/workspace", async (req, res) => {
    try {
      return res.json(await getRecruitmentWorkspace(context, userId(req)));
    } catch (error) {
      return fail(error, req, res, "get-workspace");
    }
  });
  router.put("/workspace", async (req, res) => {
    try {
      return res.json(
        await updateRecruitmentWorkspace(context, userId(req), req.body),
      );
    } catch (error) {
      return fail(error, req, res, "update-workspace");
    }
  });
  router.post("/candidates", async (req, res) => {
    try {
      return res
        .status(201)
        .json(await createRecruitmentCandidate(context, userId(req), req.body));
    } catch (error) {
      return fail(error, req, res, "create-candidate");
    }
  });
  router.put("/candidates/:id", async (req, res) => {
    try {
      return res.json(
        await updateRecruitmentCandidate(
          context,
          param(req.params.id),
          userId(req),
          req.body,
        ),
      );
    } catch (error) {
      return fail(error, req, res, "update-candidate");
    }
  });
  router.delete("/candidates/:id", async (req, res) => {
    try {
      await deleteRecruitmentCandidate(
        context,
        param(req.params.id),
        userId(req),
      );
      return res.status(204).send();
    } catch (error) {
      return fail(error, req, res, "delete-candidate");
    }
  });

  return router;
}
