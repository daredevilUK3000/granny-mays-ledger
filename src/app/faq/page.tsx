import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

const faqs = [
  {
    q: "Does this connect to my bank?",
    a: "No. Every transaction is entered by hand. There are no bank or account integrations of any kind \u2014 that's a deliberate choice, not a missing feature.",
  },
  {
    q: "Is my data shared with anyone?",
    a: "No. Your data is stored in your own account and is only ever shown to you. See the Privacy page for full detail.",
  },
  {
    q: "Is any of this AI-generated?",
    a: "No. Every number the app shows you \u2014 budgets, goal projections, investment projections, debt payoff timelines, Time to Freedom \u2014 comes from plain arithmetic you could check yourself with a calculator. Nothing is generated or guessed by a model.",
  },
  {
    q: "What's the difference between Free and Premium?",
    a: "Free covers manual transaction tracking, monthly category budgets, one sinking fund, the decision journal, and up to 2 savings goals. Premium adds up to 5 goals, investment projections, a debt payoff planner, net worth tracking with a Time to Freedom projection, CSV import, unlimited sinking funds, and decision journal insights (Best Decision / Biggest Regret, an automatic Life Wins timeline).",
  },
  {
    q: "Is this financial advice?",
    a: "No. It's a calculator and a record-keeping tool. Projections (investments, debt payoff, Time to Freedom) are based on assumptions you provide and are for planning purposes only \u2014 they're not a recommendation to buy, sell, save, or borrow anything. If you need financial advice, talk to a qualified professional.",
  },
  {
    q: "What's the Decision Journal?",
    a: "A place to log significant financial decisions \u2014 what you decided, why, and what you expect from it \u2014 with a later Yes/No check-in on whether it actually helped. It's a personal record, not advice from us or anyone else.",
  },
  {
    q: "How do Sinking Funds work?",
    a: "They're for expenses you know are coming but that don't happen monthly \u2014 an annual bill, a big repair. Set a target amount and (optionally) a date you need it by, and contribute toward it over time, separately from your regular monthly budget.",
  },
  {
    q: "Is Premium a subscription?",
    a: "No. It's a one-time purchase — pay once and Premium features are unlocked for the life of your account. No recurring billing, nothing to cancel.",
  },
  {
    q: "What happens to my data if I cancel or stop using the app?",
    a: "It's kept, not deleted, unless you delete your account. You can also export your data at any time.",
  },
];

export default function FaqPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between w-full">
        <Link href="/"><Logo size={26} /></Link>
        <Link href="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">Sign in</Link>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12 flex-1 w-full">
        <h1 className="font-display text-4xl text-ink mb-2">Frequently asked questions</h1>
        <div className="gilt-flourish mb-10" />

        <div className="space-y-8">
          {faqs.map((f) => (
            <div key={f.q} className="ledger-rule pt-6">
              <h2 className="font-display text-lg text-ink mb-2">{f.q}</h2>
              <p className="text-sm text-ink-soft leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-ink-soft mt-10">
          Something not covered here? <Link href="/contact" className="underline text-ink">Get in touch</Link>.
        </p>
      </div>

      <Footer />
    </main>
  );
}
