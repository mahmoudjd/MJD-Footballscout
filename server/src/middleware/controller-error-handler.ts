import type {Request, Response} from "express";
import {ZodError} from "zod";
import {ApiError} from "./customErrors";
import {logFeatureError} from "./feature-request-logger";

export function handleControllerError(
    feature: string,
    operation: string,
    error: unknown,
    req: Request,
    res: Response,
) {
    if (error instanceof ApiError) {
        logFeatureError(feature, operation, req, error, error.status);
        return res.status(error.status).json({error: error.message});
    }

    if (error instanceof ZodError) {
        logFeatureError(feature, operation, req, error, 400);
        return res.status(400).json({error: "Invalid input", details: error.issues});
    }

    logFeatureError(feature, operation, req, error, 500);
    return res.status(500).json({error: "Internal server error"});
}
