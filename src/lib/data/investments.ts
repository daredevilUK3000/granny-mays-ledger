import { createAdminClient } from "@/lib/supabase/admin";
import type { InvestmentInputs } from "@/lib/calc/investments";

export type InvestmentScenarioRow = {
  id: string;
  name: string;
  inputs: InvestmentInputs;
  created_at: string;
};

export async function getInvestmentScenarios(
  userId: string
): Promise<InvestmentScenarioRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("investment_scenarios")
    .select("id, name, inputs, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as InvestmentScenarioRow[];
}
