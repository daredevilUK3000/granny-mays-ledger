export type InvestmentInputs = {
  initialAmount: number;
  monthlyContribution: number;
  years: number;
  annualReturnPct: number; // e.g. 7 for 7%
  annualInflationPct: number; // e.g. 2.5 for 2.5%
  annualFeesPct: number; // e.g. 0.5 for 0.5%
};

export type InvestmentResult = {
  months: number;
  totalContributed: number; // initial + all monthly contributions
  nominalFutureValue: number;
  realFutureValue: number; // inflation-adjusted
  totalGrowth: number; // nominalFutureValue - totalContributed
  yearByYear: { year: number; nominalValue: number; realValue: number }[];
};

export function projectInvestment(inputs: InvestmentInputs): InvestmentResult {
  const months = Math.round(inputs.years * 12);
  const netAnnualReturn = inputs.annualReturnPct - inputs.annualFeesPct;
  const monthlyRate = netAnnualReturn / 100 / 12;
  const monthlyInflation = inputs.annualInflationPct / 100 / 12;

  const yearByYear: InvestmentResult["yearByYear"] = [];

  let nominalValue = inputs.initialAmount;

  for (let m = 1; m <= months; m++) {
    nominalValue = nominalValue * (1 + monthlyRate) + inputs.monthlyContribution;

    if (m % 12 === 0) {
      const yearsElapsed = m / 12;
      const realValue =
        nominalValue / Math.pow(1 + monthlyInflation, m);
      yearByYear.push({
        year: yearsElapsed,
        nominalValue: round2(nominalValue),
        realValue: round2(realValue),
      });
    }
  }

  const totalContributed =
    inputs.initialAmount + inputs.monthlyContribution * months;
  const realFutureValue = nominalValue / Math.pow(1 + monthlyInflation, months);

  return {
    months,
    totalContributed: round2(totalContributed),
    nominalFutureValue: round2(nominalValue),
    realFutureValue: round2(realFutureValue),
    totalGrowth: round2(nominalValue - totalContributed),
    yearByYear,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
