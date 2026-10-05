// node tools/stills.mjs <Composition> <outdir> <frame> [frame ...]  — bundle once, render review stills (+ a contact sheet)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import {execFileSync} from 'child_process';

const [comp, out, ...frames] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const HS = process.env.CHROME_PATH || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const opts = {serveUrl, browserExecutable: fs.existsSync(HS) ? HS : undefined, chromiumOptions: {gl: 'angle'}};
const composition = await selectComposition({...opts, id: comp});
const files = [];
for (const fr of frames.map(Number)) {
  const output = path.join(out, `${comp}_${String(fr).padStart(4, '0')}.png`);
  await renderStill({...opts, composition, frame: fr, output, scale: 0.5, logLevel: 'error'});
  files.push(output);
}
// contact sheet, 5 per row
const args = [];
files.forEach((f) => args.push('-i', f));
const n = files.length, cols = Math.min(5, n), rows = Math.ceil(n / cols);
const layout = files.map((_, i) => `${(i % cols) * 540}_${Math.floor(i / cols) * 960}`).join('|');
const pad = n < cols * rows ? `` : '';
if (n === 1) { fs.copyFileSync(files[0], path.join(out, `${comp}_sheet.png`)); console.log('sheet', files[0]); process.exit(0); }
execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, '-filter_complex', `${files.map((_, i) => `[${i}]`).join('')}xstack=inputs=${n}:layout=${layout}:fill=black${pad},scale=iw/2:ih/2`, path.join(out, `${comp}_sheet.png`)]);
console.log('sheet', path.join(out, `${comp}_sheet.png`));
