import { ObjectId } from "mongodb";
import Stripe from "stripe";
import type { AppContext } from "../../context/types";
import type { User } from "../auth/user.model";
import { hasPremiumAccess } from "./billing-access";

export class BillingConfigurationError extends Error {}

function requiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new BillingConfigurationError(`${name} is not configured`);
  return value;
}

function billingReturnUrl(context: AppContext) {
  const clientUrl = context.config.clientUrl.replace(/\/$/, "");
  if (!/^https?:\/\//.test(clientUrl)) {
    throw new BillingConfigurationError("CLIENT_URL must be an absolute HTTP(S) URL for billing");
  }
  return clientUrl;
}

export function createStripeClient() {
  return new Stripe(requiredEnvironmentValue("STRIPE_SECRET_KEY"));
}

function customerId(customer: Stripe.Subscription["customer"]) {
  return typeof customer === "string" ? customer : customer.id;
}

function productId(subscription: Stripe.Subscription) {
  const product = subscription.items.data[0]?.price.product;
  return typeof product === "string" ? product : product?.id;
}

function currentPeriodEnd(subscription: Stripe.Subscription) {
  const timestamps = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number");
  return timestamps.length ? new Date(Math.max(...timestamps) * 1000) : undefined;
}

function subscriptionStatus(subscription: Stripe.Subscription) {
  return subscription.status;
}

async function findUserForSubscription(
  context: AppContext,
  subscription: Stripe.Subscription,
) {
  const metadataUserId = subscription.metadata.userId;
  if (metadataUserId && ObjectId.isValid(metadataUserId)) {
    const byId = await context.users.findOne({ _id: new ObjectId(metadataUserId) });
    if (byId) return byId;
  }
  return context.users.findOne({ stripeCustomerId: customerId(subscription.customer) });
}

export async function syncSubscription(
  context: AppContext,
  subscription: Stripe.Subscription,
) {
  const premiumPriceId = requiredEnvironmentValue("STRIPE_PREMIUM_PRICE_ID");
  if (!subscription.items.data.some((item) => item.price.id === premiumPriceId)) {
    return false;
  }

  const user = await findUserForSubscription(context, subscription);
  if (!user) return false;

  const status = subscriptionStatus(subscription);
  const premium = status === "active" || status === "trialing";
  const periodEnd = currentPeriodEnd(subscription);
  const set: Partial<User> = {
    billingPlan: premium ? "premium" : "free",
    subscriptionStatus: status,
    stripeCustomerId: customerId(subscription.customer),
    stripeSubscriptionId: subscription.id,
    subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: new Date(),
  };
  const stripeProductId = productId(subscription);
  if (stripeProductId) set.stripeProductId = stripeProductId;
  if (periodEnd) set.subscriptionCurrentPeriodEnd = periodEnd;

  await context.users.updateOne({ _id: user._id }, { $set: set });
  return true;
}

export function publicBillingStatus(user: User) {
  return {
    plan: user.billingPlan ?? "free",
    status: user.subscriptionStatus ?? "inactive",
    isPremium: hasPremiumAccess(user),
    currentPeriodEnd: user.subscriptionCurrentPeriodEnd ?? null,
    cancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd ?? false,
    canManageSubscription: Boolean(user.stripeCustomerId),
  };
}

export async function createCheckoutSession(context: AppContext, user: User) {
  if (hasPremiumAccess(user)) {
    throw new Error("PREMIUM_ALREADY_ACTIVE");
  }

  const stripe = createStripeClient();
  const priceId = requiredEnvironmentValue("STRIPE_PREMIUM_PRICE_ID");
  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toHexString() },
    });
    stripeCustomerId = customer.id;
    await context.users.updateOne(
      { _id: user._id },
      { $set: { stripeCustomerId, updatedAt: new Date() } },
    );
  }

  const clientUrl = billingReturnUrl(context);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user._id.toHexString(),
    metadata: { userId: user._id.toHexString() },
    subscription_data: { metadata: { userId: user._id.toHexString() } },
    success_url: `${clientUrl}/pricing?checkout=success`,
    cancel_url: `${clientUrl}/pricing?checkout=cancelled`,
  });

  if (!session.url) throw new Error("CHECKOUT_URL_MISSING");
  return session.url;
}

export async function createPortalSession(context: AppContext, user: User) {
  if (!user.stripeCustomerId) throw new Error("STRIPE_CUSTOMER_MISSING");
  const stripe = createStripeClient();
  const clientUrl = billingReturnUrl(context);
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${clientUrl}/pricing`,
  });
  return session.url;
}
