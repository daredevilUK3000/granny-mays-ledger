import { createCheckoutSession } from "@/lib/billing";

export function PremiumLockedCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-8">{title}</h1>
      <div className="ledger-rule pt-8 max-w-md">
        <p className="tabular text-xs text-plum uppercase tracking-wide mb-3">
          Premium
        </p>
        <p className="text-ink-soft text-sm leading-relaxed mb-6">
          {description}
        </p>
        <form action={createCheckoutSession}>
          <button
            type="submit"
            className="border border-plum text-plum px-4 py-2 text-sm hover:bg-plum hover:text-parchment transition-colors"
          >
            Upgrade to Premium
          </button>
        </form>
      </div>
    </div>
  );
}
