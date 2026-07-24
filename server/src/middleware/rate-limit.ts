import { Request, Response, NextFunction, RequestHandler } from "express";

const firstHeader = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value?.split(",")[0]?.trim();

/**
 * Real client IP behind Cloudflare / Vercel proxies. `req.ip` alone would be
 * the proxy address, so every request would share one bucket.
 */
export function getClientIp(req: Request) {
  return (
    firstHeader(req.headers["cf-connecting-ip"] as string | string[] | undefined) ||
    firstHeader(req.headers["x-forwarded-for"] as string | string[] | undefined) ||
    req.ip ||
    "unknown"
  );
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
}

/**
 * Sliding-window rate limiter with per-middleware in-memory state.
 * ponytail: in-memory buckets, per process. Fine for a single instance;
 * swap the Map for Redis (or express-rate-limit + a shared store) if this
 * ever runs multi-instance, otherwise the limit is only enforced per replica.
 */
export function createRateLimiter(options: RateLimitOptions): RequestHandler {
  const { windowMs, max, keyGenerator = getClientIp } = options;
  const hits = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const timestamps = (hits.get(key) || []).filter((ts) => now - ts < windowMs);

    if (timestamps.length >= max) {
      const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);
      res.setHeader("Retry-After", String(Math.max(retryAfter, 1)));
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    timestamps.push(now);
    hits.set(key, timestamps);

    // Opportunistic cleanup so idle keys don't accumulate forever.
    if (hits.size > 10_000) {
      for (const [existingKey, existingTimestamps] of hits) {
        if (existingTimestamps.every((ts) => now - ts >= windowMs)) {
          hits.delete(existingKey);
        }
      }
    }

    next();
  };
}
