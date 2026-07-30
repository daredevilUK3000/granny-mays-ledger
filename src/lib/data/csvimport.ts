import { createAdminClient } from "@/lib/supabase/admin";

export type CsvImportJob = {
  id: string;
  status: string;
  row_count: number;
  imported_count: number;
  skipped_count: number;
  created_at: string;
};

export async function getImportHistory(userId: string): Promise<CsvImportJob[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("csv_import_jobs")
    .select("id, status, row_count, imported_count, skipped_count, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
