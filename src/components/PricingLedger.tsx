import Link from "next/link";

/**
 * Pricing shown as two facing ledger pages — Free on the left, Premium on
 * the right, with a visible spine between them from `sm:` up. On mobile
 * the pages stack and the spine disappears, replaced by a dashed rule.
 */
export function PricingLedger({ premiumPrice }: { premiumPrice: string }) {
  return (
    <div className="ledger-card relative overflow-hidden">
      <div className="relative grid sm:grid-cols-2">
        <div className="p-8 sm:p-10">
          <p className="tabular text-xs uppercase tracking-wide text-sage mb-2">Free</p>
          <p className="font-display text-3xl text-ink mb-1">£0</p>
          <p className="tabular text-xs text-ink-soft mb-6">forever</p>
          <p className="text-ink-soft text-sm leading-relaxed mb-8">
            Manual budget tracking, monthly category budgets, sinking funds,
            a financial decisions journal, and up to 2 savings goals with
            progress and on-track indicators.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-ink px-5 py-2.5 text-sm text-ink hover:bg-ink hover:text-parchment transition-colors"
          >
            Start tracking &mdash; free
          </Link>
        </div>

        {/* spine — visible from sm: up only */}
        <div
          className="hidden sm:block absolute inset-y-4 left-1/2 w-px -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--rule) 15%, var(--rule) 85%, transparent)",
          }}
          aria-hidden="true"
        />

        <div className="border-t border-dashed border-rule bg-plum-soft/40 p-8 sm:border-t-0 sm:p-10">
          <p className="tabular text-xs uppercase tracking-wide text-plum mb-2">Premium</p>
          <p className="font-display text-3xl text-plum mb-1">{premiumPrice}</p>
          <p className="tabular text-xs text-ink-soft mb-6">&nbsp;</p>
          <p className="text-ink-soft text-sm leading-relaxed mb-8">
            Up to 5 goals, investment projections, debt payoff plans
            (snowball or avalanche), net worth tracking with a Time to
            Freedom projection, decision journal insights, and CSV import.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-plum px-5 py-2.5 text-sm text-white font-medium transition hover:brightness-95"
          >
            Go Premium
          </Link>
        </div>
      </div>
    </div>
  );
}
