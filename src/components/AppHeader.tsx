"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { EnergyPill, StreakPill, XpPill } from "./Stats";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/apprendre", label: "Apprendre" },
  { href: "/ligues", label: "Ligues" },
  { href: "/profil", label: "Profil" },
];

export function AppHeader() {
  const path = usePathname();
  const { p } = useStore();
  return (
    <header className="sticky top-0 z-20 border-b-2 border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Logo href="/apprendre" />
        <nav className="hidden gap-1 sm:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${path.startsWith(n.href) ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <StreakPill /><XpPill /><EnergyPill />
          {p.plan === "free" && (
            <Link href="/tarifs" className="hidden rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-ink sm:block">Passer à Plus</Link>
          )}
        </div>
      </div>
      <nav className="flex justify-around border-t border-line sm:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`flex-1 py-2 text-center text-sm font-semibold ${path.startsWith(n.href) ? "text-brand" : "text-muted"}`}>{n.label}</Link>
        ))}
      </nav>
    </header>
  );
}
