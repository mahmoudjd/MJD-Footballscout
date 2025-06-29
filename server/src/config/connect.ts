import mongoose from "mongoose";
import logger from "../logger/logger";

export async function connectDB(MONGOURI: string) {
  try {
    logger.info("Connecting to MongoDB...")
    const connect = await mongoose.connect(MONGOURI!);
    logger.info("✅ [server]: Connected successfully to MongoDB")
    return connect.connection.db
  } catch (error) {
    logger.error(`❌[error]:Failed to connect to MongoDB:${error}`);
  }
}
