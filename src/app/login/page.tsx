"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="w-full max-w-sm ledger-card p-8">
      <div className="flex justify-center mb-6">
        <Logo size={32} />
      </div>
      <h1 className="font-display text-2xl text-ink mb-2 text-center">
        Sign in
      </h1>
      <p className="text-ink-soft text-sm text-center mb-8">
        We'll email you a link &mdash; no password to remember.
      </p>

      {callbackError && status !== "sent" && (
        <p className="text-rust text-sm text-center mb-4">{callbackError}</p>
      )}

      {status === "sent" ? (
        <p className="ledger-rule pt-6 text-center text-sage">
          Check your inbox for a sign-in link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded border border-rule bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full border border-ink bg-ink px-4 py-3 text-parchment hover:bg-transparent hover:text-ink transition-colors disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send sign-in link"}
          </button>
          {status === "error" && (
            <p className="text-rust text-sm text-center">
              Something went wrong sending that link. Try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
