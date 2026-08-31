import type { SafeToSpendResult } from "@/lib/calc/safetospend";

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

const TONE = {
  normal: { text: "text-sage", bg: "bg-sage-soft" },
  tight: { text: "text-rust", bg: "bg-rust-soft" },
  over: { text: "text-rust", bg: "bg-rust-soft" },
  no_budget: { text: "text-ink-soft", bg: "bg-parchment-dim" },
} as const;

export function SafeToSpendWidget({
  result,
  currency,
}: {
  result: SafeToSpendResult;
  currency: string;
}) {
  const tone = TONE[result.state];

  return (
    <div className={`ledger-card p-5 ${tone.bg}`}>
      <p className="text-xs text-ink-soft uppercase tracking-wide">Safe to spend today</p>

      {result.state === "over" ? (
        <>
          <p className={`tabular text-2xl ${tone.text} mt-1`}>
            {money(Math.abs(result.remaining), currency)} over
          </p>
          <p className="text-xs text-ink-soft mt-1">
            {`You’re ${money(Math.abs(result.remaining), currency)} over this month’s flexible budget.`}
          </p>
        </>
      ) : result.state === "no_budget" ? (
        <>
          <p className="tabular text-2xl text-ink mt-1">&mdash;</p>
          <p className="text-xs text-ink-soft mt-1">
            Set a budget on a flexible category to see this number.
          </p>
        </>
      ) : (
        <>
          <p className={`tabular text-2xl ${tone.text} mt-1`}>
            {money(result.dailyAmount, currency)}
          </p>
          <p className="text-xs text-ink-soft mt-1">
            {money(result.remaining, currency)} left over {result.daysRemaining}{" "}
            day{result.daysRemaining === 1 ? "" : "s"}
          </p>
        </>
      )}
    </div>
  );
}
