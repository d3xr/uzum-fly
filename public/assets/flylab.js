// Лаборатория: живой интерфейс к мухе. Всё, что здесь видно, считается на
// сервере моделью lib/fly.mjs по коннектому FlyWire (см. /api/fly/*).

const nf = new Intl.NumberFormat('ru-RU');
const GITHUB = 'https://github.com/d3xr/uzum-fly/blob/main/notebooks/uzum_fly.ipynb';

const state = { persona: 'gamer', session: [], variant: 'flywire', likes: [], dislikes: [] };
let meta = null;
let last = null;
let pending = 0;

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined && content !== null) node.textContent = content;
  return node;
}

function svg(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function query() {
  const q = new URLSearchParams();
  if (state.session.length) q.set('s', state.session.map((p) => p.id).join(','));
  else q.set('p', state.persona);
  if (state.variant !== 'flywire') q.set('v', state.variant);
  if (state.likes.length) q.set('l', state.likes.join(','));
  if (state.dislikes.length) q.set('d', state.dislikes.join(','));
  return q.toString();
}

function readHash() {
  const q = new URLSearchParams(location.hash.slice(1));
  if (q.get('p')) state.persona = q.get('p');
  if (q.get('v')) state.variant = q.get('v');
  if (q.get('l')) state.likes = q.get('l').split(',');
  if (q.get('d')) state.dislikes = q.get('d').split(',');
  if (q.get('s')) state.session = q.get('s').split(',').map((id) => ({ id, title: id }));
}

function thumb(item, size = 'md') {
  const box = el('span', `lab-thumb lab-thumb--${size}`);
  const placeholder = () => {
    box.replaceChildren(el('b', '', (item.category || 'U').slice(0, 2)));
    box.dataset.empty = '';
    box.style.setProperty('--hue', String([...(item.category || 'U')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)));
  };
  if (item.image) {
    const img = el('img');
    img.src = item.image;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = placeholder;
    box.append(img);
  } else {
    placeholder();
  }
  return box;
}

async function refresh() {
  const ticket = ++pending;
  const qs = query();
  window.flyQuery = qs;
  history.replaceState(null, '', `${location.pathname}${location.search}#${qs}`);
  root.dataset.loading = '';
  const response = await fetch(`/api/fly/sniff.json?${qs}`, { cache: 'no-store' });
  const data = await response.json();
  if (ticket !== pending) return;
  last = data;
  if (state.session.length) state.session = data.session;
  delete root.dataset.loading;
  render();
}

// ---------- разметка ----------

const root = el('section', 'panel panel--lab');
root.id = 'lab';
root.setAttribute('aria-label', 'Лаборатория: муха выбирает товары');

function header() {
  const head = el('div', 'lab__head');
  const title = el('div');
  title.append(el('h2', 'panel__title lab__title', 'Дайте мухе понюхать сессию'));
  title.append(el('p', 'lab__lead', 'Выберите покупателя или соберите свою сессию. Муха переведёт товары в запахи и найдёт похожие по всему каталогу. Лайк меняет веса синапсов по правилу, вдохновлённому дофамином.'));
  const badge = el('div', 'lab__badge');
  badge.append(el('span', 'lab__live', 'LIVE'), el('span', '', 'FlyWire v783 · 0 GPU'));
  head.append(title, badge);
  return head;
}

function personaRow() {
  const row = el('div', 'lab__personas');
  row.append(el('span', 'lab__label', 'Кто покупает?'));
  for (const p of meta.personas) {
    const b = el('button', 'lab-chip', p.title);
    b.type = 'button';
    b.dataset.persona = p.id;
    b.addEventListener('click', () => {
      state.persona = p.id;
      state.session = [];
      state.likes = [];
      state.dislikes = [];
      refresh();
    });
    row.append(b);
  }
  return row;
}

function customRow() {
  const row = el('div', 'lab__custom');
  row.append(el('span', 'lab__label', 'Или своя сессия'));
  const wrap = el('div', 'lab__search');
  const input = el('input', 'lab__input');
  input.type = 'search';
  input.placeholder = 'наушники, лоток, удочка, помада…';
  input.setAttribute('aria-label', 'Найти товар для сессии');
  const list = el('div', 'lab__results');
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const r = await fetch(`/api/fly/search.json?q=${encodeURIComponent(input.value)}`).then((x) => x.json());
      list.replaceChildren(...r.items.map((item) => {
        const b = el('button', 'lab__result');
        b.type = 'button';
        b.append(thumb(item, 'sm'), el('span', '', item.title));
        b.addEventListener('click', () => {
          if (!state.session.length) state.session = (last?.session ?? []).slice();
          if (!state.session.some((s) => s.id === item.id)) state.session.push(item);
          state.session = state.session.slice(-8);
          state.likes = [];
          state.dislikes = [];
          list.replaceChildren();
          input.value = '';
          refresh();
        });
        return b;
      }));
    }, 180);
  });
  wrap.append(input, list);
  const chips = el('div', 'lab__session');
  row.append(wrap, chips);
  return row;
}

function variantRow() {
  const row = el('div', 'lab__variants');
  row.append(el('span', 'lab__label', 'Чей мозг?'));
  const seg = el('div', 'lab-seg');
  const labels = { flywire: '🪰 Настоящая муха', shuffled: '🔀 Перемешанная', random: '🎲 Случайный FlyHash' };
  for (const [key, text] of Object.entries(labels)) {
    const b = el('button', 'lab-seg__btn', text);
    b.type = 'button';
    b.dataset.variant = key;
    b.addEventListener('click', () => {
      state.variant = key;
      refresh();
    });
    seg.append(b);
  }
  row.append(seg, el('span', 'lab__agree'));
  return row;
}

function funnel() {
  const rail = el('div', 'lab__funnel');
  const stages = [
    ['catalog', 'Каталог', 'запахов'],
    ['glomeruli', 'Нос', 'гломерул'],
    ['kc', 'Клетки Кеньона', 'горят'],
    ['candidates', 'Кандидаты', 'по overlap'],
    ['mbon', 'MBON', 'лайки / дизлайки'],
    ['shown', 'Полка', 'товаров'],
  ];
  for (const [key, name, unit] of stages) {
    const s = el('div', 'lab__stage');
    s.dataset.stage = key;
    s.append(el('span', 'lab__stage-name', name), el('strong', 'lab__stage-count', '—'), el('span', 'lab__stage-unit', unit));
    rail.append(s);
  }
  return rail;
}

function body() {
  const grid = el('div', 'lab__body');
  const smell = el('div', 'lab__card lab__smell');
  smell.append(el('h3', 'lab__h3', 'Как пахнет сессия'), el('p', 'lab__hint', 'Ответ 51 гломерулы после нормализации в антеннальной доле. Выше ноля — запах «сильнее обычного».'));
  smell.append(svg('svg', { class: 'lab__bars', viewBox: '0 0 510 150', role: 'img', 'aria-label': 'Ответы гломерул' }));
  smell.append(el('ul', 'lab__gloms'));
  const picks = el('div', 'lab__card lab__picks');
  const ph = el('div', 'lab__picks-head');
  ph.append(el('h3', 'lab__h3', 'Что выбрала муха'), el('span', 'lab__ms'));
  picks.append(ph, el('ol', 'lab__list'));
  grid.append(smell, picks);
  return grid;
}

function science() {
  const box = el('details', 'lab__science');
  box.append(el('summary', '', 'Наука: настоящая ли от мухи польза? Честные результаты'));
  const inner = el('div', 'lab__science-body');
  box.append(inner);
  if (!meta.eval) {
    inner.append(el('p', 'lab__hint', 'Офлайн-эксперимент ещё не запускался: experiments/offline_eval.py'));
    return box;
  }
  const rows = meta.eval.rows;
  const pick = (v, m = 'strength') => rows.find((r) => r.variant === v && r.mapping === m);
  const bars = [
    ['Точный поиск (384 измерения)', pick('dense_384'), 'ref'],
    ['Плотный вектор 51 гломерулы', pick('dense_pn51'), 'ref'],
    ['🔀 Перемешанная муха', pick('shuffled'), 'fly'],
    ['🪰 Настоящая муха FlyWire', pick('flywire'), 'real'],
    ['🎲 Случайный FlyHash', pick('random_flyhash'), 'fly'],
    ['LSH (SimHash), 234 бита', pick('simhash_pn51'), 'base'],
    ['🪰 Настоящая, гломерулы вразнобой', pick('flywire', 'random'), 'real'],
  ].filter((b) => b[1]);
  inner.append(el('p', 'lab__hint', `Для ${nf.format(meta.eval.n_queries)} товаров ищем ${meta.eval.truth_k} ближайших соседей по тому же текстовому эмбеддингу названия, из которого построен вход модели. mAP измеряет сохранение близости, а не качество рекомендаций. KC-код требует 4 678 бит; SimHash ниже получает 234 бита.`));
  const chart = el('div', 'lab__chart');
  for (const [name, row, kind] of bars) {
    const line = el('div', 'lab__bar');
    line.dataset.kind = kind;
    const fill = el('span', 'lab__bar-fill');
    fill.style.width = `${(row.map * 100).toFixed(1)}%`;
    line.append(el('span', 'lab__bar-name', name), fill, el('span', 'lab__bar-value', row.map.toFixed(3)));
    chart.append(line);
  }
  inner.append(chart);
  const facts = el('ul', 'lab__facts');
  const real = pick('flywire');
  const shuffled = pick('shuffled');
  const random = pick('random_flyhash');
  const randomMapping = pick('flywire', 'random');
  const f = [
    `Код KC использует измеренную проводку FlyWire и 5% активных клеток. Сравнение с SimHash на равном бюджете памяти и времени пока не проводилось.`,
    real && shuffled ? `Измеренная проводка: ${real.map.toFixed(3)} mAP; контроль с сохранением степеней нейронов: ${shuffled.map.toFixed(3)}. По этим данным ${real.map > shuffled.map ? 'есть преимущество измеренной проводки, которое нужно проверить на независимых данных' : 'преимущество измеренной проводки не обнаружено'}.` : '',
    real && random && randomMapping ? `Случайный FlyHash: ${random.map.toFixed(3)}; FlyWire со случайной раскладкой признаков по гломерулам: ${randomMapping.map.toFixed(3)}. Назначение признаков влияет на результат.` : '',
    `Индекс каталога: ${meta.eval.timing.index_build_s} с; запрос сессии: ${meta.eval.timing.session_query_ms} мс на CPU. Реальные сессии Uzum пока не проверены.`,
  ].filter(Boolean);
  for (const t of f) facts.append(el('li', '', t));
  inner.append(facts);
  if (meta.lif?.length) {
    const weak = meta.lif.filter((r) => r.intensity === 'weak');
    const strong = meta.lif.filter((r) => r.intensity === 'strong');
    const avg = (a, k) => a.reduce((s, r) => s + r[k], 0) / Math.max(1, a.length);
    const lif = el('p', 'lab__hint');
    lif.textContent = `Спайковая проверка: LIF-модель FlyWire (Shiu et al., Brian2) на заданных запахах персон. При слабом запахе активны ${(avg(weak, 'kc_active') * 100).toFixed(0)}% KC, при сильном — ${(avg(strong, 'kc_active') * 100).toFixed(0)}%; разреженного кода эта настройка не дала. Совпадение top-234 спайкующих KC со статическим кодом: ${avg(weak, 'topk_overlap_with_static_code').toFixed(0)} против ${avg(weak, 'topk_overlap_chance').toFixed(0)} случайно ожидаемых. Причина высокой активности без отдельных контролей не установлена. Товары выбирает статический контур; запись спайков показывается после сборки полки только для исходной персоны и проводки FlyWire.`;
    inner.append(lif);
  }
  const link = el('a', 'lab__link', 'Открыть ноутбук с разбором →');
  link.href = GITHUB;
  link.target = '_blank';
  link.rel = 'noopener';
  inner.append(link);
  return box;
}

// ---------- отрисовка результата ----------

function render() {
  if (!last) return;
  root.querySelectorAll('[data-persona]').forEach((b) => b.toggleAttribute('data-active', !state.session.length && b.dataset.persona === state.persona));
  root.querySelectorAll('[data-variant]').forEach((b) => b.toggleAttribute('data-active', b.dataset.variant === state.variant));

  const chips = root.querySelector('.lab__session');
  chips.replaceChildren(...last.session.map((item) => {
    const c = el('span', 'lab-sess');
    c.append(thumb(item, 'xs'), el('span', 'lab-sess__t', item.title));
    const x = el('button', 'lab-sess__x', '×');
    x.type = 'button';
    x.title = 'Убрать из сессии';
    x.addEventListener('click', () => {
      state.session = last.session.filter((s) => s.id !== item.id);
      if (!state.session.length) state.session = [];
      refresh();
    });
    c.append(x);
    return c;
  }));

  const other = Object.entries(last.agreement_with).filter(([k]) => k !== state.variant);
  root.querySelector('.lab__agree').textContent = `совпадение top-50 с другими мозгами: ${other.map(([k, v]) => `${k === 'flywire' ? 'настоящая' : k === 'shuffled' ? 'перемешанная' : 'случайная'} ${(v * 100).toFixed(0)}%`).join(' · ')}`;

  const s = last.stages;
  const counts = { catalog: nf.format(s.catalog), glomeruli: s.glomeruli, kc: `${s.kc_active} / ${nf.format(s.kc_total)}`, candidates: s.candidates, mbon: `${last.likes.length}👍 ${last.dislikes.length}👎`, shown: s.shown };
  root.querySelectorAll('.lab__stage').forEach((n) => { n.querySelector('.lab__stage-count').textContent = counts[n.dataset.stage]; });

  drawBars(last.smell);
  const gl = root.querySelector('.lab__gloms');
  gl.replaceChildren(...last.smell.top.slice(0, 4).map((g) => {
    const li = el('li');
    li.append(el('b', '', g.name), el('span', '', g.note ?? `гломерула ${g.name}: +${g.value.toFixed(2)}`));
    return li;
  }));

  root.querySelector('.lab__ms').textContent = `мозг посчитан за ${last.compute_ms} мс`;
  const list = root.querySelector('.lab__list');
  list.replaceChildren(...last.shown.map((item) => {
    const li = el('li', 'lab-pick');
    if (state.likes.includes(item.id)) li.dataset.liked = '';
    const link = el('a', 'lab-pick__title', item.title);
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const metaLine = el('span', 'lab-pick__meta');
    const learned = item.learned_valence;
    metaLine.textContent = `${item.category} · общих KC ${item.shared_kc}/${s.kc_active}${Math.abs(learned) > 0.001 ? ` · выученная валентность ${learned > 0 ? '+' : ''}${(learned * 100).toFixed(0)}` : ''}`;
    const text = el('span', 'lab-pick__text');
    text.append(link, metaLine);
    const meter = el('span', 'lab-pick__meter');
    meter.style.setProperty('--v', item.fly_score.toFixed(3));
    const actions = el('span', 'lab-pick__actions');
    for (const [label, key, list2] of [['👍', 'like', 'likes'], ['👎', 'dislike', 'dislikes']]) {
      const b = el('button', 'lab-pick__btn', label);
      b.type = 'button';
      b.title = key === 'like' ? 'Нравится: ослабить вес избегания по упрощённому правилу' : 'Не нравится: ослабить вес приближения по упрощённому правилу';
      b.addEventListener('click', () => {
        const other2 = list2 === 'likes' ? 'dislikes' : 'likes';
        state[other2] = state[other2].filter((id) => id !== item.id);
        state[list2] = state[list2].includes(item.id) ? state[list2].filter((id) => id !== item.id) : [...state[list2], item.id];
        refresh();
      });
      actions.append(b);
    }
    li.append(el('span', 'lab-pick__rank', String(item.rank)), thumb(item), text, meter, actions);
    return li;
  }));
}

function drawBars(smell) {
  const box = root.querySelector('.lab__bars');
  box.replaceChildren();
  const pn = smell.pn;
  const max = Math.max(...pn.map(Math.abs), 1e-6);
  const w = 510 / pn.length;
  const top = new Set(smell.top.slice(0, 4).map((g) => g.name));
  box.append(svg('line', { x1: 0, x2: 510, y1: 75, y2: 75, class: 'lab__axis' }));
  pn.forEach((v, g) => {
    const h = (Math.abs(v) / max) * 68;
    const r = svg('rect', { x: (g * w + 1).toFixed(1), width: (w - 2).toFixed(1), y: v >= 0 ? 75 - h : 75, height: Math.max(0.5, h), rx: 1.5, class: v >= 0 ? 'lab__bar-up' : 'lab__bar-down' });
    const t = svg('title');
    t.textContent = `${smell.glomeruli[g]}: ${v.toFixed(3)}`;
    r.append(t);
    box.append(r);
    if (top.has(smell.glomeruli[g])) {
      const label = svg('text', { x: (g * w + w / 2).toFixed(1), y: 75 - h - 4, class: 'lab__bar-label', 'text-anchor': 'middle' });
      label.textContent = smell.glomeruli[g];
      box.append(label);
    }
  });
}

async function start() {
  readHash();
  meta = await fetch('/api/fly/meta.json', { cache: 'no-store' }).then((r) => r.json());
  root.append(header(), personaRow(), customRow(), variantRow(), funnel(), body(), science());
  const app = document.getElementById('app');
  const mount = () => {
    const grid = app.querySelector('.grid');
    if (!grid) return false;
    grid.insertBefore(root, grid.querySelector('.zone--stage'));
    return true;
  };
  if (!mount()) {
    const observer = new MutationObserver(() => mount() && observer.disconnect());
    observer.observe(app, { childList: true, subtree: true });
  }
  await refresh();
}

readHash();
window.flyQuery = query();
start().catch((error) => console.error('Fly lab unavailable', error));
