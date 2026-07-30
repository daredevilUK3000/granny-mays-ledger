import { createAdminClient } from "@/lib/supabase/admin";

export async function getCategories(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, user_id, name, type, color")
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
