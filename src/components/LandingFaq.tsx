import Link from "next/link";

const QUESTIONS = [
  "Where did my money go this month?",
  "How much do I need to save each month to hit a goal by a date?",
  "What happens if I invest €300 a month?",
  "What's the fastest way to clear this debt?",
];

const DOT_COLORS = ["var(--sage)", "var(--rust)", "var(--plum)", "var(--gilt-bright)"];

export function LandingFaq() {
  return (
    <div className="ledger-card h-full px-8 py-10">
      <div className="gilt-flourish mb-4" />
      <h2 className="font-display text-2xl text-ink mb-6">
        What people actually want to know
      </h2>
      <ul>
        {QUESTIONS.map((question, i) => (
          <li
            key={question}
            className={i > 0 ? "border-t border-dashed border-rule" : ""}
          >
            <Link
              href="/login"
              className="group -mx-2 flex items-baseline gap-4 rounded-[3px] px-2 py-5 transition-colors hover:bg-parchment-dim"
            >
              <span
                className="tabular text-lg font-medium shrink-0"
                style={{ color: DOT_COLORS[i % DOT_COLORS.length] }}
              >
                &bull;
              </span>
              <span className="text-ink text-lg transition-colors group-hover:text-gilt-bright">
                {question}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
