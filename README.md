# Savanto : prototype

Plateforme d'apprentissage multi-matières (maths, physique-chimie, programmation, SVT) en leçons courtes et gamifiées.

## Lancer en local
```bash
npm install
npm run dev   # http://localhost:3000
```

## Ce que contient le prototype
- Accueil, catalogue des matières, parcours de leçons par cours
- Lecteur de leçon : explications, QCM, réponses numériques avec unités, formules (KaTeX), exercices de code JavaScript exécutés dans le navigateur
- Coach IA (simulé pour l'instant), XP, niveaux, série de jours avec gels, énergie quotidienne en gratuit, badges, ligues hebdomadaires, certificats
- Tarifs Gratuit / Plus / Pro, paiement simulé, bandeau « paiement annulé » sur `/tarifs?cancel=true` et confirmation sur `/tarifs?success=true`

## Changer le nom
Tout le branding est dans `src/lib/brand.ts`.

## Prochaines étapes
- Comptes et progression en base : Supabase
- Paiement réel : Stripe Checkout (success_url `/tarifs?success=true`, cancel_url `/tarifs?cancel=true`)
- Coach IA réel via une route serveur
- Python dans le navigateur (Pyodide), éditeur de contenus, plus de cours
