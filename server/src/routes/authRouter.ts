import express, {Request, Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import {z} from "zod";
import {ObjectId} from "mongodb";

import {createGoogleUser, createUser, findUserByEmail} from "../controllers/authController";
import logger from "../logger/logger";
import {AppContext} from "../models/context";
import {
    UserLoginInput, UserLoginInputSchema,
    UserRegisterInput, UserRegisterInputSchema ,
    UserGoogleLoginInput, UserGoogleLoginInputSchema,

} from "../models/user";
import {UserRole} from "../models/auth";


export default function createAuthRouter(context: AppContext) {
    const router = express.Router();
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is missing in environment");
    }
    const GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_ID || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const GoogleTokenInfoSchema = z.object({
        aud: z.string().min(1),
        sub: z.string().min(1),
        email: z.string().email(),
        email_verified: z.union([z.boolean(), z.string()]),
        name: z.string().optional(),
    });

    const isEmailVerified = (value: boolean | string) => value === true || value === "true";

    const verifyGoogleIdToken = async (idToken: string) => {
        const response = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
            params: {id_token: idToken},
            timeout: 5000,
        });
        const payload = GoogleTokenInfoSchema.parse(response.data);
        if (!isEmailVerified(payload.email_verified)) {
            throw new Error("Google token email is not verified");
        }
        if (GOOGLE_CLIENT_IDS.length > 0 && !GOOGLE_CLIENT_IDS.includes(payload.aud)) {
            throw new Error("Google token audience mismatch");
        }
        return {
            email: payload.email,
            name: payload.name?.trim() || payload.email.split("@")[0],
            googleId: payload.sub,
        };
    };

    const generateTokens = (user: { _id: string; email: string; role: UserRole }) => {
        const accessToken = jwt.sign(
            {userId: user._id, email: user.email, role: user.role, tokenType: "access"},
            JWT_SECRET,
            {expiresIn: "1h"}
        );
        const refreshToken = jwt.sign(
            {userId: user._id, role: user.role, tokenType: "refresh"},
            JWT_SECRET,
            {expiresIn: "7d"}
        );
        return {accessToken, refreshToken};
    };

    router.post("/register", async (req: Request, res: Response): Promise<any> => {
        try {
            const input: UserRegisterInput = UserRegisterInputSchema.parse(req.body);
            const user = await createUser(context, input);

            const userRole = user.role || "user";
            const tokens = generateTokens({_id: user._id!.toString(), email: user.email, role: userRole});

            return res.status(201).json({
                ...tokens,
                name: user.name,
                email: user.email,
                id: user._id,
                role: userRole,
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({error: "Invalid input", details: err.errors});
            }
            if (err instanceof Error && err.message === "User already exists") {
                return res.status(409).json({error: "This email already has an account. Please log in."});
            }
            logger.error("Registration failed", err);
            return res.status(500).json({error: "Registration failed"});
        }
    });

    router.post("/login", async (req: Request, res: Response): Promise<any> => {
        try {
            const input: UserLoginInput = UserLoginInputSchema.parse(req.body);
            const user = await findUserByEmail(context, input.email);

            if (!user) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            if (!user.password) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            const validPassword = await bcrypt.compare(input.password, user.password);
            if (!validPassword) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            const userRole = user.role || "user";
            const tokens = generateTokens({_id: user._id!.toString(), email: user.email, role: userRole});

            return res.status(200).json({
                ...tokens,
                name: user.name,
                email: user.email,
                id: user._id,
                role: userRole,
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({error: "Invalid input", details: err.errors});
            }
            logger.error("Login failed", err);
            return res.status(500).json({error: "Login failed"});
        }
    });

    router.post("/google-login", async (req: Request, res: Response): Promise<any> => {
        try {
            if (GOOGLE_CLIENT_IDS.length === 0) {
                logger.error("GOOGLE_CLIENT_ID is missing. Google login is disabled.");
                return res.status(503).json({error: "Google login is not configured"});
            }

            const input: UserGoogleLoginInput = UserGoogleLoginInputSchema.parse(req.body);
            const verifiedGoogleUser = await verifyGoogleIdToken(input.idToken);

            let user = await context.users.findOne({googleId: verifiedGoogleUser.googleId});
            if (!user) {
                const userByEmail = await context.users.findOne({email: verifiedGoogleUser.email});
                if (userByEmail) {
                    if (userByEmail.authProvider !== "google" && userByEmail.password) {
                        return res.status(409).json({
                            error: "Account already exists with email/password. Please login with credentials.",
                        });
                    }

                    user = await context.users.findOneAndUpdate(
                        {_id: userByEmail._id},
                        {
                            $set: {
                                googleId: verifiedGoogleUser.googleId,
                                authProvider: "google",
                                name: userByEmail.name || verifiedGoogleUser.name,
                            },
                        },
                        {returnDocument: "after"},
                    );
                } else {
                    user = await createGoogleUser(context, verifiedGoogleUser);
                }
            }

            if (!user) {
                return res.status(500).json({error: "Unable to complete Google login"});
            }

            const userRole = user.role || "user";
            const tokens = generateTokens({
                _id: user._id!.toString(),
                email: user.email,
                role: userRole,
            });

            return res.status(200).json({
                ...tokens,
                name: user.name,
                email: user.email,
                id: user._id,
                role: userRole,
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({error: "Invalid input", details: err.errors});
            }
            if (err instanceof Error && err.message === "User already exists") {
                return res.status(409).json({error: err.message});
            }
            if (err instanceof Error && err.message.includes("Google token")) {
                return res.status(401).json({error: err.message});
            }
            if (axios.isAxiosError(err)) {
                return res.status(401).json({error: "Invalid Google token"});
            }

            logger.error("Google login failed", err);
            return res.status(500).json({error: "Google login failed"});
        }
    });


    router.post("/refresh", async (req: Request, res: Response): Promise<any> => {
        const {refreshToken} = req.body;
        if (!refreshToken) {
            return res.status(400).json({error: "Refresh token required"});
        }

        try {
            const payload = jwt.verify(refreshToken, JWT_SECRET) as { userId?: string; tokenType?: string };
            if (!payload.userId || payload.tokenType !== "refresh") {
                return res.status(401).json({error: "Invalid token payload"});
            }
            if (!ObjectId.isValid(payload.userId)) {
                return res.status(401).json({error: "Invalid token payload"});
            }

            const user = await context.users.findOne({_id: new ObjectId(payload.userId)});
            if (!user) {
                return res.status(401).json({error: "User not found"});
            }

            logger.info("[REFRESH TOKEN] Refresh token", user.email);

            const userRole = user.role || "user";
            const accessToken = jwt.sign(
                {userId: user._id.toString(), email: user.email, role: userRole, tokenType: "access"},
                JWT_SECRET,
                {expiresIn: "1h"}
            );

            return res.status(200).json({
                accessToken,
                refreshToken,
                role: userRole,
            });
        } catch (err) {
            logger.error("Refresh token error", err);
            return res.status(401).json({error: "Invalid or expired refresh token"});
        }
    });

    return router;
}
