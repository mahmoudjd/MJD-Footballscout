import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ObjectId } from "mongodb";
import type { AppContext } from "../context/types";
import type { AuthenticatedRequest } from "../shared/auth";
import { hasPremiumAccess } from "../modules/billing/billing-access";
import logger from "../logger/logger";

export function createPremiumAccessMiddleware(
  context: AppContext,
  feature = "premium-feature",
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
        logger.warn(
          `[${feature}] Premium access denied ${JSON.stringify({
            requestId: res.locals.requestId || "unknown",
            method: req.method,
            path: `${req.baseUrl}${req.path}`,
            userId,
          })}`,
        );
        res.status(403).json({
          error: "A Premium subscription is required for this feature",
          code: "PREMIUM_REQUIRED",
        });
        return;
      }
      next();
    } catch (error) {
      logger.error(
        `[${feature}] Premium access validation failed ${JSON.stringify({
          requestId: res.locals.requestId || "unknown",
          method: req.method,
          path: `${req.baseUrl}${req.path}`,
          userId,
          error:
            error instanceof Error
              ? { name: error.name, message: error.message, stack: error.stack }
              : { message: String(error) },
        })}`,
      );
      res.status(500).json({ error: "Unable to validate Premium access" });
    }
  };
}
