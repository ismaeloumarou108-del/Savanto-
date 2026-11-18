"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { findJourney, nextNode } from "@/lib/content";
import { useStore } from "@/lib/store";

const I = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  map: <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14" />,
  trophy: <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4m8-5h4v1a4 4 0 0 1-4 4m-4 2v4m-4 3h8" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0" />,
};
function Icon({ d }: { d: React.ReactNode }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>;
}

export function BottomNav() {
  const path = usePathname();
  const { p } = useStore();
  const j = findJourney(p.currentJourney)?.journey;
  const nxt = j ? nextNode(j, p.completed) : null;
  const playHref = nxt ? (nxt.type === "coffre" ? `/parcours/${j!.id}` : `/lecon/${nxt.id}`) : "/parcours";
  const item = (href: string, label: string, d: React.ReactNode) => {
    const on = path === href || (href !== "/apprendre" && path.startsWith(href));
    return (
      <Link href={href} aria-label={label} className={`group flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition ${on ? "text-orange" : "text-muted hover:text-text"}`}>
        <Icon d={d} /><span>{label}</span>
      </Link>
    );
  };
  return (
    <nav className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[calc(100%-32px)] max-w-md">
      <div className="flex items-center rounded-[28px] border border-line bg-[#120d0c]/85 px-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {item("/apprendre", "Accueil", I.home)}
        {item("/parcours", "Parcours", I.map)}
        <Link href={playHref} aria-label="Continuer ma leçon" className="anim-glow grad -mt-1 mx-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white transition hover:scale-105 active:scale-95">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
        </Link>
        {item("/ligues", "Ligues", I.trophy)}
        {item("/profil", "Profil", I.user)}
      </div>
    </nav>
  );
}
