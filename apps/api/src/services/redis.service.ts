import { Redis } from "ioredis";
import { env } from "../config/env.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// ioredis crashes the process on an unhandled "error" event if nothing is
// listening for it — log and move on instead (rate limiting / view counts
// degrading is far better than the API going down when Redis blips).
redis.on("error", (error: Error) => {
  // eslint-disable-next-line no-console
  console.error("Redis connection error:", error.message);
});
