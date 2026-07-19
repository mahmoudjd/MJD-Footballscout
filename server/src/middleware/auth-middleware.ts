import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, AuthTokenPayload } from "../shared/auth";
import { AppContext } from "../context/types";
import { ObjectId } from "mongodb";

export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Token missing" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ error: "JWT secret is not configured" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
    if (!decoded?.userId || typeof decoded.userId !== "string") {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }
    if (decoded.tokenType !== "access") {
      res.status(401).json({ error: "Invalid token type" });
      return;
    }
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

export const createActiveAuthMiddleware = (
  context: AppContext,
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    authMiddleware(req, res, async () => {
      const authenticatedRequest = req as AuthenticatedRequest;
      const userId = authenticatedRequest.user?.userId;
      if (!userId || !ObjectId.isValid(userId)) {
        res.status(401).json({ error: "Invalid token payload" });
        return;
      }

      try {
        const user = await context.users.findOne(
          { _id: new ObjectId(userId) },
          { projection: { isActive: 1, authVersion: 1 } },
        );
        if (!user || user.isActive === false) {
          res.status(401).json({ error: "Account is deactivated" });
          return;
        }

        const tokenVersion = authenticatedRequest.user?.authVersion ?? 0;
        const userVersion = user.authVersion ?? 0;
        if (tokenVersion !== userVersion) {
          res.status(401).json({ error: "Session is no longer valid" });
          return;
        }

        next();
      } catch {
        res.status(500).json({ error: "Unable to validate account" });
      }
    });
  };
};
