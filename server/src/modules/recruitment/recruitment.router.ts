import express, { Request, Response } from "express";
import { ZodError } from "zod";
import { AppContext } from "../../context/types";
import logger from "../../logger/logger";
import { authMiddleware } from "../../middleware/auth-middleware";
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

function fail(error: unknown, res: Response) {
  if (error instanceof ApiError)
    return res.status(error.status).json({ error: error.message });
  if (error instanceof ZodError)
    return res
      .status(400)
      .json({ error: "Invalid input", details: error.issues });
  logger.error("Recruitment route failed:", error);
  return res.status(500).json({ error: "Internal server error" });
}

export default function createRecruitmentRouter(context: AppContext) {
  const router = express.Router();
  router.use(authMiddleware);
  router.use(createPremiumAccessMiddleware(context));

  router.get("/candidates", async (req, res) => {
    try {
      return res.json(await listRecruitmentCandidates(context, userId(req)));
    } catch (error) {
      return fail(error, res);
    }
  });
  router.get("/workspace", async (req, res) => {
    try {
      return res.json(await getRecruitmentWorkspace(context, userId(req)));
    } catch (error) {
      return fail(error, res);
    }
  });
  router.put("/workspace", async (req, res) => {
    try {
      return res.json(
        await updateRecruitmentWorkspace(context, userId(req), req.body),
      );
    } catch (error) {
      return fail(error, res);
    }
  });
  router.post("/candidates", async (req, res) => {
    try {
      return res
        .status(201)
        .json(await createRecruitmentCandidate(context, userId(req), req.body));
    } catch (error) {
      return fail(error, res);
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
      return fail(error, res);
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
      return fail(error, res);
    }
  });

  return router;
}
