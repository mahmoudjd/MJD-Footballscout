import {NextFunction, Request, RequestHandler, Response} from "express";
import {ObjectId} from "mongodb";
import {AppContext} from "../models/context";
import {AuthenticatedRequest, UserRole} from "../models/auth";
import logger from "../logger/logger";

function getUserId(req: Request) {
    return (req as AuthenticatedRequest).user?.userId || null;
}

export function requireRole(context: AppContext, allowedRoles: UserRole[]): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = getUserId(req);
            if (!userId || !ObjectId.isValid(userId)) {
                return res.status(401).json({error: "Unauthorized"});
            }

            const user = await context.users.findOne(
                {_id: new ObjectId(userId)},
                {projection: {role: 1}},
            );
            if (!user) {
                return res.status(401).json({error: "Unauthorized"});
            }

            const role = user.role || "user";
            if (!allowedRoles.includes(role)) {
                return res.status(403).json({error: "Forbidden"});
            }

            return next();
        } catch (error) {
            logger.error("Role check failed:", error);
            return res.status(500).json({error: "Internal server error"});
        }
    };
}
