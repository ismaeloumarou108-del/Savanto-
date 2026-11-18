"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { getBrowserSupabase } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  "Invalid login credentials": "E-mail ou mot de passe incorrect.",
  "User already registered": "Un compte existe déjà avec cet e-mail. Connecte-toi.",
  "Email not confirmed": "Confirme d'abord ton e-mail grâce au lien reçu.",
};

export default function Login() {
  const q = useSearchParams();
  const router = useRouter();
  const next = q.get("next") || "/apprendre";
  const sb = getBrowserSupabase();
  const [mode, setMode] = useState<"in" | "up">(q.get("mode") === "inscription" ? "up" : "in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!sb)
    return (
      <Shell>
        <h1 className="font-display text-2xl font-extrabold">Mode démo</h1>
        <p className="mt-2 text-muted">Les comptes ne sont pas encore activés sur cette installation : ta progression est gardée dans ce navigateur.</p>
        <Link href="/apprendre" className="btn-primary mt-6 w-full">Continuer sans compte</Link>
      </Shell>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    setBusy(true);
    setMsg(null);
    const res = mode === "in"
      ? await sb.auth.signInWithPassword({ email, password })
      : await sb.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    setBusy(false);
    if (res.error) return setMsg({ ok: false, text: ERRORS[res.error.message] ?? res.error.message });
    if (mode === "up" && !res.data.session) return setMsg({ ok: true, text: "Compte créé ! Clique sur le lien reçu par e-mail pour l'activer." });
    router.push(next);
    router.refresh();
  }

  return (
    <Shell>
      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-1 text-sm font-bold">
        {(["in", "up"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setMsg(null); }} className={`rounded-xl py-2 ${mode === m ? "grad text-white" : "text-muted"}`}>
            {m === "in" ? "Connexion" : "Créer un compte"}
          </button>
        ))}
      </div>
      <h1 className="mt-6 font-display text-2xl font-extrabold">{mode === "in" ? "Content de te revoir !" : "Garde ta progression partout"}</h1>
      <p className="mt-1 text-sm text-muted">{mode === "in" ? "Reprends ta série là où tu l'as laissée." : "Ta série, tes XP et tes coffres sont sauvegardés sur tous tes appareils."}</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="email" required autoComplete="email" placeholder="ton@email.fr" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border-2 border-line bg-surface-2 px-4 py-3 outline-none focus:border-orange" />
        <input type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder="Mot de passe (8 caractères min.)"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border-2 border-line bg-surface-2 px-4 py-3 outline-none focus:border-orange" />
        {msg && <p className={`rounded-xl px-3 py-2 text-sm ${msg.ok ? "bg-good/10 text-good" : "bg-bad/10 text-bad"}`}>{msg.text}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? "Un instant…" : mode === "in" ? "Se connecter" : "Créer mon compte"}</button>
      </form>
      <Link href="/apprendre" className="mt-4 block text-center text-sm font-semibold text-muted">Continuer sans compte</Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <div className="mb-8"><Logo /></div>
      <div className="card-hot p-6">{children}</div>
    </main>
  );
}
