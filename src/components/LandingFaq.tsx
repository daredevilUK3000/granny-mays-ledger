import Image from "next/image";
import Link from "next/link";

/**
 * "What people actually want to know" — landing page FAQ, redesigned as
 * alternating text/image rows (same side-by-side construct as the hero
 * and Money Corner sections) so each question is paired with a real
 * screenshot of the app answering it, instead of a plain text list.
 *
 * Screenshots come from public/faq/ — captured from a seeded test account,
 * cropped to the relevant card only. hrefs point at /login for now, same
 * as every other CTA on this page.
 */

interface FaqItem {
  question: string;
  caption: string;
  href: string;
  tone: "sage" | "rust" | "plum";
  image: string;
  imgWidth: number;
  imgHeight: number;
}

const FAQS: FaqItem[] = [
  {
    question: "Can I actually afford this before I buy it?",
    caption:
      "Safe-to-Spend Today turns your flexible budget into one number — what's left this month, divided by the days remaining. Recalculated live, every time you log something.",
    href: "/login",
    tone: "sage",
    image: "/faq/safe-to-spend.png",
    imgWidth: 260,
    imgHeight: 100,
  },
  {
    question: "I don't have time to fill out a whole form for a coffee.",
    caption:
      "Add Quick-Add to your home screen — tap an amount, tap a category, done. No login screen, no navigating the dashboard, just a few taps.",
    href: "/login",
    tone: "rust",
    image: "/faq/quick-add.png",
    imgWidth: 265,
    imgHeight: 470,
  },
  {
    question: "What happens to the money I don't spend?",
    caption:
      "Once a month, Granny asks where last month's leftover flexible budget should go — a sinking fund, a goal, or straight into this month. Wherever it goes, it's a real, traceable entry, never a quiet reset to zero.",
    href: "/login",
    tone: "plum",
    image: "/faq/surplus-sweep.png",
    imgWidth: 610,
    imgHeight: 100,
  },
  {
    question: "Where did my money go this month?",
    caption:
      "Every expense you log gets sorted into categories automatically, so the answer is always one glance away.",
    href: "/login",
    tone: "sage",
    image: "/faq/spending.png",
    imgWidth: 630,
    imgHeight: 545,
  },
  {
    question: "How much do I need to save each month to hit a goal by a date?",
    caption:
      "Set a target amount and a date — Granny works out the required monthly contribution for you.",
    href: "/login",
    tone: "rust",
    image: "/faq/goals.png",
    imgWidth: 630,
    imgHeight: 345,
  },
  {
    question: "What happens if I invest €300 a month?",
    caption:
      "A standalone what-if calculator. Change any number and the projection updates instantly — nothing is ever committed for real.",
    href: "/login",
    tone: "plum",
    image: "/faq/investments.png",
    imgWidth: 630,
    imgHeight: 500,
  },
  {
    question: "What's the fastest way to clear this debt?",
    caption:
      "Compare avalanche vs. snowball side by side, and see exactly when you'll be debt-free.",
    href: "/login",
    tone: "rust",
    image: "/faq/debt.png",
    imgWidth: 630,
    imgHeight: 400,
  },
  {
    question:
      "How do I avoid getting caught out by annual bills, like car insurance or Christmas?",
    caption:
      "Set up a Sinking Fund and Granny tells you exactly how much to put away each month, so it's never a surprise.",
    href: "/login",
    tone: "sage",
    image: "/faq/sinking-funds.png",
    imgWidth: 700,
    imgHeight: 200,
  },
];

const toneText = {
  sage: "text-sage",
  rust: "text-rust",
  plum: "text-plum",
};

export function LandingFaq() {
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <div className="gilt-flourish mx-auto mb-5" />
        <h2 className="font-display text-2xl text-ink sm:text-3xl">
          What people actually want to know
        </h2>
        <p className="tabular mt-2 text-xs uppercase tracking-wide text-ink-soft">
          Real questions, answered by the app
        </p>
      </div>

      <div className="mt-16 space-y-20">
        {FAQS.map((item, i) => {
          const imageFirst = i % 2 === 0;
          return (
            <div
              key={item.question}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={imageFirst ? "" : "lg:order-2"}>
                <div className="ledger-card overflow-hidden p-2">
                  <Image
                    src={item.image}
                    alt={item.question}
                    width={item.imgWidth}
                    height={item.imgHeight}
                    className="h-auto w-full rounded-[3px]"
                  />
                </div>
              </div>
              <div className={imageFirst ? "" : "lg:order-1"}>
                <p className={`tabular text-xs uppercase tracking-wide ${toneText[item.tone]}`}>
                  Real question
                </p>
                <h3 className="mt-2 font-display text-2xl leading-snug text-ink">
                  {item.question}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                  {item.caption}
                </p>
                <Link
                  href={item.href}
                  className={`mt-5 inline-flex items-center text-sm font-medium ${toneText[item.tone]} hover:underline`}
                >
                  See it for yourself &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
