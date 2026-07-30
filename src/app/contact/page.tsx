import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between w-full">
        <Link href="/"><Logo size={26} /></Link>
        <Link href="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">Sign in</Link>
      </header>

      <div className="mx-auto max-w-lg px-6 py-16 flex-1 w-full text-center">
        <h1 className="font-display text-4xl text-ink mb-2">Get in touch</h1>
        <div className="gilt-flourish mb-6 mx-auto" />
        <p className="text-ink-soft text-sm leading-relaxed mb-8">
          Questions, feedback, or something not working the way it should &mdash; we&apos;d
          rather hear about it than have you quietly stop using the app.
        </p>
        <a
          href="mailto:wearegamechangers@outlook.com"
          className="inline-flex items-center rounded-full border border-ink bg-ink px-6 py-3 text-parchment hover:bg-transparent hover:text-ink transition-colors"
        >
          wearegamechangers@outlook.com
        </a>
      </div>

      <Footer />
    </main>
  );
}
