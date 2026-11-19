import assert from "node:assert/strict";
import test from "node:test";
import { describeDevice, describeLoginContext } from "./login-context";

test("describeDevice renders a friendly browser-on-OS label", () => {
  assert.equal(
    describeDevice(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    ),
    "Chrome on macOS",
  );
  assert.equal(
    describeDevice(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    ),
    "Safari on iOS",
  );
  // The server-to-server axios call must never surface as a device.
  assert.equal(describeDevice("axios"), "Unknown device");
  assert.equal(describeDevice(undefined), "Unknown device");
});

test("creates a stable device fingerprint and reads trusted proxy location headers", () => {
  process.env.PROXY_SHARED_SECRET = "test-proxy-secret";
  const request = {
    body: { deviceId: "device-12345678" },
    headers: {
      "x-proxy-secret": "test-proxy-secret",
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

test("ignores spoofed IP/location headers without the proxy secret", () => {
  process.env.PROXY_SHARED_SECRET = "test-proxy-secret";
  const request = {
    body: {},
    headers: {
      "x-proxy-secret": "wrong-proxy-secret",
      "x-forwarded-for": "6.6.6.6",
      "cf-connecting-ip": "6.6.6.6",
      "x-vercel-ip-country": "DE",
    },
    get: () => undefined,
    ip: "198.51.100.4",
  } as any;
  const context = describeLoginContext(request);
  assert.equal(context.ip, "198.51.100.4");
  assert.equal(context.location, "Unknown location");
});
