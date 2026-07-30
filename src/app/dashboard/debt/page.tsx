import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { getDebts, getDebtPlan } from "@/lib/data/debt";
import { computeDebtPayoff } from "@/lib/calc/debt";
import { createDebt, deleteDebt, saveDebtPlan } from "@/lib/actions";
import { PremiumLockedCard } from "@/components/PremiumLockedCard";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

function formatMonths(months: number): string {
  if (months <= 0) return "\u2014";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} month${rem === 1 ? "" : "s"}`;
  if (rem === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years}y ${rem}mo`;
}

export default async function DebtPage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  if (profile.plan !== "premium") {
    return (
      <PremiumLockedCard
        title="Debt payoff"
        description="Add your debts and compare snowball vs. avalanche payoff strategies, with a full amortization schedule and interest saved."
      />
    );
  }

  const [debts, plan] = await Promise.all([getDebts(userId), getDebtPlan(userId)]);
  const currency = profile.currency;

  const result = computeDebtPayoff(
    debts.map((d) => ({ id: d.id, name: d.name, balance: d.balance, apr: d.apr, minPayment: d.minPayment })),
    plan.strategy,
    plan.extraMonthlyPayment
  );

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Debt payoff</h1>
      <div className="gilt-flourish mb-6" />
      <p className="text-ink-soft text-sm mb-8 max-w-lg leading-relaxed">
        Add every debt you're carrying, and this works out roughly how long
        you'll be paying it off and how much interest you'll pay in total &mdash;
        so you can compare strategies before picking one. "Avalanche" tackles
        your highest interest rate first (saves the most money); "snowball"
        tackles your smallest balance first (clears a debt off your list
        fastest, which some people find easier to stick with).
      </p>

      <section className="mb-12">
        <h2 className="font-display text-xl text-ink mb-4">Add a debt</h2>
        <form action={createDebt} className="grid sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs text-ink-soft mb-1">Name</label>
            <input name="name" type="text" required className="w-full border border-rule bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">Balance</label>
            <input name="balance" type="number" step="0.01" required className="w-full border border-rule bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">APR (%)</label>
            <input name="apr" type="number" step="0.01" defaultValue="0" className="w-full border border-rule bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">Min. payment</label>
            <input name="min_payment" type="number" step="0.01" required className="w-full border border-rule bg-white px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full rounded-full border border-ink bg-ink text-parchment px-5 py-2.5 text-sm hover:bg-transparent hover:text-ink transition-colors">
            Add
          </button>
        </form>
      </section>

      {debts.length === 0 ? (
        <p className="text-ink-soft text-sm">Add your debts above to see a payoff plan.</p>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="font-display text-xl text-ink mb-4">Strategy</h2>
            <form action={saveDebtPlan} className="flex items-end gap-4">
              <div>
                <label className="block text-xs text-ink-soft mb-1">Approach</label>
                <select name="strategy" defaultValue={plan.strategy} className="border border-rule bg-white px-3 py-2 text-sm">
                  <option value="avalanche">Avalanche (highest APR first)</option>
                  <option value="snowball">Snowball (smallest balance first)</option>
                  <option value="fixed_extra">Split evenly, no prioritization</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink-soft mb-1">Extra per month</label>
                <input
                  name="extra_monthly_payment"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={plan.extraMonthlyPayment}
                  className="border border-rule bg-white px-3 py-2 text-sm w-32"
                />
              </div>
              <button type="submit" className="border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-parchment transition-colors">
                Save
              </button>
            </form>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-xl text-ink mb-4">Your debts</h2>
            <div>
              {debts.map((d) => (
                <div key={d.id} className="ledger-rule py-2 flex items-center justify-between">
                  <span className="text-sm text-ink">
                    {d.name}{" "}
                    <span className="tabular text-xs text-ink-soft">
                      {money(d.balance, currency)} @ {d.apr}% APR, min {money(d.minPayment, currency)}
                    </span>
                  </span>
                  <ConfirmDeleteForm
                    action={deleteDebt.bind(null, d.id) as unknown as (fd: FormData) => void}
                    confirmMessage={`Delete debt "${d.name}"?`}
                  >
                    <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                      Delete
                    </button>
                  </ConfirmDeleteForm>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink mb-4">Payoff plan</h2>
            {result.hitSafetyCap ? (
              <p className="ledger-rule pt-4 text-sm text-rust max-w-md">
                At these minimum payments and this extra amount, your balances aren&apos;t
                shrinking &mdash; interest is outpacing what you&apos;re paying down. Try
                increasing the extra monthly payment.
              </p>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="ledger-card p-4">
                    <p className="text-xs text-ink-soft uppercase tracking-wide">Debt-free in</p>
                    <p className="tabular text-xl text-sage mt-1">{formatMonths(result.monthsToDebtFree)}</p>
                  </div>
                  <div className="ledger-card p-4">
                    <p className="text-xs text-ink-soft uppercase tracking-wide">Total interest paid</p>
                    <p className="tabular text-xl text-rust mt-1">{money(result.totalInterestPaid, currency)}</p>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="ledger-rule text-left text-xs text-ink-soft uppercase tracking-wide">
                      <th className="py-2 font-normal">Debt</th>
                      <th className="py-2 font-normal text-right">Paid off in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.perDebt
                      .slice()
                      .sort((a, b) => (a.payoffMonth ?? 9999) - (b.payoffMonth ?? 9999))
                      .map((d) => (
                        <tr key={d.id} className="ledger-rule">
                          <td className="py-2">{d.name}</td>
                          <td className="py-2 tabular text-right">
                            {d.payoffMonth !== null ? formatMonths(d.payoffMonth) : "\u2014"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </>
            )}
            <p className="text-xs text-ink-soft leading-relaxed mt-6">
              Assumes fixed APRs, on-time payments every month, and no new charges added to
              any balance. For educational planning only, not financial advice.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
