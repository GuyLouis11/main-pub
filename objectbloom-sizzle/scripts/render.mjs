// Frame-exact export: drives the page in headless Chromium, captures every
// frame at a fixed time step, renders the soundtrack offline and muxes MP4.
//
//   node scripts/render.mjs                         1920x1080 @ 30 fps -> out/objectbloom-sizzle.mp4
//   node scripts/render.mjs --workers 4             split the frames across 4 browsers
//   node scripts/render.mjs --fps 60 --out out/x.mp4
//   node scripts/render.mjs --width 960 --height 540
//   node scripts/render.mjs --from 30 --to 36       render a time range only
//   node scripts/render.mjs --stills [--times 1,9,33]   PNG stills -> out/stills/
//   node scripts/render.mjs --web                   also write a lighter web encode + poster
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';
import { startServer } from './serve.mjs';
import { launch } from './browser.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const width = Number(args.width) || 1920, height = Number(args.height) || 1080, fps = Number(args.fps) || 30;
const workers = Math.max(1, Number(args.workers) || 1);
const out = join(root, args.out || 'out/objectbloom-sizzle.mp4');
const tmp = join(root, 'out', '.segments');
mkdirSync(join(root, 'out'), { recursive: true });

const ffmpeg = (argv, stdin = 'ignore') => spawn(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-nostats', ...argv], { stdio: [stdin, 'ignore', 'inherit'] });
const done = (proc) => new Promise((resolve, reject) => proc.on('close', (c) => (c === 0 ? resolve() : reject(new Error('ffmpeg exited ' + c)))));

const server = await startServer(0);
const url = `http://127.0.0.1:${server.address().port}/index.html?render=1&w=${width}&h=${height}`;

async function openPage() {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.error('[page error]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('[console]', m.text()); });
  await page.goto(url);
  await page.waitForFunction(() => document.body.dataset.ready === 'true' || document.body.dataset.error, null, { timeout: 600000 });
  const err = await page.evaluate(() => document.body.dataset.error);
  if (err) throw new Error('page failed: ' + err);
  return { browser, page };
}

if (args.stills) {
  const { browser, page } = await openPage();
  const dir = join(root, 'out', 'stills');
  mkdirSync(dir, { recursive: true });
  const times = typeof args.times === 'string' ? args.times.split(',').map(Number)
    : [1.5, 4.2, 6.5, 8.2, 9.6, 13.2, 15.2, 17.2, 19.5, 20.5, 23.5, 27, 29.8, 30.3, 32, 34.3, 36.3, 38.9, 40.4, 42.5, 44.5, 46.5, 50.5, 53.4, 55.8, 59.5];
  for (const t of times) {
    const data = await page.evaluate((tt) => window.SIZZLE.png(tt), t);
    writeFileSync(join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`), Buffer.from(data.split(',')[1], 'base64'));
  }
  console.log(`wrote ${times.length} stills -> ${dir}`);
  await browser.close();
} else {
  const first = await openPage();
  const duration = await first.page.evaluate(() => window.SIZZLE.duration);
  console.log(`ready · ${await first.page.evaluate(() => window.SIZZLE.details)} details · ${duration.toFixed(2)} s · ${workers} worker(s)`);
  const from = Number(args.from) || 0, to = Math.min(duration, Number(args.to) || duration);
  const frames = Math.round((to - from) * fps);

  const wav = join(root, 'out', 'soundtrack.wav');
  writeFileSync(wav, Buffer.from(await first.page.evaluate(() => window.SIZZLE.wav()), 'base64'));

  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const per = Math.ceil(frames / workers);
  const t0 = Date.now();
  let rendered = 0;
  const pages = [first, ...(await Promise.all(Array.from({ length: workers - 1 }, openPage)))];

  await Promise.all(pages.map(async ({ page }, w) => {
    const f0 = w * per, f1 = Math.min(frames, f0 + per);
    if (f0 >= f1) return;
    const seg = join(tmp, `seg-${String(w).padStart(2, '0')}.mp4`);
    const ff = ffmpeg(['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', seg], 'pipe');
    for (let f = f0; f < f1; f++) {
      const data = await page.evaluate((tt) => window.SIZZLE.frame(tt, 0.95), from + f / fps);
      if (!ff.stdin.write(Buffer.from(data.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
      rendered++;
      if (rendered % 60 === 0) {
        const el = (Date.now() - t0) / 1000;
        console.log(`${rendered}/${frames} frames · ${(el / rendered).toFixed(2)} s/frame · eta ${Math.round((el / rendered) * (frames - rendered))} s`);
      }
    }
    ff.stdin.end();
    await done(ff);
  }));
  await Promise.all(pages.map(({ browser }) => browser.close()));

  // join segments + mux the soundtrack
  const list = join(tmp, 'list.txt');
  writeFileSync(list, pages.map((_, w) => `file 'seg-${String(w).padStart(2, '0')}.mp4'`).slice(0, Math.ceil(frames / per)).join('\n'));
  await done(ffmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-ss', String(from), '-t', String(to - from), '-i', wav,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 19), '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-movflags', '+faststart', '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', '48000',
    '-c:a', 'aac', '-b:a', '256k', '-shortest', out]));
  console.log('wrote', out);

  if (args.web) {
    const web = out.replace(/\.mp4$/, '-web.mp4');
    await done(ffmpeg(['-y', '-i', out, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-maxrate', '6M', '-bufsize', '12M',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k', web]));
    const poster = out.replace(/\.mp4$/, '-poster.jpg');
    await done(ffmpeg(['-y', '-ss', '58.5', '-i', out, '-frames:v', '1', '-q:v', '2', poster]));
    console.log('wrote', web, poster);
  }
  rmSync(wav, { force: true });
  rmSync(tmp, { recursive: true, force: true });
}
server.close();
