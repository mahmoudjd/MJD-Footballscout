import mongoose from "mongoose";
import { initializePlayers } from "../controllers/playerController";

export async function connectDB(MONGOURI: string) {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGOURI!);
    console.log("✅ [server]: Connected successfully to MongoDB")
    await initializePlayers();
  } catch (error) {
    console.error(`❌[error]:Failed to connect to MongoDB:${error}`);
  }
}
