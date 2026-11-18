"use client";
import { FREE_ENERGY, useStore } from "@/lib/store";

export function StreakPill() {
  const { p } = useStore();
  return (
    <span title="Série de jours" className="flex items-center gap-1 font-bold text-flame">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 3c0-4 2-7 2-10z" /></svg>
      {p.streak}
    </span>
  );
}
export function XpPill() {
  const { p } = useStore();
  return (
    <span title="Points d'expérience" className="flex items-center gap-1 font-bold text-gold">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l3 7 7 .6-5.3 4.6L18.4 22 12 18l-6.4 4 1.7-7.8L2 9.6 9 9z" /></svg>
      {p.xp}
    </span>
  );
}
export function EnergyPill() {
  const { p, unlimited } = useStore();
  return (
    <span title="Énergie : 1 leçon = 1 point" className="flex items-center gap-1 font-bold text-brand">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
      {unlimited ? "∞" : `${p.energy}/${FREE_ENERGY}`}
    </span>
  );
}
