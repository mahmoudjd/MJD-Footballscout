import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ObjectId } from "mongodb";
import type { AppContext } from "../context/types";
import type { AuthenticatedRequest } from "../shared/auth";
import { hasPremiumAccess } from "../modules/billing/billing-access";

export function createPremiumAccessMiddleware(
  context: AppContext,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthenticatedRequest).user?.userId;
    if (!userId || !ObjectId.isValid(userId)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const user = await context.users.findOne(
        { _id: new ObjectId(userId), isActive: { $ne: false } },
        { projection: { role: 1, billingPlan: 1, subscriptionStatus: 1 } },
      );
      if (!user) {
        res.status(401).json({ error: "Account is deactivated" });
        return;
      }
      if (!hasPremiumAccess(user)) {
        res.status(403).json({
          error: "A Premium subscription is required for this feature",
          code: "PREMIUM_REQUIRED",
        });
        return;
      }
      next();
    } catch {
      res.status(500).json({ error: "Unable to validate Premium access" });
    }
  };
}
