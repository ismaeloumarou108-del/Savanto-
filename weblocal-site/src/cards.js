import * as THREE from 'three';

/* Cartes "verre" flottantes : réseaux sociaux, likes, courbes de croissance.
   Les textures sont dessinées en canvas (aucune image externe). */

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const EL = '#1B3BFF';

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }

function tile(c, S, fill) {
  rr(c, 6, 6, S - 12, S - 12, S * 0.26);
  c.fillStyle = fill; c.fill();
  c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,.85)'; c.stroke();
}

const painters = {
  ig(c, S) {
    const g = c.createLinearGradient(0, S, S, 0);
    [['#FFD36B', 0], ['#FF7A2F', .28], ['#E8286E', .55], ['#9B2FD0', .8], ['#4F5BFF', 1]].forEach(([col, p]) => g.addColorStop(p, col));
    tile(c, S, g);
    c.strokeStyle = '#fff'; c.lineWidth = S * 0.06; c.lineCap = 'round';
    rr(c, S * .24, S * .24, S * .52, S * .52, S * .16); c.stroke();
    c.beginPath(); c.arc(S / 2, S / 2, S * .125, 0, 7); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(S * .66, S * .34, S * .035, 0, 7); c.fill();
  },
  fb(c, S) {
    const g = c.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#6B86FF'); g.addColorStop(1, '#2A4BFF');
    tile(c, S, g);
    c.fillStyle = '#fff'; c.font = `700 ${S * .78}px "Instrument Sans", Arial, sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('f', S * .57, S * .84);
  },
  tt(c, S) {
    tile(c, S, 'rgba(8,16,92,.92)');
    const note = (dx, dy, col) => {
      c.strokeStyle = col; c.lineWidth = S * .085; c.lineCap = 'round'; c.lineJoin = 'round';
      const x = S * .5 + dx, y = S * .5 + dy;
      c.beginPath(); c.arc(x - S * .08, y + S * .17, S * .12, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(x + S * .04, y + S * .17); c.lineTo(x + S * .04, y - S * .24);
      c.bezierCurveTo(x + S * .06, y - S * .08, x + S * .16, y - S * .06, x + S * .27, y - S * .06); c.stroke();
    };
    note(-S * .02, 0, '#25F4EE'); note(S * .02, S * .02, '#FE2C55'); note(0, S * .01, '#fff');
  },
  heart(c, S) {
    c.fillStyle = '#FF4D5E'; c.beginPath(); c.arc(S / 2, S / 2, S / 2 - 6, 0, 7); c.fill();
    c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,.85)'; c.stroke();
    c.fillStyle = '#fff'; c.beginPath();
    const x = S / 2, y = S * .56, k = S * .26;
    c.moveTo(x, y + k * .95);
    c.bezierCurveTo(x - k * 1.6, y - k * .1, x - k * .9, y - k * 1.2, x, y - k * .45);
    c.bezierCurveTo(x + k * .9, y - k * 1.2, x + k * 1.6, y - k * .1, x, y + k * .95);
    c.fill();
  },
};

function paintChart(c, W, Hh, prog, ph, label) {
  c.clearRect(0, 0, W, Hh);
  rr(c, 4, 4, W - 8, Hh - 8, 34);
  const g = c.createLinearGradient(0, 0, W, Hh);
  g.addColorStop(0, 'rgba(255,255,255,.36)'); g.addColorStop(1, 'rgba(255,255,255,.1)');
  c.fillStyle = g; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.75)'; c.stroke();
  // en-tête
  rr(c, 30, 28, 58, 58, 16); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill();
  c.fillStyle = EL; c.font = `700 36px "Instrument Sans", Arial, sans-serif`; c.textAlign = 'center'; c.fillText(label, 59, 68);
  c.fillStyle = 'rgba(255,255,255,.9)'; rr(c, 108, 38, 150, 14, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; rr(c, 108, 62, 96, 12, 6); c.fill();
  c.fillStyle = '#FFD60A'; c.beginPath(); c.arc(W - 62, 57, 26, 0, 7); c.fill();
  c.fillStyle = '#0A1670'; c.font = `700 30px "Instrument Sans", Arial, sans-serif`; c.fillText('↗', W - 62, 68);
  // zone courbe
  const x0 = 30, y0 = 112, w = W - 60, h = Hh - 112 - 30;
  rr(c, x0, y0, w, h, 22); c.fillStyle = 'rgba(255,255,255,.86)'; c.fill();
  c.strokeStyle = 'rgba(27,59,255,.12)'; c.lineWidth = 2;
  for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x0 + 18, y0 + (h * i) / 4); c.lineTo(x0 + w - 18, y0 + (h * i) / 4); c.stroke(); }
  const pts = [];
  const N = 64;
  for (let i = 0; i <= N * prog; i++) {
    const u = i / N;
    const v = 0.82 - 0.6 * u - 0.07 * Math.sin(u * 10 + ph) * (1 - u * .4);
    pts.push([x0 + 22 + u * (w - 44), y0 + 18 + v * (h - 36)]);
  }
  if (pts.length > 1) {
    const last = pts[pts.length - 1];
    c.beginPath(); c.moveTo(pts[0][0], y0 + h - 14);
    pts.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(last[0], y0 + h - 14); c.closePath();
    const ag = c.createLinearGradient(0, y0, 0, y0 + h); ag.addColorStop(0, 'rgba(27,59,255,.30)'); ag.addColorStop(1, 'rgba(27,59,255,0)');
    c.fillStyle = ag; c.fill();
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.strokeStyle = EL; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
    c.fillStyle = '#FFD60A'; c.strokeStyle = EL; c.lineWidth = 5;
    c.beginPath(); c.arc(last[0], last[1], 11, 0, 7); c.fill(); c.stroke();
  }
}

export function createCards(scene, camera) {
  const group = new THREE.Group();
  scene.add(group);

  // x, y, z = emplacement (unités monde, autour du repère) ; th = seuil d'apparition (0 = visible dès l'accueil)
  const defs = [
    { k: 'ig', x: 2.4, y: 1.8, z: 0.9, hx: 3.0, hy: 2.3, w: 1.05, th: 0 },
    { k: 'heart', x: -3.3, y: 0.6, z: 1.0, hx: 2.3, hy: 0.6, w: 0.78, th: 0 },
    { k: 'fb', x: -1.9, y: -0.5, z: 0.5, hx: 3.9, hy: 1.0, w: 0.9, th: 0 },
    { k: 'tt', x: 2.9, y: -0.1, z: 0.4, hx: 3.2, hy: -0.7, w: 0.9, th: 0 },
    { k: 'chart', lab: 'f', x: -3.0, y: -1.2, z: 0.2, w: 2.3, ph: 0.4, th: 0.5 },
    { k: 'chart', lab: '♪', x: 2.5, y: -1.7, z: 0.7, w: 2.2, ph: 2.1, th: 0.6 },
    { k: 'chart', lab: '◎', x: 1.0, y: 3.0, z: -1.2, w: 2.1, ph: 3.7, th: 0.7 },
    { k: 'heart', x: 3.5, y: 1.2, z: -0.4, w: 0.55, th: 0.5 },
    { k: 'ig', x: -3.8, y: 0.2, z: -0.7, w: 0.62, th: 0.6 },
  ];


  const cards = defs.map((d, i) => {
    const isChart = d.k === 'chart';
    const cw = isChart ? 512 : 256, ch = isChart ? 352 : 256;
    const canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (isChart) paintChart(ctx, cw, ch, 1, d.ph, d.lab); else painters[d.k](ctx, cw);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(d.w, (d.w * ch) / cw),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
    );
    mesh.visible = false;
    group.add(mesh);
    return { ...d, i, mesh, tex, ctx, cw, ch, ph: d.ph ?? i * 1.3 };
  });

  // fils lumineux entre le repère et chaque carte
  const linePos = new Float32Array(cards.length * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: '#FAEB94', transparent: true, opacity: 0, depthWrite: false });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;
  group.add(lines);

  let frameNo = 0;
  const head = new THREE.Vector3(0, 0.4, 0);

  function update({ t, ui, spread, narrow, mouse, yaw, reduce }) {
    frameNo++;
    const maxCards = narrow ? 6 : cards.length;
    group.rotation.y = yaw;
    group.rotation.x = mouse.y * 0.05;
    let anyVisible = 0;
    cards.forEach((cd, n) => {
      const vis = n < maxCards ? smooth(clamp01((ui - cd.th) / 0.35)) : 0;
      const m = cd.mesh;
      m.visible = vis > 0.003;
      const o = n * 6;
      if (!m.visible) { linePos.fill(0, o, o + 6); return; }
      anyVisible = Math.max(anyVisible, vis);
      const kx = (narrow ? 0.36 : 1) * spread, ky = (narrow ? 0.9 : 1) * spread, k = spread;
      const fly = 1 - vis;
      const bob = reduce ? 0 : Math.sin(t * 1.05 + cd.ph) * 0.14;
      const dir = Math.sign(cd.x) || 1;
      const b = clamp01((ui - 0.3) / 0.7);
      const px = cd.hx === undefined ? cd.x : cd.hx + (cd.x - cd.hx) * b;
      const py = cd.hy === undefined ? cd.y : cd.hy + (cd.y - cd.hy) * b;
      m.position.set(px * kx + dir * fly * 5, py * ky + bob + fly * 2.4, cd.z * k - fly * 6);
      let sc = (narrow ? (cd.k === 'chart' ? 0.5 : 0.72) : 1) * (0.25 + 0.75 * vis);
      if (cd.k === 'heart' && !reduce) sc *= 1 + Math.max(0, Math.sin(t * 2.6 + cd.ph)) ** 6 * 0.18;
      m.scale.setScalar(sc);
      m.material.opacity = Math.min(1, vis * 1.6);
      m.rotation.set(mouse.y * 0.12, -m.position.x * 0.07 - group.rotation.y * 0.6 + mouse.x * 0.1, Math.sin(t * 0.7 + cd.ph) * 0.04 + fly * dir * 0.6);
      // fil
      linePos[o] = head.x; linePos[o + 1] = head.y; linePos[o + 2] = head.z;
      linePos[o + 3] = m.position.x; linePos[o + 4] = m.position.y; linePos[o + 5] = m.position.z;
      // courbes animées
      if (cd.k === 'chart' && (frameNo & 1) === 0 && !reduce) {
        const cyc = (t * 0.28 + cd.ph * 0.2) % 1.5;
        const prog = smooth(clamp01(cyc / 1.0));
        paintChart(cd.ctx, cd.cw, cd.ch, Math.max(prog, 0.02), cd.ph, cd.lab);
        cd.tex.needsUpdate = true;
      }
    });
    lineGeo.attributes.position.needsUpdate = true;
    lineMat.opacity = anyVisible * 0.28;
  }

  return { group, update };
}
