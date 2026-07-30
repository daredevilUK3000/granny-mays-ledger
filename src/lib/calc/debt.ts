export type DebtInput = {
  id: string;
  name: string;
  balance: number;
  apr: number; // annual percentage rate, e.g. 19.99
  minPayment: number;
};

export type DebtStrategy = "snowball" | "avalanche" | "fixed_extra";

export type DebtPayoffResult = {
  monthsToDebtFree: number;
  totalInterestPaid: number;
  totalPaid: number;
  perDebt: { id: string; name: string; payoffMonth: number | null }[];
  hitSafetyCap: boolean; // true if payments can't keep up with interest
};

const SAFETY_CAP_MONTHS = 600; // 50 years — a signal something's wrong, not a real plan

export function computeDebtPayoff(
  debts: DebtInput[],
  strategy: DebtStrategy,
  extraMonthlyPayment: number
): DebtPayoffResult {
  if (debts.length === 0) {
    return {
      monthsToDebtFree: 0,
      totalInterestPaid: 0,
      totalPaid: 0,
      perDebt: [],
      hitSafetyCap: false,
    };
  }

  // Fix the payoff order once, up front, based on initial balances/APRs
  const order = [...debts].sort((a, b) =>
    strategy === "avalanche" ? b.apr - a.apr : a.balance - b.balance
  );

  const remaining = new Map(debts.map((d) => [d.id, d.balance]));
  const payoffMonth = new Map<string, number | null>(
    debts.map((d) => [d.id, null])
  );

  let month = 0;
  let totalInterestPaid = 0;
  let totalPaid = 0;
  let hitSafetyCap = false;

  while (
    Array.from(remaining.values()).some((b) => b > 0.01) &&
    month < SAFETY_CAP_MONTHS
  ) {
    month++;

    // 1. Accrue interest
    for (const d of debts) {
      const bal = remaining.get(d.id)!;
      if (bal <= 0) continue;
      const interest = (bal * (d.apr / 100)) / 12;
      totalInterestPaid += interest;
      remaining.set(d.id, bal + interest);
    }

    // 2. Apply minimum payments
    for (const d of debts) {
      const bal = remaining.get(d.id)!;
      if (bal <= 0) continue;
      const payment = Math.min(d.minPayment, bal);
      remaining.set(d.id, bal - payment);
      totalPaid += payment;
    }

    // 3. Apply extra payment
    if (strategy === "fixed_extra") {
      // Split evenly across all debts still owing, no prioritization
      const active = debts.filter((d) => remaining.get(d.id)! > 0.01);
      if (active.length > 0) {
        const share = extraMonthlyPayment / active.length;
        for (const d of active) {
          const bal = remaining.get(d.id)!;
          const payment = Math.min(share, bal);
          remaining.set(d.id, bal - payment);
          totalPaid += payment;
        }
      }
    } else {
      // Snowball/avalanche: waterfall the extra payment down the fixed order
      let extra = extraMonthlyPayment;
      for (const d of order) {
        if (extra <= 0) break;
        const bal = remaining.get(d.id)!;
        if (bal <= 0) continue;
        const payment = Math.min(extra, bal);
        remaining.set(d.id, bal - payment);
        totalPaid += payment;
        extra -= payment;
      }
    }

    // 4. Record payoff month for any debt that just hit zero
    for (const d of debts) {
      if (payoffMonth.get(d.id) === null && remaining.get(d.id)! <= 0.01) {
        payoffMonth.set(d.id, month);
      }
    }
  }

  if (month >= SAFETY_CAP_MONTHS) hitSafetyCap = true;

  return {
    monthsToDebtFree: hitSafetyCap ? -1 : month,
    totalInterestPaid: round2(totalInterestPaid),
    totalPaid: round2(totalPaid),
    perDebt: debts.map((d) => ({
      id: d.id,
      name: d.name,
      payoffMonth: payoffMonth.get(d.id) ?? null,
    })),
    hitSafetyCap,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
