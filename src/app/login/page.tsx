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
  const [googlePending, setGooglePending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  async function handleGoogleSignIn() {
    setGooglePending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // On success the browser is redirected to Google, so this only
    // runs when the request itself failed to start.
    if (error) setGooglePending(false);
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
        <>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googlePending}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-rule bg-white px-4 py-3 text-ink hover:bg-parchment-dim transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.98v2.33A9 9 0 0 0 9 18Z"
              />
              <path
                fill="#FBBC05"
                d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.05l2.99-2.33Z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.95l2.99 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
              />
            </svg>
            {googlePending ? "Redirecting…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-rule" />
            <span className="text-xs text-ink-soft uppercase tracking-wide">or</span>
            <div className="h-px flex-1 bg-rule" />
          </div>

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
        </>
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
