"use client";

import { useState } from "react";
import { logUnspentWin } from "@/lib/actions";
import type { Badge } from "@/lib/badges";

/**
 * Track the Un-Spent — a quick-log button + running monthly tally.
 * One always-available button, no popup nagging: the guardrail from the
 * feature spec is that this should never feel like every purchase is
 * being monitored, so there's no prompt frequency to worry about here at
 * all, just an entry point that's there when you want it.
 *
 * Styled deliberately unlike the real cashflow figures elsewhere in the
 * app (plum accent, not sage/rust) and labeled explicitly as a logged,
 * self-reported win — this number never flows into transactions, budget
 * totals, goals, or forecasting.
 */
function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export function UnspentTracker({
  initialTotalThisMonth,
  currency,
  badge,
}: {
  initialTotalThisMonth: number;
  currency: string;
  badge: Badge | null;
}) {
  const [total, setTotal] = useState(initialTotalThisMonth);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [line, setLine] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const amount = Number(formData.get("amount"));
      const result = await logUnspentWin(formData);
      setTotal((t) => t + amount);
      setLine(result.message);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ledger-card p-4">
      <p className="text-xs text-ink-soft uppercase tracking-wide">
        Un-spent this month
      </p>
      <p className="tabular text-xl text-plum mt-1">{money(total, currency)}</p>
      <p className="text-[11px] text-ink-soft mt-0.5">
        Your logged wins &mdash; not counted in your real numbers
      </p>

      {badge && (
        <span className="tabular inline-block rounded-full bg-plum-soft px-2.5 py-0.5 text-[10px] text-plum mt-2">
          🎖️ {badge.name}
        </span>
      )}

      {line && (
        <p className="text-xs text-plum mt-3 leading-relaxed">{line}</p>
      )}
      {error && <p className="text-xs text-rust mt-3">{error}</p>}

      {open ? (
        <form
          action={handleSubmit}
          className="mt-3 space-y-2"
          onSubmit={() => setLine(null)}
        >
          <input type="hidden" name="decision_date" value={new Date().toISOString().slice(0, 10)} />
          <input
            name="title"
            type="text"
            required
            placeholder="What did you walk away from?"
            className="w-full border border-rule bg-white px-2.5 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="Amount"
              className="w-24 border border-rule bg-white px-2.5 py-1.5 text-sm"
            />
            <input
              name="category_name"
              type="text"
              placeholder="Category (optional)"
              className="flex-1 border border-rule bg-white px-2.5 py-1.5 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="text-xs border border-plum text-plum px-3 py-1.5 hover:bg-plum hover:text-parchment transition-colors disabled:opacity-50"
            >
              {pending ? "Logging…" : "Log it"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 text-xs border border-ink px-3 py-1.5 hover:bg-ink hover:text-parchment transition-colors"
        >
          Walked away from something?
        </button>
      )}
    </div>
  );
}
