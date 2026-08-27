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

/**
 * Use where the UI needs to know who's signed in without redirecting
 * anonymous visitors away (e.g. a landing page that behaves
 * differently for logged-in users). Returns null if not logged in.
 */
export async function getCurrentUser(): Promise<{ id: string; email: string | null } | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? { id: user.id, email: user.email ?? null } : null;
}

/**
 * Use where the UI needs to show which account is signed in
 * (e.g. a "your profile" display). Returns null if not logged in
 * rather than redirecting, since callers here are display-only.
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.email ?? null;
}
