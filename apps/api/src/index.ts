import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response, type NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { env } from "./config/env.js";
import { connectToDatabase, disconnectFromDatabase } from "./db/mongoose.js";
import apiRouter from "./routes/index.js";

const app = express();

// Security & middleware chain
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// API v1 routes
app.use("/api/v1", apiRouter);

// Central error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Boot server after connecting to database
async function startServer() {
  await connectToDatabase();
  app.listen(env.PORT, () => {
    console.log(`🚀 API server listening on http://localhost:${env.PORT}`);
  });
}

void startServer();

// Graceful shutdown handling
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await disconnectFromDatabase();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
