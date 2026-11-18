"use client";
import Link from "next/link";
import { useState } from "react";
import { TYPE_LABEL, ALL_JOURNEYS, findJourney, journeyProgress, nextNode, type MapNode, type Step } from "@/lib/content";
import { QUESTS, useStore } from "@/lib/store";
import { sfx } from "@/lib/sfx";
import { Flame } from "@/components/Stats";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const KIND_LABEL: Record<Step["kind"], string> = { explain: "Explication", choice: "QCM", number: "Calcul", code: "Code", order: "Remettre dans l'ordre", match: "Associer", fill: "Texte à trous" };

function weekDates() {
  const d = new Date();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

export default function Home() {
  const { p, update, claimQuest } = useStore();
  const [fly, setFly] = useState<string | null>(null);
  const cur = findJourney(p.currentJourney) ?? ALL_JOURNEYS[0];
  const { journey, subject } = cur;
  const prog = journeyProgress(journey, p.completed);
  const nxt = nextNode(journey, p.completed);
  const chapter = journey.chapters.find((c) => c.nodes.some((n) => n.id === nxt?.id));
  const today = new Date().toISOString().slice(0, 10);
  const week = weekDates();

  const summary = (n: MapNode) => {
    const counts = new Map<string, number>();
    n.steps?.forEach((s) => counts.set(KIND_LABEL[s.kind], (counts.get(KIND_LABEL[s.kind]) ?? 0) + 1));
    return [...counts.entries()];
  };

  return (
    <div className="space-y-5">
      <div className="anim-rise">
        <span className="pill">Ton parcours</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{journey.title}</h1>
        <p className="mt-1 text-muted">{subject.title} · {journey.level} · {prog.pct} % terminé</p>
      </div>

      <section className="card p-5">
        <p className="label">Ta semaine</p>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {week.map((d, i) => {
            const on = p.activeDays.includes(d);
            const isToday = d === today;
            return (
              <div key={d} className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-muted">{DAYS[i]}</span>
                <div className={`flex aspect-square w-full max-w-14 items-center justify-center rounded-2xl text-sm font-bold transition
                  ${on ? "grad anim-pop text-white shadow-[0_8px_20px_-6px_rgba(255,90,40,0.7)]" : isToday ? "border-2 border-dashed border-orange/60 text-orange" : "border border-line bg-surface-2 text-muted"}`}>
                  {on ? "✓" : isToday ? "!" : d < today ? "·" : ""}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          <span className="mr-1 inline-block align-[-3px]"><Flame s={16} /></span> Série de <b className="text-text">{p.streak} jour{p.streak > 1 ? "s" : ""}</b>
          {p.freezes > 0 && <span> · 🧊 {p.freezes} gel{p.freezes > 1 ? "s" : ""}</span>}
          {!p.activeDays.includes(today) && <span className="text-orange"> · Fais une leçon pour l&apos;allumer aujourd&apos;hui</span>}
        </p>
      </section>

      {nxt ? (
        <section className="card-hot anim-rise p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">{nxt.title}</h2>
              <p className="text-sm text-muted">{chapter?.title} · {TYPE_LABEL[nxt.type]}{nxt.minutes ? ` · ${nxt.minutes} min` : ""}</p>
            </div>
            <span className="rounded-full border border-orange/50 px-3 py-1 text-xs font-bold text-orange">Suivant</span>
          </div>
          {nxt.type !== "coffre" && (
            <ul className="mt-4 space-y-2 text-[15px]">
              {summary(nxt).map(([k, n]) => (
                <li key={k} className="flex justify-between"><span>{k}</span><span className="text-muted">× {n}</span></li>
              ))}
            </ul>
          )}
          <Link href={nxt.type === "coffre" ? `/parcours/${journey.id}` : `/lecon/${nxt.id}`} className="btn-primary mt-5 w-full text-lg">
            {nxt.type === "coffre" ? "Ouvrir le coffre 🎁" : prog.done === 0 ? "Commencer" : "Continuer"}
          </Link>
        </section>
      ) : (
        <section className="card-hot p-5 text-center">
          <p className="text-4xl">🏆</p>
          <h2 className="mt-2 font-display text-xl font-bold">Parcours terminé !</h2>
          <Link href={`/certificat/${journey.id}`} className="btn-primary mt-4">Voir mon certificat</Link>
        </section>
      )}

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <p className="label">Quêtes du jour</p>
          <span className="text-xs text-muted">Nouvelles quêtes demain</span>
        </div>
        <ul className="mt-4 space-y-4">
          {QUESTS.map((q) => {
            const v = Math.min(q.goal, q.value(p));
            const done = v >= q.goal;
            const claimed = p.claimedQuests.includes(q.id);
            return (
              <li key={q.id} className="relative flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-semibold"><span>{q.label}</span><span className="text-muted">{v}/{q.goal}</span></div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="grad h-full rounded-full transition-all duration-700" style={{ width: `${(v / q.goal) * 100}%` }} />
                  </div>
                </div>
                <button disabled={!done || claimed}
                  onClick={() => { claimQuest(q.id, q.reward); if (p.sound) sfx.chest(); setFly(q.id); setTimeout(() => setFly(null), 1000); }}
                  className={`w-20 rounded-xl px-2 py-2 text-xs font-bold transition ${claimed ? "text-good" : done ? "btn-primary !px-2 !py-2 anim-wobble" : "border border-line text-muted"}`}>
                  {claimed ? "✓ Reçu" : `+${q.reward} XP`}
                </button>
                {fly === q.id && <span className="anim-xp absolute -top-2 right-6 font-display text-lg font-extrabold text-[#ffd15c]">+{q.reward} XP</span>}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="label">Autres parcours</p>
          <Link href="/parcours" className="text-sm font-semibold text-orange">Tout voir</Link>
        </div>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {ALL_JOURNEYS.filter((x) => x.journey.id !== journey.id).map(({ journey: j, subject: s }) => {
            const pr = journeyProgress(j, p.completed);
            return (
              <button key={j.id} onClick={() => { update({ currentJourney: j.id }); if (p.sound) sfx.tap(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="card w-56 shrink-0 snap-start p-4 text-left transition hover:-translate-y-1 hover:border-orange/40">
                <span className="grad inline-flex h-10 w-10 items-center justify-center rounded-xl font-display font-bold text-white">{s.icon}</span>
                <p className="mt-3 font-bold leading-tight">{j.title}</p>
                <p className="text-xs text-muted">{s.title}</p>
                <div className="mt-3 h-1.5 rounded-full bg-surface-2"><div className="grad h-full rounded-full" style={{ width: `${pr.pct}%` }} /></div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
