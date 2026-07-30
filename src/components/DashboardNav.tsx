"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

function NavLink({ item, premium }: { item: NavItem; premium?: boolean }) {
  const pathname = usePathname();
  const active = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={`flex items-center justify-between text-sm py-1.5 pl-3 -ml-3 border-l-2 transition-colors ${
        active
          ? "border-gilt text-ink font-medium"
          : "border-transparent text-ink-soft hover:text-ink hover:border-rule"
      }`}
    >
      {item.label}
      {premium && (
        <span className="tabular text-[10px] tracking-wide uppercase text-plum bg-plum-soft px-1.5 py-0.5 rounded-full">
          Premium
        </span>
      )}
    </Link>
  );
}

export function DashboardNav({
  freeNav,
  premiumNav,
  isPremium,
}: {
  freeNav: NavItem[];
  premiumNav: NavItem[];
  isPremium: boolean;
}) {
  return (
    <>
      <nav className="mt-8 space-y-1">
        {freeNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="mt-6 ledger-rule pt-6 space-y-1">
        {premiumNav.map((item) => (
          <NavLink key={item.href} item={item} premium={!isPremium} />
        ))}
      </div>
    </>
  );
}
