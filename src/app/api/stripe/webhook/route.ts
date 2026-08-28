import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fulfils the one-time Premium purchase once Stripe confirms payment.
 * Checkout redirects the browser back before this necessarily runs, so
 * this webhook — not the success_url redirect — is the source of truth
 * for actually granting Premium.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const userId = session.client_reference_id ?? session.metadata?.userId;

      if (userId) {
        const admin = createAdminClient();
        const { error } = await admin
          .from("profiles")
          .update({
            plan: "premium",
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
            stripe_checkout_session_id: session.id,
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to grant Premium after payment:", error);
          return NextResponse.json({ error: "Database update failed." }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
