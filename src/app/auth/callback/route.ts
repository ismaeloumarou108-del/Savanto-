import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

// Lien de confirmation d'e-mail : échange le code contre une session.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/apprendre";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/apprendre";
  const sb = await getServerSupabase();
  if (sb && code) await sb.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
