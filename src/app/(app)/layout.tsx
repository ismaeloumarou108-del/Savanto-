import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { StatPills } from "@/components/Stats";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo href="/apprendre" />
          <StatPills />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-32 pt-6">{children}</main>
      <BottomNav />
    </>
  );
}
