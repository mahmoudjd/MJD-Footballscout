import assert from "node:assert/strict";
import test from "node:test";
import type { Request, Response } from "express";
import { createRateLimiter } from "./rate-limit";

function run(limiter: ReturnType<typeof createRateLimiter>, ip: string) {
  let statusCode = 0;
  let nexted = false;
  const req = { headers: { "x-forwarded-for": ip }, ip } as unknown as Request;
  const res = {
    setHeader() {},
    status(code: number) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Response;
  limiter(req, res, () => {
    nexted = true;
  });
  return { statusCode, nexted };
}

test("allows requests up to the limit, then blocks with 429", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
  assert.equal(run(limiter, "1.1.1.1").nexted, true);
  assert.equal(run(limiter, "1.1.1.1").nexted, true);
  assert.equal(run(limiter, "1.1.1.1").nexted, true);
  const blocked = run(limiter, "1.1.1.1");
  assert.equal(blocked.nexted, false);
  assert.equal(blocked.statusCode, 429);
});

test("buckets are per client IP", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
  assert.equal(run(limiter, "1.1.1.1").nexted, true);
  assert.equal(run(limiter, "1.1.1.1").nexted, false);
  // A different IP is unaffected by the first IP's exhausted bucket.
  assert.equal(run(limiter, "2.2.2.2").nexted, true);
});

test("window slides: old hits expire", () => {
  const limiter = createRateLimiter({ windowMs: 20, max: 1 });
  assert.equal(run(limiter, "9.9.9.9").nexted, true);
  assert.equal(run(limiter, "9.9.9.9").nexted, false);
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      assert.equal(run(limiter, "9.9.9.9").nexted, true);
      resolve();
    }, 30);
  });
});
