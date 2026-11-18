// Contenus pédagogiques originaux, organisés en parcours.
// Parcours > chapitres > étapes de la carte (leçon, pratique, défi, boss, coffre).
// Chaque leçon = une suite d'écrans très courts, avec une fiche mémo à la fin.

import type { SceneId, SignId } from "@/components/RoadSign";
import { ROUTE } from "./subjects/route";
import { LANGUES } from "./subjects/langues";

export type Say = { text: string; lang: string }; // lu à voix haute (synthèse vocale du navigateur)
type Visual = { sign?: SignId; scene?: SceneId; say?: Say };

export type Step =
  | ({ kind: "explain"; title: string; body: string; math?: string; code?: string } & Visual)
  | ({ kind: "choice"; prompt: string; math?: string; code?: string; options: string[]; answer: number; why: string } & Visual)
  | { kind: "listen"; prompt: string; say: Say; options: string[]; answer: number; why: string }
  | { kind: "number"; prompt: string; math?: string; answer: number; tolerance: number; unit?: string; why: string }
  | { kind: "code"; prompt: string; starter: string; expectedOutput: string; why: string }
  | { kind: "order"; prompt: string; items: string[]; why: string } // items dans le bon ordre, mélangés à l'affichage
  | { kind: "match"; prompt: string; pairs: [string, string][]; why: string }
  | { kind: "fill"; prompt: string; text: string; options: string[]; answer: string[]; why: string }; // "___" = trou

export type NodeType = "lecon" | "pratique" | "defi" | "boss" | "coffre";

export type MapNode = {
  id: string;
  type: NodeType;
  title: string;
  minutes?: number;
  premium?: boolean;
  difficulty?: "Facile" | "Moyen" | "Difficile";
  steps?: Step[];
  memo?: string[];
  timeLimit?: number; // secondes, pour les boss
  maxMistakes?: number; // erreurs tolérées pour réussir un boss (1 par défaut)
};

export type Chapter = { id: string; title: string; nodes: MapNode[] };
export type Journey = { id: string; title: string; level: string; description: string; chapters: Chapter[] };
export type Subject = { id: string; title: string; icon: string; tint: string; blurb: string; journeys: Journey[] };

export const chest = (id: string): MapNode => ({ id, type: "coffre", title: "Coffre" });

export const SUBJECTS: Subject[] = [
  {
    id: "maths",
    title: "Mathématiques",
    icon: "∑",
    tint: "#ff8a3d",
    blurb: "Du calcul littéral aux fonctions, sans prise de tête.",
    journeys: [
      {
        id: "algebre",
        title: "Algèbre fondamentale",
        level: "Collège · Seconde",
        description: "Équations, développement et fonctions affines : les bases qui débloquent tout le reste.",
        chapters: [
          {
            id: "alg-c1",
            title: "Les équations",
            nodes: [
              {
                id: "maths-eq1",
                type: "lecon",
                title: "La balance en équilibre",
                minutes: 4,
                difficulty: "Facile",
                steps: [
                  {
                    kind: "explain",
                    title: "Une équation est une balance",
                    body: "Tout ce que tu fais d'un côté du signe =, tu le fais de l'autre. Ton objectif : laisser x tout seul.",
                    math: "2x + 3 = 11 \\;\\Rightarrow\\; 2x = 8 \\;\\Rightarrow\\; x = 4",
                  },
                  {
                    kind: "choice",
                    prompt: "Première étape pour résoudre cette équation ?",
                    math: "3x - 5 = 10",
                    options: ["Diviser par 3", "Ajouter 5 des deux côtés", "Retirer 10 des deux côtés"],
                    answer: 1,
                    why: "On élimine d'abord la constante : 3x − 5 + 5 = 10 + 5, donc 3x = 15.",
                  },
                  {
                    kind: "number",
                    prompt: "Combien vaut x ?",
                    math: "3x - 5 = 10",
                    answer: 5,
                    tolerance: 0,
                    why: "3x = 15, donc x = 15 ÷ 3 = 5.",
                  },
                ],
                memo: ["Même opération des deux côtés du =", "D'abord les constantes, ensuite le coefficient de x", "Vérifie en remplaçant x dans l'équation"],
              },
              {
                id: "maths-eq2",
                type: "lecon",
                title: "Remettre les étapes dans l'ordre",
                minutes: 3,
                difficulty: "Facile",
                steps: [
                  {
                    kind: "order",
                    prompt: "Range les étapes pour résoudre 4x + 2 = 18",
                    items: ["4x + 2 = 18", "4x = 16", "x = 16 ÷ 4", "x = 4"],
                    why: "On retire 2, puis on divise par 4.",
                  },
                  {
                    kind: "fill",
                    prompt: "Complète le raisonnement",
                    text: "Pour isoler x dans x + 7 = 12, je ___ 7 des deux côtés, donc x = ___.",
                    options: ["retire", "ajoute", "5", "19"],
                    answer: ["retire", "5"],
                    why: "12 − 7 = 5.",
                  },
                ],
                memo: ["+ devient − quand on passe de l'autre côté", "× devient ÷"],
              },
              {
                id: "maths-eq-pratique",
                type: "pratique",
                title: "Entraînement express",
                minutes: 3,
                difficulty: "Moyen",
                steps: [
                  { kind: "number", prompt: "Combien vaut x ?", math: "\\frac{x}{4} + 2 = 7", answer: 20, tolerance: 0, why: "x/4 = 5, donc x = 20." },
                  { kind: "number", prompt: "Combien vaut x ?", math: "5x - 3 = 2x + 9", answer: 4, tolerance: 0, why: "3x = 12, donc x = 4." },
                  {
                    kind: "match",
                    prompt: "Relie chaque équation à sa solution",
                    pairs: [["x + 3 = 5", "x = 2"], ["2x = 10", "x = 5"], ["x − 4 = 3", "x = 7"]],
                    why: "Vérifie en remplaçant x par la valeur trouvée.",
                  },
                ],
              },
              chest("alg-c1-coffre"),
            ],
          },
          {
            id: "alg-c2",
            title: "Développer et réduire",
            nodes: [
              {
                id: "maths-dev",
                type: "lecon",
                title: "La distributivité",
                minutes: 4,
                difficulty: "Facile",
                steps: [
                  { kind: "explain", title: "Distribuer à chacun", body: "Le facteur devant la parenthèse multiplie chaque terme à l'intérieur, sans en oublier un seul.", math: "k(a + b) = ka + kb" },
                  { kind: "choice", prompt: "Forme développée ?", math: "4(x + 3)", options: ["4x + 3", "4x + 12", "x + 12"], answer: 1, why: "4 × x = 4x et 4 × 3 = 12." },
                  { kind: "choice", prompt: "Attention aux signes !", math: "-2(x - 5)", options: ["-2x - 10", "-2x + 10", "2x - 10"], answer: 1, why: "−2 × (−5) = +10." },
                ],
                memo: ["k(a + b) = ka + kb", "Moins par moins donne plus"],
              },
              {
                id: "maths-dev-defi",
                type: "defi",
                title: "Défi : le double développement",
                minutes: 4,
                difficulty: "Difficile",
                premium: true,
                steps: [
                  { kind: "explain", title: "Chaque terme avec chaque terme", body: "Pour (a + b)(c + d), on multiplie a par c et d, puis b par c et d.", math: "(a+b)(c+d) = ac + ad + bc + bd" },
                  { kind: "choice", prompt: "Développe", math: "(x + 2)(x + 3)", options: ["x² + 5x + 6", "x² + 6", "2x + 5"], answer: 0, why: "x² + 3x + 2x + 6 = x² + 5x + 6." },
                ],
              },
              chest("alg-c2-coffre"),
            ],
          },
          {
            id: "alg-final",
            title: "Épreuve finale",
            nodes: [
              {
                id: "maths-boss",
                type: "boss",
                title: "Le Gardien de l'algèbre",
                minutes: 3,
                difficulty: "Difficile",
                timeLimit: 90,
                steps: [
                  { kind: "number", prompt: "x = ?", math: "7x + 1 = 50", answer: 7, tolerance: 0, why: "7x = 49." },
                  { kind: "choice", prompt: "Développe", math: "3(2x - 1)", options: ["6x - 3", "6x - 1", "5x - 3"], answer: 0, why: "3 × 2x = 6x et 3 × (−1) = −3." },
                  { kind: "number", prompt: "x = ?", math: "\\frac{2x}{3} = 8", answer: 12, tolerance: 0, why: "2x = 24." },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "physique-chimie",
    title: "Physique-Chimie",
    icon: "⚛",
    tint: "#ff5a36",
    blurb: "Comprendre le monde avec des grandeurs et des unités.",
    journeys: [
      {
        id: "mouvement-matiere",
        title: "Mouvement et matière",
        level: "Seconde",
        description: "Vitesses, conversions et quantité de matière, avec des situations de tous les jours.",
        chapters: [
          {
            id: "pc-c1",
            title: "La vitesse",
            nodes: [
              {
                id: "pc-vitesse",
                type: "lecon",
                title: "Distance ÷ durée",
                minutes: 4,
                difficulty: "Facile",
                steps: [
                  { kind: "explain", title: "La vitesse moyenne", body: "Elle indique la distance parcourue par unité de temps. En unités du Système international : mètres et secondes.", math: "v = \\frac{d}{t}" },
                  { kind: "number", prompt: "Un cycliste parcourt 30 km en 1,5 h. Sa vitesse moyenne ?", answer: 20, tolerance: 0.01, unit: "km/h", why: "30 ÷ 1,5 = 20 km/h." },
                  {
                    kind: "match",
                    prompt: "Relie chaque grandeur à son unité SI",
                    pairs: [["Distance", "m"], ["Durée", "s"], ["Vitesse", "m/s"]],
                    why: "Le Système international utilise le mètre et la seconde.",
                  },
                ],
                memo: ["v = d / t", "Unités SI : m, s, m/s"],
              },
              {
                id: "pc-conversion",
                type: "pratique",
                title: "Le piège des km/h",
                minutes: 3,
                difficulty: "Moyen",
                steps: [
                  { kind: "choice", prompt: "Comment passer des km/h aux m/s ?", options: ["Multiplier par 3,6", "Diviser par 3,6", "Diviser par 60"], answer: 1, why: "1 km/h = 1000 m / 3600 s = 1/3,6 m/s." },
                  { kind: "number", prompt: "Convertis 72 km/h", answer: 20, tolerance: 0.01, unit: "m/s", why: "72 ÷ 3,6 = 20 m/s." },
                ],
                memo: ["km/h → m/s : ÷ 3,6", "m/s → km/h : × 3,6"],
              },
              chest("pc-c1-coffre"),
            ],
          },
          {
            id: "pc-c2",
            title: "La mole",
            nodes: [
              {
                id: "pc-mole",
                type: "lecon",
                title: "Compter par paquets",
                minutes: 5,
                difficulty: "Moyen",
                steps: [
                  { kind: "explain", title: "Une mole, c'est un paquet géant", body: "Une mole contient environ 6,02 × 10²³ entités. La masse molaire M relie la masse d'un échantillon à sa quantité de matière.", math: "n = \\frac{m}{M}" },
                  { kind: "number", prompt: "Combien de moles dans 36 g d'eau ? (M = 18 g/mol)", answer: 2, tolerance: 0.001, unit: "mol", why: "36 ÷ 18 = 2 mol." },
                  { kind: "fill", prompt: "Complète", text: "Dans n = m / M, m est la ___ et M la ___ molaire.", options: ["masse", "mole", "vitesse"], answer: ["masse", "masse"], why: "m : masse de l'échantillon (g), M : masse molaire (g/mol)." },
                ],
                memo: ["n = m / M", "N_A ≈ 6,02 × 10²³ mol⁻¹"],
              },
              { id: "pc-boss", type: "boss", title: "Le Gardien de la matière", minutes: 3, difficulty: "Difficile", timeLimit: 90, premium: true, steps: [
                { kind: "number", prompt: "Convertis 54 km/h", answer: 15, tolerance: 0.01, unit: "m/s", why: "54 ÷ 3,6 = 15." },
                { kind: "number", prompt: "n pour 88 g de CO₂ (M = 44 g/mol)", answer: 2, tolerance: 0.001, unit: "mol", why: "88 ÷ 44 = 2." },
              ] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "programmation",
    title: "Programmation",
    icon: "</>",
    tint: "#ffb04a",
    blurb: "Écris du vrai code dès la première minute, dans ton navigateur.",
    journeys: [
      {
        id: "js-fondamentaux",
        title: "JavaScript : les fondamentaux",
        level: "Débutant",
        description: "Afficher, calculer, décider et répéter. À la fin, tu codes ta propre mini-calculatrice.",
        chapters: [
          {
            id: "js-c1",
            title: "Premiers pas",
            nodes: [
              {
                id: "js-print",
                type: "lecon",
                title: "Ton premier programme",
                minutes: 3,
                difficulty: "Facile",
                steps: [
                  { kind: "explain", title: "console.log affiche du texte", body: "Pour afficher quelque chose, on écrit console.log(...). Le texte se met entre guillemets.", code: 'console.log("Salut !");' },
                  { kind: "code", prompt: "Affiche exactement : Bonjour le monde", starter: "// Écris ton code ici\n", expectedOutput: "Bonjour le monde", why: 'console.log("Bonjour le monde");' },
                ],
                memo: ['console.log("texte") affiche une ligne', "Les chaînes de caractères vont entre guillemets"],
              },
              {
                id: "js-vars",
                type: "lecon",
                title: "Les variables",
                minutes: 4,
                difficulty: "Facile",
                steps: [
                  { kind: "explain", title: "Une boîte avec une étiquette", body: "let crée une variable dont la valeur peut changer, const une valeur fixe.", code: "let score = 10;\nscore = score + 5;\nconsole.log(score); // 15" },
                  { kind: "choice", prompt: "Que vaut total ?", code: "let prix = 4;\nlet total = prix * 3;", options: ["7", "12", "43"], answer: 1, why: "4 × 3 = 12." },
                  { kind: "fill", prompt: "Complète le code", text: "___ age = 15; console.___(age);", options: ["let", "log", "print", "var"], answer: ["let", "log"], why: "let age = 15; console.log(age);" },
                  { kind: "code", prompt: "Crée age = 15, puis affiche age + 1", starter: "let age = \n", expectedOutput: "16", why: "let age = 15;\nconsole.log(age + 1);" },
                ],
                memo: ["let : modifiable", "const : fixe", "= range une valeur dans la variable"],
              },
              { id: "js-c1-pratique", type: "pratique", title: "Pratique : variables", minutes: 3, difficulty: "Moyen", steps: [
                { kind: "match", prompt: "Relie chaque valeur à son type", pairs: [['"bonjour"', "texte"], ["42", "nombre"], ["true", "booléen"]], why: "Texte entre guillemets, nombre sans, true/false pour les booléens." },
                { kind: "code", prompt: "Échange : a vaut 2, b vaut 3. Affiche a * b", starter: "const a = 2;\nconst b = 3;\n", expectedOutput: "6", why: "console.log(a * b);" },
              ] },
              chest("js-c1-coffre"),
            ],
          },
          {
            id: "js-c2",
            title: "Décider et répéter",
            nodes: [
              {
                id: "js-if",
                type: "lecon",
                title: "Si… sinon",
                minutes: 4,
                difficulty: "Moyen",
                steps: [
                  { kind: "explain", title: "Prendre une décision", body: "if exécute un bloc seulement si la condition est vraie. else gère l'autre cas.", code: 'if (note >= 10) {\n  console.log("Admis");\n} else {\n  console.log("Rattrapage");\n}' },
                  { kind: "order", prompt: "Remets ce programme dans l'ordre", items: ["let t = 30;", "if (t > 25) {", '  console.log("Chaud");', "}"], why: "On déclare la variable, puis on teste." },
                  { kind: "code", prompt: "n vaut 7. Affiche pair s'il est pair, sinon impair", starter: "const n = 7;\n", expectedOutput: "impair", why: 'if (n % 2 === 0) console.log("pair");\nelse console.log("impair");' },
                ],
                memo: ["if (condition) { … } else { … }", "=== compare, = affecte", "% donne le reste"],
              },
              {
                id: "js-loops",
                type: "lecon",
                title: "Les boucles",
                minutes: 5,
                difficulty: "Moyen",
                premium: true,
                steps: [
                  { kind: "explain", title: "Répéter sans recopier", body: "for répète un bloc tant que la condition est vraie.", code: "for (let i = 1; i <= 3; i++) {\n  console.log(i);\n}" },
                  { kind: "code", prompt: "Affiche les nombres de 1 à 5, un par ligne", starter: "for (let i = 1; i <= 5; i++) {\n  \n}\n", expectedOutput: "1\n2\n3\n4\n5", why: "console.log(i); dans la boucle." },
                ],
                memo: ["for (départ; condition; pas)", "i++ ajoute 1 à i"],
              },
              chest("js-c2-coffre"),
            ],
          },
          {
            id: "js-final",
            title: "Épreuve finale",
            nodes: [
              { id: "js-boss", type: "boss", title: "La mini-calculatrice", minutes: 4, difficulty: "Difficile", timeLimit: 180, steps: [
                { kind: "code", prompt: "Écris une fonction somme(a, b) puis affiche somme(8, 5)", starter: "function somme(a, b) {\n  \n}\n\nconsole.log(somme(8, 5));\n", expectedOutput: "13", why: "return a + b;" },
                { kind: "choice", prompt: "Que fait return ?", options: ["Affiche une valeur", "Renvoie une valeur à l'appelant", "Arrête le programme"], answer: 1, why: "return renvoie le résultat de la fonction." },
              ] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "svt",
    title: "SVT",
    icon: "🧬",
    tint: "#e8743b",
    blurb: "Le vivant, la Terre et l'environnement.",
    journeys: [
      {
        id: "cellule",
        title: "Le monde de la cellule",
        level: "Collège",
        description: "Explore l'unité de base du vivant, de la membrane à l'ADN.",
        chapters: [
          {
            id: "svt-c1",
            title: "La cellule",
            nodes: [
              {
                id: "svt-cellule",
                type: "lecon",
                title: "Visite guidée",
                minutes: 3,
                difficulty: "Facile",
                steps: [
                  { kind: "explain", title: "L'unité du vivant", body: "Tous les êtres vivants sont faits de cellules : une membrane, un cytoplasme et, chez les eucaryotes, un noyau qui contient l'ADN." },
                  { kind: "match", prompt: "Relie chaque élément à son rôle", pairs: [["Membrane", "Délimite la cellule"], ["Noyau", "Contient l'ADN"], ["Mitochondrie", "Produit l'énergie"]], why: "Chaque organite a une fonction précise." },
                  { kind: "choice", prompt: "Qu'a une cellule végétale qu'une cellule animale n'a pas ?", options: ["Un noyau", "Une paroi et des chloroplastes", "Une membrane"], answer: 1, why: "La paroi rigidifie, les chloroplastes font la photosynthèse." },
                ],
                memo: ["Membrane, cytoplasme, noyau", "Végétale : + paroi + chloroplastes"],
              },
              chest("svt-c1-coffre"),
            ],
          },
        ],
      },
    ],
  },
];

SUBJECTS.push(ROUTE, LANGUES);

export const ALL_JOURNEYS = SUBJECTS.flatMap((s) => s.journeys.map((j) => ({ subject: s, journey: j })));

export function findJourney(id: string) {
  return ALL_JOURNEYS.find((x) => x.journey.id === id) ?? null;
}

export function journeyNodes(j: Journey) {
  return j.chapters.flatMap((c) => c.nodes);
}

export function findNode(id: string) {
  for (const { subject, journey } of ALL_JOURNEYS)
    for (const chapter of journey.chapters)
      for (const node of chapter.nodes) if (node.id === id) return { subject, journey, chapter, node };
  return null;
}

// Une étape est accessible si toutes celles d'avant (dans le parcours) sont terminées.
export function isUnlocked(j: Journey, nodeId: string, done: string[]) {
  const nodes = journeyNodes(j);
  const idx = nodes.findIndex((n) => n.id === nodeId);
  return nodes.slice(0, idx).every((n) => done.includes(n.id));
}

export function nextNode(j: Journey, done: string[]) {
  return journeyNodes(j).find((n) => !done.includes(n.id)) ?? null;
}

export function journeyProgress(j: Journey, done: string[]) {
  const nodes = journeyNodes(j);
  const d = nodes.filter((n) => done.includes(n.id)).length;
  return { done: d, total: nodes.length, pct: Math.round((d / nodes.length) * 100) };
}

export const TYPE_LABEL: Record<NodeType, string> = { lecon: "Leçon", pratique: "Pratique", defi: "Défi", boss: "Épreuve finale", coffre: "Coffre" };
export const TYPE_ICON: Record<NodeType, string> = { lecon: "★", pratique: "✎", defi: "⚡", boss: "♛", coffre: "🎁" };
