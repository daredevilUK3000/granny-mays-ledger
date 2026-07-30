import { createAdminClient } from "@/lib/supabase/admin";
import type { DebtInput, DebtStrategy } from "@/lib/calc/debt";

export async function getDebts(userId: string): Promise<DebtInput[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("debts")
    .select("id, name, balance, apr, min_payment")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    balance: Number(d.balance),
    apr: Number(d.apr),
    minPayment: Number(d.min_payment),
  }));
}

export async function getDebtPlan(
  userId: string
): Promise<{ strategy: DebtStrategy; extraMonthlyPayment: number }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("debt_plans")
    .select("strategy, extra_monthly_payment")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return {
    strategy: (data?.strategy as DebtStrategy) ?? "avalanche",
    extraMonthlyPayment: Number(data?.extra_monthly_payment ?? 0),
  };
}
