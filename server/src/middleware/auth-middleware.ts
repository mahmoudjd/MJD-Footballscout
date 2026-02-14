import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import {AuthenticatedRequest, AuthTokenPayload} from "../models/auth";

export const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Token missing" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload;
        if (!decoded?.userId || typeof decoded.userId !== "string") {
            res.status(401).json({error: "Invalid token payload"});
            return;
        }
        if (decoded.tokenType !== "access") {
            res.status(401).json({error: "Invalid token type"});
            return;
        }
        (req as AuthenticatedRequest).user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
        return;
    }
};
