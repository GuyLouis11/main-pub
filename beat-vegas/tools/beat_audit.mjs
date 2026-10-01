// Lists stretches > 1.5 s with no visible animation beat, per chapter (reads the GSAP timeline in a headless browser).
import { chromium } from 'playwright';
import fs from 'fs';
// cloud box ships Chromium here; elsewhere set CHROME_PATH or run `npx playwright install chromium`
const CHROME = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
import path from 'path';
const chs = process.argv.slice(2).length ? process.argv.slice(2) : ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'];
const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
for (const ch of chs) {
  const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(ch, 'index.html'));
  await page.waitForFunction(() => window.__beats, null, { timeout: 15000 });
  const r = await page.evaluate(() => window.__beats());
  const sum = r.gaps.reduce((a, g) => a + g[2], 0);
  console.log(`${ch}  total ${r.total.toFixed(1)}s  gaps>1.5s: ${r.gaps.length}  (${sum.toFixed(1)}s)` + (errs.length ? '  ERR ' + errs[0] : ''));
  r.gaps.forEach(g => console.log(`   ${g[0].toFixed(1)}–${g[1].toFixed(1)}  (${g[2].toFixed(1)}s)`));
  await page.close();
}
await browser.close();
