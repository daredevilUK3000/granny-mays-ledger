import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import GrannysBookcase from "@/components/GrannysBookcase";
import { getCurrentUser } from "@/lib/auth";

export default async function BookcasePage() {
  const user = await getCurrentUser();
  const email = user?.email ?? null;

  return (
    <main className="flex-1">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="block">
          <Logo size={98} wordmarkClassName="font-display text-5xl text-ink" />
        </Link>
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

      <section className="w-full bg-ink-deep py-16">
        <div className="mx-auto max-w-2xl px-6 flex flex-col items-center text-center">
          <div className="relative w-64 sm:w-80 aspect-square">
            <Image
              src="/granny-book-choice.png"
              alt="Granny May's Book Choice — an illustrated antique bookcase"
              fill
              sizes="320px"
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              priority
            />
          </div>
          <p className="mt-2 text-parchment/70 max-w-md">
            Real, practical money guidance from the same people behind this
            app &mdash; browse the shelf and pick one up.
          </p>
        </div>
      </section>

      <GrannysBookcase variant="landing" />

      <div className="mx-auto max-w-4xl px-6 pb-16 text-center">
        <Link
          href="/"
          className="text-sm text-ink-soft hover:text-ink underline underline-offset-2"
        >
          &larr; Back to Granny May&rsquo;s Ledger
        </Link>
      </div>

      <Footer />
    </main>
  );
}
