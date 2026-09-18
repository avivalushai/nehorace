// NehoRace smoke test.
// Walks every screen at 390x844, fails on console errors or horizontal scroll,
// screenshots each screen, and pixel-compares the static screens to tests/baseline/.
//
//   node tests/smoke.mjs            full run: a whole race, results, shop, album (~1.5 min)
//   node tests/smoke.mjs --quick    stops after the first seconds of the race (~40 s)
//   node tests/smoke.mjs --update   rewrite tests/baseline/ after an intentional visual change
//
//   SITE=<url> node tests/smoke.mjs --quick   same checks against the live site
//
// Starts its own static server (unless SITE is set). Screenshots go to tests/output/.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'output');
const BASE = path.join(HERE, 'baseline');
const quick = process.argv.includes('--quick');
const update = process.argv.includes('--update');
// ask the OS for a port nobody is using (a random one once collided with another local server)
const PORT = +process.env.PORT || await new Promise(res => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
if (update) { fs.rmSync(BASE, { recursive: true, force: true }); fs.mkdirSync(BASE, { recursive: true }); }

// SITE=https://nehorace.vercel.app/ runs against the live site instead of a local server
// the dev server runs api/*.mjs with an in-memory database, so the champions board works locally too
const server = process.env.SITE ? null : spawn(process.execPath, [path.join(HERE, 'dev-server.mjs'), String(PORT)], { cwd: ROOT, stdio: 'ignore' });
const URL = process.env.SITE || `http://127.0.0.1:${PORT}/index.html`;
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

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 }); // Google Fonts can be slow
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await shot('title', { compare: true });

  // ---- icons, link-preview image and manifest load and have the declared sizes ----
  const headProblems = await page.evaluate(async () => {
    const out = [];
    const size = src => new Promise(res => { const im = new Image(); im.onload = () => res(`${im.naturalWidth}x${im.naturalHeight}`); im.onerror = () => res('broken'); im.src = src; });
    const check = async (src, want, what) => { const got = await size(new URL(src, location.href).href); if (got !== want) out.push(`${what} ${src}: expected ${want}, got ${got}`); };
    for (const l of document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]')) await check(l.getAttribute('href'), l.getAttribute('sizes') || '180x180', l.rel);
    const og = p => document.querySelector(`meta[property="og:${p}"]`)?.content;
    // og:image points at the live site; check the local copy of the same file
    const site = og('url');
    if (!site || !/^https:\/\//.test(site) || !og('image')?.startsWith(site)) out.push(`og:url/og:image must be absolute and on the same site: ${site} ${og('image')}`);
    else await check(og('image').slice(site.length), `${og('image:width')}x${og('image:height')}`, 'og:image');
    for (const p of ['title', 'description', 'image']) if (!og(p)) out.push(`missing og:${p}`);
    const mUrl = new URL(document.querySelector('link[rel="manifest"]').getAttribute('href'), location.href);
    try {
      const m = await (await fetch(mUrl)).json();
      if (!m.icons?.some(i => i.purpose === 'maskable')) out.push('manifest: no maskable icon');
      for (const i of m.icons || []) await check(new URL(i.src, mUrl).href, i.sizes, `manifest icon (${i.purpose})`);
    } catch (e) { out.push(`manifest: ${e.message}`); }
    return out;
  });
  headProblems.forEach(p => errors.push(`[head] ${p}`));

  // ---- garage: character ----
  await page.fill('#nameIn', 'בדיקה');
  await click('#startBtn');
  await shot('garage-char', { compare: true });
  const charTabs = await page.locator('#tabs .tab').count();
  for (let i = 0; i < charTabs; i++) {
    await page.locator('#tabs .tab').nth(i).click();
    const opts = page.locator('#opts .opt');
    if (await opts.count() > 1) await opts.nth(1).click(); // change the look in every category
    await page.waitForTimeout(500);
    await shot(`char-tab${i}`, { compare: true });
  }
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
    await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
    await click('#startBtn');
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

  // ---- ?dev shortcut and personal records ----
  const devUrl = URL + (URL.includes('?') ? '&' : '?') + 'dev';
  const stats = () => page.evaluate(() => JSON.parse(localStorage.getItem('nehorace-stats') || 'null'));
  const expectR = (ok, msg) => { if (!ok) errors.push(`[records] ${msg}`); };
  await page.goto(devUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await page.evaluate(() => localStorage.removeItem('nehorace-stats'));
  await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
  expectR(await page.locator('#bestLine').isHidden(), 'best line visible before any race');
  await click('#devBtn');
  await page.waitForSelector('#results.on', { timeout: 30000 });
  await shot('dev-results');
  const s1 = await stats();
  expectR(s1?.races === 1 && s1.bestScore > 0 && s1.bestTime > 0, `after one race: ${JSON.stringify(s1)}`);
  expectR(!((await page.locator('#resRec').textContent()) || '').includes('שיא'), 'first race should not show a "new record" badge');
  await click('#garageBtn'); await click('#backBtn');
  const best = (await page.locator('#bestLine').textContent()) || '';
  expectR(await page.locator('#bestLine').isVisible() && best.includes('מירוץ אחד') && best.includes(String(s1?.bestScore)), `title best line: "${best}"`);
  await shot('title-with-best');
  // a worse previous record must be beaten and announced
  await page.evaluate(() => localStorage.setItem('nehorace-stats', JSON.stringify({ races: 3, wins: 0, podiums: 0, bestScore: 1, bestTime: 9999, victims: 0 })));
  await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
  await click('#devBtn');
  await page.waitForSelector('#results.on', { timeout: 30000 });
  const rec = (await page.locator('#resRec').textContent()) || '';
  expectR(rec.includes('שיא נקודות חדש') && rec.includes('הכי מהיר'), `new record badge: "${rec}"`);
  expectR((await stats())?.races === 4, `races after second run: ${JSON.stringify(await stats())}`);
  await shot('dev-results-new-record');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
  expectR(await page.locator('#devBtn').isHidden(), 'dev button visible without ?dev');

  // ---- unlocks: locked items refuse, unlocked items work in a race and in every album photo ----
  const expectU = (ok, msg) => { if (!ok) errors.push(`[unlocks] ${msg}`); };
  await page.goto(devUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await page.evaluate(() => localStorage.setItem('nehorace-stats', JSON.stringify({ races: 1, career: 0 })));
  await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
  await click('#startBtn');
  expectU(await page.locator('#opts .opt.locked').count() >= 7, 'new haircuts should be locked with 0 career points');
  await page.locator('#opts .opt.locked').first().click();
  expectU(!(await page.locator('#opts .opt.on.locked').count()), 'a locked item got selected');
  await shot('locked-hair');
  // unlock everything and dress up in the rarest item of every category
  await page.goto(devUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await page.evaluate(() => localStorage.setItem('nehorace-stats', JSON.stringify({ races: 1, career: 99999 })));
  for (const vid of [3, 4, 5]) { // T-Max, giant pitbull, wings
    await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
    await click('#startBtn');
    expectU(!(await page.locator('#opts .opt.locked').count()), 'items still locked with 99,999 points');
    const tabs = await page.locator('#tabs .tab').count();
    for (let i = 0; i < tabs; i++) { await page.locator('#tabs .tab').nth(i).click(); await page.locator('#opts .opt').last().click(); }
    if (vid === 3) await shot('rarest-look');
    await click('#nextBtn');
    await page.locator('#opts .vcard').nth(vid).click();
    await click('#nextBtn');
    await shot(`ride-${vid}-design`);
    await click('#backBtn'); await click('#backBtn'); await click('#backBtn'); // back to the title, look kept
    await click('#devBtn');
    await page.waitForSelector('#results.on', { timeout: 30000 });
    await shot(`ride-${vid}-results`);
    await click('#giftBtn'); await page.waitForTimeout(400);
    await page.locator('#albumGrid .pol').first().click();
    const np = await page.locator('#albumGrid .pol').count();
    for (let i = 1; i < np; i++) { await click('#lbNext'); await page.waitForTimeout(120); }
    await click('#lbClose'); await click('#albumClose');
  }
  // the race itself with the wings, for a few seconds
  await click('#againBtn'); await page.waitForTimeout(5000);
  await shot('ride-wings-race');
  await click('#exitBtn');

  // ---- champions board: a second player, ranks, and a name that tries to inject HTML ----
  if (!process.env.SITE) {
    const expectB = (ok, msg) => { if (!ok) errors.push(`[board] ${msg}`); };
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p2 = await ctx2.newPage(); p2.setDefaultTimeout(10000);
    p2.on('pageerror', e => errors.push(`[board pageerror] ${e.message}`));
    p2.on('dialog', d => { errors.push('[board] a dialog opened: injected HTML ran'); d.dismiss(); });
    await p2.goto(devUrl, { waitUntil: 'networkidle', timeout: 45000 });
    await p2.fill('#nameIn', '<img src=x onerror=alert(1)>');
    await p2.locator('#devBtn').click();
    await p2.waitForSelector('#results.on', { timeout: 30000 });
    await p2.waitForFunction(() => (document.querySelector('#resRec').textContent || '').includes('השבוע'), null, { timeout: 10000 }).catch(() => errors.push('[board] no weekly rank badge after the race'));
    await p2.locator('#resBoardBtn').click();
    await p2.waitForSelector('#boardList li', { timeout: 10000 });
    const rows = await p2.locator('#boardList li:not(.gap)').count();
    expectB(rows >= 2, `expected both players on the weekly board, got ${rows} rows`);
    expectB(await p2.locator('#boardList li.me').count() === 1, 'my row is not highlighted exactly once');
    expectB(!(await p2.locator('#boardList img').count()), 'a name was rendered as HTML');
    await p2.screenshot({ path: path.join(OUT, 'board-week.png') });
    await p2.locator('#boardTabs .tab').nth(1).click();
    await p2.screenshot({ path: path.join(OUT, 'board-wins.png') });
    const bad = await p2.request.post(URL.replace(/index\.html$/, '') + 'api/race', { data: { id: 'a'.repeat(32), name: 'x', score: 99999, pos: 1, time: 45 } });
    expectB(bad.status() === 400, `implausible score accepted (${bad.status()})`);
    await ctx2.close();
  }

  // ---- desktop (1440x900): one screen at a time, every step clickable ----
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const dp = await dctx.newPage();
  dp.setDefaultTimeout(5000);
  dp.on('pageerror', e => errors.push(`[desktop pageerror] ${e.message}`));
  const visible = () => dp.evaluate(() => [...document.querySelectorAll('.screen')].filter(s => getComputedStyle(s).display !== 'none').map(s => s.id).join(','));
  const dstep = async (name, action, want) => {
    try { if (action) await action(); } catch (e) { errors.push(`[desktop] ${name}: ${e.message.split('\n')[0]}`); return false; }
    await dp.waitForTimeout(400);
    await dp.screenshot({ path: path.join(OUT, `desktop-${name}.png`) });
    const v = await visible();
    if (v !== want) { errors.push(`[desktop] ${name}: visible screens "${v}", expected "${want}"`); return false; }
    return true;
  };
  const dclick = sel => dp.locator(sel).first().click();
  if (await dstep('title', () => dp.goto(URL, { waitUntil: 'networkidle', timeout: 45000 }), 'title')
    && await dstep('garage', () => dclick('#startBtn'), 'garage')
    && await dstep('vehicle', () => dclick('#nextBtn'), 'garage')
    && await dstep('race', async () => { await dclick('#nextBtn'); await dclick('#nextBtn'); await dp.waitForTimeout(4000); }, 'race'))
    await dstep('exit', () => dclick('#exitBtn'), 'garage');
  await dctx.close();

  console.log(`${n} screenshots in tests/output/${update ? ', baseline updated' : ''}`);
} catch (e) {
  errors.push(`[test stopped] ${e.message.split('\n')[0]}`);
} finally {
  await browser.close();
  server?.kill();
}

const report = { errors, diffs, hscroll };
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
const bad = errors.length + diffs.length + hscroll.length;
if (bad) { console.log(JSON.stringify(report, null, 2)); console.log('FAIL'); }
else console.log('PASS: no console errors, no horizontal scroll, static screens match baseline');
process.exit(bad ? 1 : 0);
