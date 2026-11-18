"use client";
import Link from "next/link";
import { SUBJECTS, lessonCount } from "@/lib/content";
import { FREE_ENERGY, levelOf, useStore } from "@/lib/store";

export default function Dashboard() {
  const { p, unlimited } = useStore();
  const lv = levelOf(p.xp);
  const next = SUBJECTS.flatMap((s) => s.courses.flatMap((c) => c.lessons.map((l) => ({ s, l }))))
    .find(({ l }) => !p.completed.includes(l.id) && (!l.premium || unlimited));
  const doneToday = p.lastDay === new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-sm font-semibold text-muted">{doneToday ? "Objectif du jour atteint 🎉" : "Ta leçon du jour"}</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold">{next ? next.l.title : "Tout est terminé, bravo !"}</h1>
            {next && <p className="mt-1 text-muted">{next.s.title} · {next.l.minutes} min</p>}
          </div>
          {next && <Link href={`/lecon/${next.l.id}`} className="btn-primary text-lg">{doneToday ? "Continuer" : "Commencer"}</Link>}
        </section>

        <section>
          <h2 className="mb-3 font-display text-2xl font-extrabold">Matières</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {SUBJECTS.map((s) => {
              const total = lessonCount(s);
              const done = s.courses.flatMap((c) => c.lessons).filter((l) => p.completed.includes(l.id)).length;
              return (
                <Link key={s.id} href={`/apprendre/${s.id}`} className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5">
                  <div className={`${s.color} flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-display text-xl font-extrabold text-white`}>{s.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{s.title}</h3>
                    <div className="mt-2 h-2 rounded-full bg-line"><div className="h-2 rounded-full bg-good" style={{ width: `${(done / total) * 100}%` }} /></div>
                    <p className="mt-1 text-xs text-muted">{done}/{total} leçons</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-muted">Niveau {lv.level}</p>
          <div className="mt-2 h-3 rounded-full bg-line"><div className="h-3 rounded-full bg-gold" style={{ width: `${(lv.into / lv.span) * 100}%` }} /></div>
          <p className="mt-1 text-xs text-muted">{lv.into}/{lv.span} XP avant le niveau {lv.level + 1}</p>
        </div>
        <div className="card p-5">
          <p className="font-bold">🔥 Série de {p.streak} jour{p.streak > 1 ? "s" : ""}</p>
          <p className="mt-1 text-sm text-muted">Record : {p.bestStreak} · Gels disponibles : {p.freezes}</p>
          {p.freezes === 0 && <p className="mt-2 text-xs text-muted">Avec Plus, 2 gels protègent ta série si tu rates un jour.</p>}
        </div>
        <div className="card p-5">
          <p className="font-bold">⚡ Énergie</p>
          {unlimited ? (
            <p className="mt-1 text-sm text-muted">Illimitée avec ton offre.</p>
          ) : (
            <>
              <div className="mt-2 flex gap-1">{Array.from({ length: FREE_ENERGY }).map((_, i) => (
                <div key={i} className={`h-3 flex-1 rounded-full ${i < p.energy ? "bg-brand" : "bg-line"}`} />))}</div>
              <p className="mt-2 text-sm text-muted">1 leçon = 1 énergie. Recharge complète chaque jour.</p>
              <Link href="/tarifs" className="mt-3 block text-sm font-bold text-brand">Énergie illimitée →</Link>
            </>
          )}
        </div>
        <div className="card border-dashed p-5">
          <p className="font-bold">🏆 Défi de la semaine</p>
          <p className="mt-1 text-sm text-muted">Gagne 100 XP avant dimanche.</p>
          <div className="mt-2 h-2 rounded-full bg-line"><div className="h-2 rounded-full bg-flame" style={{ width: `${Math.min(100, p.weeklyXp)}%` }} /></div>
          <p className="mt-1 text-xs text-muted">{Math.min(100, p.weeklyXp)}/100 XP</p>
        </div>
      </aside>
    </div>
  );
}
