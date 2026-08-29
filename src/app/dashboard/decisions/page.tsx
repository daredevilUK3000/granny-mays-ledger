import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { getDecisions, getDueForReview, getUnspentWins, sumUnspentWins } from "@/lib/data/decisions";
import { getLifeWinsEvents } from "@/lib/data/lifewins";
import { createDecision, recordDecisionOutcome, deleteDecision, deleteUnspentWin } from "@/lib/actions";
import { getUnspentBadge } from "@/lib/badges";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { UnspentTracker } from "@/components/UnspentTracker";

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

function defaultReviewDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().slice(0, 10);
}

function eventLabel(e: Awaited<ReturnType<typeof getLifeWinsEvents>>[number], currency: string): string {
  if (e.kind === "net_worth_milestone") return `Net worth passed ${money(e.amount, currency)}`;
  if (e.kind === "goal_completed") return `Goal reached: ${e.name}`;
  return `Sinking fund complete: ${e.name}`;
}

export default async function DecisionsPage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);
  const isPremium = profile.plan === "premium";
  const currency = profile.currency;

  const decisions = await getDecisions(userId);
  const dueForReview = getDueForReview(decisions);

  const unspentWins = await getUnspentWins(userId);
  const unspentTotal = sumUnspentWins(unspentWins);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const unspentTotalThisMonth = sumUnspentWins(
    unspentWins.filter((w) => w.decision_date.startsWith(thisMonth))
  );
  const unspentBadge = getUnspentBadge(unspentTotal);

  const bestDecision = decisions
    .filter((d) => d.estimated_amount !== null && d.estimated_amount > 0)
    .sort((a, b) => (b.estimated_amount ?? 0) - (a.estimated_amount ?? 0))[0];
  const biggestRegret = decisions
    .filter((d) => d.estimated_amount !== null && d.estimated_amount < 0)
    .sort((a, b) => (a.estimated_amount ?? 0) - (b.estimated_amount ?? 0))[0];

  const lifeWins = isPremium ? await getLifeWinsEvents(userId) : [];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Decisions</h1>
      <div className="gilt-flourish mb-6" />
      <p className="text-ink-soft text-sm mb-8 max-w-lg leading-relaxed">
        Not another report of where your money went &mdash; a record of the
        significant financial decisions you make and why, so you can look back
        and actually learn from them. Bought the cheaper car? Cancelled a
        subscription? Log it, set a date to check back in, and build up your
        own track record over time.
      </p>

      {dueForReview.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-xl text-ink mb-4">Ready for review</h2>
          <div className="space-y-4">
            {dueForReview.map((d) => (
              <div key={d.id} className="ledger-rule pt-4">
                <p className="text-sm text-ink mb-1">{d.title}</p>
                {d.expected_outcome && (
                  <p className="text-xs text-ink-soft mb-3">Expected: {d.expected_outcome}</p>
                )}
                <p className="text-sm text-ink mb-2">Did this decision improve your finances?</p>
                <div className="flex gap-2">
                  <form action={recordDecisionOutcome}>
                    <input type="hidden" name="decision_id" value={d.id} />
                    <input type="hidden" name="outcome" value="worked" />
                    <button type="submit" className="text-sm border border-sage text-sage px-4 py-1.5 hover:bg-sage hover:text-parchment transition-colors">
                      Yes
                    </button>
                  </form>
                  <form action={recordDecisionOutcome}>
                    <input type="hidden" name="decision_id" value={d.id} />
                    <input type="hidden" name="outcome" value="did_not_work" />
                    <button type="submit" className="text-sm border border-rust text-rust px-4 py-1.5 hover:bg-rust hover:text-parchment transition-colors">
                      No
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-12">
        <h2 className="font-display text-xl text-ink mb-4">Track the un-spent</h2>
        <p className="text-ink-soft text-sm mb-4 max-w-lg leading-relaxed">
          Skipped a coffee? Closed the cart instead of checking out? Log the moments you
          chose not to spend &mdash; a motivational tally, kept separate from your real
          numbers.
        </p>
        <div className="max-w-xs mb-6">
          <UnspentTracker
            initialTotalThisMonth={unspentTotalThisMonth}
            currency={currency}
            badge={unspentBadge}
          />
        </div>
        {unspentWins.length > 0 && (
          <div>
            {unspentWins.map((w) => (
              <div key={w.id} className="ledger-rule py-2 flex items-start justify-between">
                <div>
                  <p className="text-sm text-ink">{w.title}</p>
                  <p className="tabular text-xs text-ink-soft">
                    {w.decision_date}
                    <span className="text-plum"> &middot; {money(w.amount, currency)}</span>
                    {w.category_name && <span> &middot; {w.category_name}</span>}
                  </p>
                </div>
                <ConfirmDeleteForm
                  action={deleteUnspentWin.bind(null, w.id) as unknown as (fd: FormData) => void}
                  confirmMessage={`Delete "${w.title}"?`}
                >
                  <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                    Delete
                  </button>
                </ConfirmDeleteForm>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="font-display text-xl text-ink mb-4">Log a decision</h2>
        <form action={createDecision} className="space-y-3 max-w-xl">
          <div>
            <label className="block text-xs text-ink-soft mb-1">What did you decide?</label>
            <input name="title" type="text" required placeholder="e.g. Bought the cheaper car instead of the pricier one" className="w-full border border-rule bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">Why? (optional)</label>
            <textarea name="reasoning" rows={2} className="w-full border border-rule bg-white px-3 py-2 text-sm" placeholder="e.g. Didn&apos;t want the extra loan payment" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">Expected outcome (optional)</label>
            <input name="expected_outcome" type="text" className="w-full border border-rule bg-white px-3 py-2 text-sm" placeholder="e.g. Save £180/month and invest the difference" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-ink-soft mb-1">Estimated impact (optional)</label>
              <input name="estimated_amount" type="number" step="0.01" className="w-full border border-rule bg-white px-3 py-2 text-sm" placeholder="+ saves, - costs" />
            </div>
            <div>
              <label className="block text-xs text-ink-soft mb-1">Decision date</label>
              <input name="decision_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full border border-rule bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-ink-soft mb-1">Review on (optional)</label>
              <input name="review_date" type="date" defaultValue={defaultReviewDate()} className="w-full border border-rule bg-white px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="rounded-full border border-ink bg-ink text-parchment px-5 py-2.5 text-sm hover:bg-transparent hover:text-ink transition-colors">
            Log decision
          </button>
        </form>
        <p className="text-xs text-ink-soft mt-2 max-w-xl">
          "Estimated impact" is your own honest guess, not something the app calculates &mdash;
          it's just what lets Best Decision/Biggest Regret stats work later, if you're Premium.
        </p>
      </section>

      {isPremium ? (
        <section className="mb-12">
          <h2 className="font-display text-xl text-ink mb-4">Insights</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="ledger-card p-4">
              <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">Best decision</p>
              {bestDecision ? (
                <>
                  <p className="text-sm text-ink">{bestDecision.title}</p>
                  <p className="tabular text-lg text-sage mt-1">
                    {money(bestDecision.estimated_amount!, currency)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-ink-soft">Log a decision with a positive estimated impact to see this.</p>
              )}
            </div>
            <div className="ledger-card p-4">
              <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">Biggest regret</p>
              {biggestRegret ? (
                <>
                  <p className="text-sm text-ink">{biggestRegret.title}</p>
                  <p className="tabular text-lg text-rust mt-1">
                    {money(biggestRegret.estimated_amount!, currency)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-ink-soft">None logged &mdash; or none with a negative impact yet.</p>
              )}
            </div>
          </div>

          <h3 className="font-display text-lg text-ink mb-3">Life wins</h3>
          {lifeWins.length === 0 ? (
            <p className="text-sm text-ink-soft">
              This builds itself automatically as you complete goals, sinking funds, and
              add net worth snapshots &mdash; nothing to log manually here.
            </p>
          ) : (
            <div>
              {lifeWins.map((e, i) => (
                <div key={i} className="ledger-rule py-2 flex items-baseline gap-4">
                  <span className="tabular text-xs text-plum">{e.date}</span>
                  <span className="text-sm text-ink">{eventLabel(e, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="mb-12 ledger-rule pt-6 max-w-md">
          <p className="tabular text-xs text-plum uppercase tracking-wide mb-3">Premium</p>
          <p className="text-ink-soft text-sm leading-relaxed">
            Premium turns your logged decisions into Best Decision / Biggest Regret stats,
            plus an automatic Life Wins timeline built from your goals, sinking funds, and
            net worth history &mdash; no extra logging required.
          </p>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl text-ink mb-4">All decisions</h2>
        {decisions.length === 0 ? (
          <p className="text-ink-soft text-sm">Nothing logged yet.</p>
        ) : (
          <div>
            {decisions.map((d) => (
              <div key={d.id} className="ledger-rule py-3 flex items-start justify-between">
                <div>
                  <p className="text-sm text-ink">{d.title}</p>
                  <p className="tabular text-xs text-ink-soft">
                    {d.decision_date}
                    {d.estimated_amount !== null && (
                      <span className={d.estimated_amount >= 0 ? "text-sage" : "text-rust"}>
                        {" "}&middot; {money(d.estimated_amount, currency)}
                      </span>
                    )}
                    {d.outcome === "worked" && <span className="text-sage"> &middot; Worked</span>}
                    {d.outcome === "did_not_work" && <span className="text-rust"> &middot; Didn&apos;t work</span>}
                    {d.outcome === null && d.review_date && <span> &middot; Review {d.review_date}</span>}
                  </p>
                </div>
                <ConfirmDeleteForm
                  action={deleteDecision.bind(null, d.id) as unknown as (fd: FormData) => void}
                  confirmMessage={`Delete "${d.title}"?`}
                >
                  <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                    Delete
                  </button>
                </ConfirmDeleteForm>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
