"use client";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { findLesson, type Step } from "@/lib/content";
import { useStore } from "@/lib/store";
import { Math } from "@/components/Math";
import { runJs } from "@/lib/runCode";

type Verdict = null | { ok: boolean; msg: string };

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const found = findLesson(id);
  const router = useRouter();
  const { p, ready, unlimited, spendEnergy, spendAi, completeLesson } = useStore();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const charged = useRef(false);
  const [i, setI] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<null | { xp: number; streakUp: boolean }>(null);

  useEffect(() => {
    if (!ready || charged.current || !found) return;
    charged.current = true;
    if (found.lesson.premium && !unlimited) return setAllowed(false);
    setAllowed(spendEnergy());
  }, [ready, found, unlimited, spendEnergy]);

  if (!found) notFound();
  const { lesson, subject } = found;
  const steps = lesson.steps;
  const step = steps[i];

  if (allowed === null) return <div className="p-10 text-center text-muted">Chargement…</div>;
  if (allowed === false)
    return (
      <Blocker
        title={lesson.premium && !unlimited ? "Leçon réservée aux abonnés" : "Plus d'énergie pour aujourd'hui"}
        text={lesson.premium && !unlimited ? "Cette leçon fait partie de l'offre Plus." : "Ton énergie se recharge demain. Avec Plus, l'énergie est illimitée."}
      />
    );

  const exercises = steps.filter((s) => s.kind !== "explain").length;

  function next() {
    setVerdict(null);
    if (i + 1 < steps.length) return setI(i + 1);
    const xp = exercises * 10 + (mistakes === 0 ? 5 : 0);
    const { streakUp } = completeLesson(lesson.id, xp, mistakes === 0);
    setResult({ xp, streakUp });
  }

  if (result)
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="font-display text-4xl font-extrabold">Leçon terminée !</h1>
        <div className="flex gap-3">
          <div className="card px-5 py-3"><p className="text-xs font-bold text-muted">XP</p><p className="text-2xl font-extrabold text-gold">+{result.xp}</p></div>
          <div className="card px-5 py-3"><p className="text-xs font-bold text-muted">Série</p><p className="text-2xl font-extrabold text-flame">🔥 {p.streak}</p></div>
          <div className="card px-5 py-3"><p className="text-xs font-bold text-muted">Erreurs</p><p className="text-2xl font-extrabold">{mistakes}</p></div>
        </div>
        {result.streakUp && <p className="font-semibold text-flame">Ta série continue, reviens demain pour la prolonger !</p>}
        {mistakes === 0 && <p className="font-semibold text-good">Sans faute : +5 XP de bonus.</p>}
        <button className="btn-primary mt-4 w-full text-lg" onClick={() => router.push(`/apprendre/${subject.id}`)}>Continuer</button>
      </div>
    );

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4">
      <div className="flex items-center gap-4 py-5">
        <Link href={`/apprendre/${subject.id}`} aria-label="Quitter" className="text-2xl text-muted">×</Link>
        <div className="h-3 flex-1 rounded-full bg-line">
          <div className="h-3 rounded-full bg-good transition-all" style={{ width: `${(i / steps.length) * 100}%` }} />
        </div>
        <span className="text-sm font-bold text-muted">{i + 1}/{steps.length}</span>
      </div>

      <div className="flex-1 py-6">
        <StepView key={i} step={step} locked={!!verdict}
          onAnswer={(ok, msg) => { if (!ok) setMistakes((m) => m + 1); setVerdict({ ok, msg }); }}
          onContinue={next}
          coach={() => {
            if (!spendAi()) return null;
            return coachHint(step);
          }}
          aiLeft={p.plan === "pro" ? null : p.aiLeft}
        />
      </div>

      {verdict && (
        <div className={`sticky bottom-0 -mx-4 mb-0 border-t-2 px-4 py-5 ${verdict.ok ? "border-good bg-[#e3f3ea]" : "border-bad bg-[#f9e4df]"}`}>
          <p className={`font-display text-xl font-extrabold ${verdict.ok ? "text-good" : "text-bad"}`}>{verdict.ok ? "Excellent !" : "Pas tout à fait"}</p>
          <p className="mt-1 whitespace-pre-wrap text-ink">{verdict.msg}</p>
          <button className="btn-primary mt-4 w-full" onClick={next}>Continuer</button>
        </div>
      )}
    </div>
  );
}

// Coach simulé pour le prototype : à brancher sur une vraie IA (API Claude) côté serveur.
function coachHint(step: Step): string {
  switch (step.kind) {
    case "choice": return "Élimine d'abord la réponse qui te paraît la moins logique, puis vérifie chaque proposition sur l'exemple.";
    case "number": return `Écris la formule utile, remplace par les valeurs, puis calcule étape par étape.${step.unit ? ` Ta réponse s'exprime en ${step.unit}.` : ""}`;
    case "code": return "Relis l'énoncé mot à mot : la sortie doit être exactement identique, majuscules et espaces compris. Pense à console.log(...).";
    default: return "";
  }
}

function Blocker({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-6xl">⚡</div>
      <h1 className="font-display text-3xl font-extrabold">{title}</h1>
      <p className="text-muted">{text}</p>
      <Link href="/tarifs" className="btn-primary w-full">Voir les offres</Link>
      <Link href="/apprendre" className="font-semibold text-muted">Retour</Link>
    </div>
  );
}

function StepView({ step, locked, onAnswer, onContinue, coach, aiLeft }: {
  step: Step; locked: boolean; onAnswer: (ok: boolean, msg: string) => void; onContinue: () => void;
  coach: () => string | null; aiLeft: number | null;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [code, setCode] = useState(step.kind === "code" ? step.starter : "");
  const [out, setOut] = useState<{ output: string; error?: string } | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const askCoach = (
    <div className="mt-6">
      {hint ? (
        <div className="rounded-xl border-2 border-brand/30 bg-brand-soft p-4 text-sm"><b>Coach IA :</b> {hint}</div>
      ) : (
        <button disabled={locked} className="text-sm font-bold text-brand disabled:opacity-40"
          onClick={() => setHint(coach() ?? "Tu as utilisé tes questions au coach pour aujourd'hui. Passe à Pro pour un coach illimité.")}>
          💡 Demander un indice au coach{aiLeft !== null ? ` (${aiLeft} restant${aiLeft > 1 ? "s" : ""})` : ""}
        </button>
      )}
    </div>
  );

  if (step.kind === "explain")
    return (
      <div>
        <h2 className="font-display text-3xl font-extrabold">{step.title}</h2>
        <p className="mt-4 text-lg leading-relaxed">{step.body}</p>
        {step.math && <div className="card mt-6 p-4 text-center"><Math tex={step.math} /></div>}
        <button className="btn-primary mt-8 w-full" onClick={onContinue}>J&apos;ai compris</button>
      </div>
    );

  if (step.kind === "choice")
    return (
      <div>
        <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
        {step.math && <Math tex={step.math} />}
        <div className="mt-6 grid gap-3">
          {step.options.map((o, k) => {
            const state = locked ? (k === step.answer ? "border-good bg-good/10" : k === choice ? "border-bad bg-bad/10" : "") : k === choice ? "border-brand bg-brand-soft" : "";
            return (
              <button key={k} disabled={locked} onClick={() => setChoice(k)}
                className={`card px-4 py-3 text-left font-semibold transition hover:border-ink/30 ${state}`}>{o}</button>
            );
          })}
        </div>
        {!locked && <button className="btn-primary mt-6 w-full" disabled={choice === null}
          onClick={() => onAnswer(choice === step.answer, step.why)}>Vérifier</button>}
        {askCoach}
      </div>
    );

  if (step.kind === "number")
    return (
      <div>
        <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
        {step.math && <Math tex={step.math} />}
        <div className="mt-6 flex items-center gap-3">
          <input inputMode="decimal" disabled={locked} value={value} onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && value && !locked && check()}
            className="card w-40 px-4 py-3 text-xl font-bold outline-none focus:border-brand" placeholder="?" />
          {step.unit && <span className="text-lg font-semibold text-muted">{step.unit}</span>}
        </div>
        {!locked && <button className="btn-primary mt-6 w-full" disabled={!value} onClick={check}>Vérifier</button>}
        {askCoach}
      </div>
    );

  function check() {
    if (step.kind !== "number") return;
    const n = parseFloat(value.replace(",", ".").replace(/\s/g, ""));
    const ok = !Number.isNaN(n) && globalThis.Math.abs(n - step.answer) <= step.tolerance;
    onAnswer(ok, step.why);
  }

  // code
  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border-2 border-ink bg-[#1d1a2e]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs font-semibold text-white/60">
          <span>main.js</span><span>JavaScript</span>
        </div>
        <textarea spellCheck={false} disabled={locked} value={code} onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const t = e.currentTarget, s = t.selectionStart;
              setCode(code.slice(0, s) + "  " + code.slice(t.selectionEnd));
              requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2));
            }
          }}
          className="h-48 w-full resize-y bg-transparent p-4 font-mono text-sm text-[#f3eedf] outline-none" />
      </div>
      <div className="mt-3 min-h-16 rounded-xl border-2 border-line bg-card p-3 font-mono text-sm">
        <p className="mb-1 text-xs font-bold uppercase text-muted">Console</p>
        {out ? <pre className={out.error ? "text-bad" : ""}>{out.output}{out.error ? `\n${out.error}` : ""}</pre> : <span className="text-muted">Lance ton code pour voir le résultat.</span>}
      </div>
      {!locked && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="btn-ghost" onClick={async () => setOut(await runJs(code))}>▶ Exécuter</button>
          <button className="btn-primary" onClick={async () => {
            const r = await runJs(code);
            setOut(r);
            const ok = !r.error && r.output.trim() === step.expectedOutput.trim();
            onAnswer(ok, ok ? "Ton code produit exactement la sortie attendue." : `Sortie attendue :\n${step.expectedOutput}\n\nUne solution possible :\n${step.why}`);
          }}>Vérifier</button>
        </div>
      )}
      {askCoach}
    </div>
  );
}
