import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { markOnboarded } from "@/lib/actions";

const steps = [
  {
    title: "Check your categories",
    body: "You've already got a starting set \u2014 Groceries, Rent, Utilities, Salary, and so on. Add your own from the Categories page if something's missing. You don't need to do this now; you can add categories any time, including while logging a transaction.",
    href: "/dashboard/categories",
    linkLabel: "Go to Categories",
  },
  {
    title: "Log a transaction",
    body: "Every income or expense you enter feeds everything else in the app \u2014 the Overview summary, your monthly budget, your category breakdown. Start on the Budget page and just log a few real transactions to get a feel for it.",
    href: "/dashboard/budget",
    linkLabel: "Go to Budget",
  },
  {
    title: "Set a monthly budget (optional, but worth it)",
    body: "On the same Budget page, give any category a planned amount for the month. As you log expenses against it, you'll see a green \u201cleft\u201d pill while you're under, or a red \u201cover\u201d pill the moment you go past it \u2014 no need to do the maths yourself.",
    href: "/dashboard/budget",
    linkLabel: "Go to Budget",
  },
  {
    title: "Set a goal",
    body: "Give it a name, a target amount, and \u2014 if you want the app to tell you whether you're on pace \u2014 a target date. With a date set, you'll see a required monthly contribution and an on track/behind indicator, recalculated every time you log a contribution.",
    href: "/dashboard/goals",
    linkLabel: "Go to Goals",
  },
  {
    title: "Log a significant decision",
    body: "Not every transaction \u2014 the decisions that actually matter. Bought the cheaper car? Cancelled a subscription? Log what you decided, why, and what you expect from it, with a date to check back in later. This builds up into your own record of what's actually worked.",
    href: "/dashboard/decisions",
    linkLabel: "Go to Decisions",
  },
];

export default async function GettingStartedPage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">
        Getting started
      </h1>
      <div className="gilt-flourish mb-6" />
      <p className="text-ink-soft text-sm mb-10 max-w-lg">
        There&apos;s no set order to any of this &mdash; nothing breaks if you jump
        straight to Goals. But if you&apos;re not sure where to begin, this is
        the order that makes the app click fastest.
      </p>

      <div className="space-y-8 max-w-xl">
        {steps.map((step, i) => (
          <div key={step.title} className="ledger-rule pt-5">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="tabular text-sm text-plum">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-lg text-ink">{step.title}</h2>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed mb-3">
              {step.body}
            </p>
            <a href={step.href} className="text-sm text-ink underline">
              {step.linkLabel} &rarr;
            </a>
          </div>
        ))}
      </div>

      <div className="ledger-rule pt-6 mt-10 max-w-xl">
        <h2 className="font-display text-lg text-ink mb-4">
          If you&apos;re on Premium
        </h2>
        <div className="space-y-5">
          <div>
            <a href="/dashboard/investments" className="text-sm text-ink underline">
              Investments
            </a>
            <p className="text-sm text-ink-soft leading-relaxed mt-1">
              A standalone what-if calculator &mdash; see what a monthly
              contribution could grow into over time before committing to it.
            </p>
          </div>
          <div>
            <a href="/dashboard/debt" className="text-sm text-ink underline">
              Debt payoff
            </a>
            <p className="text-sm text-ink-soft leading-relaxed mt-1">
              Add what you owe and compare payoff strategies &mdash; see roughly
              how long until you&apos;re debt-free and how much interest you&apos;ll pay.
            </p>
          </div>
          <div>
            <a href="/dashboard/net-worth" className="text-sm text-ink underline">
              Net worth
            </a>
            <p className="text-sm text-ink-soft leading-relaxed mt-1">
              Snapshot everything you own minus everything you owe every so
              often (monthly is typical) to see whether you&apos;re actually
              getting wealthier over time, not just staying on budget.
            </p>
          </div>
          <div>
            <a href="/dashboard/import" className="text-sm text-ink underline">
              Import
            </a>
            <p className="text-sm text-ink-soft leading-relaxed mt-1">
              Already tracking spending elsewhere? Bring in a CSV of past
              transactions at once instead of typing each one in by hand.
            </p>
          </div>
        </div>
      </div>

      {!profile.onboarded_at && (
        <form action={markOnboarded} className="mt-10">
          <button
            type="submit"
            className="rounded-full border border-ink bg-ink text-parchment px-5 py-2.5 text-sm hover:bg-transparent hover:text-ink transition-colors"
          >
            Take me to my dashboard &rarr;
          </button>
        </form>
      )}
    </div>
  );
}
