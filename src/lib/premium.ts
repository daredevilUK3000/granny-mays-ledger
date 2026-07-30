import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";

/**
 * Use at the top of any premium-only server action. Throws if the
 * user isn't on the premium plan — UI hiding alone isn't enforcement,
 * since a determined user could call the action directly.
 */
export async function requirePremiumUserId(): Promise<string> {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  if (profile.plan !== "premium") {
    throw new Error("This feature requires Premium.");
  }

  return userId;
}
