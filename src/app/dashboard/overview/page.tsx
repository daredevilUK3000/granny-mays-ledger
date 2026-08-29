import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { getMonthSummary, currentMonth } from "@/lib/data/transactions";
import { getCategories } from "@/lib/data/categories";
import { getGoals } from "@/lib/data/goals";
import { getProfile } from "@/lib/data/profile";
import { getGrannyScore } from "@/lib/data/granny-score";
import { getScoreBadge, getStreakBadge, getUnspentBadge } from "@/lib/badges";
import { ShareBadgeButton } from "@/components/ShareBadgeButton";
import { UnspentTracker } from "@/components/UnspentTracker";
import { getUnspentWins, sumUnspentWins, unspentWinsThisMonth } from "@/lib/data/decisions";

// Character stats realistically land somewhere around -50..+100 after a
// handful of days played anonymously — map that range onto a 0-100% bar.
function statBarWidth(n: number) {
  return Math.max(0, Math.min(100, ((n + 50) / 150) * 100));
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const userId = await requireUserId();
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonth();

  const [summary, categories, profile, { goals }, grannyScore, unspentWins] = await Promise.all([
    getMonthSummary(userId, month),
    getCategories(userId),
    getProfile(userId),
    getGoals(userId, false),
    getGrannyScore(userId),
    getUnspentWins(userId),
  ]);

  const unspentTotalThisMonth = sumUnspentWins(unspentWinsThisMonth(unspentWins, month));
  const unspentBadge = getUnspentBadge(sumUnspentWins(unspentWins));

  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const spendingByCategory = Array.from(summary.byCategory.entries())
    .map(([id, amount]) => ({ name: categoryName.get(id) ?? "Uncategorized", amount }))
    .sort((a, b) => b.amount - a.amount);

  const currency = profile.currency;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-3xl text-ink">Overview</h1>
        <div className="flex items-center gap-3 tabular text-sm">
          <Link href={`/dashboard/overview?month=${shiftMonth(month, -1)}`} className="text-ink-soft hover:text-ink">
            &larr;
          </Link>
          <span className="text-ink">{month}</span>
          <Link href={`/dashboard/overview?month=${shiftMonth(month, 1)}`} className="text-ink-soft hover:text-ink">
            &rarr;
          </Link>
        </div>
      </div>
      <div className="gilt-flourish mb-8" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="ledger-card p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wide">Income</p>
          <p className="tabular text-xl text-sage mt-1">{money(summary.income, currency)}</p>
        </div>
        <div className="ledger-card p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wide">Expenses</p>
          <p className="tabular text-xl text-rust mt-1">{money(summary.expenses, currency)}</p>
        </div>
        <div className="ledger-card p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wide">Cashflow</p>
          <p className="tabular text-xl text-ink mt-1">{money(summary.cashflow, currency)}</p>
        </div>
        <div className="ledger-card p-4">
          <p className="text-xs text-ink-soft uppercase tracking-wide">Savings rate</p>
          <p className="tabular text-xl text-ink mt-1">{(summary.savingsRate * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="max-w-xs mb-10">
        <UnspentTracker
          initialTotalThisMonth={unspentTotalThisMonth}
          currency={currency}
          badge={unspentBadge}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h2 className="font-display text-xl text-ink mb-4">Spending by category</h2>
          {spendingByCategory.length === 0 ? (
            <p className="text-ink-soft text-sm">No expenses logged yet this month.</p>
          ) : (
            <div>
              {spendingByCategory.map((c) => (
                <div key={c.name} className="ledger-rule py-2 flex items-center justify-between">
                  <span className="text-sm text-ink">{c.name}</span>
                  <span className="tabular text-sm text-ink">{money(c.amount, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-4">Goals</h2>
          {goals.length === 0 ? (
            <p className="text-ink-soft text-sm">
              No goals yet.{" "}
              <Link href="/dashboard/goals" className="underline">
                Set one up
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-4">
              {goals.map((g) => (
                <div key={g.id} className="ledger-rule pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink">{g.name}</span>
                    <span className="tabular text-xs text-ink-soft">
                      {money(g.metrics.currentAmount, currency)} / {money(Number(g.target_amount), currency)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-parchment-dim mt-2">
                    <div
                      className="h-full bg-sage"
                      style={{ width: `${Math.min(100, g.metrics.progress * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {grannyScore && (
        <div className="ledger-card p-5 mt-10 max-w-sm">
          <p className="text-xs text-ink-soft uppercase tracking-wide">
            From Granny&rsquo;s Money Corner
          </p>
          <p className="tabular text-2xl text-gilt-bright mt-1">{grannyScore.score}</p>

          {(() => {
            const scoreBadge = getScoreBadge(grannyScore.score);
            const streakBadge = getStreakBadge(grannyScore.streak);
            const shareBadge = scoreBadge ?? streakBadge;
            if (!scoreBadge && !streakBadge) return null;
            return (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {scoreBadge && (
                  <span className="tabular rounded-full bg-gilt-soft px-3 py-1 text-xs text-gilt">
                    🎖️ {scoreBadge.name}
                  </span>
                )}
                {streakBadge && (
                  <span className="tabular rounded-full bg-rust-soft px-3 py-1 text-xs text-rust">
                    🔥 {streakBadge.name}
                  </span>
                )}
                {shareBadge && (
                  <ShareBadgeButton
                    badgeId={shareBadge.id}
                    label="Share"
                    className="tabular text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
                  />
                )}
              </div>
            );
          })()}

          <div className="space-y-2 mt-4">
            {[
              { label: "Savings discipline", value: grannyScore.savings_discipline, tone: "bg-sage" },
              { label: "Impulse control", value: grannyScore.impulse_control, tone: "bg-plum" },
              { label: "Debt management", value: grannyScore.debt_management, tone: "bg-rust" },
              { label: "Budgeting", value: grannyScore.budgeting, tone: "bg-gilt" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-ink-soft">{stat.label}</span>
                  <span className="tabular text-xs text-ink-soft">{stat.value}</span>
                </div>
                <div className="h-1.5 bg-parchment-dim mt-1">
                  <div className={`h-full ${stat.tone}`} style={{ width: `${statBarWidth(stat.value)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
