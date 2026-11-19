import { timingSafeEqual } from "crypto";
import { Request, Response, NextFunction, RequestHandler } from "express";

const firstHeader = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value?.split(",")[0]?.trim();

/**
 * True when the request comes from our own Next.js server, which proves it with
 * PROXY_SHARED_SECRET. Only then may it vouch for the browser's IP/location via
 * x-forwarded-for etc. — any other client can set those headers to anything.
 */
export function isTrustedProxy(req: Request) {
  const secret = process.env.PROXY_SHARED_SECRET;
  const given = firstHeader(req.headers["x-proxy-secret"] as string | string[] | undefined);
  if (!secret || !given || given.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(secret));
}

/**
 * Client IP for rate limiting / login context. `req.ip` honours `trust proxy`
 * (set in index.ts), so it's the address the hosting proxy saw — not spoofable.
 */
export function getClientIp(req: Request) {
  const forwarded = isTrustedProxy(req)
    ? firstHeader(req.headers["x-forwarded-for"] as string | string[] | undefined)
    : undefined;
  return forwarded || req.ip || "unknown";
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
