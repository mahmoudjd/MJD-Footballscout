import assert from "node:assert/strict";
import test from "node:test";
import { hasPremiumAccess, isPremiumEnabled } from "./billing-access";
import { isActiveMonthlyPrice } from "./billing.service";

test.beforeEach(() => {
  process.env.PREMIUM_ENABLED = "true";
});

test.after(() => {
  delete process.env.PREMIUM_ENABLED;
});

test("Premium is disabled by default and enabled only by an explicit true value", () => {
  delete process.env.PREMIUM_ENABLED;
  assert.equal(isPremiumEnabled(), false);
  process.env.PREMIUM_ENABLED = "false";
  assert.equal(isPremiumEnabled(), false);
  process.env.PREMIUM_ENABLED = "TRUE";
  assert.equal(isPremiumEnabled(), true);
});

test("the feature flag overrides existing subscriptions and administrator access", () => {
  process.env.PREMIUM_ENABLED = "false";
  assert.equal(
    hasPremiumAccess({ role: "user", billingPlan: "premium", subscriptionStatus: "active" }),
    false,
  );
  assert.equal(
    hasPremiumAccess({ role: "admin", billingPlan: "free", subscriptionStatus: "inactive" }),
    false,
  );
});

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

test("checkout accepts only an active price billed once per month", () => {
  assert.equal(
    isActiveMonthlyPrice({
      active: true,
      type: "recurring",
      recurring: {
        interval: "month",
        interval_count: 1,
        meter: null,
        trial_period_days: null,
        usage_type: "licensed",
      },
    }),
    true,
  );
  assert.equal(
    isActiveMonthlyPrice({
      active: true,
      type: "recurring",
      recurring: {
        interval: "year",
        interval_count: 1,
        meter: null,
        trial_period_days: null,
        usage_type: "licensed",
      },
    }),
    false,
  );
});
