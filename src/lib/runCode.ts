// Exécute du JavaScript de l'élève dans un Web Worker isolé, avec délai maximal.
export function runJs(code: string, timeoutMs = 2000): Promise<{ output: string; error?: string }> {
  const src = `
    const out = [];
    const fmt = (v) => typeof v === "string" ? v : JSON.stringify(v);
    console.log = (...a) => out.push(a.map(fmt).join(" "));
    onmessage = (e) => {
      try { new Function(e.data)(); postMessage({ output: out.join("\\n") }); }
      catch (err) { postMessage({ output: out.join("\\n"), error: String(err) }); }
    };`;
  const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
  const w = new Worker(url);
  return new Promise((resolve) => {
    const t = setTimeout(() => {
      w.terminate();
      resolve({ output: "", error: "Temps dépassé : ta boucle ne s'arrête peut-être jamais." });
    }, timeoutMs);
    w.onmessage = (e) => {
      clearTimeout(t);
      w.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data);
    };
    w.postMessage(code);
  });
}
