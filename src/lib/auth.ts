import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Use in server components/pages that require a logged-in user.
 * Returns the user's id (uuid) — nothing else, since data reads
 * always go through the admin client filtered by this id.
 */
export async function requireUserId(): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user.id;
}
