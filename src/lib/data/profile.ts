import { createAdminClient } from "@/lib/supabase/admin";

export async function getProfile(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, currency, date_format, start_of_week, plan, subscription_status, onboarded_at"
    )
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}
