/**
 * Granny's Notes — rule-based contextual nudges shown on the dashboard.
 * No AI, ever: every line comes from a static, hand-written pool keyed to
 * a specific rule, exactly like the daily scenario bank in
 * granny-scenarios.ts. Selection is a deterministic hash of a seed key
 * (userId + trigger key + date), not true randomness — that keeps the
 * line stable within a day without persisting which one was shown.
 */

export type NoteTier = "pace_warning" | "over_budget" | "goal_milestone" | "goal_complete";

export const NOTE_LINES: Record<NoteTier, string[]> = {
  pace_warning: [
    "You're spending a bit quicker than the month's going, on {category}. Nothing drastic — just worth a glance.",
    "{category} is running ahead of where the calendar says it should be. Early days yet, plenty of time to ease off.",
    "Keep an eye on {category} — you're a little ahead of pace this month.",
    "{category} is ticking along faster than the days are. Might be nothing, might be worth a look.",
    "Just a nudge: {category} is outpacing the month so far.",
    "You've moved through {category} a touch faster than usual this month.",
    "{category} spending is running a step ahead of the calendar. Worth a check-in.",
    "A gentle flag on {category} — the pace has picked up a bit this month.",
  ],
  over_budget: [
    "{category} has gone over what you set aside this month. It happens — the useful bit is noticing.",
    "You're past your {category} budget for the month. No lecture here, just letting you know.",
    "{category} has tipped over budget. Worth a look before next month rolls around.",
    "That's {category} over its planned amount now. Doesn't undo anything — just good to see clearly.",
    "{category} has gone past what you planned. Onward — but worth a glance at why.",
    "You've exceeded the {category} budget this month. Happens to everyone eventually.",
    "{category} is over budget now. Not a scolding, just a ledger doing its job.",
    "That puts {category} over plan for the month. Something to weigh next time you set it.",
  ],
  goal_milestone: [
    "\"{goal}\" just passed {percent}%. That's real progress, built one contribution at a time.",
    "You're {percent}% of the way to \"{goal}\" now. Steady work, that.",
    "\"{goal}\" has crossed {percent}%. Worth pausing to notice how far you've come.",
    "{percent}% done on \"{goal}\" — the kind of milestone that doesn't happen by accident.",
    "\"{goal}\" is now {percent}% funded. Keep at it, you're closer than you think.",
    "That's {percent}% toward \"{goal}\". A quiet kind of proud, that is.",
    "\"{goal}\" just ticked past {percent}%. Nicely done.",
    "{percent}% of the way there on \"{goal}\" — the habit is clearly working.",
  ],
  goal_complete: [
    "\"{goal}\" is fully funded. That's not luck — that's you, showing up for it.",
    "You did it — \"{goal}\" is complete. Worth sitting with that for a moment.",
    "\"{goal}\" just hit 100%. I'd call that worth celebrating.",
    "Fully funded: \"{goal}\". Now's the time to decide what it becomes next.",
    "\"{goal}\" is done. Every contribution added up to exactly this.",
    "That's \"{goal}\" complete. Not every plan makes it this far — yours did.",
    "\"{goal}\" reached its target. Well and truly earned.",
    "Target met on \"{goal}\". A proper milestone, that.",
  ],
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Deterministic pick within a tier's line pool, stable for a given seed. */
export function pickLine(tier: NoteTier, seedKey: string, vars: Record<string, string> = {}): string {
  const pool = NOTE_LINES[tier];
  const line = pool[hashString(seedKey) % pool.length];
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    line
  );
}
