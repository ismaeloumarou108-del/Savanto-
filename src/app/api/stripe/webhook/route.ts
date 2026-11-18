import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, planForPrice } from "@/lib/stripe";
import { getAdminSupabase } from "@/lib/supabase/server";

// Webhook Stripe : seule source de vérité pour l'offre de chaque compte.
export async function POST(req: Request) {
  const stripe = getStripe();
  const admin = getAdminSupabase();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !admin || !secret) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  async function save(sub: Stripe.Subscription, userId: string | null | undefined) {
    if (!userId) return;
    const item = sub.items.data[0];
    const active = ["active", "trialing"].includes(sub.status);
    const periodEnd = (item as unknown as { current_period_end?: number })?.current_period_end
      ?? (sub as unknown as { current_period_end?: number }).current_period_end;
    await admin!.from("subscriptions").upsert({
      user_id: userId,
      plan: active ? planForPrice(item?.price.id) : "free",
      status: sub.status,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripe_subscription_id: sub.id,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      if (s.mode === "subscription" && s.subscription) {
        const sub = await stripe.subscriptions.retrieve(typeof s.subscription === "string" ? s.subscription : s.subscription.id);
        await save(sub, s.client_reference_id ?? sub.metadata.user_id);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await save(sub, sub.metadata.user_id);
      break;
    }
  }
  return NextResponse.json({ received: true });
}
