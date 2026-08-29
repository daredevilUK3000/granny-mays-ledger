/**
 * Track the Un-Spent — "well saved" response lines.
 * Zero-API-cost by design, same static-array principle as
 * lib/granny-scenarios.ts: no LLM calls, one picked at random after a
 * win is logged.
 */

export const UNSPENT_LINES: string[] = [
  "Well saved. That's money that gets to make its own decisions now.",
  "Good on you. The thing you didn't buy is worth exactly as much as the thing you would have.",
  "That's the muscle, right there. Keep using it.",
  "Nicely walked away from. Not every want needs answering the same day.",
  "That's one for the ledger — the quiet kind of win, but a win all the same.",
  "Sensible. And it didn't even hurt, did it?",
  "That's a habit forming, whether you notice it yet or not.",
  "Good instinct. The best purchase is often the one you skip.",
  "Well done. Tomorrow-you just got a little richer.",
  "That's the kind of restraint I'd happily vouch for.",
];

export function pickUnspentLine(): string {
  return UNSPENT_LINES[Math.floor(Math.random() * UNSPENT_LINES.length)];
}
