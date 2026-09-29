// Renderer, studio, environment FX and the post-processing chain.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { hash } from './timeline.js';

export const BRAND = {
  studio: new THREE.Color('#171c20'),
  ink: '#233432',
  cream: '#f4f4ef',
  primary: '#26483e',
  focus: '#178378',
  mint: '#b9ffe5',
  scan: new THREE.Color(0.14, 0.72, 0.53),
};

// World clip planes for the x-ray wipe along the car's length (z).
export const clip = {
  solid: new THREE.Plane(new THREE.Vector3(0, 0, 1), 1e4), // keeps z > s (not yet scanned)
  fx: new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e4),   // keeps z < s (scanned)
  set(s) {
    if (s === null) { this.solid.constant = 1e4; this.fx.constant = 1e4; return; }
    this.solid.constant = -s; // z - s >= 0
    this.fx.constant = s;     // -z + s >= 0
  },
};

// ------------------------------------------------------------------ floor
function makeFloor() {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: BRAND.scan.clone() },
      uBase: { value: new THREE.Color('#0d1114') },
      uGrid: { value: 0.6 },
      uScroll: { value: 0 },
      uPulse: { value: 0 },
      uPulseR: { value: 0 },
      uShadow: { value: 1 },
      uGlow: { value: 0.4 },
      uGlowColor: { value: new THREE.Color('#ff2233') },
      uFadeR: { value: 26 },
    },
    vertexShader: /* glsl */`
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform vec3 uBase; uniform float uGrid; uniform float uScroll; uniform float uPulse;
      uniform float uPulseR; uniform float uShadow; uniform float uGlow; uniform vec3 uGlowColor; uniform float uFadeR;
      varying vec3 vW;
      float grid(vec2 q, float w) { vec2 fw = fwidth(q); vec2 d = abs(fract(q - 0.5) - 0.5) / (fw * w); float aa = 1.0 - smoothstep(0.08, 0.35, max(fw.x, fw.y)); return (1.0 - min(min(d.x, d.y), 1.0)) * aa; }
      void main() {
        vec2 p = vW.xz;
        vec2 q = vec2(p.x, p.y + uScroll);
        float major = grid(q, 1.2);
        float minor = grid(q * 4.0, 1.0) * 0.35;
        vec2 c = p - vec2(0.0, 0.17);
        float d = length(c);
        float fade = exp(-pow(d / uFadeR, 2.0) * 3.0);
        float ring = exp(-pow((d - uPulseR) * 2.2, 2.0)) * uPulse;
        float shadow = smoothstep(1.0, 0.0, length(c * vec2(0.85, 0.42))) * uShadow;
        float glow = exp(-dot(c * vec2(0.55, 0.3), c * vec2(0.55, 0.3)) * 2.0) * uGlow;
        vec3 col = uBase * (0.6 + 0.4 * fade);
        col += uColor * (major + minor) * uGrid * fade * 0.55;
        col += uColor * ring * fade * 1.6;
        col += uGlowColor * glow * 0.35;
        col *= 1.0 - shadow * 0.85;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.03;
  return mesh;
}

// ------------------------------------------------------------------ dust
function makeDust(count = 2600) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3), seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (hash(i * 1.3) - 0.5) * 70;
    pos[i * 3 + 1] = hash(i * 2.7) * 18;
    pos[i * 3 + 2] = (hash(i * 5.1) - 0.5) * 70;
    seed[i] = hash(i * 9.7);
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0.6 }, uFlow: { value: 0 }, uColor: { value: new THREE.Color('#b9ffe5') } },
    vertexShader: /* glsl */`
      attribute float seed; uniform float uTime; uniform float uFlow; varying float vA;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.2 + seed * 40.0) * 0.8;
        p.y = mod(p.y + uTime * (0.08 + seed * 0.12), 18.0);
        p.z = mod(p.z + 35.0 + uFlow * (0.6 + seed), 70.0) - 35.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(5.0, (0.8 + seed * 1.6) * (140.0 / -mv.z));
        vA = (0.35 + 0.65 * fract(seed * 13.0 + uTime * 0.5)) * smoothstep(2.5, 6.0, -mv.z);
      }`,
    fragmentShader: /* glsl */`
      uniform float uOpacity; uniform vec3 uColor; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(uColor * (1.0 - d * 2.0) * vA * uOpacity, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  return pts;
}

// ------------------------------------------------------------------ light streaks (speed)
function makeStreaks(count = 220) {
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(1, 1, 1), transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
    depthWrite: false, toneMapped: false,
  });
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, count);
  mesh.frustumCulled = false;
  mesh.userData.seeds = Array.from({ length: count }, (_, i) => ({
    x: (hash(i * 3.1) < 0.5 ? -1 : 1) * (2.2 + hash(i * 7.7) * 16),
    y: 0.05 + Math.pow(hash(i * 1.9), 1.6) * 9,
    z: hash(i * 4.3) * 160,
    len: 1.5 + hash(i * 8.8) * 7,
    thick: 0.01 + hash(i * 6.6) * 0.025,
    hue: hash(i * 2.2),
  }));
  const colors = new Float32Array(count * 3);
  const teal = new THREE.Color('#5fffd0'), red = new THREE.Color('#ff2a3a'), white = new THREE.Color('#ffffff');
  mesh.userData.seeds.forEach((s, i) => {
    const c = s.hue < 0.55 ? white : s.hue < 0.85 ? teal : red;
    colors.set([c.r * 3, c.g * 3, c.b * 3], i * 3);
  });
  mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  return mesh;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
export function updateStreaks(mesh, t, speed, intensity) {
  mesh.material.opacity = intensity;
  mesh.visible = intensity > 0.001;
  if (!mesh.visible) return;
  mesh.userData.seeds.forEach((s, i) => {
    const z = ((s.z + t * speed) % 160 + 160) % 160 - 80;
    _p.set(s.x, s.y, z);
    _s.set(s.thick, s.thick, s.len * (0.4 + Math.min(1.6, speed / 40)));
    _m.compose(_p, _q, _s);
    mesh.setMatrixAt(i, _m);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

// ------------------------------------------------------------------ scan sheet
function makeScanSheet() {
  const m = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 0 }, uTime: { value: 0 }, uColor: { value: new THREE.Color('#7dffd6') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: /* glsl */`
      uniform float uOpacity; uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
      void main() {
        vec2 e = min(vUv, 1.0 - vUv);
        float edge = smoothstep(0.02, 0.0, min(e.x, e.y));
        float gridl = step(0.96, fract(vUv.x * 24.0)) + step(0.96, fract(vUv.y * 16.0 + uTime));
        float fill = 0.08 + 0.1 * gridl;
        gl_FragColor = vec4(uColor * (fill + edge * 1.5) * uOpacity * 2.0, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.6), m);
  mesh.position.set(0, 0.7, 0);
  return mesh;
}

// ------------------------------------------------------------------ final pass (glitch, chroma, grain, HUD comp)
const FinalShader = {
  uniforms: {
    tDiffuse: { value: null }, tHud: { value: null },
    uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1920, 1080) },
    uChroma: { value: 0.003 }, uGrain: { value: 0.025 }, uVignette: { value: 0.7 },
    uFlash: { value: 0 }, uFlashColor: { value: new THREE.Color(1, 1, 1) }, uGlitch: { value: 0 }, uInvert: { value: 0 },
    uLetterbox: { value: 0 }, uSceneFade: { value: 1 }, uFade: { value: 1 }, uHudChroma: { value: 0 },
    uShake: { value: new THREE.Vector2() }, uZoom: { value: 1 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform sampler2D tHud;
    uniform float uTime; uniform vec2 uRes; uniform float uChroma; uniform float uGrain; uniform float uVignette;
    uniform float uFlash; uniform vec3 uFlashColor; uniform float uGlitch; uniform float uInvert; uniform float uLetterbox;
    uniform float uSceneFade; uniform float uFade; uniform float uHudChroma; uniform vec2 uShake; uniform float uZoom;
    varying vec2 vUv;
    float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main() {
      vec2 uv = (vUv - 0.5) / uZoom + 0.5 + uShake;
      float frame = floor(uTime * 24.0);
      if (uGlitch > 0.0) {
        float slice = floor(uv.y * 28.0);
        float r = h21(vec2(slice, frame));
        if (r < uGlitch * 0.55) uv.x += (h21(vec2(slice, frame + 3.0)) - 0.5) * 0.22 * uGlitch;
        float blk = step(0.93 - uGlitch * 0.1, h21(floor(uv * vec2(12.0, 7.0)) + frame));
        uv += blk * (vec2(h21(vec2(frame, 1.0)), h21(vec2(frame, 2.0))) - 0.5) * 0.05 * uGlitch;
      }
      vec2 dir = uv - 0.5;
      float d = length(dir);
      vec2 off = dir * uChroma * (0.4 + d * 2.0);
      vec3 col;
      col.r = texture2D(tDiffuse, uv + off).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - off).b;
      col *= mix(1.0, smoothstep(1.05, 0.2, d), uVignette);
      col *= uSceneFade;
      col = mix(col, vec3(1.0) - col, uInvert);
      col += uFlashColor * uFlash;
      vec2 hoff = vec2(uHudChroma, 0.0);
      vec4 hud = texture2D(tHud, vUv);
      float hr = texture2D(tHud, vUv + hoff).r, hb = texture2D(tHud, vUv - hoff).b;
      vec3 hudCol = vec3(mix(hud.r, hr, step(0.0001, uHudChroma)), hud.g, mix(hud.b, hb, step(0.0001, uHudChroma)));
      col = col * (1.0 - hud.a) + hudCol * hud.a;
      col += (h21(vUv * uRes + fract(uTime) * 91.0) - 0.5) * uGrain;
      float lb = step(0.5 - uLetterbox, abs(vUv.y - 0.5));
      col = mix(col, vec3(0.0), lb);
      gl_FragColor = vec4(col * uFade, 1.0);
    }`,
};

// ------------------------------------------------------------------ stage
export function createStage({ width, height, canvas }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.background = BRAND.studio.clone();
  scene.fog = new THREE.FogExp2(BRAND.studio.clone(), 0.012);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environmentIntensity = 1;

  const camera = new THREE.PerspectiveCamera(36, width / height, 0.05, 500);

  // lights
  const key = new THREE.DirectionalLight('#fff8eb', 2.2); key.position.set(6, 8, -4);
  const fill = new THREE.DirectionalLight('#cadfff', 1.4); fill.position.set(-5, 3, 4);
  const hemi = new THREE.HemisphereLight('#c5d4df', '#1b2320', 0.6);
  const rimA = new THREE.SpotLight('#46ffc4', 0, 30, 0.6, 0.6, 1.2); rimA.position.set(-6, 3, 6);
  const rimB = new THREE.SpotLight('#ff2a3a', 0, 30, 0.6, 0.6, 1.2); rimB.position.set(6, 3, 6);
  const sweep = new THREE.PointLight('#ffffff', 0, 6, 1.6);
  const head = new THREE.SpotLight('#fff4dc', 0, 30, 0.45, 0.5, 1.4); head.position.set(0, 0.6, -2.2);
  head.target.position.set(0, 0, -12);
  for (const l of [rimA, rimB]) l.target.position.set(0, 0.5, 0);
  scene.add(key, fill, hemi, rimA, rimB, sweep, head, head.target, rimA.target, rimB.target);

  const floor = makeFloor();
  const dust = makeDust();
  const streaks = makeStreaks();
  const scanSheet = makeScanSheet();
  scene.add(floor, dust, streaks, scanSheet);

  // post
  const target = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(1);
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  // clamp HDR fireflies (clearcoat/glass speculars) so bloom stays stable
  composer.addPass(new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uMax: { value: 6 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uMax; varying vec2 vUv;
      void main(){ vec4 c = texture2D(tDiffuse, vUv); c.rgb = clamp(c.rgb, 0.0, uMax); if (any(isnan(c.rgb))) c.rgb = vec3(0.0); gl_FragColor = c; }`,
  }));
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.35, 0.5, 0.95);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const final = new ShaderPass(FinalShader);
  final.uniforms.uRes.value.set(width, height);
  composer.addPass(final);

  function setSize(w, h) {
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    final.uniforms.uRes.value.set(w, h);
  }

  return {
    renderer, scene, camera, composer, bloom, final, floor, dust, streaks, scanSheet,
    lights: { key, fill, hemi, rimA, rimB, sweep, head },
    setSize,
  };
}
