import express from "express";
import dotenv from "dotenv";
import helmet from "helmet"
import cors from 'cors'
import compression from "compression"
import cookieParser from "cookie-parser"
import {PlayersRouter} from "./routes/playerRouter";
import {connectDB} from "./config/connect";

async function startServer() {
    const server = express();
    if (process.env.NODE_ENV !== "production") dotenv.config();

    const PORT = process.env.PORT ?? 8080
    const MONGOURI = process.env.MONGOURI;

    await connectDB(MONGOURI!);

    server.use(cors());
    server.use(helmet())
    server.use(cookieParser())
    server.use(compression())
    server.use(express.json());

// Route zum aller Spieler
    server.use("/", PlayersRouter);

    server.listen(PORT, () => {
        console.log(`✅ [server]: Server is running at http://localhost:${PORT}`);
    });
}

startServer()
