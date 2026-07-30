import { createAdminClient } from "@/lib/supabase/admin";

export type TransactionRow = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category_id: string | null;
  tx_date: string;
  note: string | null;
};

function monthBounds(month: string) {
  const start = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export async function getTransactionsForMonth(userId: string, month: string) {
  const { start, end } = monthBounds(month);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, amount, category_id, tx_date, note")
    .eq("user_id", userId)
    .gte("tx_date", start)
    .lte("tx_date", end)
    .order("tx_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TransactionRow[];
}

export async function getMonthSummary(userId: string, month: string) {
  const transactions = await getTransactionsForMonth(userId, month);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const cashflow = income - expenses;
  const savingsRate = income > 0 ? cashflow / income : 0;

  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || !t.category_id) continue;
    byCategory.set(
      t.category_id,
      (byCategory.get(t.category_id) ?? 0) + Number(t.amount)
    );
  }

  return { transactions, income, expenses, cashflow, savingsRate, byCategory };
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Average monthly (income - expenses) over the last N months, divided
 * by however many distinct months actually have transactions in that
 * window (not by monthsBack itself) — so a newer account with only
 * 2 months of history isn't diluted as if it had 6.
 */
export async function getAverageMonthlySurplus(
  userId: string,
  monthsBack = 6
): Promise<{ avgSurplus: number; monthsOfData: number }> {
  const supabase = createAdminClient();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1);
  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, tx_date")
    .eq("user_id", userId)
    .gte("tx_date", startStr);

  if (error) throw error;

  const rows = data ?? [];
  if (rows.length === 0) return { avgSurplus: 0, monthsOfData: 0 };

  const income = rows
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const expenses = rows
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const monthsOfData = new Set(rows.map((r) => r.tx_date.slice(0, 7))).size;
  const avgSurplus = monthsOfData > 0 ? (income - expenses) / monthsOfData : 0;

  return { avgSurplus, monthsOfData };
}
