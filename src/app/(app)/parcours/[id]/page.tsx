"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TYPE_ICON, TYPE_LABEL, findJourney, isUnlocked, journeyProgress, nextNode, type MapNode } from "@/lib/content";
import { useStore, type Reward } from "@/lib/store";
import { sfx } from "@/lib/sfx";
import { Confetti } from "@/components/Confetti";

const OFFSETS = [0, 60, 90, 60, 0, -60, -90, -60];

export default function JourneyMap() {
  const { id } = useParams<{ id: string }>();
  const found = findJourney(id);
  const { p, unlimited, update, openChest } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const [chest, setChest] = useState<{ id: string; phase: "shake" | "open"; reward?: Reward } | null>(null);

  useEffect(() => { if (found && p.currentJourney !== found.journey.id) update({ currentJourney: found.journey.id }); }, [found, p.currentJourney, update]);
  if (!found) notFound();
  const { journey, subject } = found;
  const prog = journeyProgress(journey, p.completed);
  const nxt = nextNode(journey, p.completed);
  let k = 0;

  function tapNode(n: MapNode, unlocked: boolean) {
    if (p.sound) sfx.tap();
    if (n.type === "coffre" && unlocked && !p.completed.includes(n.id)) {
      setChest({ id: n.id, phase: "shake" });
      setTimeout(() => {
        const reward = openChest(n.id);
        if (p.sound) sfx.chest();
        setChest({ id: n.id, phase: "open", reward });
      }, 1100);
      return;
    }
    setSel(sel === n.id ? null : n.id);
  }

  return (
    <div>
      <Link href="/parcours" className="text-sm font-semibold text-muted hover:text-text">← Parcours</Link>
      <div className="card-hot mt-3 p-5">
        <span className="pill">{subject.title}</span>
        <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">{journey.title}</h1>
        <p className="mt-1 text-sm text-muted">{journey.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2.5 flex-1 rounded-full bg-surface-2"><div className="grad h-full rounded-full transition-all" style={{ width: `${prog.pct}%` }} /></div>
          <span className="text-sm font-bold">{prog.done}/{prog.total}</span>
        </div>
      </div>

      {journey.chapters.map((c, ci) => (
        <section key={c.id} className="mt-10">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <p className="label">Chapitre {ci + 1} · {c.title}</p>
            <span className="h-px flex-1 bg-line" />
          </div>
          <ol className="mt-12 flex flex-col items-center gap-7">
            {c.nodes.map((n) => {
              const off = OFFSETS[k++ % OFFSETS.length];
              const done = p.completed.includes(n.id);
              const unlocked = isUnlocked(journey, n.id, p.completed);
              const premiumLock = n.premium && !unlimited;
              const current = nxt?.id === n.id;
              const big = n.type === "boss" || n.type === "coffre";
              return (
                <li key={n.id} className="relative flex flex-col items-center" style={{ transform: `translateX(${off}px)` }}>
                  {current && sel !== n.id && (
                    <span className="anim-floaty absolute -top-9 z-10 whitespace-nowrap rounded-xl border border-orange/50 bg-surface-2 px-3 py-1 text-xs font-bold text-orange">
                      {n.type === "coffre" ? "Ouvre-moi !" : "Commence ici"}
                    </span>
                  )}
                  <button onClick={() => tapNode(n, unlocked)} aria-label={`${TYPE_LABEL[n.type]} : ${n.title}`}
                    className={`relative flex items-center justify-center rounded-full font-display font-extrabold transition active:scale-90
                      ${big ? "h-20 w-20 text-3xl" : "h-16 w-16 text-2xl"}
                      ${done ? "grad text-white shadow-[0_10px_25px_-8px_rgba(255,90,40,0.8)]"
                        : current ? "grad anim-glow text-white ring-4 ring-orange/25"
                        : "border-2 border-line bg-surface-2 text-muted"}
                      ${chest?.id === n.id && chest.phase === "shake" ? "anim-wobble" : ""}`}>
                    {done && n.type !== "coffre" ? "✓" : done ? "📦" : !unlocked ? "🔒" : TYPE_ICON[n.type]}
                    {premiumLock && <span className="absolute -right-1 -top-1 rounded-full bg-[#ffd15c] px-1.5 text-[9px] font-black text-black">PLUS</span>}
                  </button>
                  <span className={`mt-1.5 max-w-36 text-center text-xs font-semibold ${unlocked ? "text-text" : "text-muted"}`}>{n.title}</span>

                  {sel === n.id && n.type !== "coffre" && (
                    <div className="card-hot anim-pop absolute top-full z-20 mt-2 w-64 p-4 text-left">
                      <p className="label">{TYPE_LABEL[n.type]}{n.difficulty ? ` · ${n.difficulty}` : ""}</p>
                      <p className="mt-1 font-bold">{n.title}</p>
                      <p className="text-sm text-muted">{n.steps?.length} écrans · {n.minutes} min{n.timeLimit ? ` · chrono ${n.timeLimit}s` : ""}</p>
                      {!unlocked ? <p className="mt-3 text-sm text-muted">Termine les étapes précédentes pour débloquer.</p>
                        : premiumLock ? <Link href="/tarifs" className="btn-primary mt-3 w-full !py-2.5">Débloquer avec Plus</Link>
                        : <Link href={`/lecon/${n.id}`} className="btn-primary mt-3 w-full !py-2.5">{done ? "Rejouer (+XP)" : "Commencer"}</Link>}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      {prog.done === prog.total && (
        <div className="card-hot mt-10 p-5 text-center">
          <p className="text-4xl">🏆</p>
          <p className="mt-2 font-display text-xl font-bold">Parcours terminé !</p>
          <Link href={`/certificat/${journey.id}`} className="btn-primary mt-4">Voir mon certificat</Link>
        </div>
      )}

      {chest && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm" onClick={() => chest.phase === "open" && setChest(null)}>
          {chest.phase === "open" && <Confetti />}
          <div className="card-hot anim-pop w-full max-w-xs p-8 text-center">
            <p className={`text-7xl ${chest.phase === "shake" ? "anim-wobble" : "anim-pop"}`}>{chest.phase === "shake" ? "🎁" : chest.reward?.kind === "freeze" ? "🧊" : chest.reward?.kind === "energy" ? "⚡" : "⭐"}</p>
            {chest.phase === "shake" ? <p className="mt-4 font-bold text-muted">Ouverture…</p> : (
              <>
                <p className="mt-4 font-display text-2xl font-extrabold">
                  {chest.reward?.kind === "xp" ? `+${chest.reward.amount} XP` : chest.reward?.kind === "freeze" ? "+1 gel de série" : `+${chest.reward?.kind === "energy" ? chest.reward.amount : 0} énergie`}
                </p>
                <p className="mt-1 text-sm text-muted">Récompense de fin de chapitre</p>
                <button className="btn-primary mt-6 w-full" onClick={() => setChest(null)}>Super !</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
