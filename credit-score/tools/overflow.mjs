// Layout QA: seek the timeline every 0.2 s and flag any visible text that spills outside its container box
// (.card .steelcard .paper .box .tag .pill .stamp .key .chainbox .coin) or outside the 1080-wide frame.
//   node tools/overflow.mjs [step]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const CHROME = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const step = +(process.argv[2] || .2);
const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + path.resolve('index.html'));
for (let i = 0; i < 120 && !(await p.evaluate(() => !!(window.__timelines && Object.keys(window.__timelines).length))); i++) await p.waitForTimeout(250);
await p.evaluate(() => document.fonts.ready.then(() => 1));
const total = await p.evaluate(() => window.__cues().total);
const hits = new Map();
for (let t = 0.05; t < total; t += step) {
  const r = await p.evaluate(t => {
    const tl = Object.values(window.__timelines)[0]; tl.seek(t, false);
    document.querySelectorAll('.clip').forEach(c => { const s = +c.dataset.start, d = +c.dataset.duration; c.style.visibility = (t >= s && t < s + d) ? 'visible' : 'hidden'; });
    const vis = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < .35) return false; } return true; };
    const BOX = '.card,.steelcard,.paper,.box,.tag,.pill,.stamp,.key,.chainbox';
    const out = [];
    const walker = document.createTreeWalker(document.getElementById('stage'), NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement; if (!el || el.closest('#caps') || !vis(el)) continue;
      const rg = document.createRange(); rg.selectNodeContents(n); const tr = rg.getBoundingClientRect();
      if (tr.width < 2) continue;
      const label = (el.id ? '#' + el.id : el.className || el.tagName) + ' "' + n.textContent.trim().slice(0, 24) + '"';
      if (tr.left < -2 || tr.right > 1922) out.push(['frame', label, Math.round(tr.left), Math.round(tr.right)]);
      const box = el.closest(BOX);
      if (box && box !== el.closest('#stage')) {
        const br = box.getBoundingClientRect(), pad = 2;
        if (tr.left < br.left - pad || tr.right > br.right + pad || tr.top < br.top - pad || tr.bottom > br.bottom + pad)
          out.push(['box', label + ' in ' + (box.id ? '#' + box.id : box.className.split(' ')[0]), Math.round(tr.right - br.right), Math.round(tr.bottom - br.bottom)]);
      }
    }
    return out;
  }, t);
  for (const [kind, label, a, c] of r) { const k = kind + ' ' + label; if (!hits.has(k)) hits.set(k, [t, t, a, c]); else hits.get(k)[1] = t; }
}
if (!hits.size) console.log('overflow: none');
for (const [k, [t0, t1, a, c]] of hits) console.log(`${t0.toFixed(1)}–${t1.toFixed(1)}s  ${k}  (${a}, ${c})`);
await b.close();
