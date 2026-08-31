"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { quickAddTransaction } from "@/lib/actions";
import type { QuickAddCategory } from "@/lib/data/quickadd";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"] as const;

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export function QuickAddClient({
  categories,
  currency,
}: {
  categories: QuickAddCategory[];
  currency: string;
}) {
  const [amount, setAmount] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const numericAmount = Number(amount);
  const canSave = amount !== "" && numericAmount > 0 && !pending;

  function pressKey(key: (typeof KEYS)[number]) {
    setConfirmation(null);
    setError(null);
    if (key === "back") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    if (key === "." && amount.includes(".")) return;
    // Cap at 2 decimal places, matching numeric(12,2) in the database.
    if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
    setAmount((a) => a + key);
  }

  function pickCategory(category: QuickAddCategory) {
    if (!canSave) return;
    setError(null);
    startTransition(async () => {
      try {
        await quickAddTransaction(numericAmount, category.id);
        setConfirmation(`Logged ${money(numericAmount, currency)} to ${category.name}`);
        setAmount("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      }
    });
  }

  return (
    <div className="min-h-full flex flex-col bg-parchment text-ink px-6 py-8 max-w-sm mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <span className="font-display text-lg text-ink">Quick add</span>
        <Link href="/dashboard/overview" className="text-xs text-ink-soft hover:text-ink">
          Full app
        </Link>
      </div>

      <div className="ledger-card p-6 text-center mb-4">
        <p className="text-xs text-ink-soft uppercase tracking-wide mb-1">Amount</p>
        <p className="tabular text-4xl text-ink">
          {amount ? money(numericAmount || 0, currency) : "—"}
        </p>
      </div>

      {confirmation && <p className="text-sm text-sage text-center mb-4">{confirmation}</p>}
      {error && <p className="text-sm text-rust text-center mb-4">{error}</p>}

      <div className="grid grid-cols-3 gap-2 mb-6">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => pressKey(key)}
            className="ledger-card py-4 text-lg tabular hover:bg-parchment-dim transition-colors"
          >
            {key === "back" ? "⌫" : key}
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-soft uppercase tracking-wide mb-2">Category</p>
      <div className="grid grid-cols-2 gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={!canSave}
            onClick={() => pickCategory(c)}
            className="border border-ink px-4 py-4 text-sm hover:bg-ink hover:text-parchment transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
