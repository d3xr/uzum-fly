// Грибовидное тело мухи на JS. Та же математика, что flyrec/ (Python):
// смесь ORN сессии → антеннальная доля → KC (гомеостаз) → APL top-k → MBON.
// Паритет с Python проверяется при старте по контрольным кодам из model.json.

import { readFileSync } from 'node:fs';

export function loadFly(dir, titleKey = null) {
  const model = JSON.parse(readFileSync(new URL('model.json', dir), 'utf8'));
  const buf = readFileSync(new URL('orn.f32', dir));
  const G = model.glomeruli.length;
  const orn = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
  const N = orn.length / G;
  if (N !== model.catalog_size) throw new Error(`orn.f32: ${N} rows, expected ${model.catalog_size}`);
  const K = model.n_kc;
  const k = Math.max(1, Math.round(model.sparsity * K));
  const { sigma, m } = model.al;

  function antennalLobe(r) {
    let mean = 0;
    for (let g = 0; g < G; g++) mean += r[g];
    mean /= G;
    const inhib = Math.pow(m * mean, 1.5);
    const s15 = Math.pow(sigma, 1.5);
    const pn = new Float32Array(G);
    let avg = 0;
    for (let g = 0; g < G; g++) {
      const x = Math.pow(Math.max(r[g], 0), 1.5);
      pn[g] = x / (x + s15 + inhib);
      avg += pn[g];
    }
    avg /= G;
    for (let g = 0; g < G; g++) pn[g] -= avg;
    return pn;
  }

  const variants = {};
  for (const [name, v] of Object.entries(model.variants)) {
    const ptr = Int32Array.from(v.ptr), glom = Int32Array.from(v.glom), w = Float32Array.from(v.w);
    const mu = Float32Array.from(v.mu), sd = Float32Array.from(v.sd);
    const drive = (pn) => {
      const d = new Float32Array(K);
      for (let j = 0; j < K; j++) {
        let s = 0;
        for (let e = ptr[j]; e < ptr[j + 1]; e++) s += pn[glom[e]] * w[e];
        d[j] = (s - mu[j]) / sd[j];
      }
      return d;
    };
    const codeOf = (pn) => topK(drive(pn), k);
    // Коды всего каталога и инвертированный индекс KC → товары.
    const codes = new Uint16Array(N * k);
    const postings = Array.from({ length: K }, () => []);
    const row = new Float32Array(G);
    for (let i = 0; i < N; i++) {
      for (let g = 0; g < G; g++) row[g] = orn[i * G + g];
      const c = codeOf(antennalLobe(row));
      codes.set(c, i * k);
      for (const kc of c) postings[kc].push(i);
    }
    const inverted = postings.map((list) => Uint32Array.from(list));
    let agree = 0, total = 0;
    for (const [i, ref] of Object.entries(v.check_codes)) {
      const mine = new Set(codes.subarray(Number(i) * k, Number(i) * k + k));
      agree += ref.filter((x) => mine.has(x)).length;
      total += ref.length;
    }
    if (agree / total < 0.97) throw new Error(`fly parity ${name}: ${(agree / total).toFixed(3)}`);
    variants[name] = { title: v.title, drive, codeOf, codes, inverted, parity: agree / total };
  }

  const appScale = Math.max(mean(model.w_app), mean(model.w_avoid), 1e-6);
  const app0 = Float32Array.from(model.w_app, (x) => x / appScale);
  const avoid0 = Float32Array.from(model.w_avoid, (x) => x / appScale);

  function itemCode(variant, i) {
    return variants[variant].codes.subarray(i * k, i * k + k);
  }

  function mixOrn(indices) {
    const mix = new Float32Array(G);
    indices.forEach((i, n) => {
      const weight = 1 + n * 0.25; // свежие просмотры пахнут сильнее
      for (let g = 0; g < G; g++) mix[g] += orn[i * G + g] * weight;
    });
    const total = indices.reduce((s, _, n) => s + 1 + n * 0.25, 0);
    for (let g = 0; g < G; g++) mix[g] /= total;
    return mix;
  }

  /** Полный проход: сессия → кандидаты → MBON-ранкер с дофаминовым обучением. */
  function sniff({ session, variant = 'flywire', likes = [], dislikes = [], retrieve = 200, show = 12, lr = 0.35 }) {
    const v = variants[variant];
    const ornMix = mixOrn(session);
    const pn = antennalLobe(ornMix);
    const drive = v.drive(pn);
    const code = topK(drive, k);

    // Retrieval: считаем общие активные KC через инвертированный индекс.
    const overlap = new Uint16Array(N);
    for (const kc of code) for (const i of v.inverted[kc]) overlap[i]++;
    const seen = new Set(session);
    const cand = topIndices(overlap, retrieve + seen.size).filter((i) => !seen.has(i)).slice(0, retrieve);

    // Ранкер: MBON «подойти» − «уйти»; лайк/дизлайк = дофамин, LTD синапсов KC→MBON.
    const app = Float32Array.from(app0), avoid = Float32Array.from(avoid0);
    for (const i of likes) for (const kc of itemCode(variant, i)) avoid[kc] *= 1 - lr;
    for (const i of dislikes) for (const kc of itemCode(variant, i)) app[kc] *= 1 - lr;
    const valence = (i, a, b) => {
      let s = 0;
      for (const kc of itemCode(variant, i)) s += a[kc] - b[kc];
      return s / k;
    };
    const ranked = cand.map((i) => {
      const innate = valence(i, app0, avoid0);
      const learned = valence(i, app, avoid) - innate;
      const flyScore = overlap[i] / k;
      return { i, flyScore, innate, learned, score: flyScore + 2.5 * learned };
    }).sort((a, b) => b.score - a.score || b.flyScore - a.flyScore);

    const disliked = new Set(dislikes);
    const titles = new Set();
    const shown = [];
    for (const r of ranked) {
      if (disliked.has(r.i)) continue;
      const key = titleKey ? titleKey(r.i) : r.i;
      if (titles.has(key)) continue;
      titles.add(key);
      shown.push(r);
      if (shown.length === show) break;
    }
    return { ornMix, pn, drive, code, candidates: cand, overlap, ranked, shown };
  }

  function codeForItem(variant, i) {
    const row = orn.subarray(i * G, i * G + G);
    const pn = antennalLobe(row);
    return { orn: row, pn, drive: variants[variant].drive(pn), code: itemCode(variant, i) };
  }

  return { model, N, G, K, k, variants, sniff, codeForItem, app0, avoid0 };
}

function mean(a) {
  return a.reduce((s, x) => s + x, 0) / a.length;
}

const scratch = { buf: new Float32Array(0) };

function topK(values, k) {
  // k-я по величине через quickselect, затем индексы выше порога (ничьи — по индексу).
  if (scratch.buf.length < values.length) scratch.buf = new Float32Array(values.length);
  const a = scratch.buf.subarray(0, values.length);
  a.set(values);
  let lo = 0, hi = a.length - 1;
  const target = k - 1;
  while (lo < hi) {
    const pivot = a[(lo + hi) >> 1];
    let i = lo, j = hi;
    while (i <= j) {
      while (a[i] > pivot) i++;
      while (a[j] < pivot) j--;
      if (i <= j) { const t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; }
    }
    if (target <= j) hi = j; else if (target >= i) lo = i; else break;
  }
  const threshold = a[target];
  const out = new Uint16Array(k);
  let n = 0;
  for (let i = 0; i < values.length && n < k; i++) if (values[i] > threshold) out[n++] = i;
  for (let i = 0; i < values.length && n < k; i++) if (values[i] === threshold) out[n++] = i;
  return out;
}

function topIndices(values, n) {
  // Частичная сортировка по счётчику overlap (значения ≤ k, поэтому bucket sort).
  let max = 0;
  for (const v of values) if (v > max) max = v;
  const out = [];
  for (let level = max; level > 0 && out.length < n; level--) {
    for (let i = 0; i < values.length && out.length < n; i++) if (values[i] === level) out.push(i);
  }
  return out;
}
