import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { getQuickAddCategories } from "@/lib/data/quickadd";
import { QuickAddClient } from "@/components/QuickAddClient";

// Deliberately outside /dashboard so it doesn't inherit the sidebar nav
// chrome — this route is meant to open straight into a minimal, fast
// entry screen from a home-screen shortcut, per the Quick-Add handoff.
export default async function QuickAddPage() {
  const userId = await requireUserId();
  const [profile, categories] = await Promise.all([
    getProfile(userId),
    getQuickAddCategories(userId),
  ]);

  return <QuickAddClient categories={categories} currency={profile.currency} />;
}
