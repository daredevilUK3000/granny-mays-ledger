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
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !session?.user) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          error?.message ?? "Sign-in link is invalid or has expired."
        )}`
      );
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("onboarded_at")
      .eq("id", session.user.id)
      .single();

    if (!profile?.onboarded_at) {
      return NextResponse.redirect(`${origin}/dashboard/getting-started`);
    }

    return NextResponse.redirect(`${origin}/dashboard/overview`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "Sign-in link is invalid or has expired."
    )}`
  );
}
