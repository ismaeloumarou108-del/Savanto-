# Savanto

Plateforme d'apprentissage ludique : maths, physique-chimie, programmation, SVT, code de la route et langues, en parcours de mini-leçons gamifiées (XP, séries, combos, coffres, ligues, épreuves finales).

## Lancer en local

```bash
npm install
cp .env.example .env.local   # facultatif : sans clés, l'app tourne en mode démo
npm run dev                  # http://localhost:3000
```

Sans aucune clé, tout fonctionne en **mode démo** : progression gardée dans le navigateur, paiement simulé, indices du coach génériques.

## Activer les vrais services

### 1. Comptes et sauvegarde (Supabase)
1. Crée un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécute `supabase/schema.sql`.
3. Dans **Authentication > URL Configuration**, ajoute `https://ton-domaine/auth/callback` aux URL de redirection.
4. Renseigne `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Abonnements (Stripe)
1. Crée deux produits (Plus, Pro) avec chacun un prix mensuel et un prix annuel récurrents.
2. Renseigne `STRIPE_SECRET_KEY` et les quatre `STRIPE_PRICE_*`.
3. Ajoute un webhook vers `https://ton-domaine/api/stripe/webhook` avec les événements `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, puis renseigne `STRIPE_WEBHOOK_SECRET`.
4. Active le **portail client** dans Stripe (Settings > Billing > Customer portal) pour « Gérer mon abonnement ».

Un paiement annulé ramène sur `/tarifs?cancel=true`, un paiement réussi sur `/tarifs?success=true`.

### 3. Coach IA (Claude)
Renseigne `ANTHROPIC_API_KEY`. Le coach donne un indice sans jamais révéler la réponse. Quota : 3 indices par jour en gratuit, 9 en Plus, illimité en Pro.

## Ajouter du contenu
- Parcours : `src/lib/content.ts` et `src/lib/subjects/`.
- Nouvelle langue : ajoute un appel `language({...})` dans `src/lib/subjects/langues.ts`.
- Nom et slogan : `src/lib/brand.ts`.
