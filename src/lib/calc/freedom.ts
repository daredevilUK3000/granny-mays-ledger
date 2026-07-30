export type FreedomMilestone = { amount: number; months: number };

export type FreedomResult =
  | { status: "no-net-worth-data" }
  | { status: "no-transaction-data"; currentNetWorth: number }
  | { status: "not-growing"; currentNetWorth: number; avgMonthlySurplus: number }
  | {
      status: "projected";
      currentNetWorth: number;
      avgMonthlySurplus: number;
      milestones: FreedomMilestone[];
    };

export function stepFor(n: number): number {
  if (n < 100_000) return 10_000;
  if (n < 500_000) return 50_000;
  if (n < 1_000_000) return 100_000;
  return 250_000;
}

function nextMilestones(current: number, count: number): number[] {
  const milestones: number[] = [];
  let value = current;
  for (let i = 0; i < count; i++) {
    const step = stepFor(value);
    value = Math.floor(value / step) * step + step;
    milestones.push(value);
  }
  return milestones;
}

export function computeTimeToFreedom(
  currentNetWorth: number | null,
  avgMonthlySurplus: number,
  monthsOfData: number
): FreedomResult {
  if (currentNetWorth === null) return { status: "no-net-worth-data" };
  if (monthsOfData === 0) return { status: "no-transaction-data", currentNetWorth };
  if (avgMonthlySurplus <= 0) {
    return { status: "not-growing", currentNetWorth, avgMonthlySurplus };
  }

  const milestoneAmounts = nextMilestones(currentNetWorth, 3);
  const milestones: FreedomMilestone[] = milestoneAmounts.map((amount) => ({
    amount,
    months: Math.ceil((amount - currentNetWorth) / avgMonthlySurplus),
  }));

  return {
    status: "projected",
    currentNetWorth,
    avgMonthlySurplus,
    milestones,
  };
}
