"use client";
// Paiement simulé pour le prototype. En production : session Stripe Checkout
// avec success_url = /tarifs?success=true et cancel_url = /tarifs?cancel=true.
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useStore } from "@/lib/store";

const PRICES = { plus: { mois: 9.99, an: 59.99 }, pro: { mois: 14.99, an: 99.99 } } as const;

export default function Checkout() {
  const q = useSearchParams();
  const router = useRouter();
  const { setPlan } = useStore();
  const offre = (q.get("offre") === "pro" ? "pro" : "plus") as "plus" | "pro";
  const periode = q.get("periode") === "mois" ? "mois" : "an";
  const price = PRICES[offre][periode];

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <Logo />
      <div className="card p-6">
        <p className="text-sm font-semibold text-muted">Récapitulatif</p>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="font-display text-2xl font-extrabold">Offre {offre === "pro" ? "Pro" : "Plus"}</p>
          <p className="text-xl font-bold">{price.toFixed(2).replace(".", ",")} € / {periode}</p>
        </div>
        <p className="mt-4 rounded-xl bg-brand-soft p-3 text-sm">Mode démonstration : aucune carte n&apos;est demandée et rien n&apos;est débité.</p>
        <div className="mt-6 grid gap-3">
          <button className="btn-primary" onClick={() => { setPlan(offre); router.push("/tarifs?success=true"); }}>Payer (simulation)</button>
          <button className="btn-ghost" onClick={() => router.push("/tarifs?cancel=true")}>Annuler et revenir</button>
        </div>
      </div>
    </main>
  );
}
