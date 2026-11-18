"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useStore, type Plan } from "@/lib/store";

const PLANS: { id: Plan; name: string; month: number; year: number; pitch: string; features: string[]; highlight?: boolean }[] = [
  { id: "free", name: "Gratuit", month: 0, year: 0, pitch: "Pour découvrir à ton rythme.",
    features: ["5 leçons par jour (énergie)", "3 indices du coach IA par jour", "XP, séries, badges et ligues", "Leçons de base de chaque matière"] },
  { id: "plus", name: "Plus", month: 9.99, year: 59.99, pitch: "Pour progresser sans limite.", highlight: true,
    features: ["Énergie illimitée", "Toutes les matières et tous les cours", "Certificats de fin de cours", "2 gels de série par mois", "Aucune publicité"] },
  { id: "pro", name: "Pro", month: 14.99, year: 99.99, pitch: "Pour aller vraiment loin.",
    features: ["Tout ce qu'inclut Plus", "Coach IA illimité et plus détaillé", "Correction expliquée de tes solutions", "Projets guidés et annales"] },
];

const FAQ = [
  ["Puis-je annuler à tout moment ?", "Oui. Tu gardes l'accès jusqu'à la fin de la période déjà payée, sans frais."],
  ["Que se passe-t-il si j'annule le paiement ?", "Rien n'est débité et tu restes sur l'offre gratuite. Ta progression est conservée."],
  ["Y a-t-il une offre pour les classes ?", "Oui, une offre enseignant permet de suivre une classe. Contacte-nous pour la mettre en place."],
];

export default function Pricing() {
  const q = useSearchParams();
  const router = useRouter();
  const { p, account, reloadAccount } = useStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [yearly, setYearly] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const cancelled = q.get("cancel") === "true";
  const success = q.get("success") === "true";

  // Après un paiement, le webhook Stripe peut prendre quelques secondes : on relit l'offre.
  useEffect(() => {
    if (!success || !account) return;
    let n = 0;
    const t = setInterval(() => { n++; reloadAccount(); if (n >= 5) clearInterval(t); }, 2000);
    return () => clearInterval(t);
  }, [success, account, reloadAccount]);

  async function choose(offre: Plan, periode: "mois" | "an") {
    setBusy(offre);
    setError(null);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offre, periode }) });
      if (r.status === 501) return router.push(`/paiement?offre=${offre}&periode=${periode}`); // mode démo
      if (r.status === 401) return router.push(`/connexion?mode=inscription&next=/tarifs`);
      const { url } = (await r.json()) as { url?: string };
      if (url) return (window.location.href = url);
      setError("Le paiement n'a pas pu démarrer. Réessaie dans un instant.");
    } catch {
      setError("Connexion impossible. Vérifie ton réseau et réessaie.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <Link href="/apprendre" className="text-sm font-semibold text-muted hover:text-text">Retour aux leçons</Link>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        {cancelled && !dismissed && (
          <div role="status" className="mx-auto mb-8 flex max-w-3xl items-start gap-4 rounded-2xl border border-[#ffd15c]/50 bg-[#ffd15c]/10 p-5">
            <span className="text-2xl text-[#ffd15c]">↩︎</span>
            <div className="flex-1">
              <p className="font-bold">Paiement annulé, aucun montant n&apos;a été débité.</p>
              <p className="mt-1 text-sm text-muted">Tu restes sur l&apos;offre gratuite et ta progression est intacte. Tu peux réessayer quand tu veux.</p>
            </div>
            <button aria-label="Fermer" className="text-xl text-muted" onClick={() => { setDismissed(true); router.replace("/tarifs"); }}>×</button>
          </div>
        )}
        {success && (
          <div role="status" className="mx-auto mb-8 max-w-3xl rounded-2xl border border-good/50 bg-good/10 p-5">
            <p className="font-bold text-good">Bienvenue dans l&apos;offre {p.plan === "pro" ? "Pro" : "Plus"} ! 🎉</p>
            <p className="mt-1 text-sm">Tout est débloqué. <Link href="/apprendre" className="font-bold underline">Reprendre mes leçons</Link></p>
          </div>
        )}

        <div className="text-center">
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">Apprends <span className="grad-text">sans limite</span></h1>
          <p className="mt-3 text-lg text-muted">Commence gratuitement, passe à la vitesse supérieure quand tu veux.</p>
          <div className="mt-6 inline-flex rounded-2xl border border-line bg-surface p-1 text-sm font-bold">
            <button onClick={() => setYearly(false)} className={`rounded-lg px-4 py-2 ${!yearly ? "grad text-white" : "text-muted"}`}>Mensuel</button>
            <button onClick={() => setYearly(true)} className={`rounded-lg px-4 py-2 ${yearly ? "grad text-white" : "text-muted"}`}>Annuel <span className="text-[#ffd15c]">jusqu&apos;à −50 %</span></button>
          </div>
        </div>

        {error && <p role="alert" className="mx-auto mt-6 max-w-xl rounded-xl bg-bad/10 px-4 py-3 text-center text-sm text-bad">{error}</p>}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((pl) => {
            const current = p.plan === pl.id;
            const price = yearly ? pl.year / 12 : pl.month;
            return (
              <div key={pl.id} className={`card relative flex flex-col p-6 ${pl.highlight ? "card-hot md:-translate-y-3" : ""}`}>
                {pl.highlight && <span className="absolute -top-3 left-6 rounded-full grad px-3 py-1 text-xs font-bold text-white">Le plus choisi</span>}
                <h2 className="font-display text-2xl font-extrabold">{pl.name}</h2>
                <p className="text-sm text-muted">{pl.pitch}</p>
                <p className="mt-5">
                  <span className="font-display text-4xl font-extrabold">{price === 0 ? "0 €" : `${price.toFixed(2).replace(".", ",")} €`}</span>
                  <span className="text-muted"> /mois</span>
                </p>
                <p className="h-5 text-xs text-muted">{pl.year > 0 && yearly ? `soit ${pl.year.toFixed(2).replace(".", ",")} € facturés par an` : ""}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {pl.features.map((f) => <li key={f} className="flex gap-2"><span className="font-bold text-good">✓</span>{f}</li>)}
                </ul>
                {current ? (
                  <span className="btn-ghost mt-6 pointer-events-none">Ton offre actuelle</span>
                ) : pl.id === "free" ? (
                  <Link href="/apprendre" className="btn-ghost mt-6">Commencer</Link>
                ) : (
                  <button disabled={busy !== null} onClick={() => choose(pl.id, yearly ? "an" : "mois")} className={`${pl.highlight ? "btn-primary" : "btn-ghost"} mt-6`}>
                    {busy === pl.id ? "Redirection…" : `Choisir ${pl.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-display text-2xl font-extrabold">Questions fréquentes</h2>
          <div className="mt-4 space-y-3">
            {FAQ.map(([qq, a]) => (
              <details key={qq} className="card p-4"><summary className="cursor-pointer font-bold">{qq}</summary><p className="mt-2 text-muted">{a}</p></details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
