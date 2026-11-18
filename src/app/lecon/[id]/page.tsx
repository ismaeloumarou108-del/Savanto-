"use client";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { TYPE_LABEL, findNode, type Step } from "@/lib/content";
import { useStore } from "@/lib/store";
import { MathTex } from "@/components/Math";
import { Confetti } from "@/components/Confetti";
import { runJs } from "@/lib/runCode";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speech";
import { RoadSign, Scene } from "@/components/RoadSign";

type Verdict = null | { ok: boolean; msg: string };

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const found = findNode(id);
  const router = useRouter();
  const { p, ready, unlimited, spendEnergy, spendAi, completeLesson, update } = useStore();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const charged = useRef(false);
  const steps = useMemo(() => found?.node.steps ?? [], [found]);
  // File d'attente : une question ratée revient à la fin de la leçon.
  const [queue, setQueue] = useState<number[]>(() => steps.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [retried, setRetried] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [phase, setPhase] = useState<"play" | "memo" | "done" | "timeout">("play");
  const [result, setResult] = useState<null | { xp: number; streakUp: boolean }>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(found?.node.timeLimit ?? null);
  const [pulse, setPulse] = useState(0);

  const sound = p.sound;
  const isBoss = found?.node.type === "boss";

  useEffect(() => {
    if (!ready || charged.current || !found) return;
    charged.current = true;
    if (found.node.premium && !unlimited) return setAllowed(false);
    setAllowed(spendEnergy());
  }, [ready, found, unlimited, spendEnergy]);

  useEffect(() => {
    if (!allowed || timeLeft === null || phase !== "play") return;
    if (timeLeft <= 0) { setPhase("timeout"); if (sound) sfx.bad(); return; }
    const t = setTimeout(() => setTimeLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [allowed, timeLeft, phase, sound]);

  if (!found || !found.node.steps) notFound();
  const { node, journey } = found;

  if (allowed === null) return <div className="p-10 text-center text-muted">Chargement…</div>;
  if (allowed === false)
    return (
      <Blocker
        icon={node.premium && !unlimited ? "👑" : "⚡"}
        title={node.premium && !unlimited ? "Étape réservée aux abonnés" : "Plus d'énergie pour aujourd'hui"}
        text={node.premium && !unlimited ? "Cette étape fait partie de l'offre Plus." : "Ton énergie se recharge demain. Avec Plus, elle est illimitée."}
        back={`/parcours/${journey.id}`}
      />
    );

  const stepIdx = queue[pos];
  const step = steps[stepIdx];
  const progress = phase === "play" ? pos / queue.length : 1;

  function answer(ok: boolean, msg: string) {
    if (ok) {
      const c = combo + 1;
      setCombo(c);
      setBestCombo((b) => Math.max(b, c));
      const gain = (isBoss ? 20 : 10) + (c >= 3 ? 2 * (c - 2) : 0);
      setXp((x) => x + gain);
      setPulse((n) => n + 1);
      if (sound) { if (c >= 3) sfx.combo(c); else sfx.good(); }
    } else {
      setMistakes((m) => m + 1);
      setCombo(0);
      if (sound) sfx.bad();
      if (!isBoss && !retried.includes(stepIdx)) {
        setQueue((q) => [...q, stepIdx]);
        setRetried((r) => [...r, stepIdx]);
        msg += "\n\n↻ On y reviendra à la fin de la leçon.";
      }
    }
    setVerdict({ ok, msg });
  }

  function next() {
    setVerdict(null);
    if (pos + 1 < queue.length) return setPos(pos + 1);
    if (isBoss && mistakes > (node.maxMistakes ?? 1)) { setPhase("timeout"); return; }
    if (node.memo?.length) setPhase("memo");
    else finish();
  }

  function finish() {
    const total = xp + (mistakes === 0 ? 5 : 0);
    const { streakUp } = completeLesson(node.id, total, mistakes === 0, bestCombo);
    if (sound) sfx.win();
    setResult({ xp: total, streakUp });
    setPhase("done");
  }

  if (phase === "timeout")
    return (
      <Blocker icon="♛" title={timeLeft !== null && timeLeft <= 0 ? "Temps écoulé !" : "Le gardien résiste…"}
        text={`Pour réussir l'épreuve finale, il faut répondre à temps avec au plus ${node.maxMistakes ?? 1} erreur${(node.maxMistakes ?? 1) > 1 ? "s" : ""}. Retente ta chance !`}
        back={`/parcours/${journey.id}`} retry={() => location.reload()} />
    );

  if (phase === "memo")
    return (
      <Shell progress={1} back={`/parcours/${journey.id}`} combo={0} timeLeft={null}>
        <div className="anim-rise">
          <span className="pill">Fiche mémo</span>
          <h2 className="mt-3 font-display text-2xl font-extrabold">À retenir</h2>
          <ul className="card-hot mt-5 space-y-3 p-5">
            {node.memo!.map((m) => (
              <li key={m} className="flex gap-3"><span className="text-orange">◆</span><span className="font-semibold">{m}</span></li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">Tu retrouveras cette fiche à tout moment depuis ton profil.</p>
          <button className="btn-primary mt-8 w-full text-lg" onClick={finish}>Terminer</button>
        </div>
      </Shell>
    );

  if (phase === "done" && result)
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
        <Confetti />
        <div className="anim-pop text-7xl">{mistakes === 0 ? "🏆" : "🎉"}</div>
        <h1 className="font-display text-4xl font-extrabold">{isBoss ? "Gardien vaincu !" : mistakes === 0 ? "Sans faute !" : "Leçon terminée !"}</h1>
        <div className="grid w-full grid-cols-3 gap-3">
          <Tile label="XP" value={`+${result.xp}`} color="text-[#ffd15c]" delay={0} />
          <Tile label="Combo max" value={`×${bestCombo}`} color="text-orange" delay={120} />
          <Tile label="Précision" value={`${Math.round(((steps.filter((s) => s.kind !== "explain").length) / Math.max(1, steps.filter((s) => s.kind !== "explain").length + mistakes)) * 100)} %`} color="text-good" delay={240} />
        </div>
        {result.streakUp && <p className="card-hot anim-rise w-full p-4 font-semibold">🔥 Série : {p.streak} jour{p.streak > 1 ? "s" : ""} ! Reviens demain pour la prolonger.</p>}
        <button className="btn-primary mt-2 w-full text-lg" onClick={() => router.push(`/parcours/${journey.id}`)}>Continuer</button>
      </div>
    );

  return (
    <Shell progress={progress} back={`/parcours/${journey.id}`} combo={combo} timeLeft={timeLeft} pulse={pulse} xp={xp}
      sound={sound} toggleSound={() => update({ sound: !sound })} label={`${TYPE_LABEL[node.type]} · ${node.title}`}>
      <StepView key={pos} step={step} locked={!!verdict} sound={sound} onAnswer={answer} onContinue={next}
        coach={(attempt) => askCoach(step, attempt, spendAi)} aiLeft={p.plan === "pro" ? null : p.aiLeft} />
      {verdict && (
        <div className={`anim-rise fixed inset-x-0 bottom-0 z-30 border-t px-4 pb-6 pt-5 backdrop-blur-xl ${verdict.ok ? "border-good/50 bg-[#0f2219]/95" : "border-bad/50 bg-[#2a1015]/95"}`}>
          <div className="mx-auto max-w-2xl">
            <p className={`font-display text-xl font-extrabold ${verdict.ok ? "text-good" : "text-bad"}`}>
              {verdict.ok ? (combo >= 3 ? `Combo ×${combo} ! 🔥` : ["Excellent !", "Bien joué !", "Parfait !", "Bravo !"][pos % 4]) : "Pas tout à fait"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-text/90">{verdict.msg}</p>
            <button autoFocus className={`mt-4 w-full ${verdict.ok ? "btn-primary" : "btn bg-bad text-white"}`} onClick={next}>Continuer</button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Tile({ label, value, color, delay }: { label: string; value: string; color: string; delay: number }) {
  return (
    <div className="card anim-pop p-3" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className={`font-display text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function Shell({ children, progress, back, combo, timeLeft, pulse = 0, xp, sound, toggleSound, label }: {
  children: React.ReactNode; progress: number; back: string; combo: number; timeLeft: number | null;
  pulse?: number; xp?: number; sound?: boolean; toggleSound?: () => void; label?: string;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-48">
      <div className="sticky top-0 z-20 -mx-4 bg-bg/80 px-4 pb-3 pt-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link href={back} aria-label="Quitter" className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-xl text-muted hover:text-text">×</Link>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div className="grad h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(4, progress * 100)}%` }} />
          </div>
          {combo >= 2 && <span key={combo} className="anim-pop rounded-full bg-orange/15 px-2.5 py-1 text-sm font-extrabold text-orange">🔥×{combo}</span>}
          {timeLeft !== null && (
            <span className={`rounded-full px-2.5 py-1 font-mono text-sm font-bold ${timeLeft <= 15 ? "anim-wobble bg-bad/20 text-bad" : "bg-surface-2 text-text"}`}>⏱ {timeLeft}s</span>
          )}
          {toggleSound && (
            <button onClick={toggleSound} aria-label={sound ? "Couper le son" : "Activer le son"} className="text-lg text-muted">{sound ? "🔊" : "🔇"}</button>
          )}
        </div>
        {label && (
          <div className="relative mt-2 flex items-center justify-between text-xs text-muted">
            <span className="truncate">{label}</span>
            {xp !== undefined && <span className="font-bold text-[#ffd15c]">⭐ {xp} XP</span>}
            {pulse > 0 && <span key={pulse} className="anim-xp absolute right-0 top-0 font-display font-extrabold text-[#ffd15c]">+XP</span>}
          </div>
        )}
      </div>
      <div className="flex-1 pt-6">{children}</div>
    </div>
  );
}

// Coach simulé pour le prototype : à brancher sur une vraie IA côté serveur.
const QUOTA_MSG = "Tu as utilisé tes indices du jour. Passe à Pro pour un coach illimité.";

// Demande un indice au vrai coach IA ; repli sur un indice générique si l'IA n'est pas configurée.
async function askCoach(step: Step, attempt: string | undefined, spendAi: () => boolean): Promise<string> {
  if (!spendAi()) return QUOTA_MSG;
  try {
    const r = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ step, attempt }) });
    if (r.ok) {
      const { hint } = (await r.json()) as { hint?: string };
      if (hint) return hint;
    }
    if (r.status === 429) return QUOTA_MSG;
  } catch {}
  return coachHint(step);
}

function coachHint(step: Step): string {
  switch (step.kind) {
    case "choice": return "Élimine d'abord la réponse la moins logique, puis teste chaque proposition sur un exemple.";
    case "number": return `Écris la formule utile, remplace par les valeurs, puis calcule étape par étape.${step.unit ? ` Réponse en ${step.unit}.` : ""}`;
    case "code": return "La sortie doit être exactement identique, majuscules et espaces compris. Pense à console.log(...).";
    case "order": return "Cherche d'abord la toute première étape : celle qui ne dépend d'aucune autre.";
    case "match": return "Commence par la paire dont tu es le plus sûr, les autres deviendront plus évidentes.";
    case "fill": return "Lis la phrase entière à voix haute avec chaque option : une seule sonne juste.";
    case "listen": return "Réécoute en te concentrant sur la première syllabe, puis compare avec chaque proposition.";
    default: return "";
  }
}

function Blocker({ icon, title, text, back, retry }: { icon: string; title: string; text: string; back: string; retry?: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="anim-pop grad flex h-24 w-24 items-center justify-center rounded-full text-5xl">{icon}</div>
      <h1 className="font-display text-3xl font-extrabold">{title}</h1>
      <p className="text-muted">{text}</p>
      {retry ? <button className="btn-primary w-full" onClick={retry}>Réessayer</button> : <Link href="/tarifs" className="btn-primary w-full">Voir les offres</Link>}
      <Link href={back} className="font-semibold text-muted">Retour au parcours</Link>
    </div>
  );
}

function shuffle<T>(a: T[], seed: number) {
  const r = [...a];
  let s = seed;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  // évite de présenter la bonne réponse déjà triée
  return r.join("|") === a.join("|") && r.length > 1 ? [...r.slice(1), r[0]] : r;
}

function StepView({ step, locked, sound, onAnswer, onContinue, coach, aiLeft }: {
  step: Step; locked: boolean; sound: boolean; onAnswer: (ok: boolean, msg: string) => void; onContinue: () => void;
  coach: (attempt?: string) => Promise<string>; aiLeft: number | null;
}) {
  const [hint, setHint] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const draft = useRef<string | undefined>(undefined);
  const [shake, setShake] = useState(0);
  const tap = () => sound && sfx.tap();
  const fail = (msg: string) => { setShake((n) => n + 1); onAnswer(false, msg); };

  const coachUi = step.kind !== "explain" && (
    <div className="mt-6">
      {hint ? (
        <div className="anim-rise flex gap-3 rounded-2xl border border-orange/30 bg-orange/10 p-4 text-sm">
          <span className="grad flex h-8 w-8 shrink-0 items-center justify-center rounded-full">✦</span>
          <p><b className="text-orange">Coach IA</b><br />{hint}</p>
        </div>
      ) : (
        <button disabled={locked || thinking} className={`text-sm font-bold text-orange disabled:opacity-40 ${thinking ? "animate-pulse" : ""}`}
          onClick={async () => { setThinking(true); setHint(await coach(draft.current)); setThinking(false); }}>
          {thinking ? "✦ Le coach réfléchit…" : "✦ Demander un indice"}{!thinking && aiLeft !== null ? ` (${aiLeft} restant${aiLeft > 1 ? "s" : ""})` : ""}
        </button>
      )}
    </div>
  );

  const wrap = (body: React.ReactNode) => <div key={shake} className={shake ? "anim-shake" : "anim-rise"}>{body}{coachUi}</div>;

  switch (step.kind) {
    case "explain":
      return (
        <div className="anim-rise">
          <span className="pill">Nouvelle notion</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold">{step.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-text/90">{step.body}</p>
          <Visuals step={step} auto />
          {step.math && <div className="card-hot mt-6 p-4 text-center"><MathTex tex={step.math} /></div>}
          {step.code && <CodeBlock code={step.code} />}
          <button className="btn-primary mt-8 w-full text-lg" onClick={onContinue}>J&apos;ai compris</button>
        </div>
      );
    case "listen":
      return wrap(<Listen step={step} locked={locked} tap={tap} onAnswer={onAnswer} fail={fail} />);
    case "choice":
      return wrap(<Choice step={step} locked={locked} tap={tap} onAnswer={onAnswer} fail={fail} />);
    case "number":
      return wrap(<NumberQ step={step} locked={locked} onAnswer={onAnswer} fail={fail} onDraft={(d) => (draft.current = d)} />);
    case "order":
      return wrap(<Order step={step} locked={locked} tap={tap} onAnswer={onAnswer} fail={fail} />);
    case "match":
      return wrap(<Match step={step} locked={locked} sound={sound} onAnswer={onAnswer} />);
    case "fill":
      return wrap(<Fill step={step} locked={locked} tap={tap} onAnswer={onAnswer} fail={fail} />);
    case "code":
      return wrap(<CodeQ step={step} locked={locked} onAnswer={onAnswer} fail={fail} onDraft={(d) => (draft.current = d)} />);
  }
}

function SpeakButton({ text, lang, auto = false }: { text: string; lang: string; auto?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const play = (rate = 0.9) => { if (speak(text, lang, rate)) { setPlaying(true); setTimeout(() => setPlaying(false), 900); } };
  useEffect(() => { if (auto) play(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button onClick={() => play()} aria-label="Écouter"
        className={`grad flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white shadow-[0_10px_30px_-8px_rgba(255,90,40,0.8)] transition active:scale-90 ${playing ? "anim-glow scale-105" : ""}`}>🔊</button>
      <button onClick={() => play(0.55)} aria-label="Écouter lentement" className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface-2 text-xl">🐢</button>
    </div>
  );
}

function Visuals({ step, auto = false }: { step: { sign?: import("@/components/RoadSign").SignId; scene?: import("@/components/RoadSign").SceneId; say?: { text: string; lang: string } }; auto?: boolean }) {
  return (
    <>
      {step.sign && <div className="anim-pop mt-5 flex justify-center"><RoadSign id={step.sign} size={130} /></div>}
      {step.scene && <div className="anim-rise mt-5 flex justify-center"><Scene id={step.scene} /></div>}
      {step.say && <SpeakButton text={step.say.text} lang={step.say.lang} auto={auto} />}
    </>
  );
}

function Listen({ step, locked, tap, onAnswer, fail }: QProps<"listen">) {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <>
      <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
      <SpeakButton text={step.say.text} lang={step.say.lang} auto />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {step.options.map((o, k) => {
          const st = locked
            ? k === step.answer ? "border-good bg-good/15 text-good" : k === choice ? "border-bad bg-bad/15 text-bad" : "opacity-50"
            : k === choice ? "border-orange bg-orange/15 scale-[1.02]" : "hover:border-orange/40";
          return (
            <button key={k} disabled={locked} onClick={() => { tap?.(); setChoice(k); }}
              className={`rounded-2xl border-2 border-line bg-surface-2 px-3 py-4 text-center font-semibold transition ${st}`}>{o}</button>
          );
        })}
      </div>
      {!locked && <button className="btn-primary mt-6 w-full" disabled={choice === null}
        onClick={() => (choice === step.answer ? onAnswer(true, step.why) : fail(step.why))}>Vérifier</button>}
    </>
  );
}

function CodeBlock({ code }: { code: string }) {
  return <pre className="mt-6 overflow-x-auto rounded-2xl border border-line bg-[#0e0a09] p-4 font-mono text-sm text-[#ffd0a8]">{code}</pre>;
}

type QProps<K extends Step["kind"]> = { step: Extract<Step, { kind: K }>; locked: boolean; onAnswer: (ok: boolean, msg: string) => void; fail: (msg: string) => void; tap?: () => void; onDraft?: (d: string) => void };

function Choice({ step, locked, tap, onAnswer, fail }: QProps<"choice">) {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <>
      <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
      <Visuals step={step} />
      {step.math && <MathTex tex={step.math} />}
      {step.code && <CodeBlock code={step.code} />}
      <div className="mt-6 grid gap-3">
        {step.options.map((o, k) => {
          const st = locked
            ? k === step.answer ? "border-good bg-good/15 text-good" : k === choice ? "border-bad bg-bad/15 text-bad" : "opacity-50"
            : k === choice ? "border-orange bg-orange/15 scale-[1.01]" : "hover:border-orange/40";
          return (
            <button key={k} disabled={locked} onClick={() => { tap?.(); setChoice(k); }}
              className={`flex items-center gap-3 rounded-2xl border-2 border-line bg-surface-2 px-4 py-3.5 text-left font-semibold transition ${st}`}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-xs text-muted">{String.fromCharCode(65 + k)}</span>{o}
            </button>
          );
        })}
      </div>
      {!locked && <button className="btn-primary mt-6 w-full" disabled={choice === null}
        onClick={() => (choice === step.answer ? onAnswer(true, step.why) : fail(step.why))}>Vérifier</button>}
    </>
  );
}

function NumberQ({ step, locked, onAnswer, fail, onDraft }: QProps<"number">) {
  const [value, setValue] = useState("");
  const check = () => {
    const n = parseFloat(value.replace(",", ".").replace(/\s/g, ""));
    const ok = !Number.isNaN(n) && Math.abs(n - step.answer) <= step.tolerance;
    if (ok) onAnswer(true, step.why); else fail(step.why);
  };
  return (
    <>
      <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
      {step.math && <div className="card-hot mt-4 p-3 text-center"><MathTex tex={step.math} /></div>}
      <div className="mt-6 flex items-center gap-3">
        <input autoFocus inputMode="decimal" disabled={locked} value={value} onChange={(e) => { setValue(e.target.value); onDraft?.(e.target.value); }}
          onKeyDown={(e) => e.key === "Enter" && value && !locked && check()}
          className="w-44 rounded-2xl border-2 border-line bg-surface-2 px-4 py-3 text-2xl font-bold outline-none transition focus:border-orange" placeholder="?" />
        {step.unit && <span className="text-lg font-semibold text-muted">{step.unit}</span>}
      </div>
      {!locked && <button className="btn-primary mt-6 w-full" disabled={!value} onClick={check}>Vérifier</button>}
    </>
  );
}

function Order({ step, locked, tap, onAnswer, fail }: QProps<"order">) {
  const pool = useMemo(() => shuffle(step.items.map((_, i) => i), step.items.length * 7 + 3), [step]);
  const [picked, setPicked] = useState<number[]>([]);
  return (
    <>
      <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
      <p className="mt-1 text-sm text-muted">Touche les éléments dans le bon ordre. Touche une ligne placée pour la retirer.</p>
      <ol className="mt-5 min-h-24 space-y-2 rounded-2xl border-2 border-dashed border-line p-3">
        {picked.length === 0 && <li className="py-6 text-center text-sm text-muted">Ta réponse s&apos;affiche ici</li>}
        {picked.map((i, k) => (
          <li key={i}>
            <button disabled={locked} onClick={() => { tap?.(); setPicked(picked.filter((x) => x !== i)); }}
              className="anim-pop flex w-full items-center gap-3 rounded-xl border border-orange/40 bg-orange/10 px-3 py-2.5 text-left font-mono text-sm">
              <span className="grad flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white">{k + 1}</span>{step.items[i]}
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        {pool.filter((i) => !picked.includes(i)).map((i) => (
          <button key={i} disabled={locked} onClick={() => { tap?.(); setPicked([...picked, i]); }}
            className="rounded-xl border-2 border-line bg-surface-2 px-3 py-2.5 font-mono text-sm transition hover:-translate-y-0.5 hover:border-orange/50">{step.items[i]}</button>
        ))}
      </div>
      {!locked && <button className="btn-primary mt-6 w-full" disabled={picked.length !== step.items.length}
        onClick={() => (picked.every((v, k) => v === k) ? onAnswer(true, step.why) : fail(`Ordre attendu :\n${step.items.map((x, k) => `${k + 1}. ${x}`).join("\n")}`))}>Vérifier</button>}
    </>
  );
}

function Match({ step, locked, sound, onAnswer }: { step: Extract<Step, { kind: "match" }>; locked: boolean; sound: boolean; onAnswer: (ok: boolean, msg: string) => void }) {
  const right = useMemo(() => shuffle(step.pairs.map((_, i) => i), step.pairs.length * 13 + 1), [step]);
  const [left, setLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);

  function pickRight(i: number) {
    if (left === null || locked) return;
    if (i === left) {
      const m = [...matched, i];
      setMatched(m);
      setLeft(null);
      if (sound) sfx.tap();
      if (m.length === step.pairs.length) setTimeout(() => onAnswer(errors === 0, errors === 0 ? step.why : `${errors} erreur${errors > 1 ? "s" : ""} d'association. ${step.why}`), 250);
    } else {
      setWrong(i);
      setErrors((e) => e + 1);
      if (sound) sfx.bad();
      setTimeout(() => setWrong(null), 450);
    }
  }
  const cls = (on: boolean, done: boolean, bad: boolean) =>
    `w-full rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${done ? "border-good/50 bg-good/10 text-good opacity-60" : bad ? "anim-shake border-bad bg-bad/15" : on ? "border-orange bg-orange/15 scale-[1.03]" : "border-line bg-surface-2 hover:border-orange/40"}`;
  return (
    <>
      <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
      <p className="mt-1 text-sm text-muted">Touche un élément à gauche, puis son partenaire à droite.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {step.pairs.map(([a], i) => (
            <button key={i} disabled={matched.includes(i) || locked} onClick={() => { setLeft(i); if (sound) sfx.tap(); }} className={cls(left === i, matched.includes(i), false)}>{a}</button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((i) => (
            <button key={i} disabled={matched.includes(i) || locked} onClick={() => pickRight(i)} className={cls(false, matched.includes(i), wrong === i)}>{step.pairs[i][1]}</button>
          ))}
        </div>
      </div>
    </>
  );
}

function Fill({ step, locked, tap, onAnswer, fail }: QProps<"fill">) {
  const parts = step.text.split("___");
  const [vals, setVals] = useState<(string | null)[]>(() => step.answer.map(() => null));
  const nextEmpty = vals.findIndex((v) => v === null);
  return (
    <>
      <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
      <p className="card mt-5 p-5 text-lg leading-[2.4]">
        {parts.map((t, k) => (
          <span key={k}>
            {t}
            {k < parts.length - 1 && (
              <button disabled={locked} onClick={() => { tap?.(); setVals(vals.map((v, i) => (i === k ? null : v))); }}
                className={`mx-1 inline-flex min-w-20 justify-center rounded-lg border-b-4 px-2 align-middle font-bold leading-8 transition ${vals[k] ? "anim-pop border-orange bg-orange/15 text-orange" : k === nextEmpty ? "border-orange/60 bg-surface-2" : "border-line bg-surface-2"}`}>
                {vals[k] ?? " "}
              </button>
            )}
          </span>
        ))}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {step.options.map((o) => (
          <button key={o} disabled={locked || nextEmpty === -1} onClick={() => { tap?.(); setVals(vals.map((v, i) => (i === nextEmpty ? o : v))); }}
            className="rounded-xl border-2 border-line bg-surface-2 px-4 py-2.5 font-semibold transition hover:-translate-y-0.5 hover:border-orange/50">{o}</button>
        ))}
      </div>
      {!locked && <button className="btn-primary mt-6 w-full" disabled={nextEmpty !== -1}
        onClick={() => (vals.every((v, i) => v === step.answer[i]) ? onAnswer(true, step.why) : fail(`Réponse : ${step.answer.join(", ")}. ${step.why}`))}>Vérifier</button>}
    </>
  );
}

function CodeQ({ step, locked, onAnswer, fail, onDraft }: QProps<"code">) {
  const [code, setCode] = useState(step.starter);
  const [out, setOut] = useState<{ output: string; error?: string } | null>(null);
  const [running, setRunning] = useState(false);
  const run = async () => { setRunning(true); const r = await runJs(code); setOut(r); setRunning(false); return r; };
  return (
    <>
      <h2 className="font-display text-2xl font-extrabold">{step.prompt}</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-orange/30 bg-[#0e0a09] shadow-[0_20px_40px_-25px_rgba(255,90,40,0.6)]">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2 text-xs font-semibold text-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2">main.js</span>
        </div>
        <textarea spellCheck={false} disabled={locked} value={code} onChange={(e) => { setCode(e.target.value); onDraft?.(e.target.value); }}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const t = e.currentTarget, s = t.selectionStart;
              setCode(code.slice(0, s) + "  " + code.slice(t.selectionEnd));
              requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2));
            }
          }}
          className="h-48 w-full resize-y bg-transparent p-4 font-mono text-sm leading-6 text-[#ffd0a8] caret-orange outline-none" />
      </div>
      <div className="mt-3 rounded-2xl border border-line bg-surface p-3 font-mono text-sm">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">Console</p>
        {out ? <pre className={`whitespace-pre-wrap ${out.error ? "text-bad" : "text-good"}`}>{out.output}{out.error ? `\n${out.error}` : ""}</pre> : <span className="text-muted">Lance ton code pour voir le résultat.</span>}
      </div>
      {!locked && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="btn-ghost" disabled={running} onClick={run}>▶ Exécuter</button>
          <button className="btn-primary" disabled={running} onClick={async () => {
            const r = await run();
            const ok = !r.error && r.output.trim() === step.expectedOutput.trim();
            if (ok) onAnswer(true, "Ton code produit exactement la sortie attendue."); else fail(`Sortie attendue :\n${step.expectedOutput}\n\nPiste de solution :\n${step.why}`);
          }}>Vérifier</button>
        </div>
      )}
    </>
  );
}
