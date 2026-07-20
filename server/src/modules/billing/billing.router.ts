import express, { type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import type { AppContext } from "../../context/types";
import { authMiddleware } from "../../middleware/auth-middleware";
import type { AuthenticatedRequest } from "../../shared/auth";
import logger from "../../logger/logger";
import {
  BillingConfigurationError,
  createCheckoutSession,
  createPortalSession,
  publicBillingStatus,
} from "./billing.service";

async function currentUser(context: AppContext, req: Request) {
  const userId = (req as AuthenticatedRequest).user?.userId;
  if (!userId || !ObjectId.isValid(userId)) return null;
  return context.users.findOne({ _id: new ObjectId(userId), isActive: { $ne: false } });
}

function billingFailure(error: unknown, res: Response) {
  if (error instanceof Error && error.message === "PREMIUM_DISABLED") {
    return res.status(503).json({
      error: "Premium subscriptions are currently disabled",
      code: error.message,
    });
  }
  if (error instanceof BillingConfigurationError) {
    return res.status(503).json({ error: error.message, code: "BILLING_NOT_CONFIGURED" });
  }
  if (error instanceof Error && error.message === "PREMIUM_ALREADY_ACTIVE") {
    return res.status(409).json({ error: "Premium is already active", code: error.message });
  }
  if (error instanceof Error && error.message === "STRIPE_CUSTOMER_MISSING") {
    return res.status(409).json({ error: "No billing account is available", code: error.message });
  }
  logger.error("Billing route failed:", error);
  return res.status(500).json({ error: "Billing request failed" });
}

export default function createBillingRouter(context: AppContext) {
  const router = express.Router();
  router.use(authMiddleware);

  router.get("/status", async (req, res) => {
    const user = await currentUser(context, req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    return res.json(publicBillingStatus(user));
  });

  router.post("/checkout", async (req, res) => {
    try {
      const user = await currentUser(context, req);
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      return res.json({ url: await createCheckoutSession(context, user) });
    } catch (error) {
      return billingFailure(error, res);
    }
  });

  router.post("/portal", async (req, res) => {
    try {
      const user = await currentUser(context, req);
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      return res.json({ url: await createPortalSession(context, user) });
    } catch (error) {
      return billingFailure(error, res);
    }
  });

  return router;
}
