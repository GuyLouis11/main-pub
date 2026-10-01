// Quick frame check: node tools/snap.mjs out_prefix t1 t2 ...  (seeks the GSAP timeline, screenshots at 1080x1920)
import { chromium } from 'playwright';
import fs from 'fs';
// cloud box ships Chromium here; elsewhere set CHROME_PATH or run `npx playwright install chromium`
const CHROME = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
import path from 'path';
const [out, ...ts] = process.argv.slice(2);
const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + path.resolve('index.html'));
for (let i = 0; i < 120 && !(await p.evaluate(() => !!(window.__timelines && window.__timelines.monty))); i++) await p.waitForTimeout(250);
await p.evaluate(() => document.fonts.ready.then(() => 1));
for (const t of ts) {
  await p.evaluate(t => { const tl = window.__timelines.monty; tl.seek(+t, false); document.querySelectorAll('.clip').forEach(c => { const s = +c.dataset.start, d = +c.dataset.duration; c.style.visibility = (+t >= s && +t < s + d) ? 'visible' : 'hidden'; }); }, t);
  await p.waitForTimeout(60);
  await p.screenshot({ path: `${out}_${(+t).toFixed(2)}.png` });
}
if (errs.length) console.log('ERRORS', errs.slice(0, 5));
await b.close();
