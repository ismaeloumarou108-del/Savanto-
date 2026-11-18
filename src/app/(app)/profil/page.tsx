"use client";
import Link from "next/link";
import { SUBJECTS } from "@/lib/content";
import { levelOf, useStore } from "@/lib/store";

const PLAN_LABEL = { free: "Gratuit", plus: "Plus", pro: "Pro" } as const;

export default function Profile() {
  const { p, reset, setPlan } = useStore();
  const lv = levelOf(p.xp);
  const badges = [
    { icon: "🌱", name: "Premier pas", desc: "Termine une leçon", got: p.completed.length >= 1 },
    { icon: "🔥", name: "Trois jours", desc: "Série de 3 jours", got: p.bestStreak >= 3 },
    { icon: "🎯", name: "Sans faute", desc: "Une leçon sans erreur", got: p.perfect.length >= 1 },
    { icon: "⭐", name: "100 XP", desc: "Cumule 100 XP", got: p.xp >= 100 },
    { icon: "🧭", name: "Curieux", desc: "Essaie 3 matières", got: SUBJECTS.filter((s) => s.courses.some((c) => c.lessons.some((l) => p.completed.includes(l.id)))).length >= 3 },
    { icon: "🏅", name: "Diplômé", desc: "Termine un cours", got: SUBJECTS.some((s) => s.courses.some((c) => c.lessons.every((l) => p.completed.includes(l.id)))) },
  ];
  const certs = SUBJECTS.flatMap((s) => s.courses.filter((c) => c.lessons.every((l) => p.completed.includes(l.id))).map((c) => ({ s, c })));

  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-center gap-5 p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand font-display text-3xl font-extrabold text-white">{p.name[0]}</div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-extrabold">{p.name}</h1>
          <p className="text-muted">Niveau {lv.level} · Offre {PLAN_LABEL[p.plan]}</p>
        </div>
        {p.plan === "free" ? <Link href="/tarifs" className="btn-primary">Passer à Plus</Link> : (
          <button className="btn-ghost text-sm" onClick={() => setPlan("free")}>Résilier (démo)</button>
        )}
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[["🔥", p.streak, "Série actuelle"], ["🏆", p.bestStreak, "Meilleure série"], ["⭐", p.xp, "XP total"], ["📘", p.completed.length, "Leçons terminées"]].map(([i, v, l]) => (
          <div key={l as string} className="card p-4"><p className="text-2xl">{i}</p><p className="text-2xl font-extrabold">{v}</p><p className="text-sm text-muted">{l}</p></div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl font-extrabold">Badges</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {badges.map((b) => (
            <div key={b.name} className={`card p-4 ${b.got ? "" : "opacity-45 grayscale"}`}>
              <p className="text-3xl">{b.icon}</p><p className="mt-1 font-bold">{b.name}</p><p className="text-sm text-muted">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl font-extrabold">Certificats</h2>
        {certs.length === 0 ? <p className="text-muted">Termine toutes les leçons d&apos;un cours pour obtenir ton certificat.</p> : (
          <ul className="space-y-2">{certs.map(({ s, c }) => (
            <li key={c.id}><Link className="card block p-4 font-semibold hover:border-brand" href={`/certificat/${c.id}`}>📜 {c.title} · {s.title}</Link></li>
          ))}</ul>
        )}
      </section>

      <button className="text-sm text-muted underline" onClick={() => confirm("Effacer toute ta progression ?") && reset()}>Réinitialiser ma progression</button>
    </div>
  );
}
