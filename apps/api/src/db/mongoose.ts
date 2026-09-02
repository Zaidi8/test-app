import mongoose from "mongoose";

import { env } from "../config/env.js";

/** Connect to MongoDB. Refuses to start if the connection cannot be established. */
export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {});
    console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

/** Close the connection and exit, used by SIGINT/SIGTERM handlers. */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
}
