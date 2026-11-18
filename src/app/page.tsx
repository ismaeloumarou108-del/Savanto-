import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BRAND } from "@/lib/brand";
import { SUBJECTS, journeyNodes } from "@/lib/content";
import { HeroDemo } from "@/components/HeroDemo";

export default function Home() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/tarifs" className="text-muted hover:text-text">Tarifs</Link>
          <Link href="/apprendre" className="btn-primary !px-4 !py-2 text-sm">Commencer</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-10 md:grid-cols-[1.15fr_1fr]">
        <div className="anim-rise">
          <span className="pill">Gratuit pour commencer</span>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
            Apprendre devient <span className="grad-text">un jeu</span>.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Maths, physique-chimie, code, SVT, code de la route, langues : des parcours en mini-leçons de 5 minutes, des défis, des coffres à ouvrir,
            des combos et une ligue chaque semaine. Tu ne verras pas le temps passer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/apprendre" className="btn-primary text-lg">Commencer gratuitement</Link>
            <Link href="/tarifs" className="btn-ghost text-lg">Voir les offres</Link>
          </div>
          <div className="mt-8 flex gap-6 text-sm text-muted">
            <span><b className="text-text">7</b> types d&apos;exercices</span>
            <span><b className="text-text">5 min</b> par leçon</span>
            <span><b className="text-text">0</b> vidéo ennuyeuse</span>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <p className="label">Parcours</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold">Une carte à explorer, pas un manuel</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Link key={s.id} href="/parcours" className="card group p-5 transition hover:-translate-y-1 hover:border-orange/50">
              <span className="grad flex h-12 w-12 items-center justify-center rounded-2xl font-display text-lg font-bold text-white transition group-hover:rotate-6">{s.icon}</span>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.blurb}</p>
              <p className="mt-3 text-xs font-semibold text-label">{s.journeys.reduce((n, j) => n + journeyNodes(j).length, 0)} étapes</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3">
        {[
          ["🗺️", "Des parcours, pas des cours", "Leçons, pratiques, défis, coffres et une épreuve finale chronométrée à chaque fin de parcours."],
          ["🔥", "Combos, séries et ligues", "Enchaîne les bonnes réponses pour multiplier tes XP, garde ta série allumée et grimpe de ligue."],
          ["✦", "Un coach qui débloque", "Bloqué ? Le coach IA te donne un indice sans te souffler la réponse. Une erreur revient en fin de leçon."],
        ].map(([i, t, d]) => (
          <div key={t} className="card p-6">
            <p className="text-3xl">{i}</p>
            <h3 className="mt-3 font-display text-lg font-bold">{t}</h3>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} {BRAND.name} · <Link href="/tarifs" className="underline">Tarifs</Link>
      </footer>
    </main>
  );
}
