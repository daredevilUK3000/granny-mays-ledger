"use client";

import { useMemo, useState, useEffect } from "react";
import {
  SCENARIOS,
  getScenarioForDate,
  type GrannyChoice,
  type GrannyScenario,
} from "@/lib/granny-scenarios";

/**
 * Granny's Money Corner — anonymous-friendly landing page widget.
 *
 * - No API calls: today's scenario is picked deterministically from a
 *   static pool (see lib/granny-scenarios.ts), so every visitor plays
 *   the same dilemma on a given day with zero server round-trip.
 * - Score + streak persist in localStorage for anonymous visitors.
 *   On signup, the dashboard reads GRANNY_STORAGE_KEY once and folds it
 *   into the new user's account (see GrannyScoreHandoff.tsx) — that's
 *   the bridge from "playing a game" to "using the real app," so the
 *   key name/shape here must stay in sync with that handoff.
 * - Logged-in users don't see this widget at all (the page that renders
 *   it hides it once signed in) — the daily game stays landing-page-only
 *   by design; it doesn't continue inside the dashboard.
 */

export const GRANNY_STORAGE_KEY = "granny-money-corner:v1";

export interface GrannyLocalState {
  score: number;
  streak: number;
  lastPlayedDate: string | null; // yyyy-mm-dd
  stats: {
    savingsDiscipline: number;
    impulseControl: number;
    debtManagement: number;
    budgeting: number;
  };
}

const EMPTY_STATE: GrannyLocalState = {
  score: 0,
  streak: 0,
  lastPlayedDate: null,
  stats: { savingsDiscipline: 0, impulseControl: 0, debtManagement: 0, budgeting: 0 },
};

function todayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function loadState(): GrannyLocalState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(GRANNY_STORAGE_KEY);
    if (!raw) throw new Error("empty");
    return JSON.parse(raw) as GrannyLocalState;
  } catch {
    return EMPTY_STATE;
  }
}

function saveState(state: GrannyLocalState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GRANNY_STORAGE_KEY, JSON.stringify(state));
}

function scoreDelta(choice: GrannyChoice): number {
  const { savingsDiscipline, impulseControl, debtManagement, budgeting } = choice.effects;
  return savingsDiscipline + impulseControl + debtManagement + budgeting;
}

export default function GrannysMoneyCorner() {
  const today = useMemo(() => new Date(), []);
  const scenario: GrannyScenario = useMemo(
    () => getScenarioForDate(today, SCENARIOS),
    [today],
  );

  const [state, setState] = useState<GrannyLocalState | null>(null);
  const [chosenId, setChosenId] = useState<string | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const alreadyPlayedToday = state?.lastPlayedDate === todayKey(today);

  function handleChoose(choice: GrannyChoice) {
    if (alreadyPlayedToday || !state) return;
    setChosenId(choice.id);

    const wasYesterday = (() => {
      if (!state.lastPlayedDate) return false;
      const prev = new Date(state.lastPlayedDate);
      const diffDays = Math.round((today.getTime() - prev.getTime()) / 86_400_000);
      return diffDays === 1;
    })();

    const next: GrannyLocalState = {
      score: state.score + scoreDelta(choice),
      streak: wasYesterday ? state.streak + 1 : 1,
      lastPlayedDate: todayKey(today),
      stats: {
        savingsDiscipline: state.stats.savingsDiscipline + choice.effects.savingsDiscipline,
        impulseControl: state.stats.impulseControl + choice.effects.impulseControl,
        debtManagement: state.stats.debtManagement + choice.effects.debtManagement,
        budgeting: state.stats.budgeting + choice.effects.budgeting,
      },
    };
    setState(next);
    saveState(next);
  }

  const chosen = scenario.choices.find((c) => c.id === chosenId) ?? null;
  const showResult = alreadyPlayedToday || chosen !== null;

  return (
    <section className="ledger-card mx-auto max-w-xl px-6 py-8 sm:px-10 sm:py-10">
      <div className="gilt-flourish mb-6" />

      <p className="tabular text-xs uppercase tracking-wide text-sage">
        Granny&rsquo;s Money Corner
      </p>
      <h3 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
        What Would Granny Do?
      </h3>

      <p className="mt-4 text-ink-soft">{scenario.setupLine}</p>
      <p className="mt-1 text-ink-soft">{scenario.situation}</p>

      {!showResult && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {scenario.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => handleChoose(choice)}
              className="ledger-card flex items-center justify-between gap-3 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex items-center gap-2 text-ink">
                <span aria-hidden="true">{choice.emoji}</span>
                {choice.label}
              </span>
              <span className="tabular text-sm text-ink-soft">
                {choice.cost > 0 ? `−£${choice.cost}` : "£0"}
              </span>
            </button>
          ))}
        </div>
      )}

      {showResult && (
        <div className="mt-6 space-y-4">
          {chosen && (
            <div className="rounded-lg bg-plum-soft px-4 py-3">
              <p className="font-display text-lg text-plum">Granny says:</p>
              <p className="mt-1 text-ink">&ldquo;{chosen.response}&rdquo;</p>
            </div>
          )}

          {alreadyPlayedToday && !chosen && (
            <p className="text-ink-soft">
              You&rsquo;ve already played today&rsquo;s dilemma &mdash; come back tomorrow for a
              new one.
            </p>
          )}

          {state && (
            <div className="ledger-rule flex flex-wrap items-center gap-4 pt-4">
              <div>
                <p className="tabular text-xs uppercase tracking-wide text-ink-soft">
                  Granny Score
                </p>
                <p className="tabular text-2xl text-gilt-bright">{state.score}</p>
              </div>
              {state.streak > 1 && (
                <div className="tabular rounded-full bg-rust-soft px-3 py-1 text-sm text-rust">
                  🔥 {state.streak}-day streak
                </div>
              )}
            </div>
          )}

          <a
            href="/login"
            className="inline-block rounded-full bg-gilt-bright px-5 py-2.5 font-medium text-white transition hover:brightness-95"
          >
            Start tracking your real money &rarr;
          </a>
        </div>
      )}
    </section>
  );
}
