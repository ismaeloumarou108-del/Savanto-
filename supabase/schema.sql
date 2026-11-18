-- Schéma Savanto : à exécuter une fois dans Supabase > SQL Editor.

-- Progression de l'élève (XP, série, leçons terminées…), une ligne par compte.
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
create policy "progress: lecture perso" on public.progress for select using (auth.uid() = user_id);
create policy "progress: création perso" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress: mise à jour perso" on public.progress for update using (auth.uid() = user_id);

-- Abonnement : écrit uniquement par le serveur (webhook Stripe, clé service_role).
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'plus', 'pro')),
  status text,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "subscriptions: lecture perso" on public.subscriptions for select using (auth.uid() = user_id);

-- Compteur quotidien de questions au coach IA (quota de l'offre gratuite).
create table if not exists public.coach_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);
alter table public.coach_usage enable row level security;
create policy "coach_usage: lecture perso" on public.coach_usage for select using (auth.uid() = user_id);
