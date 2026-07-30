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

export async function getDecisions(userId: string): Promise<DecisionRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("financial_decisions")
    .select(
      "id, title, reasoning, expected_outcome, estimated_amount, decision_date, review_date, outcome"
    )
    .eq("user_id", userId)
    .order("decision_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DecisionRow[];
}

/** Decisions whose review date has arrived but haven't been answered yet. */
export function getDueForReview(decisions: DecisionRow[]): DecisionRow[] {
  const today = new Date().toISOString().slice(0, 10);
  return decisions.filter(
    (d) => d.outcome === null && d.review_date !== null && d.review_date <= today
  );
}
