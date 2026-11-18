import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BRAND } from "@/lib/brand";
import { SUBJECTS, lessonCount } from "@/lib/content";
import { Math } from "@/components/Math";

export default function Home() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/tarifs" className="hidden text-muted hover:text-ink sm:block">Tarifs</Link>
          <Link href="/apprendre" className="btn-primary !py-2 text-sm">Commencer</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="mb-4 inline-block rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">Gratuit pour commencer</p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Cinq minutes par jour pour enfin <span className="text-brand">comprendre</span>.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Maths, physique-chimie, programmation, SVT : des leçons courtes où tu pratiques tout de suite,
            une série à entretenir et un coach IA qui t&apos;explique tes erreurs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/apprendre" className="btn-primary text-lg">Commencer gratuitement</Link>
            <Link href="/tarifs" className="btn-ghost text-lg">Voir les offres</Link>
          </div>
        </div>

        <div className="card relative p-6 shadow-[8px_8px_0_var(--ink)]">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-muted">
            <span>Mathématiques · Leçon 1</span><span className="text-flame">🔥 12 jours</span>
          </div>
          <div className="mb-4 h-2 rounded-full bg-line"><div className="h-2 w-2/3 rounded-full bg-good" /></div>
          <p className="font-semibold">Résous l&apos;équation. Combien vaut x ?</p>
          <Math tex="3x - 5 = 10" />
          <div className="mt-2 rounded-xl border-2 border-good bg-good/10 px-4 py-3 font-semibold text-good">
            x = 5 · Bravo ! +10 XP
          </div>
        </div>
      </section>

      <section className="border-y-2 border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-3xl font-extrabold">Choisis ta matière</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUBJECTS.map((s) => (
              <Link key={s.id} href={`/apprendre/${s.id}`} className="card overflow-hidden transition hover:-translate-y-1">
                <div className={`${s.color} flex h-24 items-center justify-center font-display text-4xl font-extrabold text-white`}>{s.emoji}</div>
                <div className="p-4">
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted">{s.blurb}</p>
                  <p className="mt-3 text-xs font-semibold text-muted">{lessonCount(s)} leçons</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
        {[
          ["Apprendre en pratiquant", "Chaque notion est suivie d'un exercice : QCM, calcul avec unités ou code exécuté dans ton navigateur."],
          ["Garder le rythme", "XP, série de jours, badges et ligues hebdomadaires pour progresser un peu chaque jour."],
          ["Ne jamais rester bloqué", "Le coach IA donne un indice ou explique ton erreur sans te donner directement la réponse."],
        ].map(([t, d]) => (
          <div key={t} className="card p-6">
            <h3 className="font-display text-xl font-extrabold">{t}</h3>
            <p className="mt-2 text-muted">{d}</p>
          </div>
        ))}
      </section>

      <footer className="border-t-2 border-line py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} {BRAND.name} · <Link href="/tarifs" className="underline">Tarifs</Link>
      </footer>
    </main>
  );
}
