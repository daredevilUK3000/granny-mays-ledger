export type GoalRow = {
  id: string;
  name: string;
  goal_type: string;
  target_amount: number;
  target_date: string | null;
  starting_amount: number;
  manual_current_amount: number | null;
  current_amount: number;
  created_at: string;
};

export type GoalMetrics = {
  currentAmount: number;
  remaining: number;
  progress: number; // 0..1 (can exceed 1)
  requiredMonthly: number | null;
  onTrack: boolean | null;
};

function monthsBetween(from: Date, to: Date): number {
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  // Round up a partial month, same as the PHP version
  return months + (to.getDate() > from.getDate() ? 1 : 0);
}

export function computeGoalMetrics(
  goal: GoalRow,
  contributionSum: number
): GoalMetrics {
  const target = Number(goal.target_amount);

  let current =
    goal.manual_current_amount !== null
      ? Number(goal.manual_current_amount)
      : Number(goal.starting_amount) + contributionSum;
  if (current < 0) current = 0;

  const remaining = Math.max(0, target - current);
  const progress = target > 0 ? current / target : 0;

  let requiredMonthly: number | null = null;
  let onTrack: boolean | null = null;

  if (goal.target_date) {
    const today = new Date();
    const targetDate = new Date(goal.target_date);

    if (targetDate > today) {
      const monthsRemaining = Math.max(1, monthsBetween(today, targetDate));
      requiredMonthly = remaining > 0 ? round2(remaining / monthsRemaining) : 0;

      const created = new Date(goal.created_at);
      const monthsActive = Math.max(1, monthsBetween(created, today));
      const avgMonthly = contributionSum / monthsActive;

      onTrack = requiredMonthly <= 0 ? true : avgMonthly >= requiredMonthly;
    } else {
      requiredMonthly = remaining > 0 ? remaining : 0;
      onTrack = remaining <= 0;
    }
  }

  return {
    currentAmount: round2(current),
    remaining: round2(remaining),
    progress,
    requiredMonthly,
    onTrack,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
