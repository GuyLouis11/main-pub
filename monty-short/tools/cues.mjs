// Dump the SFX cue list + layout from the composition (window.__cues) to assets/audio/cues.json for tools/score.py
import { chromium } from 'playwright';
import fs from 'fs';
// cloud box ships Chromium here; elsewhere set CHROME_PATH or run `npx playwright install chromium`
const CHROME = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
import path from 'path';
import fs from 'fs';
const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const p = await b.newPage();
await p.goto('file://' + path.resolve('index.html'));
for (let i = 0; i < 120 && !(await p.evaluate(() => !!window.__cues)); i++) await p.waitForTimeout(250);
const c = await p.evaluate(() => JSON.stringify(window.__cues()));
fs.writeFileSync('assets/audio/cues.json', c);
const j = JSON.parse(c); console.log('cues', j.cues.length, 'total', j.total.toFixed(2));
const names = {}; j.cues.forEach(q => names[q[1]] = (names[q[1]] || 0) + 1); console.log(names);
await b.close();
