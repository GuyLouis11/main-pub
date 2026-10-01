// Render the three thumbnail options to thumbnails/thumb_[A|B|C].png (1280×720)
import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
for (const t of ['A', 'B', 'C']) {
  await p.goto('file://' + path.resolve('tools/thumbs.html') + '?t=' + t);
  await p.evaluate(() => document.fonts.ready.then(() => 1));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `thumbnails/thumb_${t}.png` });
}
await b.close();
