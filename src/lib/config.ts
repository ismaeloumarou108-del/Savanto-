// Quels services réels sont configurés ? Sans clé, l'app reste en mode démo.
export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const serverConfig = {
  stripe: () => Boolean(process.env.STRIPE_SECRET_KEY),
  coach: () => Boolean(process.env.ANTHROPIC_API_KEY),
  admin: () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL),
};

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
