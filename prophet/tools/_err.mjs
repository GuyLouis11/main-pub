import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
p.on('pageerror', e => console.log('PE', e.message, (e.stack||'').split('\n').slice(1,3).join(' | ')));
await p.goto('file://' + process.cwd() + '/index.html'); await p.waitForTimeout(6000);
console.log('timeline', await p.evaluate(() => !!(window.__timelines && window.__timelines.prophet)));
await b.close();
