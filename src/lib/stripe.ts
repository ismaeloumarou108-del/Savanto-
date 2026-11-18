import "server-only";
import Stripe from "stripe";
import type { Plan } from "@/lib/store";

let stripe: Stripe | null = null;
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

export type Period = "mois" | "an";

export function priceFor(plan: Exclude<Plan, "free">, period: Period) {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${period === "mois" ? "MONTH" : "YEAR"}`;
  return process.env[key] || null;
}

export function planForPrice(priceId: string | undefined): Plan {
  if (!priceId) return "free";
  if ([process.env.STRIPE_PRICE_PRO_MONTH, process.env.STRIPE_PRICE_PRO_YEAR].includes(priceId)) return "pro";
  if ([process.env.STRIPE_PRICE_PLUS_MONTH, process.env.STRIPE_PRICE_PLUS_YEAR].includes(priceId)) return "plus";
  return "free";
}
