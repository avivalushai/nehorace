// Renders tools/images.html and saves every canvas on it in assets/ (PNG, or JPEG for .jpg names).
//   node tests/make-images.mjs      (or: cd tests && npm run images)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets');
// ask the OS for a port nobody is using (a random one once collided with another local server)
const PORT = +process.env.PORT || await new Promise(res => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
const URL = `http://127.0.0.1:${PORT}/tools/images.html`;
for (let i = 0; i < 50; i++) { try { if ((await fetch(URL)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('body[data-ready="1"]', { timeout: 15000 });
  if (errors.length) throw new Error(errors.join('\n'));
  const files = await page.$$eval('canvas[data-file]', cvs => cvs.map(cv => [cv.dataset.file, cv.toDataURL(cv.dataset.file.endsWith('.jpg') ? 'image/jpeg' : 'image/png', 0.88)]));
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, url] of files) {
    const buf = Buffer.from(url.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT, name), buf);
    console.log(`assets/${name}  ${Math.round(buf.length / 1024)}KB`);
  }
  await page.setViewportSize({ width: 1300, height: 1400 });
  await page.screenshot({ path: path.join(ROOT, 'tests/output/images-preview.png'), fullPage: true });
} finally {
  await browser.close();
  server.kill();
}
