import { createAdminClient } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/data/categories";
import { currentMonth } from "@/lib/data/transactions";
import { computeSafeToSpendToday, type SafeToSpendResult } from "@/lib/calc/safetospend";

function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function monthBounds(month: string) {
  const start = `${month}-01`;
  const end = `${month}-${String(daysInMonth(month)).padStart(2, "0")}`;
  return { start, end };
}

/**
 * Flexible-category budget and spend for one month, optionally capped to
 * transactions on or before `cutoffDate` (used by Safe-to-Spend Today so
 * future-dated entries don't count against "spent so far"). Shared by
 * Safe-to-Spend Today (current month, cutoff = today) and the Surplus
 * Sweep trigger (a fully-elapsed past month, no cutoff needed).
 */
export async function getFlexibleBudgetAndSpent(
  userId: string,
  month: string,
  cutoffDate?: string
): Promise<{ flexibleBudgetTotal: number; flexibleSpentSoFar: number }> {
  const supabase = createAdminClient();
  const { start, end } = monthBounds(month);

  const txEnd = cutoffDate && cutoffDate < end ? cutoffDate : end;

  const [categories, plansResult, txQuery] = await Promise.all([
    getCategories(userId),
    supabase
      .from("budget_plans")
      .select("category_id, planned_amount")
      .eq("user_id", userId)
      .eq("month", month),
    supabase
      .from("transactions")
      .select("amount, category_id, tx_date")
      .eq("user_id", userId)
      .eq("type", "expense")
      .gte("tx_date", start)
      .lte("tx_date", txEnd),
  ]);

  if (plansResult.error) throw plansResult.error;
  if (txQuery.error) throw txQuery.error;

  const flexibleCategoryIds = new Set(
    categories
      .filter((c) => c.spending_type !== "fixed" && (c.type === "expense" || c.type === "both"))
      .map((c) => c.id)
  );

  const flexibleBudgetTotal = (plansResult.data ?? [])
    .filter((p) => flexibleCategoryIds.has(p.category_id))
    .reduce((sum, p) => sum + Number(p.planned_amount), 0);

  const flexibleSpentSoFar = (txQuery.data ?? [])
    .filter((t) => t.category_id && flexibleCategoryIds.has(t.category_id))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return { flexibleBudgetTotal, flexibleSpentSoFar };
}

export async function getSafeToSpendToday(userId: string): Promise<SafeToSpendResult> {
  const month = currentMonth();
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const supabase = createAdminClient();
  const [{ flexibleBudgetTotal, flexibleSpentSoFar }, carryoverResult] = await Promise.all([
    getFlexibleBudgetAndSpent(userId, month, todayKey),
    supabase
      .from("budget_carryovers")
      .select("amount")
      .eq("user_id", userId)
      .eq("month", month),
  ]);

  if (carryoverResult.error) throw carryoverResult.error;
  const carryoverTotal = (carryoverResult.data ?? []).reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  const daysRemaining = daysInMonth(month) - today.getDate() + 1;

  return computeSafeToSpendToday({
    flexibleBudgetTotal: flexibleBudgetTotal + carryoverTotal,
    flexibleSpentSoFar,
    daysRemaining,
  });
}
