import { createAdminClient } from "@/lib/supabase/admin";
import { computeGoalMetrics, type GoalRow } from "@/lib/calc/goals";

export type GoalWithMetrics = GoalRow & {
  metrics: ReturnType<typeof computeGoalMetrics>;
};

export const GOAL_LIMIT = { free: 2, premium: 5 } as const;

export async function getGoals(
  userId: string,
  isPremium: boolean
): Promise<{ goals: GoalWithMetrics[]; limit: number }> {
  const supabase = createAdminClient();

  const { data: goals, error } = await supabase
    .from("goals")
    .select(
      "id, name, goal_type, target_amount, target_date, starting_amount, manual_current_amount, current_amount, created_at"
    )
    .eq("user_id", userId)
    .order("target_date", { ascending: true, nullsFirst: false });

  if (error) throw error;

  const goalsWithMetrics: GoalWithMetrics[] = [];

  for (const goal of goals ?? []) {
    const { data: contributions, error: contribError } = await supabase
      .from("goal_contributions")
      .select("amount")
      .eq("goal_id", goal.id);

    if (contribError) throw contribError;

    const contributionSum = (contributions ?? []).reduce(
      (sum, c) => sum + Number(c.amount),
      0
    );

    goalsWithMetrics.push({
      ...goal,
      metrics: computeGoalMetrics(goal as GoalRow, contributionSum),
    });
  }

  return {
    goals: goalsWithMetrics,
    limit: isPremium ? GOAL_LIMIT.premium : GOAL_LIMIT.free,
  };
}
