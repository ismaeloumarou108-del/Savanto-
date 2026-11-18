import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getUser } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/config";

// Ouvre le portail client Stripe (changer d'offre, moyen de paiement, résilier).
export async function POST() {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "not_configured" }, { status: 501 });
  const { sb, user } = await getUser();
  if (!sb || !user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const { data } = await sb.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!data?.stripe_customer_id) return NextResponse.json({ error: "no_customer" }, { status: 404 });
  const portal = await stripe.billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${siteUrl()}/profil`, locale: "fr" });
  return NextResponse.json({ url: portal.url });
}
