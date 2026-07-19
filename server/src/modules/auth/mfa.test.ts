import assert from "node:assert/strict";
import test from "node:test";
import {
  createMfaSecret,
  createRecoveryCodes,
  decryptMfaSecret,
  encryptMfaSecret,
  generateTotp,
  verifyTotp,
} from "./mfa";

test("generates and verifies RFC-compatible TOTP values", () => {
  const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
  assert.equal(generateTotp(secret, 59_000), "287082");
  assert.equal(verifyTotp(secret, "287082", 59_000), true);
  assert.equal(verifyTotp(secret, "000000", 59_000), false);
});

test("encrypts MFA secrets using authenticated encryption", () => {
  process.env.MFA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  const secret = createMfaSecret();
  const encrypted = encryptMfaSecret(secret);
  assert.notEqual(encrypted, secret);
  assert.equal(decryptMfaSecret(encrypted), secret);
});

test("creates distinct, user-friendly recovery codes", () => {
  const codes = createRecoveryCodes();
  assert.equal(codes.length, 8);
  assert.equal(new Set(codes).size, 8);
  assert.ok(codes.every((code) => /^[A-F0-9]{5}-[A-F0-9]{5}$/.test(code)));
});
