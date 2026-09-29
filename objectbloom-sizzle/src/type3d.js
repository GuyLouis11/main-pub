// Typography that lives inside the 3D scene: per-letter planes (so every
// glyph can be choreographed on the beat) and wrap-around text rings.
import * as THREE from 'three';
import { BAR, BEAT, at, bar, beatInfo, clamp, ease, hash, range } from './timeline.js';

const DISPLAY = '800 220px Manrope, sans-serif';

function glyphTexture(ch, { font = DISPLAY, outline = false } = {}) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = font;
  const w = Math.max(40, Math.ceil(g.measureText(ch).width + 40));
  c.width = w; c.height = 280;
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (outline) { g.lineWidth = 6; g.strokeStyle = '#fff'; g.strokeText(ch, w / 2, 150); }
  else { g.fillStyle = '#fff'; g.fillText(ch, w / 2, 150); }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, aspect: w / 280 };
}

// A word built from individually animatable letter planes.
class Word3D extends THREE.Group {
  constructor(text, { height = 1, color = '#ffffff', intensity = 1.5, outline = false, spacing = 0.02 } = {}) {
    super();
    this.letters = [];
    let x = 0;
    const items = [...text].map((ch) => {
      if (ch === ' ') return { ch, w: height * 0.3 };
      const { tex, aspect } = glyphTexture(ch, { outline });
      return { ch, tex, w: height * aspect * 0.78 };
    });
    const total = items.reduce((a, it) => a + it.w + spacing * height, 0);
    x = -total / 2;
    for (const it of items) {
      if (it.tex) {
        const mat = new THREE.MeshBasicMaterial({
          map: it.tex, color: new THREE.Color(color).multiplyScalar(intensity), transparent: true,
          depthWrite: false, side: THREE.DoubleSide, toneMapped: false, blending: THREE.AdditiveBlending,
        });
        const w = height * (it.tex.image.width / 280);
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, height), mat);
        mesh.position.x = x + it.w / 2;
        mesh.userData.home = mesh.position.clone();
        mesh.userData.seed = hash(this.letters.length * 3.3 + text.length);
        this.add(mesh);
        this.letters.push(mesh);
      }
      x += it.w + spacing * height;
    }
    this.baseColor = new THREE.Color(color).multiplyScalar(intensity);
  }
  setOpacity(o) { for (const l of this.letters) l.material.opacity = o; this.visible = o > 0.001; }
}

function textRing(text, { radius = 20, height = 2.2, color = '#b9ffe5', repeat = 3, intensity = 1.2 }) {
  const c = document.createElement('canvas');
  c.width = 4096; c.height = 256;
  const g = c.getContext('2d');
  g.font = '800 170px Manrope, sans-serif';
  g.textBaseline = 'middle';
  const unit = text + '   ';
  let x = 0;
  const w = g.measureText(unit).width;
  g.fillStyle = '#fff';
  while (x < c.width) { g.fillText(unit, x, 132); x += w; }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(repeat, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex, color: new THREE.Color(color).multiplyScalar(intensity), transparent: true, depthWrite: false,
    side: THREE.FrontSide, toneMapped: false, blending: THREE.AdditiveBlending,
  });
  const geo = new THREE.CylinderGeometry(radius, radius, height, 128, 1, true);
  const group = new THREE.Group();
  const outside = new THREE.Mesh(geo, mat);
  const texIn = tex.clone(); texIn.repeat.set(-repeat, 1); texIn.needsUpdate = true;
  const matIn = mat.clone(); matIn.map = texIn; matIn.side = THREE.BackSide;
  const inside = new THREE.Mesh(geo, matIn);
  group.add(outside, inside);
  group.material = { set opacity(o) { mat.opacity = o; matIn.opacity = o; } };
  return group;
}

export function createType3D(scene) {
  const root = new THREE.Group();
  scene.add(root);

  // tray: giant "BLOOM" standing at the far end of the knolled tray, letters hop on the beat
  const trayWord = new Word3D('BLOOM', { height: 9, color: '#f4f4ef', intensity: 0.75, outline: true });
  trayWord.position.set(0, 5.2, 21);
  trayWord.rotation.y = Math.PI;
  // helix: letters strung along the axis, the camera flies through them
  const helixWords = [...'OBJECTBLOOM'].map((ch, i) => {
    const w = new Word3D(ch, { height: 3.2, color: i < 6 ? '#b9ffe5' : '#ff3347', intensity: 1.1, outline: i % 2 === 1 });
    w.position.set(0, 3.1, -24 + i * 4.8);
    root.add(w);
    return w;
  });
  // rings / bloom: wrap-around type
  const ringA = textRing('OBJECT BLOOM  ·  930 DETAILS  ·  ONE CAR  ·  EVERY LAYER', { radius: 21, height: 2.4, repeat: 2 });
  const ringB = textRing('TAKE IT APART  ·  LOOK INSIDE  ·  MAKE IT YOURS', { radius: 24, height: 1.6, color: '#ff3347', repeat: 2, intensity: 1.4 });
  ringA.position.y = 1.4; ringB.position.y = 6.5;
  // reveal: huge outline "458" behind the driving car
  const heroWord = new Word3D('458', { height: 3.2, color: '#f4f4ef', intensity: 0.9, outline: true, spacing: 0.08 });
  heroWord.position.set(-4.4, 2.1, 5.4);

  root.add(trayWord, ringA, ringB, heroWord);

  function update(t, camera) {
    const b = t / BAR;
    const bi = beatInfo(t);

    // --- 458 behind the car (reveal bars 4-6), letters drop in on beats
    const heroOn = b >= 4 && b < 6.5;
    heroWord.visible = heroOn;
    if (heroOn) {
      heroWord.lookAt(camera.position.x, heroWord.position.y, camera.position.z);
      heroWord.letters.forEach((l, i) => {
        const k = ease.outBack(range(t, at(4, i * 0.5), at(4, i * 0.5) + BEAT * 0.6));
        l.position.y = l.userData.home.y + (1 - k) * 4;
        l.material.opacity = k * (1 - range(t, at(6, 0), at(6, 2)));
        l.scale.setScalar(1 + Math.exp(-bi.frac * 8) * 0.04);
      });
    }

    // --- BLOOM on the tray (bars 16-18)
    const trayOn = b >= 16 && b < 18.2;
    trayWord.visible = trayOn;
    if (trayOn) {
      const inK = ease.outExpo(range(t, bar(16), at(16, 1)));
      trayWord.letters.forEach((l, i) => {
        const hop = bi.index % 5 === i ? Math.sin(Math.PI * clamp(bi.frac * 1.6)) : 0;
        l.position.y = l.userData.home.y + hop * 2.2 - (1 - inK) * 12;
        l.rotation.y = (bi.index % 5 === i ? ease.outCubic(bi.frac) : 0) * Math.PI * 2;
        l.material.opacity = inK * (1 - range(t, at(17, 3), bar(18)));
      });
    }

    // --- rings (bars 18-20, return faint in bloom 22-24)
    const ringsOn = b >= 18 && b < 20;
    ringA.visible = ringB.visible = ringsOn;
    if (ringsOn) {
      const k = ease.outCubic(range(t, bar(18), at(18, 2))) * (1 - range(t, at(19, 3), bar(20)));
      ringA.rotation.y = t * 0.25; ringB.rotation.y = -t * 0.18;
      const pulse = 0.75 + Math.exp(-bi.frac * 6) * 0.5;
      ringA.material.opacity = k * pulse; ringB.material.opacity = k * pulse * 0.8;
    }

    // --- helix fly-through letters (bars 20-22)
    const helixOn = b >= 20 && b < 22;
    helixWords.forEach((w, i) => {
      w.visible = helixOn;
      if (!helixOn) return;
      const pop = ease.outBack(range(t, bar(20) + i * BEAT * 0.12, bar(20) + i * BEAT * 0.12 + BEAT * 0.8));
      w.scale.setScalar(Math.max(0.001, pop) * (1 + Math.exp(-bi.frac * 7) * 0.15));
      w.lookAt(camera.position);
      w.rotateZ(Math.sin(t * 2 + i) * 0.2);
      const near = range(w.position.distanceTo(camera.position), 2.5, 7);
      w.setOpacity(0.95 * near * (1 - range(t, at(21, 3), bar(22))));
    });
  }

  return { update };
}
