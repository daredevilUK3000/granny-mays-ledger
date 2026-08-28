import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between w-full">
        <Link href="/"><Logo size={26} /></Link>
        <Link href="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">Sign in</Link>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12 flex-1 w-full">
        <h1 className="font-display text-4xl text-ink mb-2">Terms and conditions</h1>
        <div className="gilt-flourish mb-10" />

        <div className="space-y-8 text-sm text-ink-soft leading-relaxed">
          <section>
            <h2 className="font-display text-lg text-ink mb-2">Using the service</h2>
            <p>
              Granny May&apos;s Ledger is a personal budgeting, goal-tracking, and record-keeping
              tool. By using it, you agree to these terms. You&apos;re responsible for the
              accuracy of what you enter, and for keeping access to your account secure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Not financial advice</h2>
            <p>
              Nothing in this app constitutes financial, investment, tax, or legal advice.
              Projections (investment growth, debt payoff timelines, Time to Freedom) are
              calculations based on assumptions you provide, for planning purposes only. They are
              not guarantees, and past or projected figures are not a reliable indicator of what
              will actually happen. Consult a qualified professional for advice specific to your
              situation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Free and Premium plans</h2>
            <p>
              A Free plan is available with core features and reasonable limits (for example, on
              the number of active goals and sinking funds). Premium is a one-time purchase that
              unlocks additional features for the life of your account — no recurring billing,
              no subscription to cancel.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Acceptable use</h2>
            <p>
              Don&apos;t use the service for anything unlawful, don&apos;t attempt to
              disrupt or gain unauthorized access to it, and don&apos;t use it to store or
              transmit anyone else&apos;s personal or financial data without their consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Limitation of liability</h2>
            <p>
              The service is provided as-is. To the fullest extent permitted by law, we are not
              liable for financial decisions made using information from this app, or for any
              indirect or consequential loss arising from its use.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Changes</h2>
            <p>
              We may update these terms or the service itself from time to time. We&apos;ll make a
              reasonable effort to let existing users know of any material change.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Contact</h2>
            <p>
              Questions about these terms:{" "}
              <a href="mailto:wearegamechangers@outlook.com" className="underline text-ink">
                wearegamechangers@outlook.com
              </a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
