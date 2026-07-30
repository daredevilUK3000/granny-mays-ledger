import { createAdminClient } from "@/lib/supabase/admin";

export type NetWorthItem = {
  id: string;
  kind: "asset" | "liability";
  category: string;
  label: string;
  value: number;
};

export type NetWorthSnapshot = {
  id: string;
  snapshot_date: string;
  note: string | null;
  items: NetWorthItem[];
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
};

export async function getNetWorthSnapshots(
  userId: string
): Promise<NetWorthSnapshot[]> {
  const supabase = createAdminClient();

  const { data: snapshots, error } = await supabase
    .from("net_worth_snapshots")
    .select("id, snapshot_date, note")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: false });

  if (error) throw error;

  const results: NetWorthSnapshot[] = [];

  for (const snap of snapshots ?? []) {
    const { data: items, error: itemsError } = await supabase
      .from("net_worth_items")
      .select("id, kind, category, label, value")
      .eq("snapshot_id", snap.id)
      .order("category", { ascending: true });

    if (itemsError) throw itemsError;

    const typedItems = (items ?? []) as NetWorthItem[];
    const totalAssets = typedItems
      .filter((i) => i.kind === "asset")
      .reduce((sum, i) => sum + Number(i.value), 0);
    const totalLiabilities = typedItems
      .filter((i) => i.kind === "liability")
      .reduce((sum, i) => sum + Number(i.value), 0);

    results.push({
      ...snap,
      items: typedItems,
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    });
  }

  return results;
}
