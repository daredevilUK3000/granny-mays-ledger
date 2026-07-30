import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for server actions.
 *
 * Why not just use the session-aware client with RLS for everything?
 * Past projects on this stack hit a real gotcha: nested/embedded
 * selects (e.g. `.select('*, goals(*)')`) silently return empty
 * results the moment RLS is involved, rather than erroring — very easy
 * to lose an afternoon to. The reliable pattern is: use this admin
 * client (bypasses RLS) for all server-side reads/writes, run
 * sequential queries instead of relying on embedded joins, and always
 * filter explicitly by user_id in the query itself — never trust RLS
 * alone to scope the result. RLS stays enabled in Postgres as a second
 * layer of defense, but the app code must not depend on it.
 *
 * Every function that uses this MUST take the user's id explicitly
 * and filter by it — this client can see every user's data.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
