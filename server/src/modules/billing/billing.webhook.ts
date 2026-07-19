import type { Request, Response } from "express";
import type Stripe from "stripe";
import type { AppContext } from "../../context/types";
import logger from "../../logger/logger";
import {
  BillingConfigurationError,
  createStripeClient,
  syncSubscription,
} from "./billing.service";

const SUBSCRIPTION_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export function createBillingWebhookHandler(context: AppContext) {
  return async (req: Request, res: Response) => {
    try {
      const signature = req.headers["stripe-signature"];
      if (typeof signature !== "string") {
        return res.status(400).json({ error: "Stripe signature is missing" });
      }

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
      if (!webhookSecret) throw new BillingConfigurationError("STRIPE_WEBHOOK_SECRET is not configured");
      const stripe = createStripeClient();
      const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

      if (SUBSCRIPTION_EVENTS.has(event.type)) {
        await syncSubscription(context, event.data.object as Stripe.Subscription);
      } else if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscription(context, subscription);
        }
      } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.parent?.subscription_details?.subscription;
        if (typeof subscription === "string") {
          await syncSubscription(context, await stripe.subscriptions.retrieve(subscription));
        } else if (subscription) {
          await syncSubscription(context, subscription);
        }
      }

      return res.json({ received: true });
    } catch (error) {
      logger.error("Stripe webhook rejected:", error);
      return res.status(error instanceof BillingConfigurationError ? 503 : 400).json({
        error: error instanceof Error ? error.message : "Invalid Stripe webhook",
      });
    }
  };
}
