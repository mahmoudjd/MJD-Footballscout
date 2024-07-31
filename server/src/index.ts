import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PlayersRouter } from "./routes/playerRouter";
import { connectDB } from "./config/connect";

const server = express();
dotenv.config();

const PORT = process.env.PORT;
const MONGOURI = process.env.MONGOURI;

connectDB(MONGOURI!);

server.use(cors());
server.use(express.json());

// Route zum aller Spieler
server.use("/", PlayersRouter);

server.listen(PORT, () => {
  console.log(`✅ [server]: Server is running at http://localhost:${PORT}`);
});
