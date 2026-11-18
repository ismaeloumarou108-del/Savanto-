"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SUBJECTS } from "@/lib/content";
import { useStore } from "@/lib/store";
import { BRAND } from "@/lib/brand";

export default function Certificate() {
  const { cours } = useParams<{ cours: string }>();
  const { p } = useStore();
  const found = SUBJECTS.flatMap((s) => s.courses.map((c) => ({ s, c }))).find((x) => x.c.id === cours);
  if (!found) return <p>Cours introuvable.</p>;
  const done = found.c.lessons.every((l) => p.completed.includes(l.id));
  if (!done) return <p className="text-muted">Termine toutes les leçons de « {found.c.title} » pour débloquer ce certificat. <Link className="text-brand underline" href={`/apprendre/${found.s.id}`}>Y aller</Link></p>;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border-[6px] border-double border-ink bg-card p-10 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted">Certificat de réussite</p>
        <p className="mt-6 text-muted">Décerné à</p>
        <p className="font-display text-5xl font-extrabold">{p.name}</p>
        <p className="mt-6 text-muted">pour avoir terminé le cours</p>
        <p className="font-display text-3xl font-extrabold text-brand">{found.c.title}</p>
        <p className="mt-1 text-muted">{found.s.title} · {found.c.lessons.length} leçons</p>
        <p className="mt-10 font-display text-xl font-extrabold">{BRAND.name}</p>
        <p className="text-sm text-muted">{new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
      </div>
      <button className="btn-ghost mt-4 print:hidden" onClick={() => print()}>Imprimer / PDF</button>
    </div>
  );
}
