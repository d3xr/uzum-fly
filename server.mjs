import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { loadFly } from './lib/fly.mjs';

const root = resolve(import.meta.dirname, 'public');
const dataDir = new URL('./data/fly/', import.meta.url);
const port = Number(process.env.PORT || 4173);
const startedAt = Date.now();
const roundMs = 40_000;
const sweepMs = 14_000;
const revealStepMs = 800;

const catalog = JSON.parse(readFileSync(new URL('./data/catalog.json', import.meta.url), 'utf8'));
const localImageDir = resolve(root, 'images/products');
const localImageIds = new Set(existsSync(localImageDir)
  ? readdirSync(localImageDir).filter((name) => name.endsWith('.jpg')).map((name) => name.slice(0, -4)) : []);
const indexById = new Map(catalog.map((product, i) => [product.id, i]));
const titleKey = (i) => catalog[i].title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').slice(0, 42);
const bootAt = Date.now();
const fly = loadFly(dataDir, titleKey);
console.log(`Fly: ${fly.N} товаров, ${fly.K} KC, варианты ${Object.keys(fly.variants).join(', ')} за ${Date.now() - bootAt} мс`);

const readJson = (name) => (existsSync(new URL(name, dataDir)) ? JSON.parse(readFileSync(new URL(name, dataDir), 'utf8')) : null);
const evalResults = readJson('eval_results.json');
const lifResults = readJson('lif_results.json');
const personas = fly.model.personas;

// Гломерулы с известным лигандом (Or/Ir/Gr → гломерула), чтобы объяснять запах.
const famous = {
  V: 'CO₂ — запах паники (Gr21a/Gr63a)',
  DA2: 'геосмин — запах плесени (Or56a)',
  DA1: 'cVA — мужской феромон (Or67d)',
  VA1v: 'феромоны ухаживания (Or47b)',
  VL2a: 'фенилуксусная кислота — «еда и романтика» (Ir84a)',
};

function hash(value) {
  let h = 2166136261;
  for (const char of value) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function ids(value) {
  return (value || '').split(',').map((id) => indexById.get(id.trim())).filter((i) => i !== undefined);
}

function parseQuery(url) {
  const q = url.searchParams;
  const persona = personas.find((p) => p.id === q.get('p'));
  let session = ids(q.get('s'));
  if (!session.length) session = ids((persona || personas[0]).items.join(','));
  const variant = fly.variants[q.get('v')] ? q.get('v') : 'flywire';
  return {
    persona: persona?.id ?? (q.get('s') ? null : personas[0].id),
    session: session.slice(0, 12),
    variant,
    likes: ids(q.get('l')).slice(0, 30),
    dislikes: ids(q.get('d')).slice(0, 30),
  };
}

const cache = new Map();
function sniffCached(query) {
  const key = JSON.stringify(query);
  if (!cache.has(key)) {
    const t = performance.now();
    const result = fly.sniff(query);
    result.ms = performance.now() - t;
    result.key = key;
    if (cache.size > 200) cache.delete(cache.keys().next().value);
    cache.set(key, result);
  }
  return cache.get(key);
}

function card(i, extra = {}) {
  const p = catalog[i];
  return {
    id: p.id, title: p.title, category: p.category, leaf: p.leaf,
    image: localImageIds.has(p.id) ? p.image : (p.cdn ? `/img/${p.id}.jpg` : null),
    url: `https://uzum.uz/ru/search?query=${encodeURIComponent(p.title)}`,
    ...extra,
  };
}

function topGlomeruli(pn, n = 6) {
  return [...pn.keys()].sort((a, b) => pn[b] - pn[a]).slice(0, n).map((g) => ({
    name: fly.model.glomeruli[g], value: Number(pn[g].toFixed(4)), note: famous[fly.model.glomeruli[g]] ?? null,
  }));
}

function sniffResponse(query) {
  const r = sniffCached(query);
  const shownSet = new Set(r.shown.map((x) => x.i));
  const agreement = {};
  for (const name of Object.keys(fly.variants)) {
    const other = sniffCached({ ...query, variant: name }).candidates.slice(0, 50);
    const mine = new Set(r.candidates.slice(0, 50));
    agreement[name] = other.filter((i) => mine.has(i)).length / 50;
  }
  return {
    schema: 2,
    mode: 'live',
    model: { role: 'retrieval+feedback_ranker', connectome: 'FlyWire v783', variant: query.variant, variant_title: fly.variants[query.variant].title, trained_on_users: false, connectome_executed: query.variant === 'flywire' },
    persona: query.persona,
    session: query.session.map((i) => card(i)),
    likes: query.likes.map((i) => catalog[i].id),
    dislikes: query.dislikes.map((i) => catalog[i].id),
    stages: { catalog: fly.N, glomeruli: fly.G, kc_total: fly.K, kc_active: fly.k, candidates: r.candidates.length, shown: r.shown.length },
    smell: {
      orn: Array.from(r.ornMix, (x) => Number(x.toFixed(4))),
      pn: Array.from(r.pn, (x) => Number(x.toFixed(4))),
      top: topGlomeruli(r.pn),
      glomeruli: fly.model.glomeruli,
    },
    shown: r.shown.map((x, rank) => card(x.i, {
      rank: rank + 1,
      fly_score: Number(x.flyScore.toFixed(4)),
      shared_kc: Math.round(x.flyScore * fly.k),
      innate_valence: Number(x.innate.toFixed(4)),
      learned_valence: Number(x.learned.toFixed(4)),
    })),
    candidates_preview: r.candidates.filter((i) => !shownSet.has(i)).slice(0, 8).map((i) => card(i, { fly_score: Number((r.overlap[i] / fly.k).toFixed(4)) })),
    agreement_with: agreement,
    compute_ms: Number(r.ms.toFixed(1)),
  };
}

function meta() {
  return {
    schema: 2,
    catalog_size: fly.N,
    glomeruli: fly.model.glomeruli,
    n_kc: fly.K,
    k: fly.k,
    variants: Object.fromEntries(Object.entries(fly.variants).map(([k, v]) => [k, v.title])),
    personas: personas.map((p) => ({ id: p.id, title: p.title, items: ids(p.items.join(',')).map((i) => card(i)) })),
    famous_glomeruli: famous,
    eval: evalResults && summarizeEval(evalResults),
    lif: lifResults && lifResults.stimuli.map(({ map_spikes_sparse, ...row }) => row),
  };
}

function summarizeEval(r) {
  const groups = new Map();
  for (const row of r.rows) {
    const mapping = row.mapping === 'strength' || row.mapping === '-' ? 'strength' : 'random';
    const key = `${row.variant}|${mapping}`;
    if (!groups.has(key)) groups.set(key, { variant: row.variant, mapping, map: [], leaf_p20: [] });
    groups.get(key).map.push(row.map);
    groups.get(key).leaf_p20.push(row.leaf_p20);
  }
  const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  return {
    n_queries: r.n_queries, truth_k: r.truth_k, timing: r.timing,
    rows: [...groups.values()].map((g) => ({ variant: g.variant, mapping: g.mapping, map: avg(g.map), leaf_p20: avg(g.leaf_p20), runs: g.map.length })),
  };
}

function search(q) {
  const needle = (q || '').trim().toLowerCase();
  if (needle.length < 2) return [];
  const out = [];
  for (let i = 0; i < catalog.length && out.length < 12; i++) {
    if (catalog[i].title.toLowerCase().includes(needle)) out.push(card(i));
  }
  return out;
}

// ---------- анимация CashbackFly-сцены на реальном результате ----------

function presentingAt(offers, top, progressMs) {
  if (progressMs < sweepMs) {
    const scan = Math.min(offers.length - 1, Math.floor(progressMs / (sweepMs / offers.length)));
    return offers[scan];
  }
  const selected = Math.max(0, Math.min(top.length, Math.floor((progressMs - sweepMs) / revealStepMs) + 1));
  return top[Math.min(selected, top.length - 1)];
}

function activityMap(query, itemIndex, r) {
  // Реальная активность модели для товара, который муха нюхает прямо сейчас.
  const { orn, pn, drive, code } = fly.codeForItem(query.variant, itemIndex);
  const m = fly.model.map;
  const sparse = [];
  const push = (slot, value) => { if (slot >= 0 && value > 0) sparse.push(slot, Math.max(1, Math.round(value))); };
  for (const [slot, g] of m.orn) push(slot, orn[g] * 12);
  for (const [slot, g] of m.pn) push(slot, Math.max(0, pn[g]) * 90);
  const meanOrn = orn.reduce((s, x) => s + x, 0) / orn.length;
  for (const slot of m.ln) push(slot, meanOrn * 10);
  for (const kc of code) push(m.kc_slot[kc], drive[kc] * 8);
  for (const slot of m.apl) push(slot, 40);
  const appWeights = Float32Array.from(fly.app0);
  const avoidWeights = Float32Array.from(fly.avoid0);
  for (const i of query.likes) for (const kc of fly.codeForItem(query.variant, i).code) avoidWeights[kc] *= 0.65;
  for (const i of query.dislikes) for (const kc of fly.codeForItem(query.variant, i).code) appWeights[kc] *= 0.65;
  let app = 0, avoid = 0;
  for (const kc of code) { app += appWeights[kc]; avoid += avoidWeights[kc]; }
  for (const [slot, sign] of m.mbon) push(slot, sign > 0 ? app / fly.k * 20 : sign < 0 ? avoid / fly.k * 20 : 4);
  if (query.likes.length || query.dislikes.length) for (const slot of m.dan) push(slot, 6 * (query.likes.length + query.dislikes.length));
  const overlap = r.overlap[itemIndex] / fly.k;
  return { sparse, overlap };
}

function lifSpikes(query) {
  if (!lifResults || !query.persona) return null;
  const rows = lifResults.stimuli.filter((s) => s.persona === query.persona);
  const row = rows.find((s) => s.intensity === 'weak') ?? rows[0];
  return row ? { sparse: row.map_spikes_sparse.flat(), row } : null;
}

function snapshot(query) {
  const r = sniffCached(query);
  const elapsed = Date.now() - startedAt;
  const round = Math.floor(elapsed / roundMs);
  const progressMs = elapsed % roundMs;
  const top = r.shown.map((x) => catalog[x.i].id);
  const shownByIndex = new Map(r.shown.map((x) => [x.i, x]));
  const offers = r.shown.map((x) => {
    const valence = x.innate + x.learned;
    const glom = topGlomeruli(fly.codeForItem(query.variant, x.i).pn, 2).map((g) => g.name);
    return card(x.i, {
      note: `общих KC ${Math.round(x.flyScore * fly.k)} из ${fly.k}`,
      rate: 0,
      boosted: x.learned > 0.001 || (!query.likes.length && valence > 0),
      tags: glom,
      rating: Number(x.flyScore.toFixed(4)),
      fly_score: Number(x.flyScore.toFixed(4)),
      windows: 2,
    });
  });
  const selectedCount = Math.max(0, Math.min(top.length, Math.floor((progressMs - sweepMs) / revealStepMs) + 1));
  const presentingId = presentingAt(top, top, progressMs);
  const presentingIndex = indexById.get(presentingId);
  const sequence = Math.floor(elapsed / 1_000) + 1;
  const history = Array.from({ length: 120 }, (_, n) => {
    const t = elapsed - (119 - n) * 1_000;
    const id = presentingAt(top, top, ((t % roundMs) + roundMs) % roundMs);
    return Number(((r.overlap[indexById.get(id)] / fly.k) * 100).toFixed(2));
  });
  const complete = selectedCount === top.length;
const lif = complete && query.variant === 'flywire' && !query.likes.length && !query.dislikes.length
  && query.persona && query.session.join(',') === ids(personas.find((p) => p.id === query.persona).items.join(',')).slice(0, 12).join(',')
  ? lifSpikes(query) : null;
  const live = activityMap(query, presentingIndex, r);
  const withOverlap = r.overlap.reduce((s, v) => s + (v > 0 ? 1 : 0), 0);
  return {
    schema: 1,
    room: {
      id: 'uzum-fly',
      title: lif ? 'Архив спайков Brian2 · стимул персоны' : `Муха нюхает · ${fly.variants[query.variant].title}`,
      interests: query.session.map((i) => ({ id: catalog[i].id, title: catalog[i].title.slice(0, 46), tags: topGlomeruli(fly.codeForItem(query.variant, i).pn, 2).map((g) => g.name) })),
      interest_tags: [...new Set(offers.flatMap((o) => o.tags))],
    },
    month: { id: `sess-${hash(r.key)}`, title: 'эта сессия' },
    offers,
    selection: { slots: top.length, selected: top.slice(0, selectedCount), top, complete },
    presenting: { id: presentingId, boosted: offers.find((o) => o.id === presentingId)?.boosted ?? false },
    phase: progressMs < sweepMs ? 'sweeping' : complete ? 'complete' : 'revealing',
    progress: { windows_done: Math.min(24, Math.floor(progressMs / (sweepMs / 24))), windows_total: 24, sweep_index: Math.min(2, Math.floor(progressMs / (sweepMs / 2))), sweeps: 2 },
    activity: {
      decision_hz: history.at(-1), decision_history: history,
      motor_hz: progressMs < sweepMs ? 2.8 : 1.3, turn_hz: 12 * Math.sin(elapsed / 2_100),
      sample_ids: [], sample_types: [], sample_counts: [],
      cns_sparse: lif ? lif.sparse : live.sparse, cns_total: fly.model.map.kc_slot.length,
      source: lif ? 'brian2_lif_prerecorded' : 'mushroom_body_static_with_visual_proxies',
    },
    spikes: { window: withOverlap, total: lif ? lif.row.neurons_spiking : fly.N },
    sim_ms: r.ms,
    cycles_done: round,
    uptime_seconds: elapsed / 1_000,
    timestamp: new Date().toISOString(),
    sequence,
    concept: false,
    presenting_detail: shownByIndex.has(presentingIndex) ? { fly_score: live.overlap } : null,
  };
}

// Фото товаров: локальные миниатюры или публичный CDN Uzum через дисковый кеш.
const imageCache = resolve(process.env.IMAGE_CACHE_DIR || resolve(import.meta.dirname, 'data/img-cache'));
const thumbnailCache = resolve(imageCache, 'thumbs');
mkdirSync(thumbnailCache, { recursive: true });
const imageFailures = new Map();
const imageInFlight = new Map();

async function fetchProductImage(id, i, cached) {
  if (imageInFlight.has(id)) return imageInFlight.get(id);
  const request = (async () => {
    const source = catalog[i].cdn;
    if (!source || !source.startsWith('https://images.uzum.uz/') || !source.endsWith('/original.jpg')) return null;
    try {
      const response = await fetch(source.replace(/original\.jpg$/, 't_product_240_high.jpg'), { signal: AbortSignal.timeout(3_500) });
      if (!response.ok || !(response.headers.get('content-type') || '').startsWith('image/jpeg')) return null;
      const body = Buffer.from(await response.arrayBuffer());
      if (!body.length || body.length > 200_000) return null;
      await writeFile(cached, body);
      return body;
    } catch {
      return null;
    }
  })();
  imageInFlight.set(id, request);
  try { return await request; } finally { imageInFlight.delete(id); }
}

async function productImage(res, id) {
  const i = indexById.get(id);
  const thumbnail = resolve(thumbnailCache, `${id}.jpg`);
  const cached = resolve(imageCache, `${id}.jpg`);
  if (i === undefined) return res.writeHead(404).end();
  for (const path of [thumbnail, cached]) {
    if (existsSync(path)) {
      res.writeHead(200, { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=604800' });
      return res.end(await readFile(path));
    }
  }
  const failedAt = imageFailures.get(id);
  if (failedAt && Date.now() - failedAt < 600_000) return res.writeHead(404).end();
  const body = await fetchProductImage(id, i, cached);
  if (body) {
    res.writeHead(200, { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=604800' });
    return res.end(body);
  }
  imageFailures.set(id, Date.now());
  res.writeHead(404).end();
}

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
};

function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'content-type': mime['.json'], 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  try {
    if (pathname === '/api/rooms.json') return sendJson(res, {
      schema: 1,
      rooms: [{ id: 'uzum-fly', title: 'Муха нюхает каталог', snapshot: '/api/rooms/uzum-fly/snapshot.json' }],
      provenance: { release: 'Uzum Fly · FlyWire v783', decision_pool_size: fly.N, cns_map_neurons: fly.model.map.kc_slot.length, learning: true },
    });
    if (pathname === '/api/rooms/uzum-fly/snapshot.json') return sendJson(res, snapshot(parseQuery(url)));
    if (pathname === '/api/fly/meta.json') return sendJson(res, meta());
    if (pathname === '/api/fly/sniff.json') return sendJson(res, sniffResponse(parseQuery(url)));
    if (pathname === '/api/fly/search.json') return sendJson(res, { items: search(url.searchParams.get('q')) });
    if (pathname === '/config.json') return sendJson(res, { payUrl: 'https://uzum.uz/ru/', repoUrl: 'https://github.com/d3xr/uzum-fly' });
    const img = pathname.match(/^\/img\/(\d+)\.jpg$/);
    if (img) return await productImage(res, img[1]);
  } catch (error) {
    console.error(error);
    return sendJson(res, { error: 'internal' }, 500);
  }
  const route = pathname === '/' || pathname === '/bzzzz' ? '/index.html' : pathname;
  const file = resolve(root, '.' + route);
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('Not a file');
    const body = await readFile(file);
    const staticCache = route.startsWith('/images/') || route.startsWith('/fonts/')
      ? 'public, max-age=604800' : route === '/api/cns.json'
        ? 'public, max-age=86400' : route.startsWith('/assets/')
          ? 'public, max-age=3600' : 'no-store';
    res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream', 'cache-control': staticCache });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Uzum Fly: http://localhost:${port}`));
