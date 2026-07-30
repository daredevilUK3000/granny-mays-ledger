import Link from "next/link";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-10 ledger-rule mt-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <Logo size={20} wordmarkClassName="font-display text-sm text-ink-soft" />
        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-ink-soft hover:text-ink transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
