import { createAdminClient } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/data/categories";
import { getTransactionsForMonth } from "@/lib/data/transactions";

export type BudgetPlanItem = {
  categoryId: string;
  categoryName: string;
  plannedAmount: number;
  actualAmount: number;
  remaining: number;
  status: "over" | "under" | "unplanned";
};

export async function getBudgetPlanForMonth(
  userId: string,
  month: string
): Promise<BudgetPlanItem[]> {
  const supabase = createAdminClient();

  const [categories, plans, transactions] = await Promise.all([
    getCategories(userId),
    supabase
      .from("budget_plans")
      .select("category_id, planned_amount")
      .eq("user_id", userId)
      .eq("month", month)
      .then((r) => {
        if (r.error) throw r.error;
        return r.data ?? [];
      }),
    getTransactionsForMonth(userId, month),
  ]);

  const plannedMap = new Map<string, number>();
  for (const p of plans) plannedMap.set(p.category_id, Number(p.planned_amount));

  const actualMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || !t.category_id) continue;
    actualMap.set(
      t.category_id,
      (actualMap.get(t.category_id) ?? 0) + Number(t.amount)
    );
  }

  return categories
    .filter((c) => c.type === "expense" || c.type === "both")
    .map((c) => {
      const planned = plannedMap.get(c.id) ?? 0;
      const actual = actualMap.get(c.id) ?? 0;
      const remaining = planned - actual;
      const status: BudgetPlanItem["status"] =
        planned > 0 ? (actual > planned ? "over" : "under") : "unplanned";

      return {
        categoryId: c.id,
        categoryName: c.name,
        plannedAmount: planned,
        actualAmount: actual,
        remaining,
        status,
      };
    });
}
