export type SafeToSpendState = "normal" | "tight" | "over" | "no_budget";

export type SafeToSpendResult = {
  state: SafeToSpendState;
  dailyAmount: number; // floored at 0 for display
  remaining: number; // can be negative — the raw "over by" figure
  daysRemaining: number;
};

const TIGHT_THRESHOLD = 5;

/**
 * Pure arithmetic core of Safe-to-Spend Today — bottom-up from the
 * month's flexible budget, not from total income. See handoff for why:
 * income tracking isn't modeled reliably enough yet to headline a number
 * on top of it.
 */
export function computeSafeToSpendToday({
  flexibleBudgetTotal,
  flexibleSpentSoFar,
  daysRemaining,
}: {
  flexibleBudgetTotal: number;
  flexibleSpentSoFar: number;
  daysRemaining: number;
}): SafeToSpendResult {
  if (flexibleBudgetTotal <= 0 && flexibleSpentSoFar <= 0) {
    return { state: "no_budget", dailyAmount: 0, remaining: 0, daysRemaining };
  }

  const remaining = flexibleBudgetTotal - flexibleSpentSoFar;

  if (remaining < 0) {
    return { state: "over", dailyAmount: 0, remaining, daysRemaining };
  }

  const rawDaily = daysRemaining > 0 ? remaining / daysRemaining : remaining;
  const dailyAmount = Math.max(0, rawDaily);
  const state: SafeToSpendState = dailyAmount < TIGHT_THRESHOLD ? "tight" : "normal";

  return { state, dailyAmount, remaining, daysRemaining };
}
