import { createAdminClient } from "@/lib/supabase/admin";
import { getBudgetPlanForMonth } from "@/lib/data/budget";
import { getGoals } from "@/lib/data/goals";
import { currentMonth } from "@/lib/data/transactions";
import { pickLine, type NoteTier } from "@/lib/grannys-notes";

export type GrannyNoteInstance = {
  triggerKey: string;
  tier: NoteTier;
  message: string;
};

const PACE_WARNING_THRESHOLD = 0.15;
const MILESTONE_THRESHOLDS = [75, 50, 25] as const; // checked highest-first

function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/**
 * Evaluates the four v1 trigger rules (budget pace, over budget, goal
 * milestone, goal complete) against a user's current data, then filters
 * out anything already shown via granny_notes_seen — each threshold is a
 * one-time nudge, not a recurring nag every dashboard load.
 */
export async function getActiveGrannyNotes(userId: string): Promise<GrannyNoteInstance[]> {
  const month = currentMonth();
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const paceRatio = today.getDate() / daysInMonth(month);

  const [budgetItems, { goals }] = await Promise.all([
    getBudgetPlanForMonth(userId, month),
    getGoals(userId, false),
  ]);

  const candidates: GrannyNoteInstance[] = [];

  for (const item of budgetItems) {
    if (item.plannedAmount <= 0) continue;
    const actualRatio = item.actualAmount / item.plannedAmount;

    if (item.status === "over") {
      const triggerKey = `over_budget:${item.categoryId}:${month}`;
      candidates.push({
        triggerKey,
        tier: "over_budget",
        message: pickLine("over_budget", `${userId}:${triggerKey}:${todayKey}`, {
          category: item.categoryName,
        }),
      });
    } else if (actualRatio - paceRatio > PACE_WARNING_THRESHOLD) {
      const triggerKey = `pace_warning:${item.categoryId}:${month}`;
      candidates.push({
        triggerKey,
        tier: "pace_warning",
        message: pickLine("pace_warning", `${userId}:${triggerKey}:${todayKey}`, {
          category: item.categoryName,
        }),
      });
    }
  }

  for (const goal of goals) {
    if (goal.metrics.progress >= 1) {
      const triggerKey = `goal_complete:${goal.id}`;
      candidates.push({
        triggerKey,
        tier: "goal_complete",
        message: pickLine("goal_complete", `${userId}:${triggerKey}`, { goal: goal.name }),
      });
      continue;
    }

    const progressPct = goal.metrics.progress * 100;
    const crossed = MILESTONE_THRESHOLDS.find((t) => progressPct >= t);
    if (crossed) {
      const triggerKey = `goal_milestone:${goal.id}:${crossed}`;
      candidates.push({
        triggerKey,
        tier: "goal_milestone",
        message: pickLine("goal_milestone", `${userId}:${triggerKey}`, {
          goal: goal.name,
          percent: String(crossed),
        }),
      });
    }
  }

  if (candidates.length === 0) return [];

  const supabase = createAdminClient();
  const { data: seen, error } = await supabase
    .from("granny_notes_seen")
    .select("trigger_key")
    .eq("user_id", userId)
    .in(
      "trigger_key",
      candidates.map((c) => c.triggerKey)
    );

  if (error) throw error;
  const seenKeys = new Set((seen ?? []).map((s) => s.trigger_key));

  return candidates.filter((c) => !seenKeys.has(c.triggerKey));
}
