// Render the three cover options to thumbnails/cover_[A|B|C].png (1080×1920, for Shorts promo/cover use)
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const CHROME = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
fs.mkdirSync('thumbnails', { recursive: true });
for (const t of ['A', 'B', 'C']) {
  await p.goto('file://' + path.resolve('tools/thumbs.html') + '?t=' + t);
  await p.evaluate(() => document.fonts.ready.then(() => 1));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `thumbnails/cover_${t}.png` });
}
await b.close();
