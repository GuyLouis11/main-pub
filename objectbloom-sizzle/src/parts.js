// Loads the supplied 458 model and rebuilds the 930-detail assembly exactly
// the way the 458 Parts Explorer does (assets/source/assets/explorer.js):
//   * every mesh is split into its connected source surfaces (882 details);
//     brake rotors stay one detail each,
//   * each detail is classified into an assembly (body, glass, wheels, cabin,
//     steering, lighting, details) with the explorer's labels and offsets,
//   * the 48-piece illustrative V8 is added behind the cabin,
//   * geometry is centred per detail and drawn through BatchedMesh.
// Car frame (from the source model): x = left/right, y = up, z = front(-)/rear(+).

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const SYSTEM_LABELS = {
  body: 'Body panels',
  engine: 'Engine & drivetrain',
  glass: 'Glazing',
  wheels: 'Wheels & brakes',
  cabin: 'Cabin & trim',
  steering: 'Steering controls',
  lighting: 'Lighting',
  details: 'Exterior fittings',
};

// ------------------------------------------------------------ splitting
// Union-find over welded vertex positions -> connected surfaces (explorer `rf`).
function connectedSurfaces(pos, index) {
  const count = pos.length / 3;
  const parent = Int32Array.from({ length: count }, (_, i) => i);
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  const union = (a, b) => { parent[find(a)] = find(b); };
  const weld = new Map();
  for (let i = 0; i < count; i++) {
    const key = `${Math.round(pos[i * 3] * 1e5)},${Math.round(pos[i * 3 + 1] * 1e5)},${Math.round(pos[i * 3 + 2] * 1e5)}`;
    if (weld.has(key)) union(i, weld.get(key)); else weld.set(key, i);
  }
  for (let i = 0; i < index.length; i += 3) { union(index[i], index[i + 1]); union(index[i], index[i + 2]); }
  const groups = new Map();
  for (let i = 0; i < index.length; i += 3) {
    const root = find(index[i]);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(index[i], index[i + 1], index[i + 2]);
  }
  return [...groups.values()];
}

// Compact sub-geometry for one surface (explorer `Jx`).
function subGeometry(src, tris) {
  const remap = new Map(), idx = [];
  for (const v of tris) { if (!remap.has(v)) remap.set(v, remap.size); idx.push(remap.get(v)); }
  const g = new THREE.BufferGeometry();
  for (const name of ['position', 'normal']) {
    const a = src.getAttribute(name);
    if (!a) continue;
    const out = new Float32Array(remap.size * 3);
    for (const [from, to] of remap) { out[to * 3] = a.getX(from); out[to * 3 + 1] = a.getY(from); out[to * 3 + 2] = a.getZ(from); }
    g.setAttribute(name, new THREE.BufferAttribute(out, 3));
  }
  g.setIndex(idx);
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  g.computeBoundingBox();
  return g;
}

// ------------------------------------------------------------ classification (explorer `af`)
function classify(source, center, size, wheel, rank) {
  const [x, y, z] = center, [sx, sy, sz] = size;
  const side = x < 0 ? 'Left' : 'Right';
  let system = 'details', label = 'Exterior fitting';
  if (wheel) {
    system = 'wheels';
    label = source === 'tire' ? 'Tire' : source === 'brake' ? 'Brake rotor' : source.startsWith('rim') ? 'Alloy wheel face'
      : source === 'nuts' ? 'Wheel fastener surface' : source === 'centre' ? 'Wheel center cap' : rank === 0 ? 'Wheel barrel' : 'Wheel detail';
    label = `${wheel} ${label.toLowerCase()}`;
  } else if (source.startsWith('steering') || source === 'carbon fibre') {
    system = 'steering';
    label = {
      steering_column: 'Steering column detail', steering_metal: 'Shift-paddle surface', steering_leather: 'Steering rim leather',
      steering_carbon: 'Steering carbon trim', steering_centre: 'Steering center badge', steering_red_lights: 'Steering indicator detail',
      steering_trim: 'Steering control surround',
    }[source] || 'Steering trim';
  } else if (source === 'interior_dark' && sz > 4) {
    system = 'body'; label = 'Underbody and inner shell';
  } else if (source === 'body') {
    system = 'body';
    const ax = Math.abs(x);
    label = sz > 1.7 && y < 0.4 ? `${side} side sill`
      : ax > 0.95 ? `${side} outer body detail`
      : ax > 0.7 && z > 1 ? `${side} rear quarter panel`
      : ax > 0.7 && z < -0.7 ? `${side} front fender`
      : ax > 0.7 && sy > 0.5 ? `${side} door panel`
      : sx > 1.8 && z < -1.4 ? 'Front bumper'
      : sx > 1.8 && z > 1.5 ? 'Rear bumper'
      : sx > 1 && z < -1 ? 'Front luggage-compartment lid'
      : sx > 1 && z > 1.4 ? 'Rear deck panel'
      : sx > 1 && y > 1 && z > 0 ? 'Upper rear body panel'
      : sx > 1 && y > 0.9 ? 'Windscreen frame'
      : sz < 0.15 && ax > 0.8 ? `${side} door-handle detail`
      : `${side} body-panel detail`;
  } else if (source === 'glass' && y > 0.9 && z < 1.3) {
    system = 'glass'; label = z < 0 ? 'Windscreen' : 'Rear cabin glazing';
  } else if (/^(lights|leds|brakes)/.test(source) || (source === 'glass' && (z > 1.5 || z < -1.3))) {
    system = 'lighting';
    label = `${side} ${z > 0 ? 'rear lamp' : 'headlamp'} ${source === 'glass' ? 'lens' : source === 'leds' ? 'LED detail' : 'surface'}`;
  } else if (source === 'wipers') {
    system = 'glass'; label = 'Windscreen wiper component';
  } else if (source === 'leather' || source === 'trim' || source === 'carpet' || source.startsWith('carbon') || source === 'blue'
    || (source.startsWith('interior') && z > -0.95 && z < 0.75 && Math.abs(x) < 0.8)) {
    system = 'cabin';
    label = source === 'carpet' ? 'Cabin carpet' : source === 'blue' ? 'Instrument display' : source.startsWith('carbon') ? 'Carbon cabin trim'
      : source === 'trim' ? 'Upholstery accent' : 'Cabin trim element';
    if (source === 'leather') {
      label = sx > 1 ? 'Dashboard upholstery' : sy > 0.7 ? `${side} seat-back upholstery`
        : sz > 0.45 && y < 0.45 ? `${side} seat-base upholstery` : Math.abs(x) > 0.65 ? `${side} door upholstery` : 'Console upholstery';
    }
  } else if (source === 'grills') label = `${side} ${z < 0 ? 'front' : 'rear'} grille`;
  else if (source === 'chrome' && y < 0.5 && z > 2) label = 'Exhaust outlet trim';
  else if (source === 'yellow_trim') label = 'Exterior badge';
  else if (source === 'chrome') label = 'Chrome finish detail';
  else if (source.startsWith('interior') || source === 'plastic_gray') label = `${z < -0.9 ? 'Front' : z > 0.9 ? 'Rear' : 'Side'} liner / trim surface`;
  else if (source === 'metal') label = 'Metal fitting';
  return { system, label, source };
}

// Explorer `lf`: illustrative separation offsets per assembly.
function explodeOffset(p) {
  const [x, y, z] = p.center;
  const s = x < 0 ? -1 : 1;
  const small = Math.max(...p.size) < 0.2;
  switch (p.system) {
    case 'wheels': {
      const k = p.source === 'brake' ? 0.6 : p.source === 'wheel' ? 1 : p.source.startsWith('rim') ? 1.5
        : p.source === 'tire' ? 2 : p.source === 'centre' ? 2.5 : 2.8;
      return [s * k, 0.12 + (small ? (y - 0.36) * 1.4 : 0), (z > 0 ? 0.45 : -0.45) + (small ? (z - (z > 0 ? 1.495 : -1.155)) * 1.4 : 0)];
    }
    case 'body':
      return p.label === 'Underbody and inner shell' ? [0, 0, 0]
        : [Math.abs(x) > 0.6 ? s * 1.1 : 0, y > 0.95 ? 1.85 : y > 0.65 ? 1.15 : 0.5, z > 1.5 ? 0.8 : z < -1.3 ? -0.8 : 0];
    case 'glass': return [x * 0.65, 2.65, z * 0.4];
    case 'cabin': return [x * 0.6, 0.65 + (y - 0.6) * 0.18, z * 0.3];
    case 'steering': return [-0.5, 1.55 + (y - 0.8) * 1.8, -0.45 + (z + 0.35) * 1.8];
    case 'lighting': return [s * 0.8, 0.35 + (small ? (y - 0.7) * 1.3 : 0), z > 0 ? 1.65 : -1.65];
    case 'engine': return [0, 1.8, 0];
    default: return [x * 0.85, 0.18 + Math.max(0, y - 0.6) * 0.5, z > 1 ? 1.05 : z < -1 ? -1.05 : z * 0.5];
  }
}

// ------------------------------------------------------------ illustrative V8 (explorer `of`)
function buildV8() {
  const out = [];
  const add = (label, geometry, pos, finish, rot = [0, 0, 0]) => {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot)));
    if (!geometry.index) geometry.setIndex(Array.from({ length: geometry.getAttribute('position').count }, (_, i) => i));
    geometry.deleteAttribute('uv');
    geometry.computeBoundingBox();
    const c = geometry.boundingBox.getCenter(new THREE.Vector3());
    geometry.translate(-c.x, -c.y, -c.z);
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    const size = geometry.boundingBox.getSize(new THREE.Vector3()).toArray();
    out.push({
      label, system: 'engine', source: 'engine_' + finish, geometry, finish,
      center: [pos[0] + c.x, pos[1] + c.y, pos[2] + 1.27 + c.z], size,
      location: 'Rear engine bay · illustrative V8',
    });
  };
  const box = (w, h, d, r = 0.016) => new RoundedBoxGeometry(w, h, d, 3, r);
  const cyl = (r, h) => new THREE.CylinderGeometry(r, r, h, 24, 1);
  add('V8 crankcase', box(0.49, 0.29, 0.75), [0, 0.38, 0], 'alloy');
  add('Oil sump', box(0.45, 0.09, 0.69), [0, 0.195, 0], 'dark');
  for (const s of [-1, 1]) {
    const side = s < 0 ? 'Left' : 'Right';
    add(`${side} cylinder bank`, box(0.22, 0.24, 0.76), [s * 0.25, 0.52, 0], 'alloy', [0, 0, -s * 0.48]);
    add(`${side} red cam cover`, box(0.25, 0.07, 0.81), [s * 0.29, 0.675, 0], 'red', [0, 0, -s * 0.22]);
    for (let i = 0; i < 4; i++) {
      const z = -0.27 + i * 0.18;
      add(`${side} ignition coil ${i + 1}`, box(0.075, 0.065, 0.092, 0.009), [s * 0.3, 0.735, z], 'dark');
      add(`${side} intake runner ${i + 1}`, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(s * 0.21, 0.57, z), new THREE.Vector3(s * 0.18, 0.75, z), new THREE.Vector3(s * 0.055, 0.8, z),
      ]), 16, 0.027, 10, false), [0, 0, 0], 'alloy');
      add(`${side} exhaust primary ${i + 1}`, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(s * 0.32, 0.46, z), new THREE.Vector3(s * 0.48, 0.4, z), new THREE.Vector3(s * 0.48, 0.31, 0.43),
      ]), 20, 0.025, 10, false), [0, 0, 0], 'steel');
    }
    for (let i = 0; i < 6; i++) add(`${side} cover fastener ${i + 1}`, cyl(0.013, 0.025), [s * 0.4, 0.708, -0.33 + i * 0.132], 'steel');
  }
  add('Intake plenum', box(0.2, 0.12, 0.63), [0, 0.82, 0], 'alloy');
  add('Throttle inlet', cyl(0.07, 0.14), [0, 0.83, -0.385], 'alloy', [Math.PI / 2, 0, 0]);
  add('Crankshaft pulley', cyl(0.092, 0.048), [0, 0.36, -0.41], 'dark', [Math.PI / 2, 0, 0]);
  add('Alternator housing', cyl(0.083, 0.17), [0.32, 0.34, -0.31], 'alloy', [Math.PI / 2, 0, 0]);
  add('Transmission bell housing', new THREE.CylinderGeometry(0.18, 0.24, 0.19, 32), [0, 0.38, 0.47], 'alloy', [Math.PI / 2, 0, 0]);
  add('Transmission casing', box(0.31, 0.25, 0.38), [0, 0.34, 0.73], 'alloy');
  return out;
}

// ------------------------------------------------------------ materials (explorer `Qx`, tuned for film)
export const PAINTS = [
  { name: 'Ember Red', hex: '#b0101c' },
  { name: 'Aurora Blue', hex: '#1a3f7a' },
  { name: 'Verdant Green', hex: '#1d5a4b' },
  { name: 'Alpine Silver', hex: '#c5cdd5' },
  { name: 'Obsidian Black', hex: '#11151c' },
];

function solidMaterial(p) {
  const src = p.materialSource;
  const m = new THREE.MeshPhysicalMaterial({
    color: src?.color?.clone() || new THREE.Color('#758480'), metalness: 0.1, roughness: 0.55, side: THREE.DoubleSide,
  });
  const s = p.source;
  if (p.system === 'engine') {
    m.color.set({ alloy: '#9da7ae', red: '#a3161c', dark: '#20272b', steel: '#bac3c8' }[p.finish]);
    m.metalness = p.finish === 'red' ? 0.35 : 0.82;
    m.roughness = p.finish === 'dark' ? 0.6 : 0.3;
    if (p.finish === 'red') { m.clearcoat = 1; m.clearcoatRoughness = 0.1; }
  } else if (s === 'body') {
    m.color.set(PAINTS[0].hex); m.metalness = 0.72; m.roughness = 0.23; m.clearcoat = 1; m.clearcoatRoughness = 0.06;
  } else if (s.startsWith('rim') || s === 'wheel') {
    m.color.set('#bfc6cc'); m.metalness = 0.92; m.roughness = 0.25;
  } else if (s === 'brake') {
    m.color.set('#7e8588'); m.metalness = 0.84; m.roughness = 0.46;
  } else if (/chrome|metal|nuts|centre/.test(s)) {
    m.color.set('#b0b8bd'); m.metalness = 0.94; m.roughness = s === 'chrome' ? 0.16 : 0.37;
  } else if (s === 'leather' || s === 'trim' || s === 'steering_leather') {
    m.color.set('#875636'); m.roughness = 0.8;
  } else if (s === 'tire' || s === 'carpet') {
    m.color.set('#171b1d'); m.roughness = 0.94; m.metalness = 0;
  } else if (s.includes('carbon')) {
    m.color.set('#303a3b'); m.roughness = 0.42; m.metalness = 0.4; m.clearcoat = 0.6;
  } else if (s.startsWith('interior') || s === 'plastic_gray') {
    m.color.set('#384442'); m.roughness = 0.63;
  }
  const glass = src?.name === 'Glass_Gray';
  if (glass) {
    m.color.set('#afc2c5'); m.transparent = true; m.opacity = 0.28; m.roughness = 0.05; m.metalness = 0.2; m.depthWrite = false;
    m.envMapIntensity = 2;
  }
  if (s === 'lights_red' || s === 'brakes') { m.color.set('#921820'); m.roughness = 0.26; m.emissive.set('#ff1a2a'); m.emissiveIntensity = 0; }
  if (s === 'leds') { m.color.set('#eee6c5'); m.emissive.set('#fff4d6'); m.emissiveIntensity = 0.15; }
  m.userData = { source: s, system: p.system, glass, baseEmissive: m.emissiveIntensity };
  return m;
}

// ------------------------------------------------------------ FX material (x-ray / contour hologram)
// Additive, depth-test off; per-detail tint/intensity comes from the batch colour.
export const fxUniforms = {
  uTime: { value: 0 },
  uScan: { value: -99 },     // z of the bright scan band
  uHeat: { value: -99 },     // z of the thermal scan (heat colouring toward +z... behind it)
};

function fxMaterial(style, clipPlane) {
  const m = new THREE.MeshLambertMaterial({
    color: 0xffffff, transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
  });
  m.clippingPlanes = [clipPlane];
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, fxUniforms, { uStyle: { value: style } });
    sh.vertexShader = 'varying vec3 obWorld;\nvarying vec3 obLocal;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      vec4 obP = vec4(transformed, 1.0);
      obLocal = transformed;
      #ifdef USE_BATCHING
        obP = batchingMatrix * obP;
      #endif
      obWorld = (modelMatrix * obP).xyz;`);
    sh.fragmentShader = `varying vec3 obWorld; varying vec3 obLocal;
      uniform float uTime; uniform float uScan; uniform float uHeat; uniform float uStyle;\n` + sh.fragmentShader.replace('#include <opaque_fragment>', `
      vec3 obN = normalize(normal);
      float obF = 1.0 - abs(dot(obN, normalize(vViewPosition)));
      float obRim = pow(obF, 2.0);
      vec3 obTint = diffuseColor.rgb;
      vec3 obCol;
      if (uStyle < 0.5) {
        float lines = 0.85 + 0.15 * sin(obWorld.y * 240.0 - uTime * 8.0);
        float heat = smoothstep(uHeat + 0.05, uHeat - 0.3, obWorld.z);
        vec3 hot = mix(vec3(1.0, 0.28, 0.08), vec3(1.0, 0.9, 0.45), obRim);
        obCol = mix(obTint, hot * length(obTint) * 0.8, heat * 0.85) * (0.06 + obRim * 1.4) * lines;
      } else {
        float c1 = abs(fract(obLocal.y * 28.0) - 0.5);
        float c2 = abs(fract((obLocal.x + obLocal.z) * 14.0) - 0.5);
        float lineA = smoothstep(0.08, 0.0, c1) + smoothstep(0.05, 0.0, c2) * 0.4;
        obCol = obTint * (0.03 + lineA * 0.9 + obRim * 0.55);
      }
      float band = exp(-pow((obWorld.z - uScan) * 7.0, 2.0));
      obCol += vec3(0.72, 1.0, 0.9) * band * (0.25 + obRim) * length(obTint) * 0.9;
      outgoingLight = obCol;
      #include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => 'ob-sizzle-fx-' + style;
  return m;
}

// ------------------------------------------------------------ assembly
export async function loadAssembly({ modelUrl, modelData, dracoPath, dracoType = 'wasm', clipSolid, clipFx, onProgress }) {
  const draco = new DRACOLoader().setDecoderPath(dracoPath).setDecoderConfig({ type: dracoType });
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const gltf = modelData ? await loader.parseAsync(modelData, '')
    : await loader.loadAsync(modelUrl, (e) => { if (e.total) onProgress?.(e.loaded / e.total); });
  draco.dispose();

  const parts = [];
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  root.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const source = mesh.name.replace(/_\d+$/, '').replace(/^carbon_fibre$/, 'carbon fibre');
    const geo = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    const pos = geo.getAttribute('position');
    const index = geo.index?.array || Uint32Array.from({ length: pos.count }, (_, i) => i);
    const surfaces = source === 'brake' ? [Array.from(index)] : connectedSurfaces(pos.array, index);
    surfaces.sort((a, b) => b.length - a.length);
    let n = mesh, wheel = '';
    while (n) {
      if (/^wheel_[fr][lr]$/.test(n.name)) {
        wheel = { wheel_fl: 'Front left', wheel_fr: 'Front right', wheel_rl: 'Rear left', wheel_rr: 'Rear right' }[n.name];
        break;
      }
      n = n.parent;
    }
    surfaces.forEach((tris, rank) => {
      const g = subGeometry(geo, tris);
      const c = g.boundingBox.getCenter(new THREE.Vector3());
      const size = g.boundingBox.getSize(new THREE.Vector3());
      g.translate(-c.x, -c.y, -c.z);
      g.computeBoundingBox(); g.computeBoundingSphere();
      parts.push({
        ...classify(source, c.toArray(), size.toArray(), wheel, rank),
        wheel, geometry: g, materialSource: mesh.material, center: c.toArray(), size: size.toArray(), rank,
      });
    });
    geo.dispose();
  });
  const carDetails = parts.length;
  parts.push(...buildV8());

  // labels, codes, offsets
  const seen = new Map();
  for (const p of parts) seen.set(p.label, (seen.get(p.label) || 0) + 1);
  const seq = new Map();
  parts.forEach((p, i) => {
    p.id = i;
    const k = (seq.get(p.label) || 0) + 1; seq.set(p.label, k);
    p.title = p.label + (seen.get(p.label) > 1 ? ` · ${String(k).padStart(2, '0')}` : '');
    p.code = String(i + 1).padStart(3, '0');
    p.home = new THREE.Vector3(...p.center);
    p.offset = new THREE.Vector3(...explodeOffset(p));
    p.maxSize = Math.max(0.005, ...p.size);
    p.radius = p.geometry.boundingSphere.radius;
  });

  // wheel centres (for spinning wheels while the car "drives")
  const wheelCenters = {};
  for (const w of ['Front left', 'Front right', 'Rear left', 'Rear right']) {
    const box = new THREE.Box3();
    for (const p of parts) if (p.wheel === w && p.source === 'tire') box.expandByPoint(p.home);
    wheelCenters[w] = box.isEmpty() ? null : box.getCenter(new THREE.Vector3());
  }

  // ---------------- batches: solid (per material group) + two FX batches (all details)
  const groups = new Map();
  for (const p of parts) {
    const key = `${p.source}|${p.system}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  const solidBatches = [], solidMaterials = [];
  const white = new THREE.Color(1, 1, 1);
  const identity = new THREE.Matrix4();
  for (const list of groups.values()) {
    const verts = list.reduce((a, p) => a + p.geometry.getAttribute('position').count, 0);
    const idx = list.reduce((a, p) => a + p.geometry.index.count, 0);
    const mat = solidMaterial(list[0]);
    mat.clippingPlanes = [clipSolid];
    const batch = new THREE.BatchedMesh(list.length, verts, idx, mat);
    batch.frustumCulled = false;
    batch.perObjectFrustumCulled = false;
    batch.sortObjects = mat.transparent;
    for (const p of list) {
      p.solidBatch = batch;
      p.solidId = batch.addInstance(batch.addGeometry(p.geometry));
      batch.setMatrixAt(p.solidId, identity.makeTranslation(p.home));
      batch.setColorAt(p.solidId, white);
    }
    if (mat.transparent) batch.renderOrder = 2;
    solidBatches.push(batch); solidMaterials.push(mat);
  }

  const totalVerts = parts.reduce((a, p) => a + p.geometry.getAttribute('position').count, 0);
  const totalIdx = parts.reduce((a, p) => a + p.geometry.index.count, 0);
  const makeFx = (style) => {
    const b = new THREE.BatchedMesh(parts.length, totalVerts, totalIdx, fxMaterial(style, clipFx));
    b.frustumCulled = false; b.perObjectFrustumCulled = false; b.sortObjects = false;
    b.renderOrder = 5;
    return b;
  };
  const xray = makeFx(0), holo = makeFx(1);
  // geometry ids are shared by both FX batches (same add order)
  for (const p of parts) {
    const gx = xray.addGeometry(p.geometry), gh = holo.addGeometry(p.geometry);
    p.xrayId = xray.addInstance(gx);
    p.holoId = holo.addInstance(gh);
    xray.setColorAt(p.xrayId, white); holo.setColorAt(p.holoId, white);
  }

  return { parts, carDetails, solidBatches, solidMaterials, xray, holo, wheelCenters };
}
