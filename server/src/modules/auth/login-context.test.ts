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
