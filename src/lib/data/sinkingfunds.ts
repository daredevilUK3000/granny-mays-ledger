import { createAdminClient } from "@/lib/supabase/admin";
import { computeGoalMetrics, type GoalRow } from "@/lib/calc/goals";

export type SinkingFundWithMetrics = GoalRow & {
  metrics: ReturnType<typeof computeGoalMetrics>;
};

export const SINKING_FUND_LIMIT = { free: 1, premium: 20 } as const;

export async function getSinkingFunds(
  userId: string,
  isPremium: boolean
): Promise<{ funds: SinkingFundWithMetrics[]; limit: number }> {
  const supabase = createAdminClient();

  const { data: funds, error } = await supabase
    .from("sinking_funds")
    .select(
      "id, name, target_amount, target_date, starting_amount, manual_current_amount, current_amount, created_at"
    )
    .eq("user_id", userId)
    .order("target_date", { ascending: true, nullsFirst: false });

  if (error) throw error;

  const fundsWithMetrics: SinkingFundWithMetrics[] = [];

  for (const fund of funds ?? []) {
    const { data: contributions, error: contribError } = await supabase
      .from("sinking_fund_contributions")
      .select("amount")
      .eq("fund_id", fund.id);

    if (contribError) throw contribError;

    const contributionSum = (contributions ?? []).reduce(
      (sum, c) => sum + Number(c.amount),
      0
    );

    fundsWithMetrics.push({
      ...fund,
      goal_type: "sinking_fund",
      metrics: computeGoalMetrics(
        { ...fund, goal_type: "sinking_fund" } as GoalRow,
        contributionSum
      ),
    });
  }

  return {
    funds: fundsWithMetrics,
    limit: isPremium ? SINKING_FUND_LIMIT.premium : SINKING_FUND_LIMIT.free,
  };
}
