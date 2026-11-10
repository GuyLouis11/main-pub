// node ui/render.mjs  — renders the dashboard's frames (film/assets/ui/ui_0001.jpg ...), the card texture and layout.json
import {chromium} from 'playwright-core';
import fs from 'fs';
import path from 'path';
const N = 150, out = path.resolve('film/assets/ui');
fs.mkdirSync(out, {recursive: true});
const exe = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const b = await chromium.launch({executablePath: exe, args: ['--allow-file-access-from-files']});
const url = 'file://' + path.resolve('ui/index.html');
const pg = await b.newPage({viewport: {width: 1920, height: 1200}, deviceScaleFactor: 3});
await pg.goto(url);
await pg.evaluate(() => document.fonts.ready);
for (let f = 0; f < N; f++) {
  await pg.evaluate((f) => window.setFrame(f), f);
  await pg.screenshot({path: `${out}/ui_${String(f + 1).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90});
}
const L = await pg.evaluate(() => window.LAYOUT());
// the card on its own, bars removed (the 3D bars sit on top of it)
const pc = await b.newPage({viewport: {width: 1920, height: 1200}, deviceScaleFactor: 4});
await pc.goto(url + '?nobars&card&f=107');
await pc.evaluate(() => document.fonts.ready);
await pc.evaluate(() => window.setFrame(107));
await pc.screenshot({path: `${out}/card.png`, clip: {x: L.card.x, y: L.card.y, width: L.card.w, height: L.card.h}});
await b.close();
// layout in metres on the 0.292 m wide screen; x right, y up, relative to the screen centre / the card centre
const m = 0.292 / 1920, cx = L.card.x + L.card.w / 2, cy = L.card.y + L.card.h / 2;
const lay = {card_w: L.card.w * m, card_h: L.card.h * m, card_cx: (cx - 960) * m, card_cy: (600 - cy) * m, hi: L.hi,
  bars: L.bars.map((r) => [(r.x - cx) * m, (cy - r.y) * m, r.w * m, r.h * m])};
fs.writeFileSync(`${out}/layout.json`, JSON.stringify(lay, null, 1));
console.log('ui frames', N, lay.card_w.toFixed(4), lay.card_h.toFixed(4));
