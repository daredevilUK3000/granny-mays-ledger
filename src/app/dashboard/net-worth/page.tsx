import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { getNetWorthSnapshots } from "@/lib/data/networth";
import { getAverageMonthlySurplus } from "@/lib/data/transactions";
import { computeTimeToFreedom } from "@/lib/calc/freedom";
import {
  createSnapshot,
  deleteSnapshot,
  addNetWorthItem,
  deleteNetWorthItem,
} from "@/lib/actions";
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

export default async function NetWorthPage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  if (profile.plan !== "premium") {
    return (
      <PremiumLockedCard
        title="Net worth"
        description="Track assets and liabilities over time with monthly snapshots and a trend view."
      />
    );
  }

  const snapshots = await getNetWorthSnapshots(userId);
  const currency = profile.currency;
  const trend = [...snapshots].reverse(); // oldest first, for the trend table

  const { avgSurplus, monthsOfData } = await getAverageMonthlySurplus(userId, 6);
  const latestNetWorth = snapshots.length > 0 ? snapshots[0].netWorth : null;
  const freedom = computeTimeToFreedom(latestNetWorth, avgSurplus, monthsOfData);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Net worth</h1>
      <div className="gilt-flourish mb-6" />
      <p className="text-ink-soft text-sm mb-8 max-w-lg leading-relaxed">
        Your day-to-day budget tells you where money's going month to month, but
        it doesn't show whether you're actually getting wealthier overall. A
        snapshot &mdash; everything you own minus everything you owe, on a given
        date &mdash; does that. Add a new one every so often (monthly is typical)
        and a trend builds up automatically below.
      </p>

      <section className="mb-12">
        <h2 className="font-display text-xl text-ink mb-4">Time to freedom</h2>
        {freedom.status === "no-net-worth-data" && (
          <p className="ledger-rule pt-4 text-sm text-ink-soft max-w-md">
            Add your first snapshot below to see a projection here.
          </p>
        )}
        {freedom.status === "no-transaction-data" && (
          <p className="ledger-rule pt-4 text-sm text-ink-soft max-w-md">
            Log a few months of transactions on the Budget page &mdash; this
            projection is based on your actual average monthly savings rate.
          </p>
        )}
        {freedom.status === "not-growing" && (
          <p className="ledger-rule pt-4 text-sm text-rust max-w-md">
            Over your last {monthsOfData} month{monthsOfData === 1 ? "" : "s"} of
            transactions, expenses have matched or outpaced income
            ({money(freedom.avgMonthlySurplus, currency)}/mo on average), so
            there's no current pace to project forward from.
          </p>
        )}
        {freedom.status === "projected" && (
          <div className="ledger-rule pt-4 max-w-md">
            <p className="text-sm text-ink-soft mb-4">
              Based on your average monthly savings of{" "}
              <span className="tabular text-ink">{money(freedom.avgMonthlySurplus, currency)}</span>{" "}
              over the last {monthsOfData} month{monthsOfData === 1 ? "" : "s"}:
            </p>
            <div className="space-y-2">
              {freedom.milestones.map((m) => (
                <div key={m.amount} className="flex items-baseline justify-between">
                  <span className="tabular text-sm text-ink">{money(m.amount, currency)}</span>
                  <span className="tabular text-sm text-sage">in {formatMonths(m.months)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-soft leading-relaxed mt-4">
              Assumes your savings rate stays constant and doesn't account for
              investment growth on money already saved &mdash; for that, try the{" "}
              <a href="/dashboard/investments" className="underline">
                Investments
              </a>{" "}
              calculator. For planning purposes only, not a guarantee.
            </p>
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="font-display text-xl text-ink mb-4">New snapshot</h2>
        <form action={createSnapshot} className="flex items-end gap-3">
          <div>
            <label className="block text-xs text-ink-soft mb-1">Date</label>
            <input
              name="snapshot_date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="border border-rule bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">Note (optional)</label>
            <input name="note" type="text" className="border border-rule bg-white px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full rounded-full border border-ink bg-ink text-parchment px-5 py-2.5 text-sm hover:bg-transparent hover:text-ink transition-colors">
            Create
          </button>
        </form>
        <p className="text-xs text-ink-soft mt-2">
          Creating a snapshot for a date that already has one just opens it up to edit &mdash; it
          won&apos;t create a duplicate.
        </p>
      </section>

      {trend.length > 1 && (
        <section className="mb-12">
          <h2 className="font-display text-xl text-ink mb-4">Trend</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="ledger-rule text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="py-2 font-normal">Date</th>
                <th className="py-2 font-normal text-right">Net worth</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((s) => (
                <tr key={s.id} className="ledger-rule">
                  <td className="py-1.5 tabular">{s.snapshot_date}</td>
                  <td className="py-1.5 tabular text-right">{money(s.netWorth, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="space-y-10">
        {snapshots.map((s) => (
          <div key={s.id} className="ledger-rule pt-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-lg text-ink">{s.snapshot_date}</h3>
                {s.note && <p className="text-xs text-ink-soft">{s.note}</p>}
              </div>
              <ConfirmDeleteForm
                action={deleteSnapshot.bind(null, s.id) as unknown as (fd: FormData) => void}
                confirmMessage={`Delete the ${s.snapshot_date} snapshot and all its items?`}
              >
                <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                  Delete snapshot
                </button>
              </ConfirmDeleteForm>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="ledger-card p-3">
                <p className="text-xs text-ink-soft uppercase tracking-wide">Assets</p>
                <p className="tabular text-lg text-sage mt-1">{money(s.totalAssets, currency)}</p>
              </div>
              <div className="ledger-card p-3">
                <p className="text-xs text-ink-soft uppercase tracking-wide">Liabilities</p>
                <p className="tabular text-lg text-rust mt-1">{money(s.totalLiabilities, currency)}</p>
              </div>
              <div className="ledger-card p-3">
                <p className="text-xs text-ink-soft uppercase tracking-wide">Net worth</p>
                <p className="tabular text-lg text-ink mt-1">{money(s.netWorth, currency)}</p>
              </div>
            </div>

            {s.items.length > 0 && (
              <div className="mb-4">
                {s.items.map((item) => (
                  <div key={item.id} className="ledger-rule py-2 flex items-center justify-between">
                    <span className="text-sm text-ink">
                      {item.label} <span className="text-ink-soft text-xs">({item.category})</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`tabular text-sm ${item.kind === "asset" ? "text-sage" : "text-rust"}`}>
                        {money(item.value, currency)}
                      </span>
                      <ConfirmDeleteForm
                        action={deleteNetWorthItem.bind(null, item.id) as unknown as (fd: FormData) => void}
                        confirmMessage={`Delete "${item.label}"?`}
                      >
                        <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                          Delete
                        </button>
                      </ConfirmDeleteForm>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form action={addNetWorthItem} className="grid sm:grid-cols-5 gap-2 items-end">
              <input type="hidden" name="snapshot_id" value={s.id} />
              <select name="kind" className="border border-rule bg-white px-2 py-1.5 text-sm">
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
              </select>
              <input name="category" type="text" placeholder="Category (e.g. Cash)" className="border border-rule bg-white px-2 py-1.5 text-sm" />
              <input name="label" type="text" placeholder="Label (e.g. Checking account)" className="border border-rule bg-white px-2 py-1.5 text-sm" />
              <input name="value" type="number" step="0.01" placeholder="Value" className="border border-rule bg-white px-2 py-1.5 text-sm" />
              <button type="submit" className="text-sm border border-ink px-3 py-1.5 hover:bg-ink hover:text-parchment transition-colors">
                Add item
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
