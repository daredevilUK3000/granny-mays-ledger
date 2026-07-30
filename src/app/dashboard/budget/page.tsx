import { requireUserId } from "@/lib/auth";
import { getCategories } from "@/lib/data/categories";
import { getTransactionsForMonth, currentMonth } from "@/lib/data/transactions";
import { getBudgetPlanForMonth } from "@/lib/data/budget";
import { getProfile } from "@/lib/data/profile";
import { getSinkingFunds } from "@/lib/data/sinkingfunds";
import {
  createTransaction,
  deleteTransaction,
  resetTransactions,
  saveBudgetPlan,
  createSinkingFund,
  deleteSinkingFund,
  addSinkingFundContribution,
} from "@/lib/actions";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const userId = await requireUserId();
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonth();

  const [categories, transactions, budgetItems, profile] = await Promise.all([
    getCategories(userId),
    getTransactionsForMonth(userId, month),
    getBudgetPlanForMonth(userId, month),
    getProfile(userId),
  ]);

  const isPremium = profile.plan === "premium";
  const { funds: sinkingFunds, limit: sinkingFundLimit } = await getSinkingFunds(
    userId,
    isPremium
  );

  const currency = profile.currency;
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Budget</h1>
      <div className="gilt-flourish mb-8" />

      {/* Add transaction */}
      <section className="mb-12">
        <h2 className="font-display text-xl text-ink mb-4">Add a transaction</h2>
        <form action={createTransaction} className="grid sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs text-ink-soft mb-1">Type</label>
            <select name="type" className="w-full border border-rule bg-white px-3 py-2 text-sm">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">Category</label>
            <select name="category_id" className="w-full border border-rule bg-white px-3 py-2 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">Amount</label>
            <input name="amount" type="number" step="0.01" required className="w-full border border-rule bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">Date</label>
            <input name="tx_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full border border-rule bg-white px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full rounded-full border border-ink bg-ink text-parchment px-5 py-2.5 text-sm hover:bg-transparent hover:text-ink transition-colors">
            Add
          </button>
          <div className="sm:col-span-5">
            <label className="block text-xs text-ink-soft mb-1">Note (optional)</label>
            <input name="note" type="text" className="w-full border border-rule bg-white px-3 py-2 text-sm" placeholder="e.g. Groceries, rent..." />
          </div>
        </form>
      </section>

      {/* Monthly budget */}
      <section className="mb-12">
        <h2 className="font-display text-xl text-ink mb-1">Monthly budget &mdash; {month}</h2>
        <p className="text-ink-soft text-sm mb-4">Set a planned amount per category and track how you're doing.</p>
        {budgetItems.length === 0 ? (
          <p className="text-ink-soft text-sm">Add an expense category first to set a budget.</p>
        ) : (
          <div>
            {budgetItems.map((item) => (
              <div key={item.categoryId} className="ledger-rule py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ink">{item.categoryName}</span>
                  {item.status === "over" && (
                    <span className="tabular text-xs text-rust bg-rust-soft px-2 py-0.5">
                      Over by {money(item.actualAmount - item.plannedAmount, currency)}
                    </span>
                  )}
                  {item.status === "under" && (
                    <span className="tabular text-xs text-sage bg-sage-soft px-2 py-0.5">
                      {money(item.remaining, currency)} left
                    </span>
                  )}
                  {item.status === "unplanned" && (
                    <span className="text-xs text-ink-soft">No budget set</span>
                  )}
                </div>
                <div className="h-1.5 bg-parchment-dim mb-2">
                  <div
                    className={item.status === "over" ? "h-full bg-rust" : "h-full bg-sage"}
                    style={{
                      width: `${item.plannedAmount > 0 ? Math.min(100, (item.actualAmount / item.plannedAmount) * 100) : 0}%`,
                    }}
                  />
                </div>
                <form action={saveBudgetPlan} className="flex items-center gap-2">
                  <input type="hidden" name="category_id" value={item.categoryId} />
                  <input type="hidden" name="month" value={month} />
                  <span className="text-xs text-ink-soft">Planned</span>
                  <input
                    name="planned_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={item.plannedAmount || ""}
                    className="border border-rule bg-white px-2 py-1 text-sm w-28"
                  />
                  <span className="tabular text-xs text-ink-soft">
                    Spent so far: {money(item.actualAmount, currency)}
                  </span>
                  <button type="submit" className="text-xs border border-ink px-2 py-1 hover:bg-ink hover:text-parchment transition-colors">
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sinking funds */}
      <section className="mb-12">
        <h2 className="font-display text-xl text-ink mb-1">Sinking funds</h2>
        <p className="text-ink-soft text-sm mb-4 max-w-lg leading-relaxed">
          For expenses you know are coming but don&apos;t happen monthly &mdash; an
          annual insurance bill, a holiday, a big repair. Set a target and start
          setting money aside now, so it's not a surprise later.
          {!isPremium && ` Free includes ${sinkingFundLimit} at a time.`}
        </p>

        {sinkingFunds.length > 0 && (
          <div className="space-y-6 mb-6">
            {sinkingFunds.map((f) => (
              <div key={f.id} className="ledger-rule pt-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm text-ink">{f.name}</h3>
                  <ConfirmDeleteForm
                    action={deleteSinkingFund.bind(null, f.id) as unknown as (fd: FormData) => void}
                    confirmMessage={`Delete sinking fund "${f.name}"?`}
                  >
                    <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                      Delete
                    </button>
                  </ConfirmDeleteForm>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="tabular text-sm text-ink">
                    {money(f.metrics.currentAmount, currency)} / {money(Number(f.target_amount), currency)}
                  </span>
                  {f.metrics.requiredMonthly !== null && (
                    <span className="tabular text-xs text-ink-soft">
                      Needs {money(f.metrics.requiredMonthly, currency)}/mo
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-parchment-dim mb-3">
                  <div className="h-full bg-plum" style={{ width: `${Math.min(100, f.metrics.progress * 100)}%` }} />
                </div>
                <form action={addSinkingFundContribution} className="flex items-end gap-2">
                  <input type="hidden" name="fund_id" value={f.id} />
                  <input name="amount" type="number" step="0.01" placeholder="Amount" required className="border border-rule bg-white px-2 py-1 text-sm w-28" />
                  <input
                    name="contrib_date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="border border-rule bg-white px-2 py-1 text-sm"
                  />
                  <button type="submit" className="text-xs border border-ink px-3 py-1.5 hover:bg-ink hover:text-parchment transition-colors">
                    Add
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {sinkingFunds.length >= sinkingFundLimit ? (
          <p className="text-xs text-ink-soft">
            {isPremium
              ? `You've reached the maximum of ${sinkingFundLimit} sinking funds.`
              : `Free includes ${sinkingFundLimit} sinking fund. Upgrade for up to ${20}.`}
          </p>
        ) : (
          <form action={createSinkingFund} className="grid sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-ink-soft mb-1">Name</label>
              <input name="name" type="text" required placeholder="e.g. Car insurance" className="w-full border border-rule bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-ink-soft mb-1">Target amount</label>
              <input name="target_amount" type="number" step="0.01" required className="w-full border border-rule bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-ink-soft mb-1">Needed by (optional)</label>
              <input name="target_date" type="date" className="w-full border border-rule bg-white px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-full rounded-full border border-ink bg-ink text-parchment px-5 py-2.5 text-sm hover:bg-transparent hover:text-ink transition-colors">
              Create
            </button>
          </form>
        )}
      </section>

      {/* Transaction history */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink">Transaction history &mdash; {month}</h2>
          <ConfirmDeleteForm
            action={resetTransactions}
            confirmMessage="This will permanently delete ALL your transactions. Continue?"
          >
            <button type="submit" className="text-xs text-rust hover:underline">
              Reset all data
            </button>
          </ConfirmDeleteForm>
        </div>
        {transactions.length === 0 ? (
          <p className="text-ink-soft text-sm">No transactions logged this month yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="ledger-rule text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="py-2 font-normal">Date</th>
                <th className="py-2 font-normal">Category</th>
                <th className="py-2 font-normal text-right">Amount</th>
                <th className="py-2 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="ledger-rule">
                  <td className="py-2 tabular">{t.tx_date}</td>
                  <td className="py-2">{t.category_id ? categoryName.get(t.category_id) : "\u2014"}</td>
                  <td className={`py-2 tabular text-right ${t.type === "income" ? "text-sage" : "text-rust"}`}>
                    {t.type === "income" ? "+" : "-"}
                    {money(Number(t.amount), currency)}
                  </td>
                  <td className="py-2 text-right">
                    <ConfirmDeleteForm
                      action={deleteTransaction.bind(null, t.id) as unknown as (fd: FormData) => void}
                      confirmMessage="Delete this record?"
                    >
                      <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                        Delete
                      </button>
                    </ConfirmDeleteForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
