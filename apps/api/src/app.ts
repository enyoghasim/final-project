import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import evaluateRoutes from "./routes/evaluate.routes.js";
import historyRoutes from "./routes/history.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/evaluate", evaluateRoutes);
  app.use("/api/history", historyRoutes);

  app.use(errorHandler);

  return app;
}
