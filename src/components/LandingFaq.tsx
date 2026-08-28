import Link from "next/link";

/**
 * "What people actually want to know" — landing page FAQ teaser.
 * Redesign goal: give the list actual elevation (it previously sat
 * directly on the parchment background with no card, no depth) while
 * keeping the existing per-question accent colors.
 *
 * hrefs point at /login for now — every other CTA on this page does the
 * same, and there's no dedicated feature/anchor destination yet for each
 * question to link to instead.
 */

interface FaqItem {
  question: string;
  href: string;
  tone: "sage" | "rust" | "plum";
}

const FAQS: FaqItem[] = [
  { question: "Where did my money go this month?", href: "/login", tone: "sage" },
  { question: "How much do I need to save each month to hit a goal by a date?", href: "/login", tone: "rust" },
  { question: "What happens if I invest €300 a month?", href: "/login", tone: "plum" },
  { question: "What's the fastest way to clear this debt?", href: "/login", tone: "rust" },
];

const toneStyles = {
  sage: { bg: "bg-sage-soft", text: "text-sage", hoverBg: "hover:bg-sage-soft" },
  rust: { bg: "bg-rust-soft", text: "text-rust", hoverBg: "hover:bg-rust-soft" },
  plum: { bg: "bg-plum-soft", text: "text-plum", hoverBg: "hover:bg-plum-soft" },
};

export function LandingFaq() {
  return (
    <div className="ledger-card px-8 py-9 sm:px-10 sm:py-10">
      <div className="gilt-flourish mb-5" />
      <h2 className="font-display text-2xl text-ink sm:text-3xl">
        What people actually want to know
      </h2>
      <p className="tabular mt-2 text-xs uppercase tracking-wide text-ink-soft">
        Real questions, answered by the app
      </p>

      <div className="mt-6">
        {FAQS.map((item, i) => {
          const tone = toneStyles[item.tone];
          return (
            <Link
              key={item.question}
              href={item.href}
              className={`group flex items-start gap-3.5 rounded-md px-3 py-3.5 transition-colors ${tone.hoverBg} ${
                i < FAQS.length - 1 ? "border-b border-dashed border-rule" : ""
              }`}
            >
              <span
                className={`tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${tone.bg} ${tone.text}`}
              >
                ?
              </span>
              <span className="text-[15px] leading-relaxed text-ink group-hover:text-ink">
                {item.question}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
