import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getAdminSupabase, getUser } from "@/lib/supabase/server";
import type { Step } from "@/lib/content";

const FREE_DAILY = 3;
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

const SYSTEM = `Tu es le coach de Savanto, une application d'apprentissage ludique pour collégiens, lycéens et adultes.
On te donne un exercice (avec sa solution, réservée à toi) et parfois la tentative de l'élève.
Donne UN indice en français, en 2 phrases maximum, chaleureux et encourageant.
Ne donne jamais la réponse finale, ni le résultat chiffré, ni le code complet : guide vers l'étape suivante du raisonnement.
Si l'élève a fait une tentative, pointe gentiment l'endroit précis où il se trompe.`;

function describe(step: Step): string {
  switch (step.kind) {
    case "choice": return `QCM : ${step.prompt}${step.sign ? ` (panneau : ${step.sign})` : ""}${step.scene ? ` (situation : ${step.scene})` : ""}${step.math ? ` [${step.math}]` : ""}${step.code ? `\n${step.code}` : ""}\nOptions : ${step.options.join(" | ")}\nBonne réponse : ${step.options[step.answer]}. Explication : ${step.why}`;
    case "number": return `Question numérique : ${step.prompt}${step.math ? ` [${step.math}]` : ""}\nRéponse attendue : ${step.answer}${step.unit ? ` ${step.unit}` : ""}. Explication : ${step.why}`;
    case "code": return `Exercice de code JavaScript : ${step.prompt}\nCode de départ :\n${step.starter}\nSortie attendue :\n${step.expectedOutput}\nSolution possible : ${step.why}`;
    case "order": return `Remettre dans l'ordre : ${step.prompt}\nOrdre correct : ${step.items.join(" → ")}`;
    case "match": return `Associer : ${step.prompt}\nPaires correctes : ${step.pairs.map(([a, b]) => `${a} = ${b}`).join(" ; ")}`;
    case "fill": return `Texte à trous : ${step.text}\nOptions : ${step.options.join(", ")}\nRéponses : ${step.answer.join(", ")}`;
    case "listen": return `Écoute (langue ${step.say.lang}) : l'élève entend « ${step.say.text} » et doit choisir parmi ${step.options.join(" | ")}. Bonne réponse : ${step.options[step.answer]}.`;
    default: return "Explication";
  }
}

export async function POST(req: Request) {
  if (!client) return NextResponse.json({ error: "not_configured" }, { status: 501 });
  const { step, attempt } = (await req.json().catch(() => ({}))) as { step?: Step; attempt?: string };
  if (!step || typeof step !== "object" || !("kind" in step)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  // Quota côté serveur pour les comptes gratuits (si les comptes sont activés).
  const { sb, user } = await getUser();
  const admin = getAdminSupabase();
  if (sb && user && admin) {
    const { data: sub } = await sb.from("subscriptions").select("plan, status").eq("user_id", user.id).maybeSingle();
    const isPro = sub?.plan === "pro" && ["active", "trialing"].includes(sub.status ?? "");
    if (!isPro) {
      const day = new Date().toISOString().slice(0, 10);
      const { data: usage } = await admin.from("coach_usage").select("count").eq("user_id", user.id).eq("day", day).maybeSingle();
      const limit = sub?.plan === "plus" ? FREE_DAILY * 3 : FREE_DAILY;
      if ((usage?.count ?? 0) >= limit) return NextResponse.json({ error: "quota" }, { status: 429 });
      await admin.from("coach_usage").upsert({ user_id: user.id, day, count: (usage?.count ?? 0) + 1 });
    }
  }

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `${describe(step)}${attempt ? `\n\nTentative de l'élève :\n${attempt.slice(0, 2000)}` : ""}\n\nDonne ton indice.`,
      }],
    });
    if (response.stop_reason === "refusal") return NextResponse.json({ error: "refusal" }, { status: 502 });
    const hint = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
    return NextResponse.json({ hint });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "busy" }, { status: 503 });
    if (error instanceof Anthropic.APIError) return NextResponse.json({ error: "api_error" }, { status: 502 });
    throw error;
  }
}
