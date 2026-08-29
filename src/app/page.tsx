import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { HeroLedgerCard } from "@/components/HeroLedgerCard";
import { HeroVideoBackground } from "@/components/HeroVideoBackground";
import { Reveal } from "@/components/Reveal";
import GrannysMoneyCorner, { type GrannyLocalState } from "@/components/GrannysMoneyCorner";
import { LandingFaq } from "@/components/LandingFaq";
import { PricingLedger } from "@/components/PricingLedger";
import { getCurrentUser } from "@/lib/auth";
import { getGrannyScore } from "@/lib/data/granny-score";
import { getPremiumPriceDisplay } from "@/lib/billing";

const trustPoints = [
  { label: "No bank connections", detail: "Your account details never leave your bank.", tone: "sage" as const },
  { label: "No AI", detail: "Every number is arithmetic you could check by hand.", tone: "rust" as const },
  { label: "No data sold", detail: "Nothing here is shared, rented, or sold to anyone.", tone: "plum" as const },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const email = user?.email ?? null;
  const premiumPrice = await getPremiumPriceDisplay().catch(() => "See pricing");

  const grannyScore = user ? await getGrannyScore(user.id) : null;
  const grannyInitialState: GrannyLocalState | null = grannyScore
    ? {
        score: grannyScore.score,
        streak: grannyScore.streak,
        lastPlayedDate: grannyScore.last_played_date,
        stats: {
          savingsDiscipline: grannyScore.savings_discipline,
          impulseControl: grannyScore.impulse_control,
          debtManagement: grannyScore.debt_management,
          budgeting: grannyScore.budgeting,
        },
      }
    : null;

  return (
    <main className="flex-1">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Logo size={98} wordmarkClassName="font-display text-5xl text-ink" />
        {email ? (
          <Link
            href="/dashboard/overview"
            className="text-sm text-ink-soft hover:text-ink transition-colors"
          >
            Dashboard
          </Link>
        ) : (
          <Link href="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">
            Sign in
          </Link>
        )}
      </header>

      {/* Full-bleed video hero \u2014 the video itself stays fully visible;
          only a small bottom-corner card carries the text, same
          structure as the Monarch reference. */}
      <section className="relative h-[92vh] min-h-[560px] overflow-hidden">
        <HeroVideoBackground />

        {/* Floating ledger card, upper right \u2014 hidden on small screens */}
        <div className="hidden lg:block absolute top-28 right-10 z-10">
          <HeroLedgerCard />
        </div>

        {/* Headline card, bottom left */}
        <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-auto sm:max-w-lg z-10">
          <div className="bg-parchment rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-7 sm:p-9">
            <p className="tabular text-xs tracking-[0.15em] text-gilt-bright uppercase mb-4 font-bold">
              The old-fashioned way, digitized
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.02] text-ink mb-3">
              Keep your own <em className="text-plum not-italic">ledger.</em>
            </h1>
            <p className="text-ink-soft text-sm sm:text-base leading-relaxed mb-6 max-w-md">
              Take back control of your money. A secure, manual budget tracker
              for people who want to understand their finances &mdash; without
              handing their bank logins to a stranger's server.
            </p>
            <Link
              href={email ? "/dashboard/overview" : "/login"}
              className="tabular inline-flex items-center rounded-full bg-gilt-bright px-7 py-3.5 text-base text-white font-medium hover:brightness-110 hover:scale-105 transition-all shadow-[0_8px_24px_rgba(245,163,0,0.45)]"
            >
              {email ? "Go to your dashboard" : "Start tracking — free"}
            </Link>
          </div>
        </div>
      </section>

      {/* Bold, colourful trust band */}
      <section className="py-16 bg-gradient-to-r from-sage-soft via-plum-soft to-rust-soft">
        <div className="mx-auto max-w-6xl px-6 grid sm:grid-cols-3 gap-8">
          {trustPoints.map((t, i) => {
            const toneMap = {
              sage: "text-sage",
              rust: "text-rust",
              plum: "text-plum",
            };
            return (
              <Reveal key={t.label} delay={i * 120}>
                <div className="bg-white rounded-xl p-6 shadow-[0_8px_24px_rgba(16,32,46,0.1)] hover:-translate-y-1 transition-transform">
                  <p className={`font-display text-2xl mb-2 ${toneMap[t.tone]}`}>{t.label}</p>
                  <p className="text-sm text-ink-soft leading-relaxed">{t.detail}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <Reveal>
          <div className="gilt-flourish mx-auto mb-6" />
          <p className="font-display text-2xl sm:text-3xl leading-snug text-ink">
            Automated apps make it easy to lose track of where your money goes.
          </p>
          <p className="mt-4 text-ink-soft text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Writing it down yourself keeps you close to your numbers &mdash;{" "}
            <em className="text-plum not-italic font-medium">
              most people find they naturally spend less once they can
              actually see it
            </em>
            .
          </p>
        </Reveal>
      </section>

      <section className="w-full bg-ink-deep py-20">
        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="flex justify-center">
              <div className="ledger-card w-full max-w-sm lg:max-w-md aspect-square overflow-hidden p-3">
                <video
                  className="w-full h-full rounded-[3px] object-cover"
                  src="/granny-money-corner.mp4"
                  poster="/granny-money-corner-poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="Granny May, weighing up a decision while writing in her ledger"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <GrannysMoneyCorner signedIn={!!email} initialState={grannyInitialState} />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <LandingFaq />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="ledger-card flex flex-col items-center justify-center gap-4 px-8 py-10">
            <Link
              href="/bookcase"
              className="group block w-full max-w-xs transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-square">
                <Image
                  src="/granny-book-choice.png"
                  alt="Granny May's Book Choice — an illustrated bookcase of financial literacy books"
                  fill
                  sizes="384px"
                  className="object-contain drop-shadow-[0_12px_20px_rgba(28,43,57,0.18)]"
                />
              </div>
              <p className="mt-1 text-center text-sm text-ink-soft group-hover:text-ink transition-colors">
                Browse the shelf &rarr;
              </p>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <Reveal>
          <p className="tabular text-xs uppercase tracking-wide text-plum">
            Financial Decisions Journal
          </p>
          <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
            Stop impulse buying.
          </h2>
          <p className="mt-3 text-ink-soft text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Use the Financial Decisions Journal to log the purchases you
            walked away from, and watch your &ldquo;Un-spent&rdquo; money
            grow.
          </p>
          <Link
            href={email ? "/dashboard/decisions" : "/login"}
            className="tabular mt-6 inline-flex items-center rounded-full border border-plum px-6 py-2.5 text-sm text-plum font-medium hover:bg-plum hover:text-parchment transition-colors"
          >
            Start your journal &mdash; free
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <Reveal>
          <PricingLedger premiumPrice={premiumPrice} signedIn={!!email} />
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
