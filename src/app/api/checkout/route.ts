import { NextResponse } from "next/server";
import { getStripe, priceFor, type Period } from "@/lib/stripe";
import { getAdminSupabase, getUser } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/config";

// Crée une session Stripe Checkout pour l'abonnement choisi.
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const { user } = await getUser();
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { offre?: string; periode?: string };
  const plan = body.offre === "pro" ? "pro" : "plus";
  const period: Period = body.periode === "mois" ? "mois" : "an";
  const price = priceFor(plan, period);
  if (!price) return NextResponse.json({ error: "price_missing" }, { status: 500 });

  // Réutilise le client Stripe existant si on le connaît déjà.
  const admin = getAdminSupabase();
  const { data: sub } = admin
    ? await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle()
    : { data: null };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    ...(sub?.stripe_customer_id ? { customer: sub.stripe_customer_id } : { customer_email: user.email }),
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: true,
    locale: "fr",
    success_url: `${siteUrl()}/tarifs?success=true`,
    cancel_url: `${siteUrl()}/tarifs?cancel=true`,
  });
  return NextResponse.json({ url: session.url });
}
