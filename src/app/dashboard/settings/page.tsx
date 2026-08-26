import { requireUserId, getCurrentUserEmail } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { updateProfile } from "@/lib/actions";

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD"];

export default async function SettingsPage() {
  const userId = await requireUserId();
  const [profile, email] = await Promise.all([
    getProfile(userId),
    getCurrentUserEmail(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Settings</h1>
      <div className="gilt-flourish mb-8" />

      <div className="max-w-sm mb-10">
        <p className="text-xs text-ink-soft uppercase tracking-wide mb-2">Your profile</p>
        <p className="text-sm text-ink">{email}</p>
      </div>

      <form action={updateProfile} className="max-w-sm space-y-4">
        <div>
          <label className="block text-xs text-ink-soft mb-1">Currency</label>
          <select
            name="currency"
            defaultValue={profile.currency}
            className="w-full border border-rule bg-white px-3 py-2 text-sm"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-ink-soft mb-1">Date format</label>
          <select
            name="date_format"
            defaultValue={profile.date_format}
            className="w-full border border-rule bg-white px-3 py-2 text-sm"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-ink-soft mb-1">Start of week</label>
          <select
            name="start_of_week"
            defaultValue={profile.start_of_week}
            className="w-full border border-rule bg-white px-3 py-2 text-sm"
          >
            <option value={0}>Sunday</option>
            <option value={1}>Monday</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full rounded-full border border-ink bg-ink text-parchment px-5 py-2.5 text-sm hover:bg-transparent hover:text-ink transition-colors"
        >
          Save settings
        </button>
      </form>

      <div className="ledger-rule pt-6 mt-10 max-w-sm">
        <p className="text-xs text-ink-soft uppercase tracking-wide mb-2">Plan</p>
        <p className="text-sm text-ink capitalize">{profile.plan}</p>
      </div>
    </div>
  );
}
