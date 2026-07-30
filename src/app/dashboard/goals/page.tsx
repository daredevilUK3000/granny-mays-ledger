import { requireUserId } from "@/lib/auth";
import { getGoals } from "@/lib/data/goals";
import { getProfile } from "@/lib/data/profile";
import { createGoal, deleteGoal, addGoalContribution } from "@/lib/actions";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export default async function GoalsPage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);
  const isPremium = profile.plan === "premium";
  const { goals, limit } = await getGoals(userId, isPremium);
  const currency = profile.currency;
  const atLimit = goals.length >= limit;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Goals</h1>
      <div className="gilt-flourish mb-4" />
      <p className="text-ink-soft text-sm mb-8">
        {goals.length} of {limit} goals used
        {!isPremium && " (free plan)"}
      </p>

      <section className="mb-12">
        {atLimit ? (
          <p className="ledger-rule pt-4 text-sm text-ink-soft">
            {isPremium
              ? `You've reached the maximum of ${limit} goals.`
              : `Free includes up to ${limit} goals. Upgrade for up to 5.`}
          </p>
        ) : (
          <>
            <h2 className="font-display text-xl text-ink mb-4">New goal</h2>
            <form action={createGoal} className="grid sm:grid-cols-5 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs text-ink-soft mb-1">Name</label>
                <input name="name" type="text" required className="w-full border border-rule bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-ink-soft mb-1">Type</label>
                <select name="goal_type" className="w-full border border-rule bg-white px-3 py-2 text-sm">
                  <option value="savings">Savings</option>
                  <option value="emergency_fund">Emergency fund</option>
                  <option value="purchase">Purchase</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink-soft mb-1">Target amount</label>
                <input name="target_amount" type="number" step="0.01" required className="w-full border border-rule bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-ink-soft mb-1">Target date (optional)</label>
                <input name="target_date" type="date" className="w-full border border-rule bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-ink-soft mb-1">Starting amount</label>
                <input name="starting_amount" type="number" step="0.01" defaultValue="0" className="w-full border border-rule bg-white px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="rounded-full rounded-full border border-ink bg-ink text-parchment px-5 py-2.5 text-sm hover:bg-transparent hover:text-ink transition-colors">
                Create goal
              </button>
            </form>
          </>
        )}
      </section>

      <section className="space-y-8">
        {goals.map((g) => (
          <div key={g.id} className="ledger-rule pt-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-display text-lg text-ink">{g.name}</h3>
                <p className="text-xs text-ink-soft capitalize">{g.goal_type.replace("_", " ")}</p>
              </div>
              <ConfirmDeleteForm
                action={deleteGoal.bind(null, g.id) as unknown as (fd: FormData) => void}
                confirmMessage={`Delete goal "${g.name}"?`}
              >
                <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                  Delete
                </button>
              </ConfirmDeleteForm>
            </div>

            <div className="flex items-baseline justify-between mb-1">
              <span className="tabular text-sm text-ink">
                {money(g.metrics.currentAmount, currency)} / {money(Number(g.target_amount), currency)}
              </span>
              {g.metrics.onTrack !== null && (
                <span
                  className={`tabular text-xs px-2 py-0.5 ${
                    g.metrics.onTrack ? "text-sage bg-sage-soft" : "text-rust bg-rust-soft"
                  }`}
                >
                  {g.metrics.onTrack ? "On track" : "Behind"}
                </span>
              )}
            </div>
            <div className="h-1.5 bg-parchment-dim mb-2">
              <div className="h-full bg-sage" style={{ width: `${Math.min(100, g.metrics.progress * 100)}%` }} />
            </div>
            {g.metrics.requiredMonthly !== null && (
              <p className="text-xs text-ink-soft mb-4">
                Required monthly contribution:{" "}
                <span className="tabular">{money(g.metrics.requiredMonthly, currency)}</span>
              </p>
            )}

            <form action={addGoalContribution} className="flex items-end gap-2">
              <input type="hidden" name="goal_id" value={g.id} />
              <div>
                <label className="block text-xs text-ink-soft mb-1">Add contribution</label>
                <input name="amount" type="number" step="0.01" required className="border border-rule bg-white px-2 py-1 text-sm w-28" />
              </div>
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
      </section>
    </div>
  );
}
