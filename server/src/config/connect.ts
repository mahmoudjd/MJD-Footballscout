import mongoose from "mongoose";
import { initializePlayers } from "../controllers/playerController";

export async function connectDB(MONGOURI: string) {
  try {
    await mongoose.connect(MONGOURI!);
    console.log(`✅ [server]: Connected to MongoDB: ${MONGOURI}`);
    initializePlayers();
  } catch (error) {
    console.error(`❌[error]:Failed to connect to MongoDB:${error}`);
  }
}
