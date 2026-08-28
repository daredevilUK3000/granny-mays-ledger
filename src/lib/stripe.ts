import Stripe from "stripe";

/**
 * Server-only Stripe client. Premium is a one-time purchase (mode:
 * "payment" checkout sessions) — not a subscription.
 */
export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  return new Stripe(key);
}
