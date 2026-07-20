import assert from "node:assert/strict";
import test from "node:test";
import { describeLoginContext } from "./login-context";

test("creates a stable device fingerprint and reads trusted proxy location headers", () => {
  const request = {
    body: { deviceId: "device-12345678" },
    headers: {
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      "x-vercel-ip-country": "DE",
      "x-vercel-ip-city": "Berlin",
    },
    get: (name: string) => name === "user-agent" ? "Test Browser" : undefined,
    ip: "127.0.0.1",
  } as any;
  const first = describeLoginContext(request);
  const second = describeLoginContext(request);
  assert.equal(first.fingerprint, second.fingerprint);
  assert.equal(first.location, "Berlin, DE");
  assert.equal(first.ip, "203.0.113.7");
});
