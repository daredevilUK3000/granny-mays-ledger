import Link from "next/link";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

const externalLinks = [
  { href: "https://www.thepostalclub.com/", label: "The Postal Club" },
  { href: "https://humanradio.app/", label: "The Human Radio" },
  { href: "https://www.yourpersonalityblueprint.com", label: "Your Personality Blueprint" },
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

      <div className="mt-6 pt-6 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-ink-soft">Also from Kizzi Nkwocha</p>
        <nav className="flex flex-wrap items-center justify-center gap-5">
          {externalLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink-soft hover:text-ink transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
