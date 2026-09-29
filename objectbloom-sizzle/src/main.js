// Boot + player + export API.
//   index.html                 interactive player (click to play, with sound)
//   index.html?t=30            start at 30 s
//   index.html?render=1        headless export mode (driven by scripts/render.mjs)
import { DURATION, BAR } from './timeline.js';
import { renderSoundtrack, audioBufferToWav } from './music.js';
import { createStage, clip } from './stage.js';
import { loadAssembly } from './parts.js';
import { prepareChoreo } from './choreo.js';
import { createHud } from './hud.js';
import { createType3D } from './type3d.js';
import { createShow } from './show.js';

const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
const W = Number(params.get('w')) || 1920;
const H = Number(params.get('h')) || 1080;
const $ = (id) => document.getElementById(id);
const status = (msg) => { const el = $('status'); if (el) el.textContent = msg; };

async function loadFonts() {
  const faces = [
    new FontFace('Manrope', 'url(./assets/fonts/manrope-latin-800-normal.woff2)', { weight: '800' }),
    new FontFace('Manrope', 'url(./assets/fonts/manrope-latin-500-normal.woff2)', { weight: '500' }),
    new FontFace('JetBrains Mono', 'url(./assets/fonts/jetbrains-mono-latin-400-normal.woff2)', { weight: '400' }),
    new FontFace('JetBrains Mono', 'url(./assets/fonts/jetbrains-mono-latin-700-normal.woff2)', { weight: '700' }),
  ];
  await Promise.all(faces.map((f) => f.load().then(() => document.fonts.add(f))));
}

async function boot() {
  status('Loading type…');
  await loadFonts();

  const canvas = $('stage');
  const stage = createStage({ width: W, height: H, canvas });

  status('Loading the 458…');
  const assembly = await loadAssembly({
    modelUrl: './assets/source/models/ferrari.glb',
    dracoPath: './assets/source/draco/gltf/',
    clipSolid: clip.solid, clipFx: clip.fx,
    onProgress: (k) => status(`Loading the 458 · ${Math.round(k * 100)}%`),
  });
  for (const b of assembly.solidBatches) stage.scene.add(b);
  stage.scene.add(assembly.xray, assembly.holo);
  prepareChoreo(assembly.parts, assembly.wheelCenters);

  const hud = createHud(W, H);
  const type3d = createType3D(stage.scene);
  const show = createShow({ stage, assembly, hud, type3d });

  status('Composing the soundtrack…');
  const audio = await renderSoundtrack(48000, (k) => status(`Composing the soundtrack · ${Math.round(k * 100)}%`));

  // warm up every shader path once so the first real frames don't hitch
  for (const t of [1, 9, 10.5, 25, 33, 37, 41, 44, 47, 53, 57]) show.update(t);

  window.SIZZLE = {
    duration: DURATION,
    details: assembly.parts.length,
    debug: { stage, assembly, show },
    frame(t, quality = 0.92) { show.update(t); return canvas.toDataURL('image/jpeg', quality); },
    png(t) { show.update(t); return canvas.toDataURL('image/png'); },
    wav() {
      const bytes = new Uint8Array(audioBufferToWav(audio));
      let s = '';
      for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return btoa(s);
    },
  };
  document.body.dataset.ready = 'true';
  if (RENDER) return;
  startPlayer(show, audio);
}

function startPlayer(show, audio) {
  const overlay = $('overlay');
  status('');
  overlay.classList.add('ready');
  let actx = null, src = null, startAt = 0, offset = Number(params.get('t')) || 0, playing = false;
  show.update(offset);

  const now = () => (playing ? actx.currentTime - startAt : offset);
  function play(from) {
    actx ??= new AudioContext();
    src?.stop();
    src = actx.createBufferSource();
    src.buffer = audio;
    src.connect(actx.destination);
    offset = Math.max(0, Math.min(DURATION, from));
    startAt = actx.currentTime - offset;
    src.start(0, offset);
    playing = true;
    overlay.classList.add('hidden');
  }
  function pause() { if (!playing) return; offset = now(); src.stop(); playing = false; }

  $('play').addEventListener('click', () => play(offset >= DURATION ? 0 : offset));
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(offset >= DURATION ? 0 : offset); }
    if (e.code === 'ArrowRight') play(now() + BAR);
    if (e.code === 'ArrowLeft') play(now() - BAR);
    if (e.key === 'r') play(0);
    if (e.key === 'f') document.documentElement.requestFullscreen?.();
  });

  function loop() {
    const t = now();
    if (playing && t >= DURATION) { pause(); offset = DURATION; overlay.classList.remove('hidden'); $('play').textContent = 'Replay'; }
    show.update(Math.min(t, DURATION - 1e-3));
    requestAnimationFrame(loop);
  }
  loop();
}

boot().catch((err) => {
  console.error(err);
  status('Could not start: ' + err.message);
  document.body.dataset.error = err.message;
});

