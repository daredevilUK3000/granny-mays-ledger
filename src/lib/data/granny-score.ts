import { createAdminClient } from "@/lib/supabase/admin";

export interface GrannyScore {
  score: number;
  streak: number;
  last_played_date: string | null;
  savings_discipline: number;
  impulse_control: number;
  debt_management: number;
  budgeting: number;
}

/** Returns null if this user never played (or hasn't claimed their
 *  anonymous score yet) — callers use that to hide the dashboard card.
 *  Also returns null (rather than throwing) if the granny_scores table
 *  hasn't been migrated onto this Supabase project yet — see
 *  supabase/migrations/0005_granny_score.sql — so a deploy that lands
 *  before the migration is run doesn't take down the whole overview
 *  page for every user. */
export async function getGrannyScore(userId: string): Promise<GrannyScore | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("granny_scores")
    .select(
      "score, streak, last_played_date, savings_discipline, impulse_control, debt_management, budgeting"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // PGRST205: PostgREST can't find the table in its schema cache —
    // covers both "migration not applied yet" and the raw Postgres
    // 42P01 (undefined_table) case.
    if (error.code === "PGRST205" || error.code === "42P01") return null;
    throw error;
  }
  return data;
}
