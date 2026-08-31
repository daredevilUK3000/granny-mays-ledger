import { createAdminClient } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/data/categories";

const LOOKBACK_DAYS = 60;
const SLOT_COUNT = 4;
const FALLBACK_NAMES = ["Groceries", "Dining Out", "Transport", "Entertainment"];

export type QuickAddCategory = { id: string; name: string };

/**
 * The 4 category buttons shown on the Quick-Add screen — a user's most
 * frequently used expense categories over the last 60 days, no ML, just
 * a count-and-rank. A new user (or one without 4 distinct categories yet)
 * gets sensible named defaults filled in around whatever ranked history
 * exists.
 */
export async function getQuickAddCategories(userId: string): Promise<QuickAddCategory[]> {
  const supabase = createAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);
  const sinceKey = since.toISOString().slice(0, 10);

  const [categories, txResult] = await Promise.all([
    getCategories(userId),
    supabase
      .from("transactions")
      .select("category_id")
      .eq("user_id", userId)
      .eq("type", "expense")
      .gte("tx_date", sinceKey)
      .not("category_id", "is", null),
  ]);

  if (txResult.error) throw txResult.error;

  const expenseCategories = categories.filter((c) => c.type === "expense" || c.type === "both");
  const categoryById = new Map(expenseCategories.map((c) => [c.id, c]));

  const counts = new Map<string, number>();
  for (const row of txResult.data ?? []) {
    if (!row.category_id || !categoryById.has(row.category_id)) continue;
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }

  const picked: QuickAddCategory[] = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => categoryById.get(id)!)
    .map((c) => ({ id: c.id, name: c.name }));

  const hasId = (id: string) => picked.some((p) => p.id === id);

  for (const name of FALLBACK_NAMES) {
    if (picked.length >= SLOT_COUNT) break;
    const cat = expenseCategories.find((c) => c.name === name && !hasId(c.id));
    if (cat) picked.push({ id: cat.id, name: cat.name });
  }

  for (const cat of expenseCategories) {
    if (picked.length >= SLOT_COUNT) break;
    if (!hasId(cat.id)) picked.push({ id: cat.id, name: cat.name });
  }

  return picked.slice(0, SLOT_COUNT);
}
