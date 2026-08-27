/**
 * Granny's Money Corner — achievement badges.
 * Two independent tracks: cumulative score (character over time) and
 * daily streak (consistency). Both are pure functions of numbers
 * already stored on granny_scores / localStorage — nothing new to
 * persist, no "badges earned" table. A badge is just whichever tier
 * the current score/streak has reached.
 */

export interface Badge {
  id: string;
  kind: "score" | "streak";
  threshold: number; // score points, or streak days
  name: string;
  /** Warm, in Granny's voice. Never references the numeric score/streak
   *  directly — the badge travels, the figures don't. */
  description: string;
}

export const SCORE_BADGES: Badge[] = [
  {
    id: "learning-the-ropes",
    kind: "score",
    threshold: 25,
    name: "Learning the Ropes",
    description: "For getting started, one small dilemma at a time.",
  },
  {
    id: "sensible-sort",
    kind: "score",
    threshold: 100,
    name: "Sensible Sort",
    description: "For choices that add up to something steady.",
  },
  {
    id: "steady-hand",
    kind: "score",
    threshold: 250,
    name: "Steady Hand",
    description: "For making the steadier choice, week after week.",
  },
  {
    id: "grannys-favourite",
    kind: "score",
    threshold: 500,
    name: "Granny's Favourite",
    description: "For the kind of sense that doesn't go unnoticed.",
  },
  {
    id: "worthy-of-the-ledger",
    kind: "score",
    threshold: 1000,
    name: "Worthy of the Ledger",
    description: "For a track record Granny would happily vouch for.",
  },
];

export const STREAK_BADGES: Badge[] = [
  {
    id: "back-again",
    kind: "streak",
    threshold: 3,
    name: "Back Again",
    description: "For coming back to ask the question again.",
  },
  {
    id: "a-full-week",
    kind: "streak",
    threshold: 7,
    name: "A Full Week",
    description: "Seven days of showing up, one small decision at a time.",
  },
  {
    id: "a-month-of-sundays",
    kind: "streak",
    threshold: 30,
    name: "A Month of Sundays",
    description: "A whole month of choosing on purpose.",
  },
  {
    id: "grannys-proud-of-you",
    kind: "streak",
    threshold: 100,
    name: "Granny's Proud of You",
    description: "A hundred days. Granny's properly proud of you.",
  },
];

const ALL_BADGES = [...SCORE_BADGES, ...STREAK_BADGES];

/** The highest score badge reached so far, or null. */
export function getScoreBadge(score: number): Badge | null {
  let current: Badge | null = null;
  for (const b of SCORE_BADGES) if (score >= b.threshold) current = b;
  return current;
}

/** The highest streak badge reached by the current streak, or null. */
export function getStreakBadge(streak: number): Badge | null {
  let current: Badge | null = null;
  for (const b of STREAK_BADGES) if (streak >= b.threshold) current = b;
  return current;
}

export function getBadgeById(id: string): Badge | null {
  return ALL_BADGES.find((b) => b.id === id) ?? null;
}

/**
 * Compares before/after score+streak and returns whichever badge was
 * newly crossed by this play, if any — drives the one-time "New: X"
 * reveal. Score badges take priority if both happen to cross at once.
 */
export function getNewlyCrossedBadge(
  prevScore: number,
  nextScore: number,
  prevStreak: number,
  nextStreak: number,
): Badge | null {
  const prevScoreBadge = getScoreBadge(prevScore);
  const nextScoreBadge = getScoreBadge(nextScore);
  if (nextScoreBadge && nextScoreBadge.id !== prevScoreBadge?.id) return nextScoreBadge;

  const prevStreakBadge = getStreakBadge(prevStreak);
  const nextStreakBadge = getStreakBadge(nextStreak);
  if (nextStreakBadge && nextStreakBadge.id !== prevStreakBadge?.id) return nextStreakBadge;

  return null;
}
