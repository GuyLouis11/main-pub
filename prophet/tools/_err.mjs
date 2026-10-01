import { chromium } from 'playwright';
import fs from 'fs';
// cloud box ships Chromium here; elsewhere set CHROME_PATH or run `npx playwright install chromium`
const CHROME = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const p = await b.newPage();
p.on('pageerror', e => console.log('PE', e.message, (e.stack||'').split('\n').slice(1,3).join(' | ')));
await p.goto('file://' + process.cwd() + '/index.html'); await p.waitForTimeout(6000);
console.log('timeline', await p.evaluate(() => !!(window.__timelines && window.__timelines.prophet)));
await b.close();
