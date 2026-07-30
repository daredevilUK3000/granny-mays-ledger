import { createAdminClient } from "@/lib/supabase/admin";
import { getNetWorthSnapshots } from "@/lib/data/networth";
import {
  findCompletionDate,
  computeNetWorthMilestones,
  type LifeWinEvent,
} from "@/lib/calc/lifewins";

export async function getLifeWinsEvents(userId: string): Promise<LifeWinEvent[]> {
  const supabase = createAdminClient();
  const events: LifeWinEvent[] = [];

  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select("id, name, target_amount, starting_amount, current_amount")
    .eq("user_id", userId);
  if (goalsError) throw goalsError;

  for (const g of goals ?? []) {
    if (Number(g.current_amount) < Number(g.target_amount)) continue;
    const { data: contributions, error: contribError } = await supabase
      .from("goal_contributions")
      .select("amount, contrib_date")
      .eq("goal_id", g.id);
    if (contribError) throw contribError;

    const date = findCompletionDate(
      Number(g.starting_amount),
      Number(g.target_amount),
      (contributions ?? []).map((c) => ({ amount: Number(c.amount), date: c.contrib_date }))
    );
    if (date) events.push({ date, kind: "goal_completed", name: g.name });
  }

  const { data: funds, error: fundsError } = await supabase
    .from("sinking_funds")
    .select("id, name, target_amount, starting_amount, current_amount")
    .eq("user_id", userId);
  if (fundsError) throw fundsError;

  for (const f of funds ?? []) {
    if (Number(f.current_amount) < Number(f.target_amount)) continue;
    const { data: contributions, error: contribError } = await supabase
      .from("sinking_fund_contributions")
      .select("amount, contrib_date")
      .eq("fund_id", f.id);
    if (contribError) throw contribError;

    const date = findCompletionDate(
      Number(f.starting_amount),
      Number(f.target_amount),
      (contributions ?? []).map((c) => ({ amount: Number(c.amount), date: c.contrib_date }))
    );
    if (date) events.push({ date, kind: "sinking_fund_completed", name: f.name });
  }

  const snapshots = await getNetWorthSnapshots(userId);
  const nwEvents = computeNetWorthMilestones(
    snapshots.map((s) => ({ date: s.snapshot_date, netWorth: s.netWorth }))
  );
  events.push(...nwEvents);

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
