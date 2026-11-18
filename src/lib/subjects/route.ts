import type { MapNode, Subject } from "@/lib/content";

// Code de la route (règles françaises). Contenus originaux.
const chest = (id: string): MapNode => ({ id, type: "coffre", title: "Coffre" });

export const ROUTE: Subject = {
  id: "code-route",
  title: "Code de la route",
  icon: "🚦",
  tint: "#ff6a2b",
  blurb: "Panneaux, priorités, vitesses : décroche ton code en jouant.",
  journeys: [
    {
      id: "code-route",
      title: "Décroche ton code",
      level: "Permis B",
      description: "Les panneaux, les priorités et les bons réflexes, avec des situations dessinées et un examen blanc chronométré.",
      chapters: [
        {
          id: "route-c1",
          title: "Lire les panneaux",
          nodes: [
            {
              id: "route-formes",
              type: "lecon",
              title: "Formes et couleurs",
              minutes: 4,
              difficulty: "Facile",
              steps: [
                {
                  kind: "explain",
                  title: "La forme te parle avant le dessin",
                  body: "Triangle bordé de rouge : danger. Rond bordé de rouge : interdiction. Rond bleu : obligation. Carré ou rectangle bleu : indication. Même de loin, la forme suffit pour savoir à quoi t'attendre.",
                  sign: "virage-droite",
                },
                {
                  kind: "match",
                  prompt: "Relie chaque forme à son message",
                  pairs: [["Triangle rouge", "Danger"], ["Rond rouge", "Interdiction"], ["Rond bleu", "Obligation"], ["Carré bleu", "Indication"]],
                  why: "Danger, interdiction, obligation, indication : c'est la base de toute la signalisation.",
                },
                {
                  kind: "choice",
                  prompt: "Que signifie ce panneau ?",
                  sign: "obligation-droite",
                  options: ["Tourner à droite est interdit", "Tourner à droite est obligatoire", "Virage à droite dangereux"],
                  answer: 1,
                  why: "Rond bleu = obligation : tu dois tourner à droite.",
                },
                {
                  kind: "choice",
                  prompt: "Et celui-ci ?",
                  sign: "sens-interdit",
                  options: ["Sens interdit à tous les véhicules", "Route barrée pour travaux", "Fin de limitation"],
                  answer: 0,
                  why: "Rond rouge plein avec une barre blanche : sens interdit.",
                },
              ],
              memo: ["Triangle rouge = danger", "Rond rouge = interdiction", "Rond bleu = obligation", "Carré bleu = indication"],
            },
            {
              id: "route-danger",
              type: "lecon",
              title: "Les panneaux de danger",
              minutes: 4,
              difficulty: "Facile",
              steps: [
                {
                  kind: "explain",
                  title: "Danger : ralentis et anticipe",
                  body: "Hors agglomération, un panneau de danger est placé environ 150 m avant le danger (50 m en agglomération). Il t'invite à ralentir et à redoubler d'attention.",
                  sign: "enfants",
                },
                { kind: "choice", prompt: "Ce panneau annonce…", sign: "pietons", options: ["Un passage pour piétons", "Une zone piétonne", "Des enfants qui sortent d'école"], answer: 0, why: "Un piéton seul sur un triangle : passage pour piétons." },
                { kind: "choice", prompt: "Ce panneau annonce…", sign: "chaussee-glissante", options: ["Un virage dangereux", "Une chaussée glissante", "Une route en travaux"], answer: 1, why: "Les traces sinueuses sous la voiture : risque de dérapage." },
                { kind: "number", prompt: "À quelle distance du danger est placé ce panneau hors agglomération ?", answer: 150, tolerance: 0, unit: "m", why: "Environ 150 m hors agglomération, 50 m en agglomération." },
              ],
              memo: ["Hors agglo : panneau à ~150 m du danger", "En agglo : ~50 m", "Danger = ralentir et anticiper"],
            },
            {
              id: "route-panneaux-pratique",
              type: "pratique",
              title: "Quiz panneaux express",
              minutes: 3,
              difficulty: "Moyen",
              steps: [
                { kind: "choice", prompt: "Que dois-tu faire ?", sign: "stop", options: ["Ralentir et passer si personne", "Marquer l'arrêt complet puis céder le passage", "Klaxonner avant de passer"], answer: 1, why: "Au STOP, l'arrêt est obligatoire, même si la voie est libre." },
                { kind: "choice", prompt: "Ce panneau signifie…", sign: "interdit-depasser", options: ["Interdiction de dépasser les véhicules à moteur (sauf deux-roues)", "Circulation alternée", "Voitures interdites"], answer: 0, why: "Voiture rouge à gauche, noire à droite : dépassement interdit." },
                { kind: "choice", prompt: "Ce panneau signifie…", sign: "stationnement-interdit", options: ["Arrêt et stationnement interdits", "Stationnement interdit", "Parking payant"], answer: 1, why: "Une seule barre : stationnement interdit. Deux barres en croix : arrêt et stationnement interdits." },
              ],
            },
            chest("route-c1-coffre"),
          ],
        },
        {
          id: "route-c2",
          title: "Les priorités",
          nodes: [
            {
              id: "route-priorite-droite",
              type: "lecon",
              title: "La priorité à droite",
              minutes: 4,
              difficulty: "Moyen",
              steps: [
                {
                  kind: "explain",
                  title: "Sans panneau, la droite passe",
                  body: "À une intersection sans panneau ni feu, tu cèdes le passage aux véhicules qui arrivent par ta droite. C'est la règle par défaut en France.",
                  scene: "carrefour-droite",
                },
                {
                  kind: "choice",
                  prompt: "Tu es la voiture orange. Aucun panneau. Qui passe en premier ?",
                  scene: "carrefour-droite",
                  options: ["Moi, je vais tout droit", "La voiture bleue, elle vient de ma droite", "Le premier arrivé"],
                  answer: 1,
                  why: "La voiture bleue arrive par ta droite : elle est prioritaire.",
                },
                { kind: "choice", prompt: "Sur une route avec ce panneau, à l'intersection…", sign: "priorite", options: ["Je suis prioritaire", "Je cède à droite", "Je m'arrête"], answer: 0, why: "Le losange jaune indique une route prioritaire." },
                { kind: "choice", prompt: "Et après ce panneau ?", sign: "fin-priorite", options: ["Je reste prioritaire", "La priorité à droite s'applique de nouveau", "Je dois m'arrêter"], answer: 1, why: "Losange barré : fin de route prioritaire." },
              ],
              memo: ["Pas de panneau = priorité à droite", "Losange jaune = route prioritaire", "Losange barré = fin de priorité"],
            },
            {
              id: "route-giratoire",
              type: "lecon",
              title: "Le giratoire",
              minutes: 3,
              difficulty: "Moyen",
              steps: [
                { kind: "explain", title: "Ceux qui tournent sont prioritaires", body: "Dans un giratoire (signalé par ce panneau et un « cédez le passage »), les véhicules déjà engagés sur l'anneau sont prioritaires. Tu attends un espace pour entrer.", sign: "giratoire" },
                {
                  kind: "choice",
                  prompt: "Tu veux entrer dans le giratoire. La voiture bleue est déjà sur l'anneau.",
                  scene: "giratoire",
                  options: ["J'entre, je viens de sa droite", "Je la laisse passer", "Je klaxonne pour la prévenir"],
                  answer: 1,
                  why: "Dans un giratoire, la priorité est à ceux qui circulent sur l'anneau.",
                },
                { kind: "choice", prompt: "Ce panneau à l'entrée d'un giratoire impose de…", sign: "cedez", options: ["Céder le passage", "S'arrêter obligatoirement", "Rien de particulier"], answer: 0, why: "Triangle pointe en bas : cédez le passage, sans arrêt obligatoire si la voie est libre." },
              ],
              memo: ["Giratoire : priorité à l'anneau", "Cédez le passage : ralentir, arrêt seulement si nécessaire"],
            },
            chest("route-c2-coffre"),
          ],
        },
        {
          id: "route-c3",
          title: "Vitesse et sécurité",
          nodes: [
            {
              id: "route-vitesses",
              type: "lecon",
              title: "Les bonnes vitesses",
              minutes: 4,
              difficulty: "Moyen",
              steps: [
                { kind: "explain", title: "Chaque route a sa limite", body: "Par temps sec : 50 km/h en agglomération, 80 km/h sur les routes à double sens sans séparateur (certains départements autorisent 90), 110 km/h sur voie rapide, 130 km/h sur autoroute. Sous la pluie, on retire 10 km/h (20 km/h sur autoroute).", sign: "limite-50" },
                {
                  kind: "match",
                  prompt: "Relie chaque route à sa vitesse maximale par temps sec",
                  pairs: [["Agglomération", "50 km/h"], ["Route bidirectionnelle", "80 km/h"], ["Autoroute", "130 km/h"]],
                  why: "50, 80, 130 : les trois chiffres à connaître par cœur.",
                },
                { kind: "number", prompt: "Vitesse maximale sur autoroute par temps de pluie ?", answer: 110, tolerance: 0, unit: "km/h", why: "130 − 20 = 110 km/h." },
                { kind: "choice", prompt: "Tu entres dans cette zone. Tu roules au maximum à…", sign: "zone-30", options: ["30 km/h", "50 km/h", "30 km/h seulement s'il y a des enfants"], answer: 0, why: "Zone 30 : 30 km/h dans toute la zone." },
              ],
              memo: ["Agglo 50 · Route 80 · Voie rapide 110 · Autoroute 130", "Pluie : −10 km/h (−20 sur autoroute)"],
            },
            {
              id: "route-securite",
              type: "defi",
              title: "Défi : distances et alcool",
              minutes: 4,
              difficulty: "Difficile",
              premium: true,
              steps: [
                { kind: "explain", title: "Garde 2 secondes d'avance", body: "La distance de sécurité correspond à au moins 2 secondes de trajet avec le véhicule devant. Repère un point fixe : il doit s'écouler 2 secondes entre son passage et le tien." },
                { kind: "choice", prompt: "Taux d'alcool maximal pour un conducteur en permis probatoire ?", options: ["0,2 g/L de sang", "0,5 g/L de sang", "0,8 g/L de sang"], answer: 0, why: "0,2 g/L en probatoire (en pratique : zéro verre), 0,5 g/L pour les autres conducteurs." },
                { kind: "choice", prompt: "Dépasser dans cette situation est…", scene: "depassement", options: ["Possible, la voie de gauche est libre", "Dangereux : un véhicule arrive en face", "Obligatoire pour fluidifier"], answer: 1, why: "La voiture bleue arrive en face : on ne dépasse jamais sans visibilité ni espace suffisant." },
              ],
              memo: ["Distance de sécurité : 2 secondes minimum", "Alcool : 0,5 g/L, 0,2 g/L en probatoire"],
            },
            chest("route-c3-coffre"),
          ],
        },
        {
          id: "route-final",
          title: "Examen blanc",
          nodes: [
            {
              id: "route-examen",
              type: "boss",
              title: "Examen blanc",
              minutes: 5,
              difficulty: "Difficile",
              timeLimit: 300,
              maxMistakes: 2,
              steps: [
                { kind: "choice", prompt: "Ce panneau signifie…", sign: "cedez", options: ["Stop", "Cédez le passage", "Danger"], answer: 1, why: "Triangle pointe en bas : cédez le passage." },
                { kind: "choice", prompt: "Ce panneau signifie…", sign: "giratoire", options: ["Carrefour à sens giratoire", "Demi-tour autorisé", "Parking"], answer: 0, why: "Trois flèches en cercle : giratoire." },
                { kind: "number", prompt: "Vitesse maximale en agglomération ?", answer: 50, tolerance: 0, unit: "km/h", why: "50 km/h, sauf indication contraire." },
                { kind: "choice", prompt: "Sans panneau, la voiture bleue arrive de ta droite.", scene: "carrefour-droite", options: ["Je passe", "Je lui cède le passage"], answer: 1, why: "Priorité à droite." },
                { kind: "choice", prompt: "Ce panneau signifie…", sign: "limite-130", options: ["Vitesse conseillée", "Vitesse maximale autorisée", "Vitesse minimale"], answer: 1, why: "Rond rouge : interdiction de dépasser 130 km/h." },
                { kind: "choice", prompt: "Au STOP, la voie est totalement libre. Je…", sign: "stop", options: ["Passe sans m'arrêter", "Marque l'arrêt complet"], answer: 1, why: "L'arrêt est toujours obligatoire au STOP." },
                { kind: "choice", prompt: "Ce panneau annonce…", sign: "virage-droite", options: ["Un virage à droite dangereux", "Une obligation de tourner à droite", "Une route sinueuse"], answer: 0, why: "Triangle rouge : danger, virage à droite." },
                { kind: "number", prompt: "Distance de sécurité minimale, en secondes ?", answer: 2, tolerance: 0, unit: "s", why: "Au moins 2 secondes." },
                { kind: "choice", prompt: "Dans un giratoire, qui est prioritaire ?", scene: "giratoire", options: ["Les véhicules sur l'anneau", "Les véhicules qui entrent"], answer: 0, why: "Priorité à l'anneau." },
                { kind: "choice", prompt: "Ce panneau signifie…", sign: "stationnement-interdit", options: ["Stationnement interdit", "Arrêt interdit", "Route fermée"], answer: 0, why: "Une seule barre : stationnement interdit." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
