// NehoRace smoke test.
// Walks every screen at 390x844, fails on console errors or horizontal scroll,
// screenshots each screen, and pixel-compares the static screens to tests/baseline/.
//
//   node tests/smoke.mjs            full run: a whole race, results, shop, album (~1.5 min)
//   node tests/smoke.mjs --quick    stops after the first seconds of the race (~40 s)
//   node tests/smoke.mjs --update   rewrite tests/baseline/ after an intentional visual change
//
// Starts its own static server. Screenshots go to tests/output/.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'output');
const BASE = path.join(HERE, 'baseline');
const quick = process.argv.includes('--quick');
const update = process.argv.includes('--update');
const PORT = +(process.env.PORT || 8700 + Math.floor(Math.random() * 200));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
if (update) { fs.rmSync(BASE, { recursive: true, force: true }); fs.mkdirSync(BASE, { recursive: true }); }

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
const URL = `http://127.0.0.1:${PORT}/index.html`;
for (let i = 0; i < 50; i++) { try { if ((await fetch(URL)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }

const errors = [], diffs = [], hscroll = [];
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    reducedMotion: 'reduce', locale: 'he-IL',
  });
  // seeded Math.random so static screens are pixel-identical between runs
  await ctx.addInitScript(() => {
    let a = 1234567;
    Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(10000);
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[console.${m.type()}] ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', r => { if (!r.url().includes('fonts.g')) errors.push(`[requestfailed] ${r.url()}`); });

  let n = 0;
  // compare=true: a static screen, checked against tests/baseline/
  async function shot(name, { compare = false, full = false } = {}) {
    await page.waitForTimeout(350);
    const file = `${String(++n).padStart(2, '0')}-${name}.png`;
    const buf = await page.screenshot({ path: path.join(OUT, file), fullPage: full });
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    if (sw > iw) hscroll.push(`${file}: scrollWidth ${sw} > ${iw}`);
    if (!compare) return;
    const bf = path.join(BASE, file);
    if (update) fs.writeFileSync(bf, buf);
    else if (!fs.existsSync(bf)) diffs.push(`${file}: missing in baseline (run with --update)`);
    else if (!fs.readFileSync(bf).equals(buf)) diffs.push(`${file}: differs from baseline`);
  }
  const click = sel => page.locator(sel).first().click();

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await shot('title', { compare: true });

  // ---- garage: character ----
  await page.fill('#nameIn', 'בדיקה');
  await click('#startBtn');
  await page.waitForSelector('#songsSheet.on'); // opens by itself on the first visit
  await shot('songs-auto-prompt', { compare: true });
  await click('#songsClose');
  await shot('garage-char', { compare: true });
  const charTabs = await page.locator('#tabs .tab').count();
  for (let i = 0; i < charTabs; i++) {
    await page.locator('#tabs .tab').nth(i).click();
    const opts = page.locator('#opts .opt');
    if (await opts.count() > 1) await opts.nth(1).click(); // change the look in every category
    await page.waitForTimeout(500);
    await shot(`char-tab${i}`, { compare: true });
  }
  await click('#songsBtn');
  await shot('songs-sheet', { compare: true });
  await click('#songsClose');
  await click('#gShopBtn');
  await shot('shop-from-garage', { compare: true });
  await click('#shopClose');

  // ---- garage: vehicle ----
  await click('#nextBtn');
  await shot('garage-vehicle', { compare: true });
  await page.locator('#opts .vcard').nth(2).click();
  await page.waitForTimeout(500);
  await shot('garage-vehicle-atv', { compare: true });
  await page.locator('#opts .vcard').nth(0).click();

  // ---- garage: design ----
  await click('#nextBtn');
  await shot('design-stickers', { compare: true });
  await page.locator('#tabs .tab').nth(0).click();
  await page.locator('#opts .sw').nth(3).click();
  await page.waitForTimeout(500);
  await shot('design-color', { compare: true });
  await page.locator('#tabs .tab').nth(1).click();
  await page.locator('#opts .opt').nth(2).click();
  await page.waitForTimeout(500);
  await shot('design-wheels', { compare: true });
  await click('#backBtn'); await click('#backBtn');
  await shot('garage-back-to-char', { compare: true });
  await click('#nextBtn'); await click('#nextBtn');

  // ---- race (timing-dependent: screenshots only, no pixel compare) ----
  await click('#nextBtn');
  await page.waitForTimeout(1200);
  await shot('race-countdown');
  await page.waitForTimeout(3500);
  const cv = await page.locator('#raceCv').boundingBox();
  await page.mouse.move(cv.width / 2, cv.height * .7); await page.mouse.down();
  await page.mouse.move(cv.width / 2 + 40, cv.height * .7, { steps: 5 }); await page.mouse.up();
  await page.locator('#turboBtn').dispatchEvent('pointerdown');
  await page.waitForTimeout(1500);
  await shot('race-turbo');
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(300); await page.keyboard.up('ArrowLeft');
  await page.waitForTimeout(6000);
  await shot('race-mid');
  await click('#muteBtn');
  if (quick) {
    await click('#exitBtn');
    await shot('exit-to-garage');
  } else {
    await page.waitForSelector('#results.on', { timeout: 150000 });
    await page.waitForTimeout(1600);
    await shot('results');
    await shot('results-full', { full: true });
    await click('#shopBtn');
    await shot('shop');
    const buy = page.locator('.buy:not([disabled])');
    if (await buy.count()) { await buy.first().click(); await shot('shop-bought'); }
    for (const i of [1, 2, 3, 4]) await page.locator('#shopTabs .tab').nth(i).click();
    await shot('shop-mine');
    await click('#shopClose');
    await click('#giftBtn');
    await page.waitForTimeout(600);
    await shot('album');
    await shot('album-full', { full: true });
    await page.locator('#albumGrid .pol').first().click();
    await page.waitForTimeout(800);
    await shot('lightbox');
    const np = await page.locator('#albumGrid .pol').count();
    for (let i = 1; i < np; i++) { await click('#lbNext'); await page.waitForTimeout(250); }
    await shot('lightbox-last');
    await click('#lbClose');
    await click('#albumClose');
    await click('#againBtn');
    await page.waitForTimeout(1500);
    await shot('race-again');
    await click('#exitBtn');
    await shot('exit-to-garage');
    await click('#backBtn');
    await shot('back-to-title');
  }
  if (!quick) {
    // coins won in the race must be saved
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('nehorace-wallet') || 'null'));
    const shown = +(await page.locator('#walletNow').textContent()).replace(/\D/g, '');
    if (!saved || saved.coins !== shown) errors.push(`[wallet] after race: saved ${JSON.stringify(saved)} but screen shows ${shown}`);
  }

  // ---- wallet persistence (fresh page, localStorage) ----
  const wallet = () => page.evaluate(() => JSON.parse(localStorage.getItem('nehorace-wallet') || 'null'));
  const shopCoins = async () => +(await page.locator('#shopCoins').textContent()).replace(/\D/g, '');
  const toGarageShop = async () => {
    await page.reload({ waitUntil: 'networkidle' });
    await click('#startBtn');
    await page.waitForSelector('#songsSheet.on'); await click('#songsClose');
    await click('#gShopBtn');
  };
  const expect = (ok, msg) => { if (!ok) errors.push(`[wallet] ${msg}`); };
  await page.evaluate(() => localStorage.setItem('nehorace-wallet', JSON.stringify({ coins: 1000, inv: { civic: 1 } })));
  await toGarageShop();
  expect(await shopCoins() === 1000, `restored coins: expected 1000, got ${await shopCoins()}`);
  expect(await page.locator('.item.owned[data-id="civic"]').count() === 1, 'restored civic is not shown as owned');
  await page.locator('.item[data-id="seeds"] .buy').click();
  await page.locator('.item[data-id="redbull"] .buy').click();
  await shot('wallet-bought');
  await click('#shopClose');
  await shot('wallet-trophy-in-garage');
  await toGarageShop();
  expect(await shopCoins() === 915, `after buying and reloading: expected 915, got ${await shopCoins()}`);
  const w1 = await wallet();
  expect(w1?.inv?.seeds === 1 && w1?.inv?.redbull === 1 && w1?.inv?.civic === 1, `inventory after reload: ${JSON.stringify(w1)}`);
  // a red bull is used at the start of the race, and that must be saved too
  await click('#shopClose');
  await click('#nextBtn'); await click('#nextBtn'); await click('#nextBtn');
  await page.waitForTimeout(500);
  expect(!(await wallet())?.inv?.redbull, `red bull not consumed: ${JSON.stringify(await wallet())}`);
  await click('#exitBtn');
  // corrupted or hostile data must not break the game
  for (const raw of ['{not json', '{"coins":"lots","inv":{"civic":-3,"x":"y"}}', 'null']) {
    await page.evaluate(r => localStorage.setItem('nehorace-wallet', r), raw);
    await toGarageShop();
    expect(await shopCoins() === 0, `bad data ${raw}: expected 0 coins, got ${await shopCoins()}`);
    expect(await page.locator('.item.owned').count() === 0, `bad data ${raw}: items shown as owned`);
  }

  console.log(`${n} screenshots in tests/output/${update ? ', baseline updated' : ''}`);
} catch (e) {
  errors.push(`[test stopped] ${e.message.split('\n')[0]}`);
} finally {
  await browser.close();
  server.kill();
}

const report = { errors, diffs, hscroll };
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
const bad = errors.length + diffs.length + hscroll.length;
if (bad) { console.log(JSON.stringify(report, null, 2)); console.log('FAIL'); }
else console.log('PASS: no console errors, no horizontal scroll, static screens match baseline');
process.exit(bad ? 1 : 0);
