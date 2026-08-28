import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between w-full">
        <Link href="/"><Logo size={26} /></Link>
        <Link href="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">Sign in</Link>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12 flex-1 w-full">
        <h1 className="font-display text-4xl text-ink mb-2">Privacy policy</h1>
        <div className="gilt-flourish mb-10" />

        <div className="space-y-8 text-sm text-ink-soft leading-relaxed">
          <section>
            <h2 className="font-display text-lg text-ink mb-2">What we collect</h2>
            <p>
              Your email address, used solely to send you a sign-in link and any account-related
              messages. And whatever you choose to enter into the app yourself &mdash;
              transactions, categories, budgets, goals, sinking funds, debts, net worth snapshots,
              investment scenarios, and decision journal entries. We don&apos;t collect anything
              beyond what you actively type in.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">What we don&apos;t collect</h2>
            <p>
              We don&apos;t connect to your bank, don&apos;t request account numbers or
              credentials for any financial institution, and don&apos;t run your data through any
              AI or machine learning model. There's no advertising or analytics tracking embedded
              in the app.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">How your data is stored</h2>
            <p>
              Your data lives in a database (Supabase/PostgreSQL) that only your account can
              access, enforced both by application logic and database-level security rules. It is
              never sold, rented, or shared with third parties for marketing or any other purpose.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Cookies</h2>
            <p>
              We use a single cookie to keep you signed in. There are no third-party tracking or
              advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Payment information</h2>
            <p>
              If you purchase Premium, payment is handled entirely by our payment processor
              (Stripe). We never see or store your card details ourselves.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Your rights</h2>
            <p>
              You can access, export, correct, or delete your data at any time. To request an
              export or full account deletion, contact us (details below) and we&apos;ll action it
              promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Children</h2>
            <p>This app is not directed at or intended for use by children.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Changes to this policy</h2>
            <p>
              If this policy changes materially, we&apos;ll make a reasonable effort to let
              existing users know.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-2">Contact</h2>
            <p>
              Questions about this policy or your data:{" "}
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
