import type { Journey, MapNode, Step, Subject } from "@/lib/content";

// Langues : chaque parcours suit le même modèle. Pour ajouter une langue,
// il suffit d'ajouter un appel à language(...) avec son vocabulaire.
const chest = (id: string): MapNode => ({ id, type: "coffre", title: "Coffre" });

type Pack = {
  id: string;
  name: string; // « anglais »
  flag: string;
  lang: string; // code BCP 47 pour la voix
  hello: [string, string]; // [mot, traduction]
  greet: [string, string][]; // salutations
  thanks: string;
  intro: { me: string; name: string; from: string }; // « Je m'appelle… », « Je viens de… »
  sentence: string[]; // phrase à remettre dans l'ordre : « Je voudrais un café, s'il te plaît »
  sentenceFr: string;
  numbers: [string, string][];
  cafe: { ask: string; askFr: string; options: string[]; answer: number };
  fill: { text: string; options: string[]; answer: string[]; why: string };
};

function language(p: Pack): Journey {
  const say = (text: string) => ({ text, lang: p.lang });
  const listenGreet: Step[] = p.greet.slice(0, 2).map(([w, fr], i) => ({
    kind: "listen",
    prompt: "Écoute et choisis ce que tu entends",
    say: say(w),
    options: p.greet.map(([x]) => x),
    answer: i,
    why: `« ${w} » veut dire « ${fr} ».`,
  }));
  return {
    id: p.id,
    title: `${p.flag} ${p.name[0].toUpperCase()}${p.name.slice(1)} : premiers pas`,
    level: "Débutant · A1",
    description: `Saluer, te présenter et commander au café en ${p.name}, en écoutant la prononciation à chaque étape.`,
    chapters: [
      {
        id: `${p.id}-c1`,
        title: "Saluer",
        nodes: [
          {
            id: `${p.id}-salut`,
            type: "lecon",
            title: "Dire bonjour",
            minutes: 3,
            difficulty: "Facile",
            steps: [
              { kind: "explain", title: `« ${p.hello[0]} »`, body: `C'est la façon la plus courante de dire « ${p.hello[1]} » en ${p.name}. Touche le haut-parleur pour l'écouter, puis répète à voix haute.`, say: say(p.hello[0]) },
              ...listenGreet,
              { kind: "match", prompt: "Relie chaque expression à sa traduction", pairs: p.greet, why: "Écoute-les plusieurs fois pour les mémoriser." },
            ],
            memo: p.greet.map(([w, fr]) => `${w} = ${fr}`),
          },
          {
            id: `${p.id}-presenter`,
            type: "lecon",
            title: "Te présenter",
            minutes: 4,
            difficulty: "Facile",
            steps: [
              { kind: "explain", title: "Je m'appelle…", body: `Pour te présenter : « ${p.intro.me} ». Pour dire d'où tu viens : « ${p.intro.from} ».`, say: say(`${p.intro.me}. ${p.intro.from}.`) },
              { kind: "choice", prompt: "Comment dit-on « Je m'appelle Léa » ?", options: [p.intro.name, p.greet[0][0], p.thanks], answer: 0, why: `« ${p.intro.name} ».` },
              { kind: "fill", prompt: "Complète la phrase", text: p.fill.text, options: p.fill.options, answer: p.fill.answer, why: p.fill.why },
            ],
            memo: [p.intro.me, p.intro.from, `Merci = ${p.thanks}`],
          },
          {
            id: `${p.id}-nombres`,
            type: "pratique",
            title: "Les nombres",
            minutes: 3,
            difficulty: "Moyen",
            steps: [
              { kind: "match", prompt: "Relie chaque nombre", pairs: p.numbers, why: "Les nombres reviennent partout : prix, heures, âge." },
              { kind: "listen", prompt: "Quel nombre entends-tu ?", say: say(p.numbers[2][0]), options: p.numbers.map(([, n]) => n), answer: 2, why: `« ${p.numbers[2][0]} » = ${p.numbers[2][1]}.` },
            ],
          },
          chest(`${p.id}-c1-coffre`),
        ],
      },
      {
        id: `${p.id}-c2`,
        title: "Au café",
        nodes: [
          {
            id: `${p.id}-cafe`,
            type: "lecon",
            title: "Commander",
            minutes: 4,
            difficulty: "Moyen",
            steps: [
              { kind: "explain", title: "Poliment, s'il te plaît", body: `« ${p.sentence.join(" ")} » signifie « ${p.sentenceFr} ».`, say: say(p.sentence.join(" ")) },
              { kind: "order", prompt: `Remets les mots dans l'ordre : « ${p.sentenceFr} »`, items: p.sentence, why: p.sentence.join(" ") },
              { kind: "listen", prompt: p.cafe.askFr, say: say(p.cafe.ask), options: p.cafe.options, answer: p.cafe.answer, why: `« ${p.cafe.ask} » = « ${p.cafe.askFr} ».` },
            ],
            memo: [`${p.sentence.join(" ")} = ${p.sentenceFr}`, `${p.cafe.ask} = ${p.cafe.askFr}`],
          },
          chest(`${p.id}-c2-coffre`),
        ],
      },
      {
        id: `${p.id}-final`,
        title: "Épreuve finale",
        nodes: [
          {
            id: `${p.id}-boss`,
            type: "boss",
            title: "La conversation",
            minutes: 3,
            difficulty: "Difficile",
            timeLimit: 120,
            steps: [
              { kind: "listen", prompt: "Qu'entends-tu ?", say: say(p.greet[1][0]), options: p.greet.map(([, fr]) => fr), answer: 1, why: `« ${p.greet[1][0]} » = ${p.greet[1][1]}.` },
              { kind: "order", prompt: `Construis : « ${p.sentenceFr} »`, items: p.sentence, why: p.sentence.join(" ") },
              { kind: "choice", prompt: "Comment dit-on « merci » ?", options: [p.thanks, p.hello[0], p.greet[2][0]], answer: 0, why: `Merci = ${p.thanks}.` },
            ],
          },
        ],
      },
    ],
  };
}

export const LANGUES: Subject = {
  id: "langues",
  title: "Langues",
  icon: "🌍",
  tint: "#ffb04a",
  blurb: "Écoute, répète, parle : une langue en 5 minutes par jour.",
  journeys: [
    language({
      id: "anglais", name: "anglais", flag: "🇬🇧", lang: "en-GB",
      hello: ["Hello", "Bonjour"],
      greet: [["Hello", "Bonjour"], ["Goodbye", "Au revoir"], ["Good night", "Bonne nuit"], ["See you soon", "À bientôt"]],
      thanks: "Thank you",
      intro: { me: "My name is …", name: "My name is Léa", from: "I come from France" },
      sentence: ["I", "would", "like", "a", "coffee,", "please"], sentenceFr: "Je voudrais un café, s'il vous plaît",
      numbers: [["one", "1"], ["three", "3"], ["seven", "7"], ["ten", "10"]],
      cafe: { ask: "How much is it?", askFr: "Que demande le client ?", options: ["Combien ça coûte ?", "Où sont les toilettes ?", "Quelle heure est-il ?"], answer: 0 },
      fill: { text: "My ___ is Léa and I ___ from France.", options: ["name", "come", "am", "go"], answer: ["name", "come"], why: "My name is Léa and I come from France." },
    }),
    language({
      id: "espagnol", name: "espagnol", flag: "🇪🇸", lang: "es-ES",
      hello: ["Hola", "Bonjour / Salut"],
      greet: [["Hola", "Bonjour"], ["Adiós", "Au revoir"], ["Buenas noches", "Bonne nuit"], ["Hasta luego", "À plus tard"]],
      thanks: "Gracias",
      intro: { me: "Me llamo …", name: "Me llamo Léa", from: "Soy de Francia" },
      sentence: ["Quiero", "un", "café,", "por", "favor"], sentenceFr: "Je veux un café, s'il te plaît",
      numbers: [["uno", "1"], ["tres", "3"], ["siete", "7"], ["diez", "10"]],
      cafe: { ask: "¿Cuánto cuesta?", askFr: "Que demande le client ?", options: ["Combien ça coûte ?", "Où est la gare ?", "Tu as faim ?"], answer: 0 },
      fill: { text: "Me ___ Léa y ___ de Francia.", options: ["llamo", "soy", "tengo", "es"], answer: ["llamo", "soy"], why: "Me llamo Léa y soy de Francia." },
    }),
    language({
      id: "allemand", name: "allemand", flag: "🇩🇪", lang: "de-DE",
      hello: ["Hallo", "Bonjour / Salut"],
      greet: [["Hallo", "Bonjour"], ["Tschüss", "Au revoir"], ["Gute Nacht", "Bonne nuit"], ["Bis bald", "À bientôt"]],
      thanks: "Danke",
      intro: { me: "Ich heiße …", name: "Ich heiße Léa", from: "Ich komme aus Frankreich" },
      sentence: ["Ich", "möchte", "einen", "Kaffee,", "bitte"], sentenceFr: "Je voudrais un café, s'il vous plaît",
      numbers: [["eins", "1"], ["drei", "3"], ["sieben", "7"], ["zehn", "10"]],
      cafe: { ask: "Was kostet das?", askFr: "Que demande le client ?", options: ["Combien ça coûte ?", "Où habites-tu ?", "Quel âge as-tu ?"], answer: 0 },
      fill: { text: "Ich ___ Léa und ich ___ aus Frankreich.", options: ["heiße", "komme", "bin", "habe"], answer: ["heiße", "komme"], why: "Ich heiße Léa und ich komme aus Frankreich." },
    }),
  ],
};
