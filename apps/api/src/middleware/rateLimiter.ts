import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import type { Request } from "express";
import { redis } from "../services/redis.service.js";

export const evaluateRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.userId ?? req.ip ?? "anonymous",
  message: { error: "Too many evaluation requests. Please try again later." },
});

// Guards the unauthenticated /api/public/* routes (share page views, resume
// downloads, OG image/prerender fetches) against scraping and abuse, since
// anyone with a link can hit them with no login required. Backed by Redis
// (rather than in-memory) so the limit holds across API instances/restarts.
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    prefix: "rl:public:",
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<never>,
  }),
  message: { error: "Too many requests. Please try again later." },
});
