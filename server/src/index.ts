import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { createContext } from "./context/context";
import logger from "./logger/logger";
import createPlayersRouter from "./routes/playersRouter";
import createAuthRouter from "./routes/authRouter";

async function startServer() {
    if (process.env.NODE_ENV !== "production") dotenv.config();
    const PORT = process.env.PORT ?? 8080;
    const MONGOURI = process.env.MONGOURI;
    if (!MONGOURI) {
        throw new Error("MONGOURI is missing in server/.env");
    }

    const context = await createContext({ mongoURI: MONGOURI });

    const server = express();

    server.use(cors({
        origin: process.env.NODE_ENV === "production" ? (process.env.CLIENT_URL || "_") : "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Accept", "Authorization"],
        credentials: true,
    }));

    server.use(helmet());
    server.use(cookieParser());
    server.use(compression());
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    server.use("/", createPlayersRouter(context));
    server.use("/auth", createAuthRouter(context));

    server.listen(PORT, () => {
        logger.info(`✅ [server]: Server is running on PORT: ${PORT}`);
    });
}

startServer().catch((error) => {
    logger.error(`❌ [server]: Startup failed: ${error}`);
    process.exit(1);
});
