import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { signOut } from "@/lib/actions";
import { Logo } from "@/components/Logo";
import { DashboardNav } from "@/components/DashboardNav";

const freeNav = [
  { href: "/dashboard/getting-started", label: "Getting started" },
  { href: "/dashboard/overview", label: "Overview" },
  { href: "/dashboard/budget", label: "Budget" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/goals", label: "Goals" },
  { href: "/dashboard/decisions", label: "Decisions" },
];

const premiumNav = [
  { href: "/dashboard/investments", label: "Investments" },
  { href: "/dashboard/debt", label: "Debt payoff" },
  { href: "/dashboard/net-worth", label: "Net worth" },
  { href: "/dashboard/import", label: "Import" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  const profile = await getProfile(userId);
  const isPremium = profile.plan === "premium";

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <aside className="md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-rule bg-parchment-dim/40 px-6 py-8">
        <Link href="/dashboard/overview" className="block">
          <Logo size={26} wordmarkClassName="font-display text-base text-ink leading-tight" />
        </Link>

        <DashboardNav freeNav={freeNav} premiumNav={premiumNav} isPremium={isPremium} />

        <div className="mt-6 ledger-rule pt-6 space-y-1">
          <Link
            href="/dashboard/settings"
            className="block text-sm py-1.5 text-ink-soft hover:text-ink transition-colors"
          >
            Settings
          </Link>
          <form action={signOut}>
            <button className="text-sm py-1.5 text-ink-soft hover:text-ink transition-colors text-left">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 md:px-12 md:py-10 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
