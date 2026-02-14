import {Request} from "express";
import {JwtPayload} from "jsonwebtoken";

export type UserRole = "admin" | "user";
export type AuthTokenType = "access" | "refresh";

export interface AuthTokenPayload extends JwtPayload {
    userId: string;
    email?: string;
    role?: UserRole;
    tokenType?: AuthTokenType;
}

export type AuthenticatedRequest = Request & {
    user?: AuthTokenPayload;
};
