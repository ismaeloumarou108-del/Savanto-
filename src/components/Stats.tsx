"use client";
import { FREE_ENERGY, useStore } from "@/lib/store";

export const Flame = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden><path fill="url(#fl)" d="M12 2s6 5.5 6 11a6 6 0 0 1-12 0c0-2.6 1.4-4.3 1.4-4.3S7.6 11 10 12c0-4.5 2-7.5 2-10z" />
    <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb062" /><stop offset="1" stopColor="#e2381d" /></linearGradient></defs></svg>
);
export const Bolt = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="#ffb062" aria-hidden><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
);
export const Star = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="#ffd15c" aria-hidden><path d="M12 2l3 7 7 .6-5.3 4.6L18.4 22 12 18l-6.4 4 1.7-7.8L2 9.6 9 9z" /></svg>
);

export function StatPills() {
  const { p, unlimited } = useStore();
  const pill = "flex items-center gap-1.5 rounded-full border border-line bg-surface-2/80 px-3 py-1.5 text-sm font-bold";
  return (
    <div className="flex items-center gap-2">
      <span title="Série de jours" className={pill}><Flame />{p.streak}</span>
      <span title="XP" className={pill}><Star />{p.xp}</span>
      <span title="Énergie" className={`${pill} hidden sm:flex`}><Bolt />{unlimited ? "∞" : `${p.energy}/${FREE_ENERGY}`}</span>
    </div>
  );
}
