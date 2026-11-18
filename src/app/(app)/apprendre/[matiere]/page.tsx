"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { SUBJECTS } from "@/lib/content";
import { useStore } from "@/lib/store";

export default function SubjectPage() {
  const { matiere } = useParams<{ matiere: string }>();
  const s = SUBJECTS.find((x) => x.id === matiere);
  const { p, unlimited } = useStore();
  if (!s) notFound();

  return (
    <div>
      <Link href="/apprendre" className="text-sm font-semibold text-muted">← Matières</Link>
      <div className={`${s.color} mt-3 rounded-2xl p-6 text-white`}>
        <p className="font-display text-4xl font-extrabold">{s.emoji}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">{s.title}</h1>
        <p className="mt-1 opacity-90">{s.blurb}</p>
      </div>

      {s.courses.map((c) => {
        const allDone = c.lessons.every((l) => p.completed.includes(l.id));
        return (
          <section key={c.id} className="mt-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{c.level}</p>
                <h2 className="font-display text-2xl font-extrabold">{c.title}</h2>
              </div>
              {allDone && <Link href={`/certificat/${c.id}`} className="text-sm font-bold text-brand">Voir le certificat →</Link>}
            </div>
            <ol className="relative mt-4 space-y-3 border-l-4 border-line pl-6">
              {c.lessons.map((l, i) => {
                const done = p.completed.includes(l.id);
                const prevDone = i === 0 || p.completed.includes(c.lessons[i - 1].id);
                const locked = (l.premium && !unlimited) || !prevDone;
                return (
                  <li key={l.id} className="relative">
                    <span className={`absolute -left-[38px] top-4 flex h-6 w-6 items-center justify-center rounded-full border-4 border-paper text-xs font-bold text-white ${done ? "bg-good" : locked ? "bg-line" : "bg-brand"}`}>
                      {done ? "✓" : ""}
                    </span>
                    <div className={`card flex items-center gap-4 p-4 ${locked ? "opacity-60" : ""}`}>
                      <div className="flex-1">
                        <p className="font-bold">{l.title}</p>
                        <p className="text-sm text-muted">{l.steps.length} étapes · {l.minutes} min{l.premium ? " · Plus" : ""}</p>
                      </div>
                      {l.premium && !unlimited ? (
                        <Link href="/tarifs" className="rounded-lg bg-gold px-3 py-2 text-sm font-bold">Débloquer</Link>
                      ) : locked ? (
                        <span className="text-sm text-muted">🔒</span>
                      ) : (
                        <Link href={`/lecon/${l.id}`} className={done ? "btn-ghost !py-2 text-sm" : "btn-primary !py-2 text-sm"}>{done ? "Revoir" : "Commencer"}</Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
