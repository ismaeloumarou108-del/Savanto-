"use client";
import { useState } from "react";
import { MathTex } from "./Math";
import { sfx } from "@/lib/sfx";

const QS = [
  { tex: "3x - 5 = 10", opts: ["x = 3", "x = 5", "x = 15"], a: 1, tag: "Maths" },
  { tex: "v = \\frac{120\\,\\text{km}}{2\\,\\text{h}}", opts: ["60 km/h", "240 km/h", "1,6 km/h"], a: 0, tag: "Physique" },
  { tex: "\\texttt{console.log(2 + \"2\")}", opts: ["4", "\"22\"", "Erreur"], a: 1, tag: "Code" },
];

export function HeroDemo() {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const q = QS[i];
  const ok = pick === q.a;
  return (
    <div className="card-hot relative p-6">
      <div className="flex items-center justify-between">
        <span className="pill">{q.tag} · essaie !</span>
        <span className="font-bold text-orange">🔥 ×{streak}</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-surface-2"><div className="grad h-full rounded-full transition-all duration-500" style={{ width: `${((i + (pick !== null ? 1 : 0)) / QS.length) * 100}%` }} /></div>
      <div key={i} className="anim-rise">
        <div className="mt-4 text-center"><MathTex tex={q.tex} /></div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {q.opts.map((o, k) => (
            <button key={o} disabled={pick !== null}
              onClick={() => { setPick(k); if (k === q.a) { sfx.good(); setStreak((s) => s + 1); } else { sfx.bad(); setStreak(0); } }}
              className={`rounded-xl border-2 px-2 py-3 text-sm font-bold transition ${pick === null ? "border-line bg-surface-2 hover:-translate-y-0.5 hover:border-orange/50" : k === q.a ? "anim-pop border-good bg-good/15 text-good" : k === pick ? "anim-shake border-bad bg-bad/15 text-bad" : "border-line opacity-40"}`}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-12">
        {pick !== null && (
          <button onClick={() => { setPick(null); setI((i + 1) % QS.length); }} className={`anim-rise w-full ${ok ? "btn-primary" : "btn-ghost"} !py-3`}>
            {ok ? "Bravo ! +10 XP · Suivante →" : "Raté, on continue →"}
          </button>
        )}
      </div>
    </div>
  );
}
