"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { findJourney, journeyNodes } from "@/lib/content";
import { useStore } from "@/lib/store";
import { BRAND } from "@/lib/brand";
import { LogoMark } from "@/components/Logo";
import { Confetti } from "@/components/Confetti";

export default function Certificate() {
  const { id } = useParams<{ id: string }>();
  const { p } = useStore();
  const found = findJourney(id);
  if (!found) return <p>Parcours introuvable.</p>;
  const { journey, subject } = found;
  const done = journeyNodes(journey).every((n) => p.completed.includes(n.id));
  if (!done) return <p className="text-muted">Termine tout le parcours « {journey.title} » pour débloquer ce certificat. <Link className="text-orange underline" href={`/parcours/${journey.id}`}>Y aller</Link></p>;
  return (
    <div>
      <Confetti count={60} />
      <div className="card-hot relative overflow-hidden p-8 text-center sm:p-12">
        <div className="mx-auto w-fit"><LogoMark size={44} /></div>
        <p className="label mt-5">Certificat de réussite</p>
        <p className="mt-6 text-muted">Décerné à</p>
        <p className="grad-text font-display text-4xl font-extrabold sm:text-5xl">{p.name}</p>
        <p className="mt-6 text-muted">pour avoir terminé le parcours</p>
        <p className="font-display text-2xl font-extrabold">{journey.title}</p>
        <p className="mt-1 text-sm text-muted">{subject.title} · {journeyNodes(journey).length} étapes</p>
        <p className="mt-10 font-display font-bold">{BRAND.name}</p>
        <p className="text-sm text-muted">{new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
      </div>
      <button className="btn-ghost mt-4 print:hidden" onClick={() => print()}>Imprimer / PDF</button>
    </div>
  );
}
