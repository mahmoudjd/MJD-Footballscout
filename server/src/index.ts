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
import createWatchlistsRouter from "./routes/watchlistsRouter";
import { startPlayersAutoUpdateScheduler } from "./jobs/playersAutoUpdateScheduler";

async function startServer() {
    if (process.env.NODE_ENV !== "production") dotenv.config();
    const PORT = process.env.PORT ?? 8080;
    const MONGOURI = process.env.MONGOURI;
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!MONGOURI) {
        throw new Error("MONGOURI is missing in server/.env");
    }
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is missing in server/.env");
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
    server.use("/watchlists", createWatchlistsRouter(context));
    server.use("/auth", createAuthRouter(context));

    const stopPlayersAutoUpdateScheduler = startPlayersAutoUpdateScheduler(context);

    const httpServer = server.listen(PORT, () => {
        logger.info(`✅ [server]: Server is running on PORT: ${PORT}`);
    });

    const gracefulShutdown = (signal: string) => {
        logger.info(`🛑 [server]: Received ${signal}. Shutting down...`);
        stopPlayersAutoUpdateScheduler();
        httpServer.close(() => {
            logger.info("✅ [server]: HTTP server closed.");
            process.exit(0);
        });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

startServer().catch((error) => {
    logger.error(`❌ [server]: Startup failed: ${error}`);
    process.exit(1);
});
