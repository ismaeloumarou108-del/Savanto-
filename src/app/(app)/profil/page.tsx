"use client";
import Link from "next/link";
import { useState } from "react";
import { ALL_JOURNEYS, journeyNodes, findNode } from "@/lib/content";
import { levelOf, useStore } from "@/lib/store";

const PLAN_LABEL = { free: "Gratuit", plus: "Plus", pro: "Pro" } as const;

export default function Profile() {
  const { p, reset, setPlan, update } = useStore();
  const [openBadge, setOpenBadge] = useState<string | null>(null);
  const lv = levelOf(p.xp);
  const lessonsDone = p.completed.filter((id) => findNode(id)?.node.type !== "coffre");
  const badges = [
    { icon: "🌱", name: "Premier pas", desc: "Termine une leçon", got: lessonsDone.length >= 1 },
    { icon: "🔥", name: "En feu", desc: "Série de 3 jours", got: p.bestStreak >= 3 },
    { icon: "🎯", name: "Sniper", desc: "Une leçon sans erreur", got: p.perfect.length >= 1 },
    { icon: "⚡", name: "Combo ×5", desc: "5 bonnes réponses d'affilée", got: p.bestCombo >= 5 },
    { icon: "🎁", name: "Chasseur", desc: "Ouvre un coffre", got: p.completed.some((id) => findNode(id)?.node.type === "coffre") },
    { icon: "♛", name: "Tueur de gardien", desc: "Réussis une épreuve finale", got: p.completed.some((id) => findNode(id)?.node.type === "boss") },
  ];
  const certs = ALL_JOURNEYS.filter(({ journey }) => journeyNodes(journey).every((n) => p.completed.includes(n.id)));
  const memos = p.completed.map((id) => findNode(id)).filter((x) => x?.node.memo?.length);

  return (
    <div className="space-y-6">
      <section className="card-hot flex flex-wrap items-center gap-4 p-5">
        <div className="relative">
          <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90" aria-hidden>
            <circle cx="42" cy="42" r="38" stroke="var(--surface-2)" strokeWidth="6" fill="none" />
            <circle cx="42" cy="42" r="38" stroke="var(--orange)" strokeWidth="6" fill="none" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - lv.into / lv.span)} className="transition-all duration-700" />
          </svg>
          <span className="grad absolute inset-[10px] flex items-center justify-center rounded-full font-display text-2xl font-extrabold text-white">{p.name[0]}</span>
        </div>
        <div className="min-w-0 flex-1 basis-40">
          <input value={p.name} onChange={(e) => update({ name: e.target.value || "Toi" })} aria-label="Ton prénom"
            className="w-full bg-transparent font-display text-2xl font-extrabold outline-none focus:text-orange" />
          <p className="text-sm text-muted">Niveau {lv.level} · {lv.into}/{lv.span} XP · Offre {PLAN_LABEL[p.plan]}</p>
        </div>
        {p.plan === "free" ? <Link href="/tarifs" className="btn-primary !py-2.5">Passer à Plus</Link>
          : <button className="btn-ghost !py-2.5 text-sm" onClick={() => setPlan("free")}>Résilier (démo)</button>}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["🔥", p.streak, "Série"], ["🏆", p.bestStreak, "Record"], ["⭐", p.xp, "XP total"], ["⚡", `×${p.bestCombo}`, "Combo max"]].map(([i, v, l]) => (
          <div key={l as string} className="card p-4"><p className="text-xl">{i}</p><p className="font-display text-2xl font-extrabold">{v}</p><p className="text-xs text-muted">{l}</p></div>
        ))}
      </section>

      <section>
        <p className="label mb-3">Badges</p>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <button key={b.name} onClick={() => setOpenBadge(openBadge === b.name ? null : b.name)}
              className={`card p-4 text-center transition hover:-translate-y-1 ${b.got ? "border-orange/40" : "opacity-40 grayscale"}`}>
              <p className={`text-3xl ${b.got && openBadge === b.name ? "anim-pop" : ""}`}>{b.icon}</p>
              <p className="mt-1 text-xs font-bold">{b.name}</p>
              {openBadge === b.name && <p className="anim-rise mt-1 text-[11px] text-muted">{b.desc}</p>}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="label mb-3">Mes fiches mémo</p>
        {memos.length === 0 ? <p className="text-sm text-muted">Termine des leçons pour collectionner leurs fiches.</p> : (
          <div className="space-y-2">
            {memos.map((m) => (
              <details key={m!.node.id} className="card group p-4">
                <summary className="cursor-pointer list-none font-semibold">
                  <span className="mr-2 inline-block text-orange transition group-open:rotate-90">▸</span>{m!.node.title}
                  <span className="ml-2 text-xs text-muted">{m!.subject.title}</span>
                </summary>
                <ul className="mt-3 space-y-1 pl-5 text-sm">{m!.node.memo!.map((x) => <li key={x}>◆ {x}</li>)}</ul>
              </details>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="label mb-3">Certificats</p>
        {certs.length === 0 ? <p className="text-sm text-muted">Termine un parcours entier pour obtenir ton certificat.</p> : certs.map(({ journey }) => (
          <Link key={journey.id} href={`/certificat/${journey.id}`} className="card mb-2 block p-4 font-semibold hover:border-orange/50">📜 {journey.title}</Link>
        ))}
      </section>

      <section className="card flex items-center justify-between p-4">
        <span className="font-semibold">Effets sonores</span>
        <button onClick={() => update({ sound: !p.sound })} aria-pressed={p.sound}
          className={`relative h-7 w-12 rounded-full transition ${p.sound ? "grad" : "bg-surface-2"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${p.sound ? "left-6" : "left-1"}`} />
        </button>
      </section>

      <button className="text-sm text-muted underline" onClick={() => confirm("Effacer toute ta progression ?") && reset()}>Réinitialiser ma progression</button>
    </div>
  );
}
