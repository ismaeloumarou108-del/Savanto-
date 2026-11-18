// Contenus pédagogiques originaux. Chaque leçon = une suite d'étapes courtes.

export type Step =
  | { kind: "explain"; title: string; body: string; math?: string }
  | { kind: "choice"; prompt: string; math?: string; options: string[]; answer: number; why: string }
  | { kind: "number"; prompt: string; math?: string; answer: number; tolerance: number; unit?: string; why: string }
  | { kind: "code"; prompt: string; starter: string; expectedOutput: string; why: string };

export type Lesson = { id: string; title: string; minutes: number; premium?: boolean; steps: Step[] };
export type Course = { id: string; title: string; level: string; lessons: Lesson[] };
export type Subject = {
  id: string;
  title: string;
  emoji: string;
  color: string; // classe de fond tailwind
  blurb: string;
  courses: Course[];
};

export const SUBJECTS: Subject[] = [
  {
    id: "maths",
    title: "Mathématiques",
    emoji: "∑",
    color: "bg-[#2F5D8A]",
    blurb: "Du calcul littéral aux fonctions, pas à pas.",
    courses: [
      {
        id: "algebre-1",
        title: "Les bases de l'algèbre",
        level: "Collège / Seconde",
        lessons: [
          {
            id: "maths-eq1",
            title: "Résoudre une équation du premier degré",
            minutes: 4,
            steps: [
              {
                kind: "explain",
                title: "L'idée : garder la balance en équilibre",
                body: "Une équation, c'est une balance. Tout ce que tu fais d'un côté du signe =, tu dois le faire de l'autre. Le but : isoler x.",
                math: "2x + 3 = 11 \\;\\Rightarrow\\; 2x = 8 \\;\\Rightarrow\\; x = 4",
              },
              {
                kind: "choice",
                prompt: "Quelle est la première étape pour résoudre cette équation ?",
                math: "3x - 5 = 10",
                options: ["Diviser par 3", "Ajouter 5 des deux côtés", "Retirer 10 des deux côtés"],
                answer: 1,
                why: "On se débarrasse d'abord du terme constant : 3x − 5 + 5 = 10 + 5, soit 3x = 15.",
              },
              {
                kind: "number",
                prompt: "Résous l'équation. Combien vaut x ?",
                math: "3x - 5 = 10",
                answer: 5,
                tolerance: 0,
                why: "3x = 15, donc x = 15 ÷ 3 = 5.",
              },
              {
                kind: "number",
                prompt: "À toi : combien vaut x ?",
                math: "\\frac{x}{4} + 2 = 7",
                answer: 20,
                tolerance: 0,
                why: "x/4 = 5, donc x = 5 × 4 = 20.",
              },
            ],
          },
          {
            id: "maths-dev",
            title: "Développer avec la distributivité",
            minutes: 5,
            steps: [
              {
                kind: "explain",
                title: "Distribuer, c'est multiplier chaque terme",
                body: "Le nombre devant la parenthèse multiplie chaque terme à l'intérieur.",
                math: "k(a + b) = ka + kb",
              },
              {
                kind: "choice",
                prompt: "Quelle est la forme développée ?",
                math: "4(x + 3)",
                options: ["4x + 3", "4x + 12", "x + 12"],
                answer: 1,
                why: "4 × x = 4x et 4 × 3 = 12.",
              },
              {
                kind: "choice",
                prompt: "Et celle-ci ?",
                math: "-2(x - 5)",
                options: ["-2x - 10", "-2x + 10", "2x - 10"],
                answer: 1,
                why: "−2 × (−5) = +10 : attention aux signes !",
              },
            ],
          },
          {
            id: "maths-fonctions",
            title: "Lire une fonction affine",
            minutes: 5,
            premium: true,
            steps: [
              {
                kind: "explain",
                title: "f(x) = ax + b",
                body: "a est le coefficient directeur (la pente), b l'ordonnée à l'origine (où la droite coupe l'axe vertical).",
                math: "f(x) = 2x + 1",
              },
              {
                kind: "number",
                prompt: "Calcule f(3).",
                math: "f(x) = 2x + 1",
                answer: 7,
                tolerance: 0,
                why: "f(3) = 2 × 3 + 1 = 7.",
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
    emoji: "⚛",
    color: "bg-[#B4492F]",
    blurb: "Comprendre le monde avec des grandeurs et des unités.",
    courses: [
      {
        id: "mecanique-1",
        title: "Mouvement et vitesse",
        level: "Seconde",
        lessons: [
          {
            id: "pc-vitesse",
            title: "Calculer une vitesse moyenne",
            minutes: 4,
            steps: [
              {
                kind: "explain",
                title: "Distance divisée par durée",
                body: "La vitesse moyenne indique la distance parcourue par unité de temps. En unités du Système international : mètres et secondes.",
                math: "v = \\frac{d}{t}",
              },
              {
                kind: "number",
                prompt: "Un cycliste parcourt 30 km en 1,5 h. Quelle est sa vitesse moyenne ?",
                answer: 20,
                tolerance: 0.01,
                unit: "km/h",
                why: "v = 30 ÷ 1,5 = 20 km/h.",
              },
              {
                kind: "choice",
                prompt: "Comment convertir des km/h en m/s ?",
                options: ["Multiplier par 3,6", "Diviser par 3,6", "Diviser par 60"],
                answer: 1,
                why: "1 km/h = 1000 m / 3600 s = 1/3,6 m/s.",
              },
              {
                kind: "number",
                prompt: "Convertis 72 km/h en m/s.",
                answer: 20,
                tolerance: 0.01,
                unit: "m/s",
                why: "72 ÷ 3,6 = 20 m/s.",
              },
            ],
          },
        ],
      },
      {
        id: "chimie-1",
        title: "La matière et la mole",
        level: "Seconde",
        lessons: [
          {
            id: "pc-mole",
            title: "Quantité de matière",
            minutes: 5,
            steps: [
              {
                kind: "explain",
                title: "Compter les entités par paquets",
                body: "Une mole contient environ 6,02 × 10²³ entités (constante d'Avogadro). On relie masse et quantité de matière grâce à la masse molaire M.",
                math: "n = \\frac{m}{M}",
              },
              {
                kind: "number",
                prompt: "Combien de moles dans 36 g d'eau ? (M(H₂O) = 18 g/mol)",
                answer: 2,
                tolerance: 0.001,
                unit: "mol",
                why: "n = 36 ÷ 18 = 2 mol.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "programmation",
    title: "Programmation",
    emoji: "</>",
    color: "bg-[#1F6F5C]",
    blurb: "Écris du vrai code dès la première leçon, directement dans le navigateur.",
    courses: [
      {
        id: "js-1",
        title: "Premiers pas en JavaScript",
        level: "Débutant",
        lessons: [
          {
            id: "js-print",
            title: "Afficher un message",
            minutes: 3,
            steps: [
              {
                kind: "explain",
                title: "console.log affiche du texte",
                body: "Pour afficher quelque chose, on utilise console.log(...). Le texte s'écrit entre guillemets.",
              },
              {
                kind: "code",
                prompt: "Affiche exactement : Bonjour le monde",
                starter: "// Écris ton code ici\n",
                expectedOutput: "Bonjour le monde",
                why: "console.log(\"Bonjour le monde\");",
              },
            ],
          },
          {
            id: "js-vars",
            title: "Variables et calculs",
            minutes: 4,
            steps: [
              {
                kind: "explain",
                title: "Ranger une valeur dans une boîte",
                body: "let crée une variable. On peut ensuite la réutiliser dans des calculs.",
              },
              {
                kind: "choice",
                prompt: "Que vaut total après : let prix = 4; let total = prix * 3;",
                options: ["7", "12", "43"],
                answer: 1,
                why: "4 × 3 = 12.",
              },
              {
                kind: "code",
                prompt: "Crée une variable age valant 15, puis affiche age + 1.",
                starter: "let age = \n",
                expectedOutput: "16",
                why: "let age = 15;\nconsole.log(age + 1);",
              },
            ],
          },
          {
            id: "js-loops",
            title: "Répéter avec une boucle",
            minutes: 5,
            premium: true,
            steps: [
              {
                kind: "code",
                prompt: "Affiche les nombres de 1 à 3, un par ligne.",
                starter: "for (let i = 1; i <= 3; i++) {\n  \n}\n",
                expectedOutput: "1\n2\n3",
                why: "for (let i = 1; i <= 3; i++) {\n  console.log(i);\n}",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "svt",
    title: "SVT",
    emoji: "🧬",
    color: "bg-[#6B5B95]",
    blurb: "Le vivant, la Terre et l'environnement.",
    courses: [
      {
        id: "cellule-1",
        title: "La cellule",
        level: "Collège",
        lessons: [
          {
            id: "svt-cellule",
            title: "Les éléments d'une cellule",
            minutes: 3,
            steps: [
              {
                kind: "explain",
                title: "L'unité du vivant",
                body: "Tous les êtres vivants sont faits de cellules. Une cellule possède une membrane, un cytoplasme et, chez les eucaryotes, un noyau qui contient l'ADN.",
              },
              {
                kind: "choice",
                prompt: "Où se trouve l'ADN dans une cellule animale ?",
                options: ["Dans la membrane", "Dans le noyau", "Dans la paroi"],
                answer: 1,
                why: "Chez les eucaryotes, l'ADN est contenu dans le noyau. Les cellules animales n'ont d'ailleurs pas de paroi.",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function findLesson(id: string) {
  for (const s of SUBJECTS)
    for (const c of s.courses)
      for (const l of c.lessons) if (l.id === id) return { subject: s, course: c, lesson: l };
  return null;
}

export function lessonCount(s: Subject) {
  return s.courses.reduce((n, c) => n + c.lessons.length, 0);
}
