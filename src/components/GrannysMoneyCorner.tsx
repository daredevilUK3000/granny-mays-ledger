"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  SCENARIOS,
  getScenarioForDate,
  type GrannyChoice,
  type GrannyScenario,
} from "@/lib/granny-scenarios";
import { playGrannyScenario } from "@/lib/actions";
import { getScoreBadge, getStreakBadge, getNewlyCrossedBadge, getBadgeById } from "@/lib/badges";
import { ShareBadgeButton } from "@/components/ShareBadgeButton";

/**
 * Granny's Money Corner — the daily "What Would Granny Do?" widget.
 *
 * - No API calls to pick or score a scenario: today's dilemma is chosen
 *   deterministically from a static pool (see lib/granny-scenarios.ts),
 *   so every visitor plays the same one on a given day.
 * - Anonymous visitors: score/streak/stats persist in localStorage. On
 *   signup, GrannyScoreHandoff.tsx reads GRANNY_STORAGE_KEY once and
 *   folds it into the new user's account, then clears it — that's the
 *   one-time bridge from "playing a game" to "using the real app."
 * - Signed-in visitors (signedIn=true): play goes through the
 *   playGrannyScenario server action instead of localStorage, so the
 *   same account row keeps updating every day, server-validated. The
 *   parent page fetches the current DB state and passes it as
 *   initialState.
 * - Badges (lib/badges.ts) are pure functions of score/streak — nothing
 *   extra to persist. The "New: X" reveal only fires the moment a
 *   session's own play crosses a threshold; the badge itself keeps
 *   showing quietly afterwards, every time, computed fresh from state.
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

export default function GrannysMoneyCorner({
  signedIn = false,
  initialState = null,
}: {
  signedIn?: boolean;
  initialState?: GrannyLocalState | null;
}) {
  const today = useMemo(() => new Date(), []);
  const scenario: GrannyScenario = useMemo(
    () => getScenarioForDate(today, SCENARIOS),
    [today],
  );

  const [state, setState] = useState<GrannyLocalState | null>(
    signedIn ? initialState ?? EMPTY_STATE : null,
  );
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBadgeId, setNewBadgeId] = useState<string | null>(null);

  useEffect(() => {
    if (!signedIn) setState(loadState());
  }, [signedIn]);

  const alreadyPlayedToday = state?.lastPlayedDate === todayKey(today);

  async function handleChoose(choice: GrannyChoice) {
    if (alreadyPlayedToday || pending) return;
    setError(null);
    setNewBadgeId(null);

    if (signedIn) {
      setPending(true);
      try {
        const result = await playGrannyScenario(choice.id);
        setState({
          score: result.score,
          streak: result.streak,
          lastPlayedDate: result.lastPlayedDate,
          stats: result.stats,
        });
        setChosenId(choice.id);
        setNewBadgeId(result.newBadgeId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      } finally {
        setPending(false);
      }
      return;
    }

    if (!state) return;
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
    const crossed = getNewlyCrossedBadge(state.score, next.score, state.streak, next.streak);
    setNewBadgeId(crossed?.id ?? null);
  }

  const chosen = scenario.choices.find((c) => c.id === chosenId) ?? null;
  const showResult = alreadyPlayedToday || chosen !== null;
  const newBadge = newBadgeId ? getBadgeById(newBadgeId) : null;
  const scoreBadge = state ? getScoreBadge(state.score) : null;
  const streakBadge = state ? getStreakBadge(state.streak) : null;
  const shareBadge = newBadge ?? scoreBadge ?? streakBadge;

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
              disabled={pending}
              onClick={() => handleChoose(choice)}
              className="ledger-card flex items-center justify-between gap-3 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
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

      {error && <p className="mt-4 text-rust text-sm">{error}</p>}

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

          {newBadge && (
            <div className="rounded-lg bg-gilt-soft px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-ink">
                <span aria-hidden="true">🎖️</span> New: <span className="font-display text-lg">{newBadge.name}</span>
              </p>
              <ShareBadgeButton
                badgeId={newBadge.id}
                label="Share"
                className="tabular text-sm text-gilt underline underline-offset-2 hover:text-gilt-bright"
              />
            </div>
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
              {scoreBadge && (
                <div className="tabular rounded-full bg-gilt-soft px-3 py-1 text-sm text-gilt">
                  🎖️ {scoreBadge.name}
                </div>
              )}
              {!newBadge && shareBadge && (
                <ShareBadgeButton
                  badgeId={shareBadge.id}
                  label="Share badge"
                  className="tabular text-sm text-ink-soft underline underline-offset-2 hover:text-ink"
                />
              )}
            </div>
          )}

          {signedIn ? (
            <Link
              href="/dashboard/overview"
              className="inline-block rounded-full bg-gilt-bright px-5 py-2.5 font-medium text-white transition hover:brightness-95"
            >
              See it on your dashboard &rarr;
            </Link>
          ) : (
            <a
              href="/login"
              className="inline-block rounded-full bg-gilt-bright px-5 py-2.5 font-medium text-white transition hover:brightness-95"
            >
              Start tracking your real money &rarr;
            </a>
          )}
        </div>
      )}
    </section>
  );
}
