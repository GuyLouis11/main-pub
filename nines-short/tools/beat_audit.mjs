// Stretches > 1 s with no visible animation beat (decoration ignored). --nocaps also ignores the captions.
import { chromium } from 'playwright';
import path from 'path';
const noCaps = process.argv.includes('--nocaps');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
await p.goto('file://' + path.resolve('index.html'));
for (let i = 0; i < 120 && !(await p.evaluate(() => !!window.__beats)); i++) await p.waitForTimeout(250);
const r = await p.evaluate(nc => window.__beats(nc), noCaps);
console.log(`total ${r.total.toFixed(2)}s  gaps>1s${noCaps ? ' (captions ignored)' : ''}: ${r.gaps.length}`);
r.gaps.forEach(g => console.log(`   ${g[0]}–${g[1]}  (${(g[1]-g[0]).toFixed(2)}s)`));
await b.close();
