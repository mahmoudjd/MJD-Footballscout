import assert from "node:assert/strict";
import test from "node:test";
import {
  ChangePasswordInputSchema,
  DeactivateAccountInputSchema,
  ForgotPasswordInputSchema,
  ResetPasswordInputSchema,
  UserLoginInputSchema,
  UserRegisterInputSchema,
} from "./user.model";

test("registration normalizes email and accepts secure passwords", () => {
  const result = UserRegisterInputSchema.parse({
    name: "Test Scout",
    email: "  SCOUT@EXAMPLE.COM ",
    password: "Secure123!",
  });
  assert.equal(result.email, "scout@example.com");
});

test("password schemas reject passwords shorter than 8 characters", () => {
  assert.equal(
    ChangePasswordInputSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "short",
    }).success,
    false,
  );
  assert.equal(
    ResetPasswordInputSchema.safeParse({
      token: "a".repeat(64),
      newPassword: "short",
    }).success,
    false,
  );
});

test("login ignores serialized empty MFA credentials", () => {
  const result = UserLoginInputSchema.parse({
    email: "scout@example.com",
    password: "Secure123!",
    mfaCode: "undefined",
    mfaChallengeToken: "undefined",
  });

  assert.equal(result.mfaCode, undefined);
  assert.equal(result.mfaChallengeToken, undefined);
});

test("forgot password normalizes email without exposing account data", () => {
  const result = ForgotPasswordInputSchema.parse({ email: "USER@Example.com" });
  assert.equal(result.email, "user@example.com");
});

test("account deactivation accepts an optional reason and password", () => {
  const result = DeactivateAccountInputSchema.parse({
    password: "Secure123!",
    reason: "Taking a break",
  });
  assert.equal(result.reason, "Taking a break");
});
