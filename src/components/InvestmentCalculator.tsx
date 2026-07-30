"use client";

import { useMemo, useState } from "react";
import { projectInvestment, type InvestmentInputs } from "@/lib/calc/investments";
import { saveInvestmentScenario } from "@/lib/actions";

const defaultInputs: InvestmentInputs = {
  initialAmount: 5000,
  monthlyContribution: 300,
  years: 20,
  annualReturnPct: 7,
  annualInflationPct: 2.5,
  annualFeesPct: 0.5,
};

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export function InvestmentCalculator({
  currency,
  initial,
}: {
  currency: string;
  initial?: InvestmentInputs;
}) {
  const [inputs, setInputs] = useState<InvestmentInputs>(initial ?? defaultInputs);
  const [scenarioName, setScenarioName] = useState("");

  const result = useMemo(() => projectInvestment(inputs), [inputs]);

  function field(key: keyof InvestmentInputs) {
    return {
      value: inputs[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setInputs((prev) => ({ ...prev, [key]: Number(e.target.value) || 0 })),
    };
  }

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-xs text-ink-soft mb-1">Initial amount</label>
          <input type="number" step="0.01" className="w-full border border-rule bg-white px-3 py-2 text-sm" {...field("initialAmount")} />
        </div>
        <div>
          <label className="block text-xs text-ink-soft mb-1">Monthly contribution</label>
          <input type="number" step="0.01" className="w-full border border-rule bg-white px-3 py-2 text-sm" {...field("monthlyContribution")} />
        </div>
        <div>
          <label className="block text-xs text-ink-soft mb-1">Years</label>
          <input type="number" step="1" min="1" className="w-full border border-rule bg-white px-3 py-2 text-sm" {...field("years")} />
        </div>
        <div>
          <label className="block text-xs text-ink-soft mb-1">Expected annual return (%)</label>
          <input type="number" step="0.1" className="w-full border border-rule bg-white px-3 py-2 text-sm" {...field("annualReturnPct")} />
        </div>
        <div>
          <label className="block text-xs text-ink-soft mb-1">Inflation (%/yr)</label>
          <input type="number" step="0.1" className="w-full border border-rule bg-white px-3 py-2 text-sm" {...field("annualInflationPct")} />
        </div>
        <div>
          <label className="block text-xs text-ink-soft mb-1">Fees (%/yr)</label>
          <input type="number" step="0.1" className="w-full border border-rule bg-white px-3 py-2 text-sm" {...field("annualFeesPct")} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-px bg-rule mb-8">
        <div className="bg-parchment p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wide">Total contributed</p>
          <p className="tabular text-xl text-ink mt-1">{money(result.totalContributed, currency)}</p>
        </div>
        <div className="bg-parchment p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wide">Future value (nominal)</p>
          <p className="tabular text-xl text-sage mt-1">{money(result.nominalFutureValue, currency)}</p>
        </div>
        <div className="bg-parchment p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wide">Future value (today's money)</p>
          <p className="tabular text-xl text-ink mt-1">{money(result.realFutureValue, currency)}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-display text-lg text-ink mb-3">Year by year</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-xs text-ink-soft uppercase tracking-wide">
              <th className="py-2 font-normal">Year</th>
              <th className="py-2 font-normal text-right">Nominal value</th>
              <th className="py-2 font-normal text-right">Today&apos;s money</th>
            </tr>
          </thead>
          <tbody>
            {result.yearByYear
              .filter((_, i) => (i + 1) % Math.max(1, Math.floor(result.yearByYear.length / 10)) === 0 || i === result.yearByYear.length - 1)
              .map((row) => (
                <tr key={row.year} className="ledger-rule">
                  <td className="py-1.5 tabular">{row.year}</td>
                  <td className="py-1.5 tabular text-right">{money(row.nominalValue, currency)}</td>
                  <td className="py-1.5 tabular text-right text-ink-soft">{money(row.realValue, currency)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="ledger-rule pt-6 mb-8">
        <p className="text-xs text-ink-soft leading-relaxed">
          Assumptions: {inputs.annualReturnPct}% annual return, {inputs.annualFeesPct}% annual
          fees, {inputs.annualInflationPct}% annual inflation, compounded monthly. This is a
          deterministic projection based on constant assumed rates &mdash; real markets don&apos;t
          move in a straight line. For educational planning only, not financial advice.
        </p>
      </div>

      <form action={saveInvestmentScenario} className="flex items-end gap-2">
        <input type="hidden" name="initial_amount" value={inputs.initialAmount} />
        <input type="hidden" name="monthly_contribution" value={inputs.monthlyContribution} />
        <input type="hidden" name="years" value={inputs.years} />
        <input type="hidden" name="annual_return_pct" value={inputs.annualReturnPct} />
        <input type="hidden" name="annual_inflation_pct" value={inputs.annualInflationPct} />
        <input type="hidden" name="annual_fees_pct" value={inputs.annualFeesPct} />
        <div>
          <label className="block text-xs text-ink-soft mb-1">Save this scenario as</label>
          <input
            name="name"
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="e.g. Retirement, base case"
            className="border border-rule bg-white px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-parchment transition-colors">
          Save
        </button>
      </form>
    </div>
  );
}
