import Link from "next/link";
import { createCheckoutSession } from "@/lib/billing";

/**
 * Pricing, styled as an open ledger book rather than generic SaaS cards —
 * two "pages" with a center spine, ruled feature rows, and the price set
 * like a ledger entry.
 *
 * premiumPrice is passed in from the server, fetched live from Stripe —
 * never hardcode a price string here.
 *
 * The Premium CTA is signed-in aware: an already-authenticated visitor
 * goes straight to Stripe Checkout; everyone else goes to /login first,
 * same as every other CTA on this page.
 */

const FREE_FEATURES = [
  "Manual budget tracking",
  "Monthly category budgets",
  "Sinking funds",
  "Financial decisions journal",
  "Up to 2 savings goals",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Up to 5 goals + investment projections",
  "Debt payoff plans (snowball or avalanche)",
  "Net worth tracking + Time to Freedom",
  "Decision journal insights + CSV import",
];

export function PricingLedger({
  premiumPrice,
  signedIn = false,
}: {
  premiumPrice: string;
  signedIn?: boolean;
}) {
  return (
    <div>
      <p className="tabular text-center text-xs uppercase tracking-wide text-sage">
        Choose your ledger
      </p>
      <h2 className="mt-2 text-center font-display text-2xl text-ink sm:text-3xl">
        Simple pricing, honestly laid out
      </h2>

      <div className="ledger-card relative mx-auto mt-8 grid max-w-3xl grid-cols-1 overflow-hidden sm:grid-cols-2">
        {/* center spine — desktop only */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 hidden w-4 -translate-x-1/2 bg-gradient-to-r from-transparent via-ink/10 to-transparent sm:block"
        />

        {/* Free page */}
        <div className="border-b border-rule px-8 py-9 sm:border-b-0 sm:border-r sm:px-9 sm:py-10">
          <p className="tabular text-xs uppercase tracking-wide text-sage">Page One</p>
          <h3 className="mt-1 font-display text-xl text-ink">Free</h3>
          <p className="tabular mt-3 mb-6 text-3xl text-ink">
            &pound;0 <span className="text-sm font-normal text-ink-soft">/ forever</span>
          </p>

          <ul>
            {FREE_FEATURES.map((f, i) => (
              <li
                key={f}
                className={`flex items-baseline gap-2.5 py-2 text-sm text-ink ${
                  i < FREE_FEATURES.length - 1 ? "border-b border-dotted border-rule" : ""
                }`}
              >
                <span className="text-sage" aria-hidden="true">
                  &#10003;
                </span>
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/login"
            className="mt-7 block rounded-full border border-rule px-5 py-2.5 text-center text-sm font-medium text-ink transition hover:bg-parchment-dim"
          >
            Start tracking &mdash; free
          </Link>
        </div>

        {/* Premium page */}
        <div className="relative px-8 py-9 sm:px-9 sm:py-10">
          <span className="tabular absolute right-6 top-6 rounded-full bg-gilt-bright px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm">
            Most chosen
          </span>

          <p className="tabular text-xs uppercase tracking-wide text-plum">Page Two</p>
          <h3 className="mt-1 font-display text-xl text-ink">Premium</h3>
          <p className="tabular mt-3 mb-6 text-3xl text-ink">
            {premiumPrice} <span className="text-sm font-normal text-ink-soft">/ once, for life</span>
          </p>

          <ul>
            {PREMIUM_FEATURES.map((f, i) => (
              <li
                key={f}
                className={`flex items-baseline gap-2.5 py-2 text-sm text-ink ${
                  i < PREMIUM_FEATURES.length - 1 ? "border-b border-dotted border-rule" : ""
                }`}
              >
                <span className="text-plum" aria-hidden="true">
                  &#10003;
                </span>
                {f}
              </li>
            ))}
          </ul>

          {signedIn ? (
            <form action={createCheckoutSession}>
              <button
                type="submit"
                className="mt-7 block w-full rounded-full bg-gilt-bright px-5 py-2.5 text-center text-sm font-medium text-white transition hover:brightness-95"
              >
                Go Premium &mdash; once, no subscription
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="mt-7 block rounded-full bg-gilt-bright px-5 py-2.5 text-center text-sm font-medium text-white transition hover:brightness-95"
            >
              Go Premium &mdash; once, no subscription
            </Link>
          )}
        </div>
      </div>

      <p className="tabular mt-5 text-center text-xs text-ink-soft">
        No subscriptions. No bank connections. No AI reading your numbers.
      </p>
    </div>
  );
}
