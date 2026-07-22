import type {Request} from "express";
import type {AuthenticatedRequest} from "./auth";

export function getAuthenticatedUserId(req: Request) {
    return (req as AuthenticatedRequest).user?.userId || null;
}

export function getRouteParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] || "" : value || "";
}
