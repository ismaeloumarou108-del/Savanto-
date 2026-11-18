"use client";
import Link from "next/link";
import { SUBJECTS, journeyNodes, journeyProgress } from "@/lib/content";
import { useStore } from "@/lib/store";

export default function Journeys() {
  const { p, update } = useStore();
  return (
    <div className="space-y-8">
      <div>
        <span className="pill">Parcours</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold">Choisis ton aventure</h1>
        <p className="mt-1 text-muted">Chaque parcours est une carte : leçons, pratiques, défis, coffres et une épreuve finale.</p>
      </div>
      {SUBJECTS.map((s) => (
        <section key={s.id}>
          <p className="label mb-3">{s.title}</p>
          <div className="space-y-3">
            {s.journeys.map((j) => {
              const pr = journeyProgress(j, p.completed);
              const active = p.currentJourney === j.id;
              return (
                <Link key={j.id} href={`/parcours/${j.id}`} onClick={() => update({ currentJourney: j.id })}
                  className={`${active ? "card-hot" : "card"} group flex items-center gap-4 p-4 transition hover:-translate-y-0.5`}>
                  <span className="grad flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-bold text-white transition group-hover:rotate-6">{s.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-bold">{j.title}</h2>
                      {active && <span className="rounded-full border border-orange/50 px-2 py-0.5 text-[10px] font-bold text-orange">En cours</span>}
                    </div>
                    <p className="text-sm text-muted">{j.level} · {j.chapters.length} chapitres · {journeyNodes(j).length} étapes</p>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-2"><div className="grad h-full rounded-full" style={{ width: `${pr.pct}%` }} /></div>
                  </div>
                  <span className="text-sm font-bold text-muted">{pr.pct} %</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
