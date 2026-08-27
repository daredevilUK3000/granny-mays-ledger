/**
 * Granny's Money Corner — scenario bank.
 * Zero-API-cost by design: everything below is static data, selected
 * client-side. No LLM calls, no server round-trip required to play.
 *
 * Adding scenarios: append to SCENARIOS below, following the
 * GrannyScenario shape exactly (3-4 choices, one with isGrannyPick:
 * true). Nothing else in the app needs to change — the widget and the
 * date picker both just read from this array. Aim for 40-60 at launch;
 * scenario copy is written by hand, not generated.
 */

export type GrannyCategory =
  | "savings"
  | "debt"
  | "impulse"
  | "emergency"
  | "social";

export type GrannyDifficulty = "easy" | "medium" | "hard";

/** The four character stats a Granny Score is built from. Keep this list
 *  fixed — it's what "Your financial character" bars are drawn from. */
export interface GrannyEffects {
  savingsDiscipline: number; // -10..+15
  impulseControl: number; // -10..+15
  debtManagement: number; // -10..+15
  budgeting: number; // -10..+15
}

export interface GrannyChoice {
  /** stable id within this scenario, e.g. "a" | "b" | "c" | "d" */
  id: string;
  /** short label shown on the button, e.g. "Go for dinner" */
  label: string;
  /** single emoji, used as the button's visual anchor */
  emoji: string;
  /** £ amount this choice costs (0 for "save it" / free options) */
  cost: number;
  /** true for the one choice Granny would make — drives her tone,
   *  never blocks or scolds the other options */
  isGrannyPick: boolean;
  /** score deltas applied when this choice is picked */
  effects: GrannyEffects;
  /** Granny's in-voice reaction, shown after this specific choice.
   *  Keep it warm, never scolding — even the "wrong" picks get a kind,
   *  honest response, not a lecture. */
  response: string;
}

export interface GrannyScenario {
  id: string; // e.g. "2026-08-27" or a stable slug like "s014-dinner-invite"
  category: GrannyCategory;
  difficulty: GrannyDifficulty;
  /** the £-until-payday framing line, e.g. "You've got £180 left until payday." */
  setupLine: string;
  /** the dilemma itself, e.g. "Your friend invites you out for dinner." */
  situation: string;
  choices: GrannyChoice[]; // 3-4 entries
}

/** ---- Scenario bank ---- */

export const SCENARIOS: GrannyScenario[] = [
  {
    id: "s001-dinner-invite",
    category: "social",
    difficulty: "easy",
    setupLine: "You've got £180 left until payday.",
    situation:
      "Your friend invites you out for dinner. You'd also promised yourself you'd put £50 towards savings this month.",
    choices: [
      {
        id: "a",
        label: "Go for dinner",
        emoji: "🍝",
        cost: 45,
        isGrannyPick: false,
        effects: { savingsDiscipline: -4, impulseControl: -6, debtManagement: 0, budgeting: -2 },
        response:
          "Fair enough — nobody should skip every dinner out. Just make sure next month's £50 makes up for it.",
      },
      {
        id: "b",
        label: "Buy the shoes instead",
        emoji: "👟",
        cost: 70,
        isGrannyPick: false,
        effects: { savingsDiscipline: -6, impulseControl: -10, debtManagement: 0, budgeting: -4 },
        response:
          "New shoes are lovely. £70 lovely, with £50 of savings still unpaid? That's the bit worth noticing.",
      },
      {
        id: "c",
        label: "Put £50 into savings",
        emoji: "💰",
        cost: 50,
        isGrannyPick: true,
        effects: { savingsDiscipline: 12, impulseControl: 6, debtManagement: 0, budgeting: 8 },
        response: "I'd keep the £50. Future you will thank you.",
      },
      {
        id: "d",
        label: "Keep it for emergencies",
        emoji: "🛟",
        cost: 0,
        isGrannyPick: false,
        effects: { savingsDiscipline: 4, impulseControl: 8, debtManagement: 2, budgeting: 6 },
        response:
          "Sensible, and I won't argue with a cushion. Though a *named* goal tends to get funded faster than a vague one.",
      },
    ],
  },
  {
    id: "s002-washing-machine",
    category: "emergency",
    difficulty: "medium",
    setupLine: "You've got £320 left this month, and no wiggle room until payday.",
    situation: "Your washing machine has just died.",
    choices: [
      {
        id: "a",
        label: "Pay for a repair",
        emoji: "🔧",
        cost: 65,
        isGrannyPick: true,
        effects: { savingsDiscipline: 4, impulseControl: 6, debtManagement: 4, budgeting: 10 },
        response:
          "A repair first, replace only if it fails again — that's how you keep emergencies from becoming disasters.",
      },
      {
        id: "b",
        label: "Replace it outright",
        emoji: "🧺",
        cost: 320,
        isGrannyPick: false,
        effects: { savingsDiscipline: -12, impulseControl: -8, debtManagement: -6, budgeting: -10 },
        response:
          "Sometimes a full replacement really is right — but at £320 against a £320 budget, you've spent the whole month on one machine.",
      },
      {
        id: "c",
        label: "Ask a friend to help fix it",
        emoji: "🤝",
        cost: 0,
        isGrannyPick: false,
        effects: { savingsDiscipline: 6, impulseControl: 2, debtManagement: 2, budgeting: 4 },
        response:
          "Free help is a gift, not a right — just don't let it become the whole plan for next time too.",
      },
    ],
  },
  {
    id: "s003-colleague-lunch",
    category: "impulse",
    difficulty: "easy",
    setupLine: "You've got £62 left until payday, four days away.",
    situation: "A colleague suggests lunch out.",
    choices: [
      {
        id: "a",
        label: "Restaurant",
        emoji: "🍽️",
        cost: 12,
        isGrannyPick: false,
        effects: { savingsDiscipline: -3, impulseControl: -4, debtManagement: 0, budgeting: -2 },
        response: "One lunch won't ruin you — just notice if 'one lunch' happens most days.",
      },
      {
        id: "b",
        label: "Supermarket meal deal",
        emoji: "🥪",
        cost: 4,
        isGrannyPick: false,
        effects: { savingsDiscipline: 2, impulseControl: 4, debtManagement: 0, budgeting: 4 },
        response: "A perfectly good middle ground. You still got the lunch out with your colleague.",
      },
      {
        id: "c",
        label: "Bring leftovers from home",
        emoji: "🍱",
        cost: 0,
        isGrannyPick: true,
        effects: { savingsDiscipline: 6, impulseControl: 8, debtManagement: 0, budgeting: 6 },
        response: "Leftovers win again. Four days to payday, and you've spent nothing on lunch.",
      },
    ],
  },

  // Add new scenarios below, following the shape above. No other code
  // needs to change when the bank grows.
];

/**
 * Deterministic "scenario of the day" — every visitor on the same calendar
 * date sees the same dilemma, no server call or randomness needed.
 * Swap SCENARIOS for a larger pool as the bank grows; nothing else changes.
 */
export function getScenarioForDate(
  date: Date,
  pool: GrannyScenario[] = SCENARIOS,
): GrannyScenario {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  const dayOfYear = Math.floor(diff / 86_400_000);
  return pool[dayOfYear % pool.length];
}
