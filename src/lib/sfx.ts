// Petits sons générés à la volée (Web Audio), sans fichier à charger.
let ctx: AudioContext | null = null;
function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.12) {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = ctx.currentTime + start;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch {}
}
export const sfx = {
  good: () => { tone(660, 0, 0.12, "triangle"); tone(990, 0.08, 0.18, "triangle"); },
  bad: () => { tone(220, 0, 0.18, "sawtooth", 0.06); tone(170, 0.1, 0.22, "sawtooth", 0.06); },
  tap: () => tone(520, 0, 0.05, "square", 0.03),
  combo: (n: number) => { tone(700 + n * 60, 0, 0.1, "triangle"); tone(1000 + n * 80, 0.07, 0.15, "triangle"); },
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.3, "triangle")),
  chest: () => [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.07, 0.25, "sine", 0.1)),
};
