import * as THREE from 'three';
import { createCards } from './cards.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- UI : nav, reveals, intro ---------- */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const io = new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.rv').forEach((el) => io.observe(el));
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-loaded')));
document.body.classList.add('is-loaded');

/* dock : visible après le hero, masqué sur la section contact */
const dock = document.getElementById('dock');
const contact = document.getElementById('contact');
const dockCheck = () => {
  const past = scrollY > innerHeight * 0.7;
  const atEnd = contact.getBoundingClientRect().top < innerHeight * 0.6;
  dock.classList.toggle('show', past && !atEnd);
};
addEventListener('scroll', dockCheck, { passive: true }); dockCheck();

/* ---------- 3D : le repère local ---------- */
const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { renderer = null; }
if (!renderer) { canvas.remove(); } else { initScene(); }

function initScene() {
  const COBALT = new THREE.Color('#1F3FFF');
  const LEMON = new THREE.Color('#F2CC14');
  const SOFT = new THREE.Color('#FAEB94');

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, 1.6, 10);
  camera.lookAt(0, 0.6, 0);

  const key = new THREE.DirectionalLight('#ffffff', 2.2);
  key.position.set(4, 7, 6);
  scene.add(key);

  // Profil d'un repère de carte (pin) — révolution autour de Y
  const profile = new THREE.SplineCurve([
    [0.001, 0], [0.05, 0.05], [0.18, 0.36], [0.36, 0.7], [0.48, 1.0],
    [0.5, 1.25], [0.43, 1.52], [0.25, 1.72], [0.001, 1.78],
  ].map(([x, y]) => new THREE.Vector2(x, y))).getPoints(72);
  const pinGeo = new THREE.LatheGeometry(profile, 96);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: COBALT, roughness: 0.2, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.06,
  });
  const lemonMat = new THREE.MeshPhysicalMaterial({
    color: LEMON, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1,
  });

  const rig = new THREE.Group();      // position / échelle (suit le scroll)
  const pin = new THREE.Group();      // rotation + flottement
  const body = new THREE.Mesh(pinGeo, bodyMat);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.505, 0.07, 32, 128), lemonMat);
  belt.rotation.x = Math.PI / 2; belt.position.y = 1.25;
  const dotGeo = new THREE.SphereGeometry(0.2, 48, 32);
  const dotA = new THREE.Mesh(dotGeo, lemonMat); dotA.scale.z = 0.5; dotA.position.set(0, 1.25, 0.47);
  const dotB = dotA.clone(); dotB.position.z = -0.47;
  pin.add(body, belt, dotA, dotB);
  pin.position.y = -0.9;
  rig.add(pin);

  // Ondes sous la pointe : la "visibilité locale"
  const ripples = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.97, 1, 128),
      new THREE.MeshBasicMaterial({ color: LEMON, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    m.rotation.x = -Math.PI / 2; m.position.y = -0.92;
    rig.add(m); ripples.push(m);
  }
  // ombre douce au sol
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.7, 48),
    new THREE.MeshBasicMaterial({ color: '#0A1670', transparent: true, opacity: 0.16, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.93;
  shadow.material.opacity = 0.1;
  rig.add(shadow);
  scene.add(rig);

  // Essaim de pins : la croissance
  const N = 16;
  const swarmMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 });
  const swarm = new THREE.InstancedMesh(pinGeo, swarmMat, N);
  swarm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  swarm.frustumCulled = false;
  const items = [];
  const palette = [LEMON, LEMON, SOFT, new THREE.Color('#3E6BF0')];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < N; i++) {
    items.push({ fx: 0, fy: 0, z: -3 + rnd() * 4, s: 0.12 + rnd() * 0.14, ph: rnd() * 6.28, delay: rnd() * 0.5, ry: rnd() * 6.28 });
    swarm.setColorAt(i, palette[i % palette.length]);
  }
  swarm.instanceColor.needsUpdate = true;
  scene.add(swarm);

  function layoutSwarm() {
    const narrow = camera.aspect < 0.85;
    seed = 11;
    items.forEach((it) => {
      for (let k = 0; k < 40; k++) {
        it.fx = (rnd() * 2 - 1) * 1.05; it.fy = (rnd() * 2 - 1) * 0.8 + 0.1;
        const clearText = narrow ? (it.fy > 0.55) : (it.fx > 0.2 || it.fy > 0.82);
        if (clearText) break;
      }
    });
  }

  /* Étapes de la scène, une par section [data-scene] ; fx/fy en fraction de l'écran */
  const sections = [...document.querySelectorAll('[data-scene]')];
  const K = {
    desktop: {
      hero:     { fx: 0.0,   fy: 0.02, s: 1.75, col: 0, sw: 0, ui: 0.3 },
      social:   { fx: 0.0,   fy: -0.12, s: 1.25, col: 1, sw: 0, ui: 1 },
      services: { fx: 0.66,  fy: -0.04, s: 1.45, col: 0, sw: 0, ui: 0 },
      manifesto:{ fx: 0.0,   fy: -0.02, s: 1.55, col: 1, sw: 0, ui: 0 },
      method:   { fx: -0.58, fy: -0.04, s: 1.45, col: 0, sw: 0, ui: 0 },
      cta:      { fx: 0.62,  fy: -0.08, s: 1.2,  col: 1, sw: 1, ui: 0 },
    },
    mobile: {
      hero:     { fx: 0.0,   fy: 0.5,  s: 0.8, col: 0, sw: 0, ui: 0.3 },
      social:   { fx: 0.0,   fy: -0.2,  s: 0.85, col: 1, sw: 0, ui: 1 },
      services: { fx: 0.72,  fy: 0.82, s: 0.0,  col: 0, sw: 0, ui: 0 },
      manifesto:{ fx: 0.55,  fy: 0.18,  s: 0.7,  col: 1, sw: 0, ui: 0 },
      method:   { fx: -0.72, fy: 0.82, s: 0.0,  col: 0, sw: 0, ui: 0 },
      cta:      { fx: 0.0,   fy: 0.46, s: 0.62, col: 1, sw: 1, ui: 0 },
    },
  };

  let W = 1, H = 1, halfW = 1, halfH = 1, mobile = false;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const d = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d;
    halfW = halfH * camera.aspect;
    mobile = camera.aspect < 0.85;
    layoutSwarm();
  }
  addEventListener('resize', resize); resize();

  const smooth = (t) => t * t * (3 - 2 * t);
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const mix = (a, b, t) => ({ fx: a.fx + (b.fx - a.fx) * t, fy: a.fy + (b.fy - a.fy) * t, s: a.s + (b.s - a.s) * t, col: a.col + (b.col - a.col) * t, sw: a.sw + (b.sw - a.sw) * t, ui: a.ui + (b.ui - a.ui) * t });

  function targetState() {
    const set = mobile ? K.mobile : K.desktop;
    let st = set[sections[0].dataset.scene];
    for (let i = 1; i < sections.length; i++) {
      const top = sections[i].getBoundingClientRect().top;
      const t = smooth(clamp01((H * 0.95 - top) / (H * 0.85)));
      if (t > 0) st = mix(st, set[sections[i].dataset.scene], t);
    }
    return st;
  }

  const cur = { fx: 0, fy: 0, s: 0, col: 0, sw: 0, ui: 0 };
  const cards = createCards(scene, camera);
  const socialEl = document.querySelector('[data-scene="social"]');
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => { mouse.tx = (e.clientX / W) * 2 - 1; mouse.ty = (e.clientY / H) * 2 - 1; }, { passive: true });

  const tmp = new THREE.Object3D();
  const c1 = new THREE.Color();
  let last = performance.now(), elapsed = 0;
  let intro = reduce ? 1 : 0;
  let lastScroll = scrollY, spin = 0;

  function frame() {
    const now = performance.now(); const dt = Math.min((now - last) / 1000, 0.05); last = now; elapsed += dt;
    const t = elapsed;
    if (intro < 1) intro = Math.min(1, intro + dt / 1.8);
    const introE = 1 - Math.pow(1 - intro, 4);

    const tgt = targetState();
    const k = reduce ? 1 : 1 - Math.pow(0.0009, dt); // amortissement indépendant du framerate
    for (const key of ['fx', 'fy', 's', 'col', 'sw', 'ui']) cur[key] += (tgt[key] - cur[key]) * k;
    mouse.x += (mouse.tx - mouse.x) * k * 0.6; mouse.y += (mouse.ty - mouse.y) * k * 0.6;

    // rotation : accélérée par le scroll puis relâchée
    const ds = scrollY - lastScroll; lastScroll = scrollY;
    spin += ds * 0.0042;
    const yaw = (reduce ? 0.6 : t * 0.35) + spin + mouse.x * 0.5;

    const bob = reduce ? 0 : Math.sin(t * 1.4) * 0.07;
    rig.position.set(cur.fx * halfW, cur.fy * halfH + bob, 0);
    const sc = cur.s * (0.4 + 0.6 * introE) * (introE > 0 ? 1 : 0.001);
    rig.scale.setScalar(Math.max(sc, 0.001));
    pin.rotation.set(mouse.y * 0.12, yaw, 0);
    bodyMat.color.lerpColors(COBALT, LEMON, cur.col);
    lemonMat.color.lerpColors(LEMON, COBALT, cur.col);

    // cartes réseaux sociaux : écartées au fil du scroll dans leur section
    const r = socialEl.getBoundingClientRect();
    const p = clamp01((H * 0.5 - r.top) / Math.max(r.height, 1));
    cards.group.position.set(rig.position.x, rig.position.y + 0.3 * cur.s, 0);
    cards.update({
      t, ui: cur.ui, spread: 0.8 * (0.92 + 0.2 * smooth(p)), narrow: mobile,
      mouse, yaw: reduce ? 0 : (p - 0.5) * 0.7 + mouse.x * 0.15, reduce,
    });

    // ombre / ondes
    shadow.scale.setScalar(1 - bob * 2.2);
    ripples.forEach((m, i) => {
      const p = ((t * 0.28 + i / 3) % 1);
      const r = 0.45 + p * 2.6;
      m.scale.setScalar(r);
      m.material.opacity = (1 - p) * 0.9 * (reduce ? 0.5 : 1) * introE;
      m.material.color.lerpColors(LEMON, COBALT, cur.col * 0);
    });

    // essaim
    const vis = cur.sw;
    for (let i = 0; i < N; i++) {
      const it = items[i];
      const local = smooth(clamp01((vis - it.delay * 0.6) / 0.5));
      const s = it.s * local * 1.6;
      tmp.position.set(it.fx * halfW, it.fy * halfH + Math.sin(t * 1.1 + it.ph) * 0.12 * (reduce ? 0 : 1), it.z);
      tmp.rotation.set(0.15, it.ry + (reduce ? 0 : t * 0.4) + spin * 0.5, 0.12 * Math.sin(it.ph));
      tmp.scale.setScalar(Math.max(s, 0.0001));
      tmp.updateMatrix();
      swarm.setMatrixAt(i, tmp.matrix);
    }
    swarm.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  if (reduce) { /* un rendu par défilement suffit, mais on garde la boucle légère */ }
  frame();

  
}
