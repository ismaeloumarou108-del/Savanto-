// Panneaux routiers (formes réglementaires génériques) et petites scènes de circulation, dessinés en SVG.

export type SignId =
  | "stop" | "cedez" | "sens-interdit" | "limite-30" | "limite-50" | "limite-80" | "limite-130"
  | "virage-droite" | "pietons" | "priorite" | "fin-priorite" | "giratoire" | "interdit-depasser"
  | "stationnement-interdit" | "enfants" | "chaussee-glissante" | "obligation-droite" | "zone-30";

const RED = "#d42b1e";
const BLUE = "#1f5fbf";
const YELLOW = "#f5c400";

function Circle({ children, fill = "#fff", ring = RED }: { children?: React.ReactNode; fill?: string; ring?: string }) {
  return (
    <>
      <circle cx="50" cy="50" r="46" fill={fill} stroke={ring} strokeWidth="9" />
      {children}
    </>
  );
}
function Triangle({ children, up = true }: { children?: React.ReactNode; up?: boolean }) {
  const pts = up ? "50,6 95,88 5,88" : "5,10 95,10 50,92";
  return (
    <>
      <polygon points={pts} fill="#fff" stroke={RED} strokeWidth="8" strokeLinejoin="round" />
      {children}
    </>
  );
}

export function RoadSign({ id, size = 120 }: { id: SignId; size?: number }) {
  const g = (() => {
    switch (id) {
      case "stop":
        return (
          <>
            <polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill={RED} stroke="#fff" strokeWidth="4" />
            <text x="50" y="61" textAnchor="middle" fontSize="27" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">STOP</text>
          </>
        );
      case "cedez":
        return <Triangle up={false} />;
      case "sens-interdit":
        return (
          <>
            <circle cx="50" cy="50" r="46" fill={RED} />
            <rect x="18" y="42" width="64" height="16" fill="#fff" rx="2" />
          </>
        );
      case "limite-30":
      case "limite-50":
      case "limite-80":
      case "limite-130":
        return (
          <Circle>
            <text x="50" y={id === "limite-130" ? 61 : 64} textAnchor="middle" fontSize={id === "limite-130" ? 32 : 40} fontWeight="800" fill="#111" fontFamily="Arial, sans-serif">
              {id.split("-")[1]}
            </text>
          </Circle>
        );
      case "virage-droite":
        return <Triangle><path d="M42 76 V58 Q42 44 56 40 L56 34 L66 44 L56 54 L56 48 Q50 50 50 58 V76 Z" fill="#111" /></Triangle>;
      case "pietons":
        return (
          <Triangle>
            <circle cx="52" cy="38" r="5" fill="#111" />
            <path d="M50 45 L44 60 L38 74 M50 45 L54 60 L62 74 M48 52 L40 58 M52 52 L60 56" stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none" />
          </Triangle>
        );
      case "enfants":
        return (
          <Triangle>
            <circle cx="42" cy="44" r="4.5" fill="#111" /><circle cx="60" cy="40" r="5" fill="#111" />
            <path d="M42 50 L38 74 M42 50 L46 74 M60 46 L56 74 M60 46 L64 74 M44 56 L58 52" stroke="#111" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </Triangle>
        );
      case "chaussee-glissante":
        return (
          <Triangle>
            <rect x="40" y="44" width="20" height="12" rx="3" fill="#111" />
            <path d="M38 64 q6 6 0 12 M50 64 q6 6 0 12 M62 64 q6 6 0 12" stroke="#111" strokeWidth="3.5" fill="none" />
          </Triangle>
        );
      case "priorite":
        return (
          <>
            <rect x="18" y="18" width="64" height="64" transform="rotate(45 50 50)" fill="#fff" stroke="#222" strokeWidth="2" />
            <rect x="29" y="29" width="42" height="42" transform="rotate(45 50 50)" fill={YELLOW} />
          </>
        );
      case "fin-priorite":
        return (
          <>
            <rect x="18" y="18" width="64" height="64" transform="rotate(45 50 50)" fill="#fff" stroke="#222" strokeWidth="2" />
            <rect x="29" y="29" width="42" height="42" transform="rotate(45 50 50)" fill={YELLOW} />
            <path d="M26 74 L74 26" stroke="#222" strokeWidth="5" />
            <path d="M32 80 L80 32 M20 68 L68 20" stroke="#222" strokeWidth="2" />
          </>
        );
      case "giratoire":
        return (
          <>
            <circle cx="50" cy="50" r="46" fill={BLUE} />
            {[0, 120, 240].map((r) => (
              <g key={r} transform={`rotate(${r} 50 50)`}>
                <path d="M50 22 A28 28 0 0 1 74 36" stroke="#fff" strokeWidth="8" fill="none" />
                <polygon points="78,30 80,46 66,40" fill="#fff" />
              </g>
            ))}
          </>
        );
      case "obligation-droite":
        return (
          <>
            <circle cx="50" cy="50" r="46" fill={BLUE} />
            <path d="M40 76 V52 Q40 42 52 42 H62" stroke="#fff" strokeWidth="10" fill="none" />
            <polygon points="60,28 80,42 60,56" fill="#fff" />
          </>
        );
      case "interdit-depasser":
        return (
          <Circle>
            <rect x="24" y="38" width="22" height="26" rx="4" fill={RED} />
            <rect x="54" y="38" width="22" height="26" rx="4" fill="#111" />
          </Circle>
        );
      case "stationnement-interdit":
        return (
          <>
            <circle cx="50" cy="50" r="46" fill={BLUE} stroke={RED} strokeWidth="9" />
            <path d="M22 22 L78 78" stroke={RED} strokeWidth="9" />
          </>
        );
      case "zone-30":
        return (
          <>
            <rect x="6" y="10" width="88" height="80" rx="6" fill="#fff" stroke="#222" strokeWidth="2" />
            <circle cx="50" cy="44" r="24" fill="#fff" stroke={RED} strokeWidth="6" />
            <text x="50" y="53" textAnchor="middle" fontSize="24" fontWeight="800" fill="#111" fontFamily="Arial, sans-serif">30</text>
            <text x="50" y="84" textAnchor="middle" fontSize="13" fontWeight="800" fill="#111" fontFamily="Arial, sans-serif">ZONE</text>
          </>
        );
    }
  })();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Panneau : ${id}`} className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
      {g}
    </svg>
  );
}

export type SceneId = "carrefour-droite" | "giratoire" | "depassement";

// Vues du dessus : ta voiture est toujours orange.
export function Scene({ id }: { id: SceneId }) {
  const road = "#3a3330";
  const car = (x: number, y: number, rot: number, color: string, me = false) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-9" y="-15" width="18" height="30" rx="5" fill={color} stroke={me ? "#fff" : "none"} strokeWidth="1.5" />
      <rect x="-6" y="-9" width="12" height="7" rx="2" fill="#0b0706" opacity="0.6" />
    </g>
  );
  const arrow = (d: string) => <path d={d} stroke="#ffd15c" strokeWidth="2.5" fill="none" strokeDasharray="5 4" markerEnd="url(#ar)" />;
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-72 rounded-2xl border border-line bg-[#1d2a1a]" role="img" aria-label="Situation de circulation">
      <defs>
        <marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#ffd15c" /></marker>
      </defs>
      {id === "carrefour-droite" && (
        <>
          <rect x="75" y="0" width="50" height="200" fill={road} /><rect x="0" y="75" width="200" height="50" fill={road} />
          <path d="M100 0 V70 M100 130 V200 M0 100 H70 M130 100 H200" stroke="#eee" strokeWidth="2" strokeDasharray="8 8" />
          {car(112, 160, 0, "#ff6a2b", true)}
          {arrow("M112 140 V40")}
          {car(165, 88, -90, "#5aa6ff")}
          {arrow("M148 88 H40")}
        </>
      )}
      {id === "giratoire" && (
        <>
          <rect x="75" y="0" width="50" height="200" fill={road} /><rect x="0" y="75" width="200" height="50" fill={road} />
          <circle cx="100" cy="100" r="55" fill={road} /><circle cx="100" cy="100" r="25" fill="#2f4a2a" />
          {car(112, 175, 0, "#ff6a2b", true)}
          {car(140, 70, 225, "#5aa6ff")}
          {arrow("M112 158 V140")}
        </>
      )}
      {id === "depassement" && (
        <>
          <rect x="70" y="0" width="60" height="200" fill={road} />
          <path d="M100 0 V200" stroke="#eee" strokeWidth="3" />
          {car(115, 150, 0, "#ff6a2b", true)}
          {car(115, 95, 0, "#8a8a8a")}
          {car(85, 30, 180, "#5aa6ff")}
          {arrow("M115 132 Q90 110 92 80")}
        </>
      )}
    </svg>
  );
}
