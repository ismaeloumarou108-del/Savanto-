"use client";
import { useMemo } from "react";
import { useStore } from "@/lib/store";

const TIERS = ["Bronze", "Argent", "Or", "Saphir", "Rubis", "Émeraude", "Diamant"];
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
    const bots = NAMES.map((n) => ({ name: n, xp: Math.round(r() * 45 * day), me: false }));
    return [...bots, { name: p.name, xp: p.weeklyXp, me: true }].sort((a, b) => b.xp - a.xp);
  }, [p.weekKey, p.weeklyXp, p.name]);

  const endsIn = (() => {
    const d = new Date();
    const end = new Date(d);
    end.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    end.setHours(23, 59, 59);
    const h = Math.round((end.getTime() - d.getTime()) / 3600000);
    return h > 24 ? `${Math.floor(h / 24)} j ${h % 24} h` : `${h} h`;
  })();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {TIERS.map((t, k) => (
          <div key={t} className={`shrink-0 rounded-xl border-2 px-3 py-2 text-sm font-bold ${k === tier ? "border-brand bg-brand-soft text-brand" : k < tier ? "border-line text-ink" : "border-line text-muted opacity-60"}`}>{t}</div>
        ))}
      </div>
      <h1 className="font-display text-3xl font-extrabold">Ligue {TIERS[tier]}</h1>
      <p className="mt-1 text-muted">Les 5 premiers montent, les 5 derniers descendent. Fin dans {endsIn}.</p>

      <ol className="card mt-6 divide-y-2 divide-line">
        {rows.map((r, k) => {
          const zone = k < 5 ? "text-good" : k >= rows.length - 5 ? "text-bad" : "text-muted";
          return (
            <li key={r.name + k} className={`flex items-center gap-4 px-4 py-3 ${r.me ? "bg-brand-soft" : ""}`}>
              <span className={`w-6 text-center font-extrabold ${zone}`}>{k + 1}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-line font-bold">{r.name[0]}</span>
              <span className={`flex-1 font-semibold ${r.me ? "text-brand" : ""}`}>{r.name}{r.me ? " (toi)" : ""}</span>
              <span className="font-bold text-muted">{r.xp} XP</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
