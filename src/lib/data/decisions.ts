import { createAdminClient } from "@/lib/supabase/admin";

export type DecisionRow = {
  id: string;
  title: string;
  reasoning: string | null;
  expected_outcome: string | null;
  estimated_amount: number | null;
  decision_date: string;
  review_date: string | null;
  outcome: "worked" | "did_not_work" | null;
};

export type UnspentWinRow = {
  id: string;
  title: string;
  amount: number;
  category_name: string | null;
  decision_date: string;
};

/**
 * Reflections only — explicitly excludes 'walked_away' rows (Track the
 * Un-Spent) so the Decisions Journal list, Best Decision/Biggest Regret
 * stats, and Life Wins timeline never see them. Un-spent totals are a
 * self-reported, emotional figure and must stay out of anything treated
 * as this journal's real record.
 */
export async function getDecisions(userId: string): Promise<DecisionRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("financial_decisions")
    .select(
      "id, title, reasoning, expected_outcome, estimated_amount, decision_date, review_date, outcome"
    )
    .eq("user_id", userId)
    .eq("entry_type", "reflection")
    .order("decision_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DecisionRow[];
}

export async function getUnspentWins(userId: string): Promise<UnspentWinRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("financial_decisions")
    .select("id, title, amount, category_name, decision_date")
    .eq("user_id", userId)
    .eq("entry_type", "walked_away")
    .order("decision_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as UnspentWinRow[];
}

export function sumUnspentWins(wins: UnspentWinRow[]): number {
  return wins.reduce((sum, w) => sum + Number(w.amount), 0);
}

export function unspentWinsThisMonth(wins: UnspentWinRow[], month: string): UnspentWinRow[] {
  return wins.filter((w) => w.decision_date.startsWith(month));
}

/** Decisions whose review date has arrived but haven't been answered yet. */
export function getDueForReview(decisions: DecisionRow[]): DecisionRow[] {
  const today = new Date().toISOString().slice(0, 10);
  return decisions.filter(
    (d) => d.outcome === null && d.review_date !== null && d.review_date <= today
  );
}
