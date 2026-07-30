import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { getInvestmentScenarios } from "@/lib/data/investments";
import { deleteInvestmentScenario } from "@/lib/actions";
import { PremiumLockedCard } from "@/components/PremiumLockedCard";
import { InvestmentCalculator } from "@/components/InvestmentCalculator";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export default async function InvestmentsPage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  if (profile.plan !== "premium") {
    return (
      <PremiumLockedCard
        title="Investments"
        description="Run what-if projections — initial amount, monthly contribution, expected return, and inflation — to see how your investments could grow over time. Deterministic math, no AI."
      />
    );
  }

  const scenarios = await getInvestmentScenarios(userId);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Investments</h1>
      <div className="gilt-flourish mb-6" />
      <p className="text-ink-soft text-sm mb-8 max-w-lg leading-relaxed">
        See what a monthly contribution could realistically turn into over time,
        before committing real money to it. Change any number below and the
        results update instantly &mdash; there's no need to click "calculate."
        This is a standalone what-if tool: it doesn't read from or write to your
        transactions or goals.
      </p>

      <InvestmentCalculator currency={profile.currency} />

      {scenarios.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl text-ink mb-4">Saved scenarios</h2>
          <div>
            {scenarios.map((s) => (
              <div key={s.id} className="ledger-rule py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink">{s.name}</p>
                  <p className="tabular text-xs text-ink-soft">
                    {money(s.inputs.initialAmount, profile.currency)} initial,{" "}
                    {money(s.inputs.monthlyContribution, profile.currency)}/mo,{" "}
                    {s.inputs.years}y @ {s.inputs.annualReturnPct}%
                  </p>
                </div>
                <ConfirmDeleteForm
                  action={deleteInvestmentScenario.bind(null, s.id) as unknown as (fd: FormData) => void}
                  confirmMessage={`Delete scenario "${s.name}"?`}
                >
                  <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                    Delete
                  </button>
                </ConfirmDeleteForm>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
