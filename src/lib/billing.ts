"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUserId, getCurrentUserEmail } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { getStripeClient } from "@/lib/stripe";

async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host");
  return `${proto}://${host}`;
}

/**
 * Formats the live Premium price for display (e.g. "$49"), fetched
 * straight from Stripe rather than hardcoded — if the price ever changes
 * in the Stripe dashboard, this reflects it without a code deploy.
 */
export async function getPremiumPriceDisplay(): Promise<string> {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error("STRIPE_PRICE_ID is not set.");

  const stripe = getStripeClient();
  const price = await stripe.prices.retrieve(priceId);

  if (price.unit_amount == null) throw new Error("Price has no unit_amount.");

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: price.unit_amount % 100 === 0 ? 0 : 2,
  }).format(price.unit_amount / 100);
}

/**
 * Starts a Stripe Checkout session for the one-time Premium purchase and
 * redirects the signed-in user to it. Premium is "mode: payment" — a
 * single charge, not a subscription.
 */
export async function createCheckoutSession() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  if (profile.plan === "premium") {
    redirect("/dashboard/settings");
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error("STRIPE_PRICE_ID is not set.");

  const email = await getCurrentUserEmail();
  const origin = await getOrigin();
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    metadata: { userId },
    customer_email: email ?? undefined,
    success_url: `${origin}/dashboard/settings?upgraded=1`,
    cancel_url: `${origin}/dashboard/settings`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  redirect(session.url);
}
