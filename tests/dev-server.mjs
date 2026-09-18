// Local server for development and tests: serves the game, runs api/*.mjs like Vercel does, and fakes
// Upstash Redis in memory (only the commands the api uses). No dependencies.
//   node tests/dev-server.mjs [port]      then open http://localhost:<port>
// The fake database lives in memory and resets when the server stops.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

// ---------- fake Upstash Redis ----------
const db = new Map(), exp = new Map();
const live = k => { if (exp.has(k) && exp.get(k) < Date.now()) { db.delete(k); exp.delete(k); } return db.get(k); };
const zset = k => { let z = live(k); if (!(z instanceof Map)) { z = new Map(); db.set(k, z); } return z; };
const hash = k => { let h = live(k); if (!(h instanceof Map)) { h = new Map(); db.set(k, h); } return h; };
const sorted = k => [...zset(k)].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1));
function run([cmd, ...a]) {
  switch (cmd.toUpperCase()) {
    case 'ECHO': return a[0];
    case 'SET': { const [k, v, ...o] = a; const nx = o.includes('NX'), ex = o.indexOf('EX'); if (nx && live(k) !== undefined) return null; db.set(k, v); if (ex >= 0) exp.set(k, Date.now() + +o[ex + 1] * 1000); return 'OK'; }
    case 'INCR': { const v = (+live(a[0]) || 0) + 1; db.set(a[0], String(v)); return v; }
    case 'EXPIRE': return db.has(a[0]) ? (exp.set(a[0], Date.now() + +a[1] * 1000), 1) : 0;
    case 'SISMEMBER': { const s = live(a[0]); return s instanceof Set && s.has(a[1]) ? 1 : 0; }
    case 'SADD': { let s = live(a[0]); if (!(s instanceof Set)) { s = new Set(); db.set(a[0], s); } s.add(a[1]); return 1; }
    case 'HSET': hash(a[0]).set(a[1], a[2]); return 1;
    case 'HMGET': return a.slice(1).map(f => hash(a[0]).get(f) ?? null);
    case 'HGETALL': return [...hash(a[0])].flat();
    case 'ZADD': { const gt = a.includes('GT'), [score, m] = a.slice(-2), z = zset(a[0]); if (!gt || !z.has(m) || +score > z.get(m)) z.set(m, +score); return 1; }
    case 'ZINCRBY': { const z = zset(a[0]); z.set(a[2], (z.get(a[2]) || 0) + +a[1]); return String(z.get(a[2])); }
    case 'ZREM': return zset(a[0]).delete(a[1]) ? 1 : 0;
    case 'ZSCORE': { const v = zset(a[0]).get(a[1]); return v === undefined ? null : String(v); }
    case 'ZREVRANK': { const i = sorted(a[0]).findIndex(([m]) => m === a[1]); return i < 0 ? null : i; }
    case 'ZREVRANGE': { const out = sorted(a[0]).slice(+a[1], +a[2] + 1); return a.includes('WITHSCORES') ? out.flatMap(([m, s]) => [m, String(s)]) : out.map(([m]) => m); }
    default: throw new Error(`fake redis: ${cmd} not supported`);
  }
}

const port = +(process.argv[2] || process.env.PORT || 8765);
process.env.KV_REST_API_URL ??= `http://127.0.0.1:${port}/__redis`;
process.env.KV_REST_API_TOKEN ??= 'dev';
process.env.RATE_LIMIT_SECONDS ??= '0';

const body = req => new Promise(res => { const ch = []; req.on('data', d => ch.push(d)); req.on('end', () => res(Buffer.concat(ch))); });
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/__redis')) {
      const cmds = JSON.parse(await body(req) || '[]');
      const out = url.pathname.endsWith('/pipeline') ? cmds.map(c => { try { return { result: run(c) }; } catch (e) { return { error: e.message }; } }) : { result: run(cmds) };
      res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(out));
    }
    if (url.pathname.startsWith('/api/')) {
      const file = path.join(ROOT, 'api', path.basename(url.pathname) + '.mjs');
      if (!fs.existsSync(file) || path.basename(file).startsWith('_')) { res.writeHead(404); return res.end('not found'); }
      const mod = await import(pathToFileURL(file).href), handler = mod[req.method];
      if (!handler) { res.writeHead(405); return res.end(); }
      const b = req.method === 'GET' || req.method === 'HEAD' ? undefined : await body(req);
      const headers = { ...req.headers, 'x-forwarded-for': req.socket.remoteAddress };
      const r = await handler(new Request(url, { method: req.method, headers, body: b }));
      res.writeHead(r.status, Object.fromEntries(r.headers)); return res.end(Buffer.from(await r.arrayBuffer()));
    }
    let p = decodeURIComponent(url.pathname); if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  } catch (e) { console.error(e); res.writeHead(500); res.end(String(e)); }
}).listen(port, '127.0.0.1', () => console.log(`NehoRace dev server: http://localhost:${port}`));
