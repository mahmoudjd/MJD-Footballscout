import express, {Request, Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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


export default function createAuthRouter(context: AppContext) {
    const router = express.Router();
    const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

    const generateTokens = (user: { _id: string; email: string }) => {
        const accessToken = jwt.sign(
            {userId: user._id, email: user.email},
            JWT_SECRET,
            {expiresIn: "1h"}
        );
        const refreshToken = jwt.sign(
            {userId: user._id},
            JWT_SECRET,
            {expiresIn: "7d"}
        );
        return {accessToken, refreshToken};
    };

    router.post("/register", async (req: Request, res: Response): Promise<any> => {
        try {
            const input: UserRegisterInput = UserRegisterInputSchema.parse(req.body);
            const user = await createUser(context, input);

            const tokens = generateTokens({_id: user._id!.toString(), email: user.email});

            return res.status(201).json({
                ...tokens,
                name: user.name,
                email: user.email,
                id: user._id,
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({error: "Invalid input", details: err.errors});
            }
            if (err instanceof Error && err.message === "User already exists") {
                return res.status(409).json({error: err.message});
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

            const validPassword = await bcrypt.compare(input.password, user.password);
            if (!validPassword) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            const tokens = generateTokens({_id: user._id!.toString(), email: user.email});

            return res.status(200).json({
                ...tokens,
                name: user.name,
                email: user.email,
                id: user._id,
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
            const input: UserGoogleLoginInput = UserGoogleLoginInputSchema.parse(req.body);

            if (!input.email) {
                return res.status(400).json({error: "Google login must provide an email"});
            }

            const existingUser = await context.users.findOne({
                email: input.email,
                ...(input.googleId ? {googleId: input.googleId} : {}),
            });
            let user = !existingUser ?
                await createGoogleUser(context, input)
                : existingUser;

            // 3️⃣ Token generieren
            const tokens = generateTokens({
                _id: user._id!.toString(),
                email: user.email,
            });

            return res.status(200).json({
                ...tokens,
                name: user.name,
                email: user.email,
                id: user._id,
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({error: "Invalid input", details: err.errors});
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
            const payload = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
            if (!payload.userId) {
                return res.status(401).json({error: "Invalid token payload"});
            }

            const user = await context.users.findOne({_id: new ObjectId(payload.userId)});
            if (!user) {
                return res.status(401).json({error: "User not found"});
            }

            logger.info("[REFRESH TOKEN] Refresh token", user.email);

            const accessToken = jwt.sign(
                {userId: user._id.toString(), email: user.email},
                JWT_SECRET,
                {expiresIn: "1h"}
            );

            return res.status(200).json({
                accessToken,
                refreshToken,
            });
        } catch (err) {
            logger.error("Refresh token error", err);
            return res.status(401).json({error: "Invalid or expired refresh token"});
        }
    });

    return router;
}
