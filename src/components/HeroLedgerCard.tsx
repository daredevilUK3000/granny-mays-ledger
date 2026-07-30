"use client";

import { useEffect, useState } from "react";

const mockEntries = [
  { label: "Salary", amount: 3200, tone: "sage" as const },
  { label: "Rent", amount: -850, tone: "rust" as const },
  { label: "Groceries", amount: -64.2, tone: "rust" as const },
  { label: "Car insurance (sinking fund)", amount: -50, tone: "plum" as const },
];

const total = mockEntries.reduce((sum, e) => sum + e.amount, 0);

function formatSigned(n: number): string {
  const abs = Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${n >= 0 ? "+" : "\u2212"}\u00a3${abs}`;
}

const toneStyles = {
  sage: { text: "text-sage", bg: "bg-sage-soft", dot: "bg-sage" },
  rust: { text: "text-rust", bg: "bg-rust-soft", dot: "bg-rust" },
  plum: { text: "text-plum", bg: "bg-plum-soft", dot: "bg-plum" },
};

export function HeroLedgerCard() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [countUp, setCountUp] = useState(0);

  useEffect(() => {
    const timers = mockEntries.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 220 * (i + 1))
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (visibleCount < mockEntries.length) return;
    const duration = 600;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      setCountUp(total * progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visibleCount]);

  return (
    <div
      className="bg-white rounded-2xl shadow-[0_24px_70px_rgba(16,32,46,0.45)] p-6 sm:p-7 max-w-sm w-full border-2 border-gilt-bright/30"
      style={{ animation: "float-card 5s ease-in-out infinite" }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="tabular text-xs text-ink-soft uppercase tracking-wide">This month&apos;s cashflow</p>
        <span className="tabular text-[10px] uppercase tracking-wide bg-sage text-white px-2 py-0.5 rounded-full font-medium">
          On track
        </span>
      </div>
      <p className="tabular text-4xl text-ink font-medium mb-5">{formatSigned(countUp)}</p>

      {mockEntries.map((e, i) => {
        const tone = toneStyles[e.tone];
        return (
          <div
            key={e.label}
            className="py-2.5 flex items-center justify-between gap-3 transition-all duration-300"
            style={{
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? "translateX(0)" : "translateX(-8px)",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${tone.dot}`} />
              <span className="text-sm text-ink truncate">{e.label}</span>
            </div>
            <span className={`tabular text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${tone.bg} ${tone.text}`}>
              {formatSigned(e.amount)}
            </span>
          </div>
        );
      })}

      <style>{`
        @keyframes float-card {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
