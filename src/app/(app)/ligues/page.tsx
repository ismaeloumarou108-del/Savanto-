"use client";
import { useMemo } from "react";
import { useStore } from "@/lib/store";

const TIERS = [
  { name: "Bronze", c: "#b8774a" }, { name: "Argent", c: "#c9c3bd" }, { name: "Or", c: "#ffd15c" },
  { name: "Saphir", c: "#5aa6ff" }, { name: "Rubis", c: "#ff4d6d" }, { name: "Émeraude", c: "#3ccf8e" }, { name: "Diamant", c: "#b8f1ff" },
];
const NAMES = ["Inès", "Yanis", "Aïcha", "Lucas", "Fatou", "Hugo", "Sara", "Noah", "Lina", "Adam", "Chloé", "Moussa", "Léa", "Rayan", "Emma", "Karim", "Jade", "Omar", "Zoé"];

function seeded(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return () => ((h = (h * 1103515245 + 12345) >>> 0) / 2 ** 32);
}

export default function Leagues() {
  const { p } = useStore();
  const tier = Math.min(TIERS.length - 1, Math.floor(p.xp / 400));
  const rows = useMemo(() => {
    const r = seeded(p.weekKey);
    const day = ((new Date().getDay() + 6) % 7) + 1;
    const bots = NAMES.map((n) => ({ name: n, xp: Math.round(r() * 40 * day), me: false }));
    return [...bots, { name: p.name, xp: p.weeklyXp, me: true }].sort((a, b) => b.xp - a.xp);
  }, [p.weekKey, p.weeklyXp, p.name]);
  const myRank = rows.findIndex((r) => r.me) + 1;
  const d = new Date();
  const left = 7 - ((d.getDay() + 6) % 7) - 1;

  return (
    <div className="space-y-5">
      <div>
        <span className="pill">Ligue de la semaine</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold">Ligue {TIERS[tier].name}</h1>
        <p className="mt-1 text-muted">Top 5 : promotion · 5 derniers : relégation · fin dans {left} j</p>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {TIERS.map((t, k) => (
          <div key={t.name} className={`flex shrink-0 flex-col items-center gap-1 ${k > tier ? "opacity-30" : ""}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-xl ${k === tier ? "anim-glow" : ""}`} style={{ borderColor: t.c, background: `${t.c}22` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={t.c} aria-hidden><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" /></svg>
            </div>
            <span className="text-[10px] font-semibold text-muted">{t.name}</span>
          </div>
        ))}
      </div>
      <div className="card-hot flex items-center gap-4 p-4">
        <span className="font-display text-3xl font-extrabold text-orange">#{myRank}</span>
        <p className="text-sm">{myRank <= 5 ? "Tu es dans la zone de promotion, tiens bon !" : `Encore ${rows[4].xp - p.weeklyXp + 1} XP pour entrer dans le top 5.`}</p>
      </div>
      <ol className="card divide-y divide-line overflow-hidden">
        {rows.map((r, k) => (
          <li key={r.name + k} className={`flex items-center gap-3 px-4 py-3 ${r.me ? "bg-orange/10" : ""}`}>
            <span className={`w-6 text-center font-extrabold ${k < 5 ? "text-good" : k >= rows.length - 5 ? "text-bad" : "text-muted"}`}>{k < 3 ? ["🥇", "🥈", "🥉"][k] : k + 1}</span>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${r.me ? "grad text-white" : "bg-surface-2"}`}>{r.name[0]}</span>
            <span className={`flex-1 font-semibold ${r.me ? "text-orange" : ""}`}>{r.name}{r.me ? " (toi)" : ""}</span>
            <span className="text-sm font-bold text-muted">{r.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
