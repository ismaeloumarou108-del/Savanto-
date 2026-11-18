"use client";

// Progression de l'élève, stockée localement pour le prototype.
// À remplacer par Supabase (table profiles + progress) pour la version en ligne.

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Plan = "free" | "plus" | "pro";

export type Progress = {
  name: string;
  plan: Plan;
  xp: number;
  weeklyXp: number;
  weekKey: string;
  streak: number;
  bestStreak: number;
  lastDay: string | null;
  freezes: number;
  energy: number;
  aiLeft: number;
  dayKey: string;
  completed: string[];
  perfect: string[];
};

export const FREE_ENERGY = 5;
export const FREE_AI = 3;

const KEY = "savanto-progress-v1";

function today() {
  return new Date().toISOString().slice(0, 10);
}
function weekOf(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() - day + 1);
  return t.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

const initial = (): Progress => ({
  name: "Toi",
  plan: "free",
  xp: 0,
  weeklyXp: 0,
  weekKey: weekOf(),
  streak: 0,
  bestStreak: 0,
  lastDay: null,
  freezes: 0,
  energy: FREE_ENERGY,
  aiLeft: FREE_AI,
  dayKey: today(),
  completed: [],
  perfect: [],
});

// Remet à zéro ce qui dépend du jour et de la semaine.
function refresh(p: Progress): Progress {
  const t = today();
  let next = { ...p };
  if (next.dayKey !== t) next = { ...next, dayKey: t, energy: FREE_ENERGY, aiLeft: FREE_AI };
  const w = weekOf();
  if (next.weekKey !== w) next = { ...next, weekKey: w, weeklyXp: 0 };
  // Série perdue si plus d'un jour manqué et pas assez de gels.
  if (next.lastDay) {
    const gap = daysBetween(next.lastDay, t);
    if (gap > 1) {
      const missed = gap - 1;
      if (next.freezes >= missed) next = { ...next, freezes: next.freezes - missed, lastDay: addDays(t, -1) };
      else next = { ...next, streak: 0 };
    }
  }
  return next;
}
function addDays(d: string, n: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
}

type Ctx = {
  p: Progress;
  ready: boolean;
  unlimited: boolean;
  spendEnergy: () => boolean;
  spendAi: () => boolean;
  completeLesson: (id: string, xp: number, perfect: boolean) => { streakUp: boolean };
  setPlan: (plan: Plan) => void;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [p, setP] = useState<Progress>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let loaded = initial();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) loaded = { ...loaded, ...JSON.parse(raw) };
    } catch {}
    setP(refresh(loaded));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {}
  }, [p, ready]);

  const unlimited = p.plan !== "free";

  const spendEnergy = useCallback(() => {
    if (unlimited) return true;
    if (p.energy <= 0) return false;
    setP((s) => ({ ...s, energy: s.energy - 1 }));
    return true;
  }, [p.energy, unlimited]);

  const spendAi = useCallback(() => {
    if (p.plan === "pro") return true;
    if (p.aiLeft <= 0) return false;
    setP((s) => ({ ...s, aiLeft: s.aiLeft - 1 }));
    return true;
  }, [p.aiLeft, p.plan]);

  const completeLesson = useCallback(
    (id: string, xp: number, perfect: boolean) => {
      const t = today();
      const streakUp = p.lastDay !== t;
      setP((s) => {
        const streak = s.lastDay === t ? s.streak : s.streak + 1;
        return {
          ...s,
          xp: s.xp + xp,
          weeklyXp: s.weeklyXp + xp,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          lastDay: t,
          completed: s.completed.includes(id) ? s.completed : [...s.completed, id],
          perfect: perfect && !s.perfect.includes(id) ? [...s.perfect, id] : s.perfect,
        };
      });
      return { streakUp };
    },
    [p.lastDay],
  );

  const setPlan = useCallback((plan: Plan) => {
    setP((s) => ({ ...s, plan, freezes: plan === "free" ? s.freezes : Math.max(s.freezes, 2) }));
  }, []);

  const reset = useCallback(() => setP(initial()), []);

  return (
    <StoreContext.Provider value={{ p, ready, unlimited, spendEnergy, spendAi, completeLesson, setPlan, reset }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore hors du StoreProvider");
  return c;
}

export const LEVELS = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000];
export function levelOf(xp: number) {
  let l = 1;
  LEVELS.forEach((min, i) => {
    if (xp >= min) l = i + 1;
  });
  const cur = LEVELS[l - 1];
  const nxt = LEVELS[l] ?? cur + 1000;
  return { level: l, into: xp - cur, span: nxt - cur };
}
