# Stripe Premium setup

Shadow Team and Recruitment Workspace require an active MJD Scout Premium subscription. Access is verified in the backend and synchronized from signed Stripe webhooks.

## Stripe test-mode configuration

1. In Stripe test mode, create an active recurring price billed once per month. The backend rejects yearly, multi-month and one-time prices.
2. Configure the following values in the backend environment (for the default local setup, use `server/.env`):
   - `PREMIUM_ENABLED=true` to explicitly enable Premium access and Checkout
   - `STRIPE_SECRET_KEY` with the test secret key (`sk_test_...`)
   - `STRIPE_PREMIUM_PRICE_ID` with the recurring test Price ID (`price_...`)
   - `STRIPE_WEBHOOK_SECRET` with the local Stripe CLI signing secret (`whsec_...`)
3. Enable the Stripe Customer Portal in the Stripe test-mode dashboard.
4. Start the backend and web app with their normal development scripts.
5. Forward Stripe test events to the raw webhook endpoint:

   ```sh
   stripe listen --forward-to localhost:8080/billing/webhook
   ```

6. Open `http://localhost:3002/pricing`, sign in, and start test Checkout. Stripe's standard test card is `4242 4242 4242 4242` with any future expiry date and CVC.

## Required production variables

- `PREMIUM_ENABLED=true` (Premium remains disabled when omitted or set to any other value)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PREMIUM_PRICE_ID`
- `CLIENT_URL`, set to the public web-app origin

Configure the production webhook endpoint as `https://<api-host>/billing/webhook` and subscribe to:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Never expose the Stripe secret key or webhook signing secret in the web app. Checkout and Customer Portal sessions are created only by the authenticated backend.
