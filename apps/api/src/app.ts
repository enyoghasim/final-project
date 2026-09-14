import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import evaluateRoutes from "./routes/evaluate.routes.js";
import historyRoutes from "./routes/history.routes.js";
import publicRoutes from "./routes/public.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Dokploy/Traefik sit in front of the API in production. Without this,
  // req.ip resolves to the proxy's address for every request, which breaks
  // both the evaluate rate limiter's per-user/IP keying and the public
  // share routes' per-viewer view-count dedupe.
  app.set("trust proxy", 1);

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/evaluate", evaluateRoutes);
  app.use("/api/history", historyRoutes);
  app.use("/api/public/evaluations", publicRoutes);

  app.use(errorHandler);

  return app;
}
