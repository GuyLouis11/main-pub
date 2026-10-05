// Render the three thumbnails to thumbnails/thumb_[A|B|C].png (1280×720, YouTube "Test & compare")
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const CHROME = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
fs.mkdirSync('thumbnails', { recursive: true });
for (const t of ['A', 'B', 'C']) {
  await p.goto('file://' + path.resolve('tools/thumbs.html') + '?t=' + t);
  await p.evaluate(() => document.fonts.ready.then(() => 1));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `thumbnails/thumb_${t}.png` });
}
await b.close();
