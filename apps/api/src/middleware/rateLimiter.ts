import rateLimit from "express-rate-limit";
import type { Request } from "express";

export const evaluateRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.userId ?? req.ip ?? "anonymous",
  message: { error: "Too many evaluation requests. Please try again later." },
});
