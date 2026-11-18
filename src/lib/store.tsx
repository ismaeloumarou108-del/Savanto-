"use client";

// Progression de l'élève, stockée localement pour le prototype.
// À remplacer par Supabase (table profiles + progress) pour la version en ligne.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

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
  activeDays: string[];
  currentJourney: string;
  sound: boolean;
  todayXp: number;
  todayLessons: number;
  todayPerfect: number;
  bestCombo: number;
  claimedQuests: string[];
};

export type Reward = { kind: "xp"; amount: number } | { kind: "freeze" } | { kind: "energy"; amount: number };

export const FREE_ENERGY = 5;
export const FREE_AI = 3;

const KEY = "savanto-progress-v2";

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
  activeDays: [],
  currentJourney: "algebre",
  sound: true,
  todayXp: 0,
  todayLessons: 0,
  todayPerfect: 0,
  bestCombo: 0,
  claimedQuests: [],
});

// Remet à zéro ce qui dépend du jour et de la semaine.
function refresh(p: Progress): Progress {
  const t = today();
  let next = { ...p };
  if (next.dayKey !== t) next = { ...next, dayKey: t, energy: FREE_ENERGY, aiLeft: FREE_AI, todayXp: 0, todayLessons: 0, todayPerfect: 0, claimedQuests: [] };
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
  completeLesson: (id: string, xp: number, perfect: boolean, combo: number) => { streakUp: boolean };
  openChest: (id: string) => Reward;
  claimQuest: (id: string, xp: number) => void;
  update: (patch: Partial<Progress>) => void;
  setPlan: (plan: Plan) => void;
  reset: () => void;
  account: Account;
  online: boolean;
  signOut: () => Promise<void>;
  reloadAccount: () => Promise<void>;
};

export type Account = { id: string; email: string } | null;

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

  // --- Synchronisation avec Supabase (si configuré et connecté) ---
  const sb = getBrowserSupabase();
  const online = sb !== null;
  const [account, setAccount] = useState<Account>(null);
  const synced = useRef(false);

  const reloadAccount = useCallback(async () => {
    if (!sb) return;
    const { data } = await sb.auth.getUser();
    const user = data.user;
    synced.current = false;
    if (!user) {
      setAccount(null);
      return;
    }
    setAccount({ id: user.id, email: user.email ?? "" });
    const [{ data: row }, { data: sub }] = await Promise.all([
      sb.from("progress").select("data").eq("user_id", user.id).maybeSingle(),
      sb.from("subscriptions").select("plan, status").eq("user_id", user.id).maybeSingle(),
    ]);
    const plan: Plan = sub && ["active", "trialing"].includes(sub.status ?? "") ? (sub.plan as Plan) : "free";
    setP((local) => {
      const remote = row?.data as Partial<Progress> | undefined;
      // On garde la progression la plus avancée (utile à la première connexion).
      const base = remote && (remote.xp ?? 0) >= local.xp ? { ...initial(), ...remote } : local;
      return refresh({ ...base, plan });
    });
    synced.current = true;
  }, [sb]);

  useEffect(() => {
    if (!sb || !ready) return;
    reloadAccount();
    const { data } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") reloadAccount();
    });
    return () => data.subscription.unsubscribe();
  }, [sb, ready, reloadAccount]);

  useEffect(() => {
    if (!sb || !account || !synced.current) return;
    const t = setTimeout(() => {
      // Le plan n'est jamais écrit par le client : il vient du webhook Stripe.
      const { plan: _plan, ...data } = p;
      void _plan;
      sb.from("progress").upsert({ user_id: account.id, data, updated_at: new Date().toISOString() }).then(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [p, sb, account]);

  const signOut = useCallback(async () => {
    if (!sb) return;
    await sb.auth.signOut();
    setAccount(null);
    setP(initial());
  }, [sb]);

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
    (id: string, xp: number, perfect: boolean, combo: number) => {
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
          activeDays: s.activeDays.includes(t) ? s.activeDays : [...s.activeDays.slice(-60), t],
          todayXp: s.todayXp + xp,
          todayLessons: s.todayLessons + 1,
          todayPerfect: s.todayPerfect + (perfect ? 1 : 0),
          bestCombo: Math.max(s.bestCombo, combo),
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

  const openChest = useCallback((id: string): Reward => {
    const r = Math.random();
    const reward: Reward = r < 0.6 ? { kind: "xp", amount: [15, 20, 30, 50][Math.floor(Math.random() * 4)] } : r < 0.85 ? { kind: "freeze" } : { kind: "energy", amount: 3 };
    setP((s) => {
      if (s.completed.includes(id)) return s;
      const base = { ...s, completed: [...s.completed, id] };
      if (reward.kind === "xp") return { ...base, xp: s.xp + reward.amount, weeklyXp: s.weeklyXp + reward.amount, todayXp: s.todayXp + reward.amount };
      if (reward.kind === "freeze") return { ...base, freezes: s.freezes + 1 };
      return { ...base, energy: s.energy + reward.amount };
    });
    return reward;
  }, []);

  const claimQuest = useCallback((id: string, xp: number) => {
    setP((s) => (s.claimedQuests.includes(id) ? s : { ...s, claimedQuests: [...s.claimedQuests, id], xp: s.xp + xp, weeklyXp: s.weeklyXp + xp, todayXp: s.todayXp + xp }));
  }, []);

  const update = useCallback((patch: Partial<Progress>) => setP((s) => ({ ...s, ...patch })), []);

  return (
    <StoreContext.Provider value={{ p, ready, unlimited, spendEnergy, spendAi, completeLesson, setPlan, reset, openChest, claimQuest, update, account, online, signOut, reloadAccount }}>
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

export const QUESTS = [
  { id: "q-xp", label: "Gagne 30 XP", reward: 10, goal: 30, value: (p: Progress) => p.todayXp },
  { id: "q-lessons", label: "Termine 2 leçons", reward: 15, goal: 2, value: (p: Progress) => p.todayLessons },
  { id: "q-perfect", label: "Réussis 1 leçon sans faute", reward: 20, goal: 1, value: (p: Progress) => p.todayPerfect },
];
