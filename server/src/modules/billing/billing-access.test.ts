import assert from "node:assert/strict";
import test from "node:test";
import { hasPremiumAccess } from "./billing-access";

test("active and trialing Premium subscriptions grant access", () => {
  assert.equal(
    hasPremiumAccess({ role: "user", billingPlan: "premium", subscriptionStatus: "active" }),
    true,
  );
  assert.equal(
    hasPremiumAccess({ role: "user", billingPlan: "premium", subscriptionStatus: "trialing" }),
    true,
  );
});

test("free and non-paying subscription states do not grant access", () => {
  assert.equal(
    hasPremiumAccess({ role: "user", billingPlan: "free", subscriptionStatus: "inactive" }),
    false,
  );
  assert.equal(
    hasPremiumAccess({ role: "user", billingPlan: "premium", subscriptionStatus: "past_due" }),
    false,
  );
  assert.equal(
    hasPremiumAccess({ role: "user", billingPlan: "premium", subscriptionStatus: "canceled" }),
    false,
  );
});

test("administrators retain Premium access without a Stripe subscription", () => {
  assert.equal(
    hasPremiumAccess({ role: "admin", billingPlan: "free", subscriptionStatus: "inactive" }),
    true,
  );
});
