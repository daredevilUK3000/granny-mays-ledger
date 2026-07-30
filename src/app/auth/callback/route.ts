import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.exchangeCodeForSession(code);

    if (session?.user) {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("onboarded_at")
        .eq("id", session.user.id)
        .single();

      if (!profile?.onboarded_at) {
        return NextResponse.redirect(`${origin}/dashboard/getting-started`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard/overview`);
}
