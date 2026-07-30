import { stepFor } from "@/lib/calc/freedom";

export type LifeWinEvent =
  | { date: string; kind: "net_worth_milestone"; amount: number }
  | { date: string; kind: "goal_completed"; name: string }
  | { date: string; kind: "sinking_fund_completed"; name: string };

/**
 * Finds the date a goal/sinking-fund-style target was first reached,
 * by walking contributions in date order rather than trusting only
 * the current total (which wouldn't tell us WHEN it happened).
 */
export function findCompletionDate(
  startingAmount: number,
  targetAmount: number,
  contributions: { amount: number; date: string }[]
): string | null {
  if (startingAmount >= targetAmount) return null; // already complete at creation — no event to date

  const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = startingAmount;
  for (const c of sorted) {
    cumulative += c.amount;
    if (cumulative >= targetAmount) return c.date;
  }
  return null; // not complete yet
}

/**
 * Finds every round-number net worth threshold crossed between
 * consecutive snapshots. Needs at least 2 snapshots — the first one
 * only establishes a baseline, so a single large snapshot doesn't
 * dump a pile of same-day "milestones."
 */
export function computeNetWorthMilestones(
  snapshots: { date: string; netWorth: number }[]
): LifeWinEvent[] {
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return [];

  const events: LifeWinEvent[] = [];
  let baseline = sorted[0].netWorth;

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    if (curr.netWorth > baseline) {
      let value = baseline;
      while (true) {
        const step = stepFor(value);
        const next = Math.floor(value / step) * step + step;
        if (next <= curr.netWorth) {
          events.push({ date: curr.date, kind: "net_worth_milestone", amount: next });
          value = next;
        } else {
          break;
        }
      }
    }
    baseline = Math.max(baseline, curr.netWorth);
  }

  return events;
}
