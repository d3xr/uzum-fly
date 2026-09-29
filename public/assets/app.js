(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) n(s);
  new MutationObserver((s) => {
    for (const r of s)
      if (r.type === "childList")
        for (const a of r.addedNodes)
          a.tagName === "LINK" && a.rel === "modulepreload" && n(a);
  }).observe(document, { childList: !0, subtree: !0 });
  function e(s) {
    const r = {};
    return (
      s.integrity && (r.integrity = s.integrity),
      s.referrerPolicy && (r.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === "use-credentials"
        ? (r.credentials = "include")
        : s.crossOrigin === "anonymous"
          ? (r.credentials = "omit")
          : (r.credentials = "same-origin"),
      r
    );
  }
  function n(s) {
    if (s.ep) return;
    s.ep = !0;
    const r = e(s);
    fetch(s.href, r);
  }
})();
const va = 1e3,
  bs = {
    payUrl: "https://uzum.uz/ru/",
    shareUrl: window.location.href,
  };
async function mc(i) {
  try {
    const t = await fetch("/config.json", { cache: "no-store", signal: i });
    if (!t.ok) return bs;
    const e = await t.json();
    return { ...bs, ...e };
  } catch {
    return bs;
  }
}
async function xc(i) {
  const t = await fetch("/api/rooms.json", { cache: "no-store", signal: i });
  if (!t.ok) throw new Error(`индекс комнат: HTTP ${t.status}`);
  return await t.json();
}
async function _c(i, t = 5) {
  let e;
  for (let n = 0; n < t; n++) {
    try {
      const s = await fetch("/api/cns.json", {
        cache: "force-cache",
        signal: i,
      });
      if (s.ok) return await s.json();
      e = new Error(`карта ЦНС: HTTP ${s.status}`);
    } catch (s) {
      if (s?.name === "AbortError") throw s;
      e = s;
    }
    await new Promise((s) => setTimeout(s, 1e3 * (n + 1)));
  }
  throw e;
}
function gc(i, t) {
  const e = `/api/rooms/${encodeURIComponent(i)}/snapshot.json`;
  let n,
    s = !1,
    r = -1,
    a = 0;
  const o = new AbortController(),
    l = async () => {
      if (s) return;
      if (document.hidden) {
        n = window.setTimeout(l, 3000);
        return;
      }
      const c = performance.now();
      try {
        const p = await fetch(e + (window.flyQuery ? "?" + window.flyQuery : ""), { cache: "no-store", signal: o.signal });
        if (!p.ok) throw new Error(`снимок: HTTP ${p.status}`);
        const _ = await p.json();
        ((a = 0), _.sequence > r && ((r = _.sequence), t.onSnapshot(_)));
      } catch (p) {
        !s && p?.name !== "AbortError" && ((a += 1), a <= 3 && t.onError?.(p));
      }
      if (s) return;
      const u = performance.now() - c,
        h = Math.min(va * 2 ** a, 15e3),
        f = a ? h : va;
      n = window.setTimeout(l, Math.max(0, f - u));
    };
  return (
    l(),
    () => {
      ((s = !0), o.abort(), n !== void 0 && window.clearTimeout(n));
    }
  );
}
function vc() {
  return new URLSearchParams(window.location.search).get("room");
}
function Mc(i) {
  const t = new URL(window.location.href);
  (t.searchParams.set("room", i), window.history.replaceState({}, "", t));
}
const Ma = new Map(),
  Sc = 24;
function bc(i, t = Sc) {
  const e = `${i}@${t}`,
    n = Ma.get(e);
  if (n) return n;
  const s = new Promise((r, a) => {
    const o = new Image();
    ((o.crossOrigin = "anonymous"),
      (o.onload = () => {
        const l = document.createElement("canvas");
        ((l.width = t), (l.height = t));
        const c = l.getContext("2d");
        ((c.imageSmoothingEnabled = !1), c.drawImage(o, 0, 0, t, t));
        const u = document.createElement("canvas"),
          h = t * 4;
        ((u.width = h), (u.height = h));
        const f = u.getContext("2d");
        ((f.imageSmoothingEnabled = !1),
          f.drawImage(l, 0, 0, h, h),
          r(u.toDataURL("image/png")));
      }),
      (o.onerror = () => a(new Error(`иконка не загрузилась: ${i}`))),
      (o.src = i));
  });
  return (Ma.set(e, s), s);
}
function Ec(i, t) {
  bc(t)
    .then((e) => {
      ((i.style.backgroundImage = `url(${e})`), (i.dataset.pixelated = ""));
    })
    .catch(() => {});
}
let To = {};
fetch("/icons/index.json")
  .then((i) => (i.ok ? i.json() : {}))
  .then((i) => {
    To = i;
  })
  .catch(() => {});
function lt(i, t, e) {
  const n = document.createElement(i);
  return (t && (n.className = t), e !== void 0 && (n.textContent = e), n);
}
const Es = (i, t = 1) => i.toFixed(t).replace(".", ","),
  ir = (i) => i.toLocaleString("ru-RU");
function yc(i) {
  const t = [];
  return (
    i.forEach(([e, n], s) => {
      (s > 0 && t.push(document.createTextNode(" · ")),
        t.push(lt("span", "service__label", e)),
        t.push(lt("span", "service__value", n)));
    }),
    t
  );
}
function ys(i, t, e, n) {
  const s = i % 10,
    r = i % 100;
  return s === 1 && r !== 11
    ? t
    : s >= 2 && s <= 4 && (r < 12 || r > 14)
      ? e
      : n;
}
const Tc = 1200,
  Ac = 420,
  wc = 420;
class Rc {
  root = lt("section", "panel panel--categories");
  heading = lt("h2", "panel__title");
  counter = lt("div", "cats__counter");
  card = lt("div", "cats__card");
  list = lt("ol", "cats");
  shown = [];
  nextRevealAt = 0;
  month = "";
  swapping = !1;
  rowCount = 12;
  offerKey = "";
  constructor() {
    const t = lt("div", "cats__with");
    (t.append(
      lt("span", "cats__with-text", "Площадка"),
      lt("span", "yapay", "U"),
      lt("span", "cats__with-text", "Uzum Market"),
    ),
      this.card.append(this.list),
      this.root.append(this.heading, this.counter, t, this.card));
  }
  render(t) {
    const { slots: e } = t.selection;
    (this.advanceReveal(t),
      (this.heading.textContent = "Муха выбрала · 12 из 24 252"),
      (this.counter.textContent = `Вынюхано ${this.shown.length} из ${e}`));
    const n = new Set(this.shown),
      s = this.shown.length >= e ? null : (t.presenting?.id ?? null);
    if (this.swapping) return;
    this.rowCount = t.offers.length;
    const key = t.offers.map((offer) => `${offer.id}:${offer.image}:${offer.note}:${offer.boosted}`).join("|");
    if (key !== this.offerKey || this.list.children.length !== t.offers.length) {
      this.list.replaceChildren(...t.offers.map((offer) => this.row(offer, n, s)));
      this.offerKey = key;
    } else {
      for (const row of this.list.children) {
        const selected = n.has(row.dataset.id);
        row.toggleAttribute("data-selected", selected);
        row.toggleAttribute("data-presenting", row.dataset.id === s);
        row.querySelector(".cat__box")?.setAttribute("aria-label", selected ? "выбрано мухой" : "ещё нюхает");
      }
    }
  }
  allShown(t) {
    return (
      t.selection.complete &&
      this.shown.length >= t.selection.slots &&
      !this.swapping
    );
  }
  advanceReveal(t) {
    const e = t.selection.selected,
      n = t.month?.id ?? "";
    if (
      (n !== this.month &&
        ((this.month = n),
        (this.shown = []),
        (this.nextRevealAt = 0),
        this.swapping && this.finishSwap()),
      this.swapping)
    )
      return;
    e.length < this.shown.length && (this.shown = e.slice());
    const s = performance.now();
    this.shown.length < e.length &&
      s >= this.nextRevealAt &&
      ((this.shown = e.slice(0, this.shown.length + 1)),
      (this.nextRevealAt = s + Tc));
  }
  finishSwap() {
    ((this.swapping = !1),
      delete this.card.dataset.loading,
      (this.card.dataset.entering = ""),
      window.setTimeout(() => delete this.card.dataset.entering, wc));
  }
  press() {
    this.swapping ||
      ((this.swapping = !0),
      (this.offerKey = ""),
      (this.card.dataset.leaving = ""),
      window.setTimeout(() => {
        (delete this.card.dataset.leaving,
          (this.card.dataset.loading = ""),
          this.list.replaceChildren(...this.buildSkeleton()));
      }, Ac));
  }
  buildSkeleton() {
    return Array.from({ length: this.rowCount }, () => {
      const t = lt("li", "cat cat--skeleton");
      return (
        t.append(
          lt("span", "cat__icon cat__icon--skeleton"),
          lt("span", "cat__title cat__title--skeleton"),
          lt("span", "cat__box cat__box--skeleton"),
        ),
        t
      );
    });
  }
  row(t, e, n) {
    const s = lt("li", "cat");
    ((s.dataset.id = t.id),
      e.has(t.id) && (s.dataset.selected = ""),
      t.id === n && (s.dataset.presenting = ""),
      t.boosted && (s.dataset.boosted = ""));
    const r = lt("span", "cat__icon"),
      a = To[t.id];
    if (t.image) {
      const photo = lt("img", "cat__photo");
      photo.src = t.image;
      photo.alt = "";
      photo.loading = "lazy";
      photo.onerror = () => { photo.remove(); r.dataset.empty = (t.category || "U").slice(0, 2); };
      r.append(photo);
    }
    const o = lt("span", "cat__box");
    ((o.innerHTML =
      '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true"><path d="M3 8.5L6.2 11.5L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'),
      o.setAttribute("role", "img"),
      o.setAttribute(
        "aria-label",
        e.has(t.id) ? "выбрано мухой" : "ещё нюхает",
      ));
    const l = lt("a", "cat__title", t.title);
    l.href = t.url || "https://uzum.uz/ru/";
    l.target = "_blank";
    l.rel = "noopener noreferrer";
    const detail = lt("span", "cat__detail");
    const meta = lt("span", "cat__meta", `${t.category || "Uzum Market"} · ${t.note || ""}`);
    detail.append(l, meta);
    return (s.append(r, detail, o), s);
  }
}
const Ei = [
    [0, [165, 185, 210]],
    [0.3, [70, 155, 220]],
    [0.55, [120, 220, 110]],
    [0.78, [255, 225, 60]],
    [1, [255, 130, 30]],
  ],
  Cc = Math.asinh(20),
  Pc = 300;
function Dc(i) {
  const t = Math.max(0, Math.min(1, i));
  for (let e = 1; e < Ei.length; e++) {
    const [n, s] = Ei[e - 1],
      [r, a] = Ei[e];
    if (t <= r) {
      const o = (t - n) / (r - n);
      return [
        Math.round(s[0] + (a[0] - s[0]) * o),
        Math.round(s[1] + (a[1] - s[1]) * o),
        Math.round(s[2] + (a[2] - s[2]) * o),
      ];
    }
  }
  return Ei[Ei.length - 1][1];
}
class Lc {
  root = lt("section", "panel panel--cns");
  canvas = lt("canvas", "cns__canvas");
  legend = lt("div", "cns__legend");
  map = null;
  glow = new Float32Array(0);
  target = new Float32Array(0);
  history = new Map();
  frame = 0;
  lastFrameAt = 0;
  constructor() {
    const t = lt("div", "cns__head");
    (t.append(
      lt("div", "cns__label", "Мозг мухи · координаты нейронов FlyWire"),
      lt("span", "cns__dot"),
    ),
      (this.canvas.width = 900),
      (this.canvas.height = 420),
      this.root.append(t, this.canvas, this.legend));
  }
  setMap(t) {
    ((this.map = t),
      (this.glow = new Float32Array(t.neurons)),
      (this.target = new Float32Array(t.neurons)),
      this.history.clear(),
      this.legend.replaceChildren(
        ...t.parts.map((e) => {
          const n = lt("span", "cns__legend-item"),
            s = lt("i");
          return (
            s.append(
              lt("span", "cns__legend-count", ir(e.slots.length)),
              document.createTextNode(" нейронов"),
            ),
            n.append(lt("b", void 0, e.title), s),
            n
          );
        }),
      ),
      this.frame || (this.frame = requestAnimationFrame(() => this.draw())));
  }
  personalScale(t) {
    const e = this.history.get(t);
    if (!e || e.length === 0) return 1e-5;
    const n = [...e].sort((r, a) => r - a),
      s = Math.min(n.length - 1, Math.ceil(0.95 * n.length) - 1);
    return Math.max(n[s], 1e-5);
  }
  update(t) {
    if (!this.map) return;
    this.target.fill(0);
    const e = t.activity.cns_sparse;
    for (let n = 0; n < e.length; n += 2) {
      const s = e[n],
        r = e[n + 1];
      if (s >= this.target.length) continue;
      let a = this.history.get(s);
      (a || ((a = []), this.history.set(s, a)),
        a.push(r),
        a.length > Pc && a.shift());
      const o = this.personalScale(s);
      this.target[s] = Math.min(1, Math.asinh(r / (o * 0.5)) / Cc);
    }
  }
  draw() {
    this.frame = requestAnimationFrame(() => this.draw());
    const t = this.map;
    if (!t || document.hidden) return;
    const now = performance.now();
    if (this.lastFrameAt && now - this.lastFrameAt < 32) return;
    const e = this.canvas.getContext("2d"),
      { width: n, height: s } = this.canvas;
    e.clearRect(0, 0, n, s);
    const r = now,
      a = this.lastFrameAt ? r - this.lastFrameAt : 16;
    this.lastFrameAt = r;
    const l = 1 - Math.exp(-a / 280),
      c = 16,
      u = 24,
      h = (n - c * 2 - u) / 2,
      f = s - c * 2;
    t.parts.forEach((p, _) => {
      const S = c + _ * (h + u),
        m = c;
      for (let d = 0; d < p.slots.length; d++) {
        const E = p.slots[d];
        this.glow[E] += ((this.target[E] ?? 0) - this.glow[E]) * l;
        const b = this.glow[E],
          y = S + p.x[d] * h,
          R = m + p.y[d] * f,
          [T, w, L] = Dc(b),
          M = 0.45 + b * 0.55,
          g = 1.6 + b * 7;
        ((e.fillStyle = `rgba(${T}, ${w}, ${L}, ${M})`),
          e.fillRect(y - g / 2, R - g / 2, g, g));
      }
    });
  }
}
const Uc =
    "Бззззззззззззз-бз-бз-бзззззззззззззбзбзбзбзбз-бзззззззззз бзз-бз-бззззззззззззз бзбзбз-бззззззззззззззззз-бз-бз бззз-бз бз-бз-бзззззззззззззбзбзбзбзбз-бзззззззззз бзз-бз-бззззззззззззз бзбзбз-бззззззззззззззззз-бз-бз бззз-бзбзбз-бззззззззззззззззз-бз-бз бззз-бз бз-бз-бзззззззззззззбзбзбзбзбз-бзззззззззз бзз-бз-бззззззззззззз бзбзбз-бззззззззззззззззз-бз-бз бззз бз-бз-бзззззззззззззбзбзбзбзбз-бзззззззззз бзз-бз-бззззззззззззз бзбзбз-бззззззззззззззззз-бз-бз бззз-бз бз-бз-бзззззззззззззбзбзбзбзбз-бзззззззззз бзз-бз-бззззззззззззз бзбзбз-бззззззззззззззззз-бз-бз бззз-бзбзбз-бззззззззззззззззз-бз-бз бззз-бз бз-бз-бзззззззззззззбзбзбзбзбз-бзззззззззз бзз-бз.",
  Ic = [
    {
      title: "Это правда мозг мухи?",
      body: "Да. Связи взяты из FlyWire v783 — полного коннектома дрозофилы (139 тыс. нейронов). Для выбора товаров исполняется статический обонятельный путь: 51 гломерула → 4 678 клеток Кеньона → изменение выхода MBON после обратной связи.",
    },
    {
      title: "Как муха выбирает товары",
      body: "Товар превращается в искусственный запах: текстовый эмбеддинг → 51 канал гломерул. Клетки Кеньона суммируют входы по измеренным синапсам, правило top-5% оставляет самые возбуждённые клетки. Похожие товары часто зажигают одни и те же клетки.",
    },
    {
      title: "А лайки?",
      body: "Лайк включает упрощённое правило обучения, вдохновлённое дофаминовой пластичностью: веса активных клеток Кеньона на выходе «уйти» ослабевают. Похожие товары поднимаются выше. Сами дофаминовые нейроны здесь не моделируются.",
    },
    {
      title: "Честно о результатах",
      body: "Проверка на текстовых эмбеддингах измеряет, сохраняет ли муховый код близость товаров. Это ещё не проверка рекомендаций. Сравнение с классическим LSH было при разном размере кода; реальные пользовательские сессии пока не исследованы. Числа и контроли — в лаборатории и ноутбуке.",
    },
  ];
function Nc() {
  const i = lt("div", "help"),
    t = lt("div", "help__tabs"),
    e = lt("button", "help__tab toggle toggle--body", "Бзззз"),
    n = lt("button", "help__tab toggle toggle--body", "На человеческом");
  ((e.type = "button"),
    (n.type = "button"),
    (e.dataset.active = ""),
    t.append(e, n));
  const s = lt("div", "help__buzz");
  s.append(lt("p", "help__buzz-text", Uc));
  const r = lt("div", "help__human");
  r.hidden = !0;
  for (const o of Ic) {
    const l = lt("div", "help__section");
    (l.append(
      lt("div", "help__section-title", o.title),
      lt("p", "help__section-body", o.body),
    ),
      r.append(l));
  }
  const a = (o) => {
    ((s.hidden = o),
      (r.hidden = !o),
      e.toggleAttribute("data-active", !o),
      n.toggleAttribute("data-active", o));
  };
  return (
    e.addEventListener("click", () => a(!1)),
    n.addEventListener("click", () => a(!0)),
    i.append(t, s, r),
    i
  );
}
class Fc {
  root = lt("section", "panel panel--room");
  title = lt("button", "room__tab-btn toggle toggle--caps");
  phase = lt("div", "room__phase");
  explain = lt("div", "room__explain");
  legend = lt("div", "room__legend");
  bubbles = lt("ul", "interests");
  plotHead = lt("div", "plot__head");
  scaleLabel = lt("div", "plot__scale");
  canvas = lt("canvas", "plot__canvas");
  metrics = lt("div", "room__metrics");
  hzValue = lt("span", "mini__value");
  spikeValue = lt("span", "mini__value");
  service = lt("div", "room__service");
  liveTab = lt("div", "room__tab");
  helpTab = lt("div", "room__tab");
  helpTabBtn = lt("button", "room__tab-btn toggle toggle--caps");
  poolSize = 0;
  constructor() {
    ((this.canvas.width = 700),
      (this.canvas.height = 110),
      this.plotHead.append(
        lt("div", "plot__label", "СОВПАДЕНИЕ ЗАПАХА С СЕССИЕЙ"),
        this.scaleLabel,
      ));
    const t = lt("div", "mini");
    t.append(lt("span", "mini__label", "Активность"), this.hzValue);
    const e = lt("div", "mini");
    (e.append(lt("span", "mini__label", "Товаров с общими KC"), this.spikeValue),
      this.metrics.append(t, e),
      (this.title.type = "button"),
      (this.title.dataset.active = ""),
      (this.helpTabBtn.type = "button"),
      (this.helpTabBtn.textContent = "Как это работает"));
    const n = lt("div", "room__tabs");
    (n.append(this.title, this.helpTabBtn),
      this.liveTab.append(
        lt("div", "room__label", "Что нюхала муха (сессия)"),
        this.bubbles,
        this.phase,
        this.explain,
        this.legend,
        this.plotHead,
        this.canvas,
        this.metrics,
        this.service,
      ),
      (this.helpTab.hidden = !0),
      this.helpTab.append(Nc()));
    const s = () => {
        ((this.liveTab.hidden = !1),
          (this.helpTab.hidden = !0),
          this.title.toggleAttribute("data-active", !0),
          this.helpTabBtn.toggleAttribute("data-active", !1));
      },
      r = () => {
        ((this.liveTab.hidden = !0),
          (this.helpTab.hidden = !1),
          this.title.toggleAttribute("data-active", !1),
          this.helpTabBtn.toggleAttribute("data-active", !0));
      };
    (this.title.addEventListener("click", s),
      this.helpTabBtn.addEventListener("click", r),
      this.root.append(n, this.liveTab, this.helpTab));
  }
  setPoolSize(t) {
    this.poolSize = t;
  }
  render(t) {
    this.title.textContent = t.room.title;
    const e = new Map(t.offers.map((c) => [c.id, c])),
      n = t.selection.selected,
      s = n.filter((c) => e.get(c)?.boosted).length,
      r = n.length - s,
      a = this.status(t, s, r);
    ((this.phase.textContent = a.title),
      (this.explain.textContent = a.body),
      this.legend.replaceChildren());
    for (const [c, u] of [
      ["boost", "MBON: «ням!»"],
      ["own", "просто пахнет похоже"],
    ]) {
      const h = lt("span", "legend__item"),
        f = lt("span", "legend__dot");
      ((f.dataset.kind = c),
        h.append(f, lt("span", void 0, u)),
        this.legend.append(h));
    }
    const o = Oc(t);
    this.bubbles.replaceChildren(
      ...t.room.interests.map((c) => this.bubble(c, o.get(c.id))),
    );
    const l = t.activity;
    ((this.hzValue.textContent = `${Es(l.decision_hz)} %`),
      (this.spikeValue.textContent = ir(t.spikes.window)),
      this.drawPlot(l.decision_history),
      this.service.replaceChildren(
        ...yc([
          ["снимок ", `#${t.sequence}`],
          ["мозг посчитан за ", `${(t.sim_ms / 1e3).toFixed(1)} с`],
          ["циклов ", String(t.cycles_done)],
          ["аптайм ", `${Math.round(t.uptime_seconds)} с`],
        ]),
      ));
  }
  status(t, e, n) {
    const shown = e + n;
    const total = t.selection.slots;
    if (shown >= total) return {
      title: "Муха определилась",
      body: `Из ${t.spikes.total.toLocaleString("ru-RU")} запахов выбраны ${total}. ${e ? `${e} — «ням!» от MBON` : "Все — просто по сходству запаха"}${n && e ? `, ${n} — просто пахнут как ваша сессия` : ""}.`,
    };
    if (shown) return {
      title: "Сборка полки",
      body: `Показано ${shown} из ${total}. Выше тот, у кого больше общих клеток Кеньона с запахом сессии.`,
    };
    return {
      title: "Муха нюхает каталог",
      body: "Смесь запахов вашей сессии проходит через антеннальную долю. 234 из 4 678 клеток Кеньона загораются — это и есть «вкус» сессии.",
    };
  }
  bubble(t, e) {
    const n = lt("li", "interest", t.title);
    return (
      (n.dataset.id = t.id),
      e?.length &&
        ((n.dataset.active = ""),
        (n.title = `Общие гломерулы: ${e.join(", ")}`)),
      n
    );
  }
  drawPlot(t) {
    const e = this.canvas.getContext("2d"),
      { width: n, height: s } = this.canvas;
    if ((e.clearRect(0, 0, n, s), t.length < 2)) {
      this.scaleLabel.textContent = "нет данных";
      return;
    }
    let r = Math.min(...t),
      a = Math.max(...t);
    a - r < 1e-6 && ((r -= 0.5), (a += 0.5));
    const o = (a - r) * 0.15;
    ((r -= o), (a += o));
    const l = [
      lt("span", "plot__scale-value", `${Es(r)}–${Es(a)} %`),
      lt("span", "plot__scale-label", " · автомасштаб"),
    ];
    (this.poolSize &&
      l.push(
        lt("span", "plot__scale-label", " · "),
        lt("span", "plot__scale-value", ir(this.poolSize)),
        lt("span", "plot__scale-label", " товаров в каталоге"),
      ),
      this.scaleLabel.replaceChildren(...l));
    const c = (h) => (h / (t.length - 1)) * (n - 2) + 1,
      u = (h) => s - 4 - ((h - r) / (a - r)) * (s - 8);
    ((e.strokeStyle = "#b88cff"),
      (e.lineWidth = 1.5),
      e.beginPath(),
      t.forEach((h, f) => (f ? e.lineTo(c(f), u(h)) : e.moveTo(c(f), u(h)))),
      e.stroke(),
      (e.fillStyle = "#b88cff"),
      e.beginPath(),
      e.arc(c(t.length - 1), u(t[t.length - 1]), 2.5, 0, Math.PI * 2),
      e.fill());
  }
}
function Oc(i) {
  const t = new Map(),
    e = new Map(i.offers.map((n) => [n.id, n]));
  for (const n of i.selection.selected) {
    const s = e.get(n);
    if (!s?.boosted) continue;
    const r = new Set(s.tags);
    for (const a of i.room.interests) {
      if (!a.tags.some((l) => r.has(l))) continue;
      const o = t.get(a.id) ?? [];
      (o.push(s.title), t.set(a.id, o));
    }
  }
  return t;
}
function Je(i, t, e) {
  const n = document.createElement(i);
  return (t && (n.className = t), e !== void 0 && (n.textContent = e), n);
}
const Bc = 1800;
function zc() {
  const i = window.matchMedia?.("(pointer: coarse)").matches ?? !1,
    t = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return i && t;
}
class Vc {
  root = Je("footer", "bottom");
  tooltipTimer = 0;
  constructor(t) {
    const e = Je("a", "action action--primary");
    ((e.href = t.payUrl),
      (e.target = "_blank"),
      (e.rel = "noopener noreferrer"));
    e.textContent = "Открыть Uzum Market";
    const s = Je("div", "share"),
      r = Je("button", "action", "Поделиться");
    r.type = "button";
    const a = Je("span", "share__tooltip", "Ссылка скопирована");
    (s.append(r, a),
      r.addEventListener("click", () => void this.share(t.shareUrl, a)));
    const o = Je("div", "actions");
    o.append(e, s);
    if (t.repoUrl) {
      const github = Je("a", "action", "Исходники на GitHub");
      github.href = t.repoUrl;
      github.target = "_blank";
      github.rel = "noopener noreferrer";
      o.append(github);
    }
    const l = Je("p", "credit"),
      c = Je("br", "credit__mobile-break");
    (l.append(
      document.createTextNode("Проект навайбкожен RecSys-командой!"),
      c,
      document.createTextNode(" Муха настоящая (FlyWire v783), пользователей она не видела. Не придирайтесь, она бззз."),
    ),
      this.root.append(o, l));
  }
  async share(t, e) {
    const n = navigator;
    if (n.share && zc()) {
      try {
        await n.share({ url: t, title: "UZUM FLY" });
      } catch (s) {
        s?.name !== "AbortError" && this.copyFallback(t, e);
      }
      return;
    }
    this.copyFallback(t, e);
  }
  copyFallback(t, e) {
    navigator.clipboard
      .writeText(t)
      .then(() => {
        (window.clearTimeout(this.tooltipTimer),
          (e.dataset.visible = ""),
          (this.tooltipTimer = window.setTimeout(() => {
            delete e.dataset.visible;
          }, Bc)));
      })
      .catch((n) => {
        console.error("не удалось скопировать ссылку", n);
      });
  }
}
/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */ const jr = "181",
  li = { ROTATE: 0, DOLLY: 1, PAN: 2 },
  ci = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 },
  Gc = 0,
  Sa = 1,
  Hc = 2,
  Ao = 1,
  wo = 2,
  dn = 3,
  Pn = 0,
  Le = 1,
  tn = 2,
  mn = 0,
  hi = 1,
  ba = 2,
  Ea = 3,
  ya = 4,
  kc = 5,
  Vn = 100,
  Wc = 101,
  Xc = 102,
  Yc = 103,
  qc = 104,
  jc = 200,
  Kc = 201,
  $c = 202,
  Zc = 203,
  sr = 204,
  rr = 205,
  Jc = 206,
  Qc = 207,
  tl = 208,
  el = 209,
  nl = 210,
  il = 211,
  sl = 212,
  rl = 213,
  al = 214,
  ar = 0,
  or = 1,
  cr = 2,
  di = 3,
  lr = 4,
  hr = 5,
  ur = 6,
  dr = 7,
  Ro = 0,
  ol = 1,
  cl = 2,
  Rn = 0,
  ll = 1,
  hl = 2,
  ul = 3,
  dl = 4,
  fl = 5,
  pl = 6,
  ml = 7,
  Co = 300,
  fi = 301,
  pi = 302,
  fr = 303,
  pr = 304,
  _s = 306,
  mr = 1e3,
  fn = 1001,
  xr = 1002,
  Te = 1003,
  xl = 1004,
  Gi = 1005,
  He = 1006,
  Ts = 1007,
  Hn = 1008,
  sn = 1009,
  Po = 1010,
  Do = 1011,
  Li = 1012,
  Kr = 1013,
  kn = 1014,
  pn = 1015,
  _i = 1016,
  $r = 1017,
  Zr = 1018,
  Ui = 1020,
  Lo = 35902,
  Uo = 35899,
  Io = 1021,
  No = 1022,
  Ke = 1023,
  Ii = 1026,
  Ni = 1027,
  Fo = 1028,
  Jr = 1029,
  Qr = 1030,
  ta = 1031,
  ea = 1033,
  cs = 33776,
  ls = 33777,
  hs = 33778,
  us = 33779,
  _r = 35840,
  gr = 35841,
  vr = 35842,
  Mr = 35843,
  Sr = 36196,
  br = 37492,
  Er = 37496,
  yr = 37808,
  Tr = 37809,
  Ar = 37810,
  wr = 37811,
  Rr = 37812,
  Cr = 37813,
  Pr = 37814,
  Dr = 37815,
  Lr = 37816,
  Ur = 37817,
  Ir = 37818,
  Nr = 37819,
  Fr = 37820,
  Or = 37821,
  Br = 36492,
  zr = 36494,
  Vr = 36495,
  Gr = 36283,
  Hr = 36284,
  kr = 36285,
  Wr = 36286,
  _l = 3200,
  gl = 3201,
  Oo = 0,
  vl = 1,
  An = "",
  Be = "srgb",
  mi = "srgb-linear",
  ps = "linear",
  $t = "srgb",
  jn = 7680,
  Ta = 519,
  Ml = 512,
  Sl = 513,
  bl = 514,
  Bo = 515,
  El = 516,
  yl = 517,
  Tl = 518,
  Al = 519,
  Aa = 35044,
  wa = "300 es",
  en = 2e3,
  ms = 2001;
function zo(i) {
  for (let t = i.length - 1; t >= 0; --t) if (i[t] >= 65535) return !0;
  return !1;
}
function xs(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function wl() {
  const i = xs("canvas");
  return ((i.style.display = "block"), i);
}
const Ra = {};
function Ca(...i) {
  const t = "THREE." + i.shift();
  console.log(t, ...i);
}
function Ut(...i) {
  const t = "THREE." + i.shift();
  console.warn(t, ...i);
}
function he(...i) {
  const t = "THREE." + i.shift();
  console.error(t, ...i);
}
function Fi(...i) {
  const t = i.join(" ");
  t in Ra || ((Ra[t] = !0), Ut(...i));
}
function Rl(i, t, e) {
  return new Promise(function (n, s) {
    function r() {
      switch (i.clientWaitSync(t, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case i.WAIT_FAILED:
          s();
          break;
        case i.TIMEOUT_EXPIRED:
          setTimeout(r, e);
          break;
        default:
          n();
      }
    }
    setTimeout(r, e);
  });
}
class Yn {
  addEventListener(t, e) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    (n[t] === void 0 && (n[t] = []), n[t].indexOf(e) === -1 && n[t].push(e));
  }
  hasEventListener(t, e) {
    const n = this._listeners;
    return n === void 0 ? !1 : n[t] !== void 0 && n[t].indexOf(e) !== -1;
  }
  removeEventListener(t, e) {
    const n = this._listeners;
    if (n === void 0) return;
    const s = n[t];
    if (s !== void 0) {
      const r = s.indexOf(e);
      r !== -1 && s.splice(r, 1);
    }
  }
  dispatchEvent(t) {
    const e = this._listeners;
    if (e === void 0) return;
    const n = e[t.type];
    if (n !== void 0) {
      t.target = this;
      const s = n.slice(0);
      for (let r = 0, a = s.length; r < a; r++) s[r].call(this, t);
      t.target = null;
    }
  }
}
const Me = [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "0a",
    "0b",
    "0c",
    "0d",
    "0e",
    "0f",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "1a",
    "1b",
    "1c",
    "1d",
    "1e",
    "1f",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "2a",
    "2b",
    "2c",
    "2d",
    "2e",
    "2f",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "3a",
    "3b",
    "3c",
    "3d",
    "3e",
    "3f",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "4a",
    "4b",
    "4c",
    "4d",
    "4e",
    "4f",
    "50",
    "51",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "59",
    "5a",
    "5b",
    "5c",
    "5d",
    "5e",
    "5f",
    "60",
    "61",
    "62",
    "63",
    "64",
    "65",
    "66",
    "67",
    "68",
    "69",
    "6a",
    "6b",
    "6c",
    "6d",
    "6e",
    "6f",
    "70",
    "71",
    "72",
    "73",
    "74",
    "75",
    "76",
    "77",
    "78",
    "79",
    "7a",
    "7b",
    "7c",
    "7d",
    "7e",
    "7f",
    "80",
    "81",
    "82",
    "83",
    "84",
    "85",
    "86",
    "87",
    "88",
    "89",
    "8a",
    "8b",
    "8c",
    "8d",
    "8e",
    "8f",
    "90",
    "91",
    "92",
    "93",
    "94",
    "95",
    "96",
    "97",
    "98",
    "99",
    "9a",
    "9b",
    "9c",
    "9d",
    "9e",
    "9f",
    "a0",
    "a1",
    "a2",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "a8",
    "a9",
    "aa",
    "ab",
    "ac",
    "ad",
    "ae",
    "af",
    "b0",
    "b1",
    "b2",
    "b3",
    "b4",
    "b5",
    "b6",
    "b7",
    "b8",
    "b9",
    "ba",
    "bb",
    "bc",
    "bd",
    "be",
    "bf",
    "c0",
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "ca",
    "cb",
    "cc",
    "cd",
    "ce",
    "cf",
    "d0",
    "d1",
    "d2",
    "d3",
    "d4",
    "d5",
    "d6",
    "d7",
    "d8",
    "d9",
    "da",
    "db",
    "dc",
    "dd",
    "de",
    "df",
    "e0",
    "e1",
    "e2",
    "e3",
    "e4",
    "e5",
    "e6",
    "e7",
    "e8",
    "e9",
    "ea",
    "eb",
    "ec",
    "ed",
    "ee",
    "ef",
    "f0",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "f9",
    "fa",
    "fb",
    "fc",
    "fd",
    "fe",
    "ff",
  ],
  ds = Math.PI / 180,
  Xr = 180 / Math.PI;
function Oi() {
  const i = (Math.random() * 4294967295) | 0,
    t = (Math.random() * 4294967295) | 0,
    e = (Math.random() * 4294967295) | 0,
    n = (Math.random() * 4294967295) | 0;
  return (
    Me[i & 255] +
    Me[(i >> 8) & 255] +
    Me[(i >> 16) & 255] +
    Me[(i >> 24) & 255] +
    "-" +
    Me[t & 255] +
    Me[(t >> 8) & 255] +
    "-" +
    Me[((t >> 16) & 15) | 64] +
    Me[(t >> 24) & 255] +
    "-" +
    Me[(e & 63) | 128] +
    Me[(e >> 8) & 255] +
    "-" +
    Me[(e >> 16) & 255] +
    Me[(e >> 24) & 255] +
    Me[n & 255] +
    Me[(n >> 8) & 255] +
    Me[(n >> 16) & 255] +
    Me[(n >> 24) & 255]
  ).toLowerCase();
}
function Bt(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
function Cl(i, t) {
  return ((i % t) + t) % t;
}
function As(i, t, e) {
  return (1 - e) * i + e * t;
}
function yi(i, t) {
  switch (t.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return i / 4294967295;
    case Uint16Array:
      return i / 65535;
    case Uint8Array:
      return i / 255;
    case Int32Array:
      return Math.max(i / 2147483647, -1);
    case Int16Array:
      return Math.max(i / 32767, -1);
    case Int8Array:
      return Math.max(i / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function Ce(i, t) {
  switch (t.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return Math.round(i * 4294967295);
    case Uint16Array:
      return Math.round(i * 65535);
    case Uint8Array:
      return Math.round(i * 255);
    case Int32Array:
      return Math.round(i * 2147483647);
    case Int16Array:
      return Math.round(i * 32767);
    case Int8Array:
      return Math.round(i * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
const Pl = { DEG2RAD: ds };
class Pt {
  constructor(t = 0, e = 0) {
    ((Pt.prototype.isVector2 = !0), (this.x = t), (this.y = e));
  }
  get width() {
    return this.x;
  }
  set width(t) {
    this.x = t;
  }
  get height() {
    return this.y;
  }
  set height(t) {
    this.y = t;
  }
  set(t, e) {
    return ((this.x = t), (this.y = e), this);
  }
  setScalar(t) {
    return ((this.x = t), (this.y = t), this);
  }
  setX(t) {
    return ((this.x = t), this);
  }
  setY(t) {
    return ((this.y = t), this);
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(t) {
    return ((this.x = t.x), (this.y = t.y), this);
  }
  add(t) {
    return ((this.x += t.x), (this.y += t.y), this);
  }
  addScalar(t) {
    return ((this.x += t), (this.y += t), this);
  }
  addVectors(t, e) {
    return ((this.x = t.x + e.x), (this.y = t.y + e.y), this);
  }
  addScaledVector(t, e) {
    return ((this.x += t.x * e), (this.y += t.y * e), this);
  }
  sub(t) {
    return ((this.x -= t.x), (this.y -= t.y), this);
  }
  subScalar(t) {
    return ((this.x -= t), (this.y -= t), this);
  }
  subVectors(t, e) {
    return ((this.x = t.x - e.x), (this.y = t.y - e.y), this);
  }
  multiply(t) {
    return ((this.x *= t.x), (this.y *= t.y), this);
  }
  multiplyScalar(t) {
    return ((this.x *= t), (this.y *= t), this);
  }
  divide(t) {
    return ((this.x /= t.x), (this.y /= t.y), this);
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  applyMatrix3(t) {
    const e = this.x,
      n = this.y,
      s = t.elements;
    return (
      (this.x = s[0] * e + s[3] * n + s[6]),
      (this.y = s[1] * e + s[4] * n + s[7]),
      this
    );
  }
  min(t) {
    return (
      (this.x = Math.min(this.x, t.x)),
      (this.y = Math.min(this.y, t.y)),
      this
    );
  }
  max(t) {
    return (
      (this.x = Math.max(this.x, t.x)),
      (this.y = Math.max(this.y, t.y)),
      this
    );
  }
  clamp(t, e) {
    return (
      (this.x = Bt(this.x, t.x, e.x)),
      (this.y = Bt(this.y, t.y, e.y)),
      this
    );
  }
  clampScalar(t, e) {
    return ((this.x = Bt(this.x, t, e)), (this.y = Bt(this.y, t, e)), this);
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Bt(n, t, e));
  }
  floor() {
    return ((this.x = Math.floor(this.x)), (this.y = Math.floor(this.y)), this);
  }
  ceil() {
    return ((this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), this);
  }
  round() {
    return ((this.x = Math.round(this.x)), (this.y = Math.round(this.y)), this);
  }
  roundToZero() {
    return ((this.x = Math.trunc(this.x)), (this.y = Math.trunc(this.y)), this);
  }
  negate() {
    return ((this.x = -this.x), (this.y = -this.y), this);
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  cross(t) {
    return this.x * t.y - this.y * t.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Bt(n, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const e = this.x - t.x,
      n = this.y - t.y;
    return e * e + n * n;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return (
      (this.x += (t.x - this.x) * e),
      (this.y += (t.y - this.y) * e),
      this
    );
  }
  lerpVectors(t, e, n) {
    return (
      (this.x = t.x + (e.x - t.x) * n),
      (this.y = t.y + (e.y - t.y) * n),
      this
    );
  }
  equals(t) {
    return t.x === this.x && t.y === this.y;
  }
  fromArray(t, e = 0) {
    return ((this.x = t[e]), (this.y = t[e + 1]), this);
  }
  toArray(t = [], e = 0) {
    return ((t[e] = this.x), (t[e + 1] = this.y), t);
  }
  fromBufferAttribute(t, e) {
    return ((this.x = t.getX(e)), (this.y = t.getY(e)), this);
  }
  rotateAround(t, e) {
    const n = Math.cos(e),
      s = Math.sin(e),
      r = this.x - t.x,
      a = this.y - t.y;
    return (
      (this.x = r * n - a * s + t.x),
      (this.y = r * s + a * n + t.y),
      this
    );
  }
  random() {
    return ((this.x = Math.random()), (this.y = Math.random()), this);
  }
  *[Symbol.iterator]() {
    (yield this.x, yield this.y);
  }
}
class Wn {
  constructor(t = 0, e = 0, n = 0, s = 1) {
    ((this.isQuaternion = !0),
      (this._x = t),
      (this._y = e),
      (this._z = n),
      (this._w = s));
  }
  static slerpFlat(t, e, n, s, r, a, o) {
    let l = n[s + 0],
      c = n[s + 1],
      u = n[s + 2],
      h = n[s + 3],
      f = r[a + 0],
      p = r[a + 1],
      _ = r[a + 2],
      S = r[a + 3];
    if (o <= 0) {
      ((t[e + 0] = l), (t[e + 1] = c), (t[e + 2] = u), (t[e + 3] = h));
      return;
    }
    if (o >= 1) {
      ((t[e + 0] = f), (t[e + 1] = p), (t[e + 2] = _), (t[e + 3] = S));
      return;
    }
    if (h !== S || l !== f || c !== p || u !== _) {
      let m = l * f + c * p + u * _ + h * S;
      m < 0 && ((f = -f), (p = -p), (_ = -_), (S = -S), (m = -m));
      let d = 1 - o;
      if (m < 0.9995) {
        const E = Math.acos(m),
          b = Math.sin(E);
        ((d = Math.sin(d * E) / b),
          (o = Math.sin(o * E) / b),
          (l = l * d + f * o),
          (c = c * d + p * o),
          (u = u * d + _ * o),
          (h = h * d + S * o));
      } else {
        ((l = l * d + f * o),
          (c = c * d + p * o),
          (u = u * d + _ * o),
          (h = h * d + S * o));
        const E = 1 / Math.sqrt(l * l + c * c + u * u + h * h);
        ((l *= E), (c *= E), (u *= E), (h *= E));
      }
    }
    ((t[e] = l), (t[e + 1] = c), (t[e + 2] = u), (t[e + 3] = h));
  }
  static multiplyQuaternionsFlat(t, e, n, s, r, a) {
    const o = n[s],
      l = n[s + 1],
      c = n[s + 2],
      u = n[s + 3],
      h = r[a],
      f = r[a + 1],
      p = r[a + 2],
      _ = r[a + 3];
    return (
      (t[e] = o * _ + u * h + l * p - c * f),
      (t[e + 1] = l * _ + u * f + c * h - o * p),
      (t[e + 2] = c * _ + u * p + o * f - l * h),
      (t[e + 3] = u * _ - o * h - l * f - c * p),
      t
    );
  }
  get x() {
    return this._x;
  }
  set x(t) {
    ((this._x = t), this._onChangeCallback());
  }
  get y() {
    return this._y;
  }
  set y(t) {
    ((this._y = t), this._onChangeCallback());
  }
  get z() {
    return this._z;
  }
  set z(t) {
    ((this._z = t), this._onChangeCallback());
  }
  get w() {
    return this._w;
  }
  set w(t) {
    ((this._w = t), this._onChangeCallback());
  }
  set(t, e, n, s) {
    return (
      (this._x = t),
      (this._y = e),
      (this._z = n),
      (this._w = s),
      this._onChangeCallback(),
      this
    );
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(t) {
    return (
      (this._x = t.x),
      (this._y = t.y),
      (this._z = t.z),
      (this._w = t.w),
      this._onChangeCallback(),
      this
    );
  }
  setFromEuler(t, e = !0) {
    const n = t._x,
      s = t._y,
      r = t._z,
      a = t._order,
      o = Math.cos,
      l = Math.sin,
      c = o(n / 2),
      u = o(s / 2),
      h = o(r / 2),
      f = l(n / 2),
      p = l(s / 2),
      _ = l(r / 2);
    switch (a) {
      case "XYZ":
        ((this._x = f * u * h + c * p * _),
          (this._y = c * p * h - f * u * _),
          (this._z = c * u * _ + f * p * h),
          (this._w = c * u * h - f * p * _));
        break;
      case "YXZ":
        ((this._x = f * u * h + c * p * _),
          (this._y = c * p * h - f * u * _),
          (this._z = c * u * _ - f * p * h),
          (this._w = c * u * h + f * p * _));
        break;
      case "ZXY":
        ((this._x = f * u * h - c * p * _),
          (this._y = c * p * h + f * u * _),
          (this._z = c * u * _ + f * p * h),
          (this._w = c * u * h - f * p * _));
        break;
      case "ZYX":
        ((this._x = f * u * h - c * p * _),
          (this._y = c * p * h + f * u * _),
          (this._z = c * u * _ - f * p * h),
          (this._w = c * u * h + f * p * _));
        break;
      case "YZX":
        ((this._x = f * u * h + c * p * _),
          (this._y = c * p * h + f * u * _),
          (this._z = c * u * _ - f * p * h),
          (this._w = c * u * h - f * p * _));
        break;
      case "XZY":
        ((this._x = f * u * h - c * p * _),
          (this._y = c * p * h - f * u * _),
          (this._z = c * u * _ + f * p * h),
          (this._w = c * u * h + f * p * _));
        break;
      default:
        Ut("Quaternion: .setFromEuler() encountered an unknown order: " + a);
    }
    return (e === !0 && this._onChangeCallback(), this);
  }
  setFromAxisAngle(t, e) {
    const n = e / 2,
      s = Math.sin(n);
    return (
      (this._x = t.x * s),
      (this._y = t.y * s),
      (this._z = t.z * s),
      (this._w = Math.cos(n)),
      this._onChangeCallback(),
      this
    );
  }
  setFromRotationMatrix(t) {
    const e = t.elements,
      n = e[0],
      s = e[4],
      r = e[8],
      a = e[1],
      o = e[5],
      l = e[9],
      c = e[2],
      u = e[6],
      h = e[10],
      f = n + o + h;
    if (f > 0) {
      const p = 0.5 / Math.sqrt(f + 1);
      ((this._w = 0.25 / p),
        (this._x = (u - l) * p),
        (this._y = (r - c) * p),
        (this._z = (a - s) * p));
    } else if (n > o && n > h) {
      const p = 2 * Math.sqrt(1 + n - o - h);
      ((this._w = (u - l) / p),
        (this._x = 0.25 * p),
        (this._y = (s + a) / p),
        (this._z = (r + c) / p));
    } else if (o > h) {
      const p = 2 * Math.sqrt(1 + o - n - h);
      ((this._w = (r - c) / p),
        (this._x = (s + a) / p),
        (this._y = 0.25 * p),
        (this._z = (l + u) / p));
    } else {
      const p = 2 * Math.sqrt(1 + h - n - o);
      ((this._w = (a - s) / p),
        (this._x = (r + c) / p),
        (this._y = (l + u) / p),
        (this._z = 0.25 * p));
    }
    return (this._onChangeCallback(), this);
  }
  setFromUnitVectors(t, e) {
    let n = t.dot(e) + 1;
    return (
      n < 1e-8
        ? ((n = 0),
          Math.abs(t.x) > Math.abs(t.z)
            ? ((this._x = -t.y), (this._y = t.x), (this._z = 0), (this._w = n))
            : ((this._x = 0), (this._y = -t.z), (this._z = t.y), (this._w = n)))
        : ((this._x = t.y * e.z - t.z * e.y),
          (this._y = t.z * e.x - t.x * e.z),
          (this._z = t.x * e.y - t.y * e.x),
          (this._w = n)),
      this.normalize()
    );
  }
  angleTo(t) {
    return 2 * Math.acos(Math.abs(Bt(this.dot(t), -1, 1)));
  }
  rotateTowards(t, e) {
    const n = this.angleTo(t);
    if (n === 0) return this;
    const s = Math.min(1, e / n);
    return (this.slerp(t, s), this);
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return (
      (this._x *= -1),
      (this._y *= -1),
      (this._z *= -1),
      this._onChangeCallback(),
      this
    );
  }
  dot(t) {
    return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w;
  }
  lengthSq() {
    return (
      this._x * this._x +
      this._y * this._y +
      this._z * this._z +
      this._w * this._w
    );
  }
  length() {
    return Math.sqrt(
      this._x * this._x +
        this._y * this._y +
        this._z * this._z +
        this._w * this._w,
    );
  }
  normalize() {
    let t = this.length();
    return (
      t === 0
        ? ((this._x = 0), (this._y = 0), (this._z = 0), (this._w = 1))
        : ((t = 1 / t),
          (this._x = this._x * t),
          (this._y = this._y * t),
          (this._z = this._z * t),
          (this._w = this._w * t)),
      this._onChangeCallback(),
      this
    );
  }
  multiply(t) {
    return this.multiplyQuaternions(this, t);
  }
  premultiply(t) {
    return this.multiplyQuaternions(t, this);
  }
  multiplyQuaternions(t, e) {
    const n = t._x,
      s = t._y,
      r = t._z,
      a = t._w,
      o = e._x,
      l = e._y,
      c = e._z,
      u = e._w;
    return (
      (this._x = n * u + a * o + s * c - r * l),
      (this._y = s * u + a * l + r * o - n * c),
      (this._z = r * u + a * c + n * l - s * o),
      (this._w = a * u - n * o - s * l - r * c),
      this._onChangeCallback(),
      this
    );
  }
  slerp(t, e) {
    if (e <= 0) return this;
    if (e >= 1) return this.copy(t);
    let n = t._x,
      s = t._y,
      r = t._z,
      a = t._w,
      o = this.dot(t);
    o < 0 && ((n = -n), (s = -s), (r = -r), (a = -a), (o = -o));
    let l = 1 - e;
    if (o < 0.9995) {
      const c = Math.acos(o),
        u = Math.sin(c);
      ((l = Math.sin(l * c) / u),
        (e = Math.sin(e * c) / u),
        (this._x = this._x * l + n * e),
        (this._y = this._y * l + s * e),
        (this._z = this._z * l + r * e),
        (this._w = this._w * l + a * e),
        this._onChangeCallback());
    } else
      ((this._x = this._x * l + n * e),
        (this._y = this._y * l + s * e),
        (this._z = this._z * l + r * e),
        (this._w = this._w * l + a * e),
        this.normalize());
    return this;
  }
  slerpQuaternions(t, e, n) {
    return this.copy(t).slerp(e, n);
  }
  random() {
    const t = 2 * Math.PI * Math.random(),
      e = 2 * Math.PI * Math.random(),
      n = Math.random(),
      s = Math.sqrt(1 - n),
      r = Math.sqrt(n);
    return this.set(
      s * Math.sin(t),
      s * Math.cos(t),
      r * Math.sin(e),
      r * Math.cos(e),
    );
  }
  equals(t) {
    return (
      t._x === this._x &&
      t._y === this._y &&
      t._z === this._z &&
      t._w === this._w
    );
  }
  fromArray(t, e = 0) {
    return (
      (this._x = t[e]),
      (this._y = t[e + 1]),
      (this._z = t[e + 2]),
      (this._w = t[e + 3]),
      this._onChangeCallback(),
      this
    );
  }
  toArray(t = [], e = 0) {
    return (
      (t[e] = this._x),
      (t[e + 1] = this._y),
      (t[e + 2] = this._z),
      (t[e + 3] = this._w),
      t
    );
  }
  fromBufferAttribute(t, e) {
    return (
      (this._x = t.getX(e)),
      (this._y = t.getY(e)),
      (this._z = t.getZ(e)),
      (this._w = t.getW(e)),
      this._onChangeCallback(),
      this
    );
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(t) {
    return ((this._onChangeCallback = t), this);
  }
  _onChangeCallback() {}
  *[Symbol.iterator]() {
    (yield this._x, yield this._y, yield this._z, yield this._w);
  }
}
class F {
  constructor(t = 0, e = 0, n = 0) {
    ((F.prototype.isVector3 = !0), (this.x = t), (this.y = e), (this.z = n));
  }
  set(t, e, n) {
    return (
      n === void 0 && (n = this.z),
      (this.x = t),
      (this.y = e),
      (this.z = n),
      this
    );
  }
  setScalar(t) {
    return ((this.x = t), (this.y = t), (this.z = t), this);
  }
  setX(t) {
    return ((this.x = t), this);
  }
  setY(t) {
    return ((this.y = t), this);
  }
  setZ(t) {
    return ((this.z = t), this);
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(t) {
    return ((this.x = t.x), (this.y = t.y), (this.z = t.z), this);
  }
  add(t) {
    return ((this.x += t.x), (this.y += t.y), (this.z += t.z), this);
  }
  addScalar(t) {
    return ((this.x += t), (this.y += t), (this.z += t), this);
  }
  addVectors(t, e) {
    return (
      (this.x = t.x + e.x),
      (this.y = t.y + e.y),
      (this.z = t.z + e.z),
      this
    );
  }
  addScaledVector(t, e) {
    return (
      (this.x += t.x * e),
      (this.y += t.y * e),
      (this.z += t.z * e),
      this
    );
  }
  sub(t) {
    return ((this.x -= t.x), (this.y -= t.y), (this.z -= t.z), this);
  }
  subScalar(t) {
    return ((this.x -= t), (this.y -= t), (this.z -= t), this);
  }
  subVectors(t, e) {
    return (
      (this.x = t.x - e.x),
      (this.y = t.y - e.y),
      (this.z = t.z - e.z),
      this
    );
  }
  multiply(t) {
    return ((this.x *= t.x), (this.y *= t.y), (this.z *= t.z), this);
  }
  multiplyScalar(t) {
    return ((this.x *= t), (this.y *= t), (this.z *= t), this);
  }
  multiplyVectors(t, e) {
    return (
      (this.x = t.x * e.x),
      (this.y = t.y * e.y),
      (this.z = t.z * e.z),
      this
    );
  }
  applyEuler(t) {
    return this.applyQuaternion(Pa.setFromEuler(t));
  }
  applyAxisAngle(t, e) {
    return this.applyQuaternion(Pa.setFromAxisAngle(t, e));
  }
  applyMatrix3(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = t.elements;
    return (
      (this.x = r[0] * e + r[3] * n + r[6] * s),
      (this.y = r[1] * e + r[4] * n + r[7] * s),
      (this.z = r[2] * e + r[5] * n + r[8] * s),
      this
    );
  }
  applyNormalMatrix(t) {
    return this.applyMatrix3(t).normalize();
  }
  applyMatrix4(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = t.elements,
      a = 1 / (r[3] * e + r[7] * n + r[11] * s + r[15]);
    return (
      (this.x = (r[0] * e + r[4] * n + r[8] * s + r[12]) * a),
      (this.y = (r[1] * e + r[5] * n + r[9] * s + r[13]) * a),
      (this.z = (r[2] * e + r[6] * n + r[10] * s + r[14]) * a),
      this
    );
  }
  applyQuaternion(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = t.x,
      a = t.y,
      o = t.z,
      l = t.w,
      c = 2 * (a * s - o * n),
      u = 2 * (o * e - r * s),
      h = 2 * (r * n - a * e);
    return (
      (this.x = e + l * c + a * h - o * u),
      (this.y = n + l * u + o * c - r * h),
      (this.z = s + l * h + r * u - a * c),
      this
    );
  }
  project(t) {
    return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(
      t.projectionMatrix,
    );
  }
  unproject(t) {
    return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(
      t.matrixWorld,
    );
  }
  transformDirection(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = t.elements;
    return (
      (this.x = r[0] * e + r[4] * n + r[8] * s),
      (this.y = r[1] * e + r[5] * n + r[9] * s),
      (this.z = r[2] * e + r[6] * n + r[10] * s),
      this.normalize()
    );
  }
  divide(t) {
    return ((this.x /= t.x), (this.y /= t.y), (this.z /= t.z), this);
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  min(t) {
    return (
      (this.x = Math.min(this.x, t.x)),
      (this.y = Math.min(this.y, t.y)),
      (this.z = Math.min(this.z, t.z)),
      this
    );
  }
  max(t) {
    return (
      (this.x = Math.max(this.x, t.x)),
      (this.y = Math.max(this.y, t.y)),
      (this.z = Math.max(this.z, t.z)),
      this
    );
  }
  clamp(t, e) {
    return (
      (this.x = Bt(this.x, t.x, e.x)),
      (this.y = Bt(this.y, t.y, e.y)),
      (this.z = Bt(this.z, t.z, e.z)),
      this
    );
  }
  clampScalar(t, e) {
    return (
      (this.x = Bt(this.x, t, e)),
      (this.y = Bt(this.y, t, e)),
      (this.z = Bt(this.z, t, e)),
      this
    );
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Bt(n, t, e));
  }
  floor() {
    return (
      (this.x = Math.floor(this.x)),
      (this.y = Math.floor(this.y)),
      (this.z = Math.floor(this.z)),
      this
    );
  }
  ceil() {
    return (
      (this.x = Math.ceil(this.x)),
      (this.y = Math.ceil(this.y)),
      (this.z = Math.ceil(this.z)),
      this
    );
  }
  round() {
    return (
      (this.x = Math.round(this.x)),
      (this.y = Math.round(this.y)),
      (this.z = Math.round(this.z)),
      this
    );
  }
  roundToZero() {
    return (
      (this.x = Math.trunc(this.x)),
      (this.y = Math.trunc(this.y)),
      (this.z = Math.trunc(this.z)),
      this
    );
  }
  negate() {
    return ((this.x = -this.x), (this.y = -this.y), (this.z = -this.z), this);
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return (
      (this.x += (t.x - this.x) * e),
      (this.y += (t.y - this.y) * e),
      (this.z += (t.z - this.z) * e),
      this
    );
  }
  lerpVectors(t, e, n) {
    return (
      (this.x = t.x + (e.x - t.x) * n),
      (this.y = t.y + (e.y - t.y) * n),
      (this.z = t.z + (e.z - t.z) * n),
      this
    );
  }
  cross(t) {
    return this.crossVectors(this, t);
  }
  crossVectors(t, e) {
    const n = t.x,
      s = t.y,
      r = t.z,
      a = e.x,
      o = e.y,
      l = e.z;
    return (
      (this.x = s * l - r * o),
      (this.y = r * a - n * l),
      (this.z = n * o - s * a),
      this
    );
  }
  projectOnVector(t) {
    const e = t.lengthSq();
    if (e === 0) return this.set(0, 0, 0);
    const n = t.dot(this) / e;
    return this.copy(t).multiplyScalar(n);
  }
  projectOnPlane(t) {
    return (ws.copy(this).projectOnVector(t), this.sub(ws));
  }
  reflect(t) {
    return this.sub(ws.copy(t).multiplyScalar(2 * this.dot(t)));
  }
  angleTo(t) {
    const e = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (e === 0) return Math.PI / 2;
    const n = this.dot(t) / e;
    return Math.acos(Bt(n, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const e = this.x - t.x,
      n = this.y - t.y,
      s = this.z - t.z;
    return e * e + n * n + s * s;
  }
  manhattanDistanceTo(t) {
    return (
      Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z)
    );
  }
  setFromSpherical(t) {
    return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
  }
  setFromSphericalCoords(t, e, n) {
    const s = Math.sin(e) * t;
    return (
      (this.x = s * Math.sin(n)),
      (this.y = Math.cos(e) * t),
      (this.z = s * Math.cos(n)),
      this
    );
  }
  setFromCylindrical(t) {
    return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
  }
  setFromCylindricalCoords(t, e, n) {
    return (
      (this.x = t * Math.sin(e)),
      (this.y = n),
      (this.z = t * Math.cos(e)),
      this
    );
  }
  setFromMatrixPosition(t) {
    const e = t.elements;
    return ((this.x = e[12]), (this.y = e[13]), (this.z = e[14]), this);
  }
  setFromMatrixScale(t) {
    const e = this.setFromMatrixColumn(t, 0).length(),
      n = this.setFromMatrixColumn(t, 1).length(),
      s = this.setFromMatrixColumn(t, 2).length();
    return ((this.x = e), (this.y = n), (this.z = s), this);
  }
  setFromMatrixColumn(t, e) {
    return this.fromArray(t.elements, e * 4);
  }
  setFromMatrix3Column(t, e) {
    return this.fromArray(t.elements, e * 3);
  }
  setFromEuler(t) {
    return ((this.x = t._x), (this.y = t._y), (this.z = t._z), this);
  }
  setFromColor(t) {
    return ((this.x = t.r), (this.y = t.g), (this.z = t.b), this);
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z;
  }
  fromArray(t, e = 0) {
    return ((this.x = t[e]), (this.y = t[e + 1]), (this.z = t[e + 2]), this);
  }
  toArray(t = [], e = 0) {
    return ((t[e] = this.x), (t[e + 1] = this.y), (t[e + 2] = this.z), t);
  }
  fromBufferAttribute(t, e) {
    return (
      (this.x = t.getX(e)),
      (this.y = t.getY(e)),
      (this.z = t.getZ(e)),
      this
    );
  }
  random() {
    return (
      (this.x = Math.random()),
      (this.y = Math.random()),
      (this.z = Math.random()),
      this
    );
  }
  randomDirection() {
    const t = Math.random() * Math.PI * 2,
      e = Math.random() * 2 - 1,
      n = Math.sqrt(1 - e * e);
    return (
      (this.x = n * Math.cos(t)),
      (this.y = e),
      (this.z = n * Math.sin(t)),
      this
    );
  }
  *[Symbol.iterator]() {
    (yield this.x, yield this.y, yield this.z);
  }
}
const ws = new F(),
  Pa = new Wn();
class Nt {
  constructor(t, e, n, s, r, a, o, l, c) {
    ((Nt.prototype.isMatrix3 = !0),
      (this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]),
      t !== void 0 && this.set(t, e, n, s, r, a, o, l, c));
  }
  set(t, e, n, s, r, a, o, l, c) {
    const u = this.elements;
    return (
      (u[0] = t),
      (u[1] = s),
      (u[2] = o),
      (u[3] = e),
      (u[4] = r),
      (u[5] = l),
      (u[6] = n),
      (u[7] = a),
      (u[8] = c),
      this
    );
  }
  identity() {
    return (this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this);
  }
  copy(t) {
    const e = this.elements,
      n = t.elements;
    return (
      (e[0] = n[0]),
      (e[1] = n[1]),
      (e[2] = n[2]),
      (e[3] = n[3]),
      (e[4] = n[4]),
      (e[5] = n[5]),
      (e[6] = n[6]),
      (e[7] = n[7]),
      (e[8] = n[8]),
      this
    );
  }
  extractBasis(t, e, n) {
    return (
      t.setFromMatrix3Column(this, 0),
      e.setFromMatrix3Column(this, 1),
      n.setFromMatrix3Column(this, 2),
      this
    );
  }
  setFromMatrix4(t) {
    const e = t.elements;
    return (
      this.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]),
      this
    );
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    const n = t.elements,
      s = e.elements,
      r = this.elements,
      a = n[0],
      o = n[3],
      l = n[6],
      c = n[1],
      u = n[4],
      h = n[7],
      f = n[2],
      p = n[5],
      _ = n[8],
      S = s[0],
      m = s[3],
      d = s[6],
      E = s[1],
      b = s[4],
      y = s[7],
      R = s[2],
      T = s[5],
      w = s[8];
    return (
      (r[0] = a * S + o * E + l * R),
      (r[3] = a * m + o * b + l * T),
      (r[6] = a * d + o * y + l * w),
      (r[1] = c * S + u * E + h * R),
      (r[4] = c * m + u * b + h * T),
      (r[7] = c * d + u * y + h * w),
      (r[2] = f * S + p * E + _ * R),
      (r[5] = f * m + p * b + _ * T),
      (r[8] = f * d + p * y + _ * w),
      this
    );
  }
  multiplyScalar(t) {
    const e = this.elements;
    return (
      (e[0] *= t),
      (e[3] *= t),
      (e[6] *= t),
      (e[1] *= t),
      (e[4] *= t),
      (e[7] *= t),
      (e[2] *= t),
      (e[5] *= t),
      (e[8] *= t),
      this
    );
  }
  determinant() {
    const t = this.elements,
      e = t[0],
      n = t[1],
      s = t[2],
      r = t[3],
      a = t[4],
      o = t[5],
      l = t[6],
      c = t[7],
      u = t[8];
    return (
      e * a * u - e * o * c - n * r * u + n * o * l + s * r * c - s * a * l
    );
  }
  invert() {
    const t = this.elements,
      e = t[0],
      n = t[1],
      s = t[2],
      r = t[3],
      a = t[4],
      o = t[5],
      l = t[6],
      c = t[7],
      u = t[8],
      h = u * a - o * c,
      f = o * l - u * r,
      p = c * r - a * l,
      _ = e * h + n * f + s * p;
    if (_ === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const S = 1 / _;
    return (
      (t[0] = h * S),
      (t[1] = (s * c - u * n) * S),
      (t[2] = (o * n - s * a) * S),
      (t[3] = f * S),
      (t[4] = (u * e - s * l) * S),
      (t[5] = (s * r - o * e) * S),
      (t[6] = p * S),
      (t[7] = (n * l - c * e) * S),
      (t[8] = (a * e - n * r) * S),
      this
    );
  }
  transpose() {
    let t;
    const e = this.elements;
    return (
      (t = e[1]),
      (e[1] = e[3]),
      (e[3] = t),
      (t = e[2]),
      (e[2] = e[6]),
      (e[6] = t),
      (t = e[5]),
      (e[5] = e[7]),
      (e[7] = t),
      this
    );
  }
  getNormalMatrix(t) {
    return this.setFromMatrix4(t).invert().transpose();
  }
  transposeIntoArray(t) {
    const e = this.elements;
    return (
      (t[0] = e[0]),
      (t[1] = e[3]),
      (t[2] = e[6]),
      (t[3] = e[1]),
      (t[4] = e[4]),
      (t[5] = e[7]),
      (t[6] = e[2]),
      (t[7] = e[5]),
      (t[8] = e[8]),
      this
    );
  }
  setUvTransform(t, e, n, s, r, a, o) {
    const l = Math.cos(r),
      c = Math.sin(r);
    return (
      this.set(
        n * l,
        n * c,
        -n * (l * a + c * o) + a + t,
        -s * c,
        s * l,
        -s * (-c * a + l * o) + o + e,
        0,
        0,
        1,
      ),
      this
    );
  }
  scale(t, e) {
    return (this.premultiply(Rs.makeScale(t, e)), this);
  }
  rotate(t) {
    return (this.premultiply(Rs.makeRotation(-t)), this);
  }
  translate(t, e) {
    return (this.premultiply(Rs.makeTranslation(t, e)), this);
  }
  makeTranslation(t, e) {
    return (
      t.isVector2
        ? this.set(1, 0, t.x, 0, 1, t.y, 0, 0, 1)
        : this.set(1, 0, t, 0, 1, e, 0, 0, 1),
      this
    );
  }
  makeRotation(t) {
    const e = Math.cos(t),
      n = Math.sin(t);
    return (this.set(e, -n, 0, n, e, 0, 0, 0, 1), this);
  }
  makeScale(t, e) {
    return (this.set(t, 0, 0, 0, e, 0, 0, 0, 1), this);
  }
  equals(t) {
    const e = this.elements,
      n = t.elements;
    for (let s = 0; s < 9; s++) if (e[s] !== n[s]) return !1;
    return !0;
  }
  fromArray(t, e = 0) {
    for (let n = 0; n < 9; n++) this.elements[n] = t[n + e];
    return this;
  }
  toArray(t = [], e = 0) {
    const n = this.elements;
    return (
      (t[e] = n[0]),
      (t[e + 1] = n[1]),
      (t[e + 2] = n[2]),
      (t[e + 3] = n[3]),
      (t[e + 4] = n[4]),
      (t[e + 5] = n[5]),
      (t[e + 6] = n[6]),
      (t[e + 7] = n[7]),
      (t[e + 8] = n[8]),
      t
    );
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const Rs = new Nt(),
  Da = new Nt().set(
    0.4123908,
    0.3575843,
    0.1804808,
    0.212639,
    0.7151687,
    0.0721923,
    0.0193308,
    0.1191948,
    0.9505322,
  ),
  La = new Nt().set(
    3.2409699,
    -1.5373832,
    -0.4986108,
    -0.9692436,
    1.8759675,
    0.0415551,
    0.0556301,
    -0.203977,
    1.0569715,
  );
function Dl() {
  const i = {
      enabled: !0,
      workingColorSpace: mi,
      spaces: {},
      convert: function (s, r, a) {
        return (
          this.enabled === !1 ||
            r === a ||
            !r ||
            !a ||
            (this.spaces[r].transfer === $t &&
              ((s.r = xn(s.r)), (s.g = xn(s.g)), (s.b = xn(s.b))),
            this.spaces[r].primaries !== this.spaces[a].primaries &&
              (s.applyMatrix3(this.spaces[r].toXYZ),
              s.applyMatrix3(this.spaces[a].fromXYZ)),
            this.spaces[a].transfer === $t &&
              ((s.r = ui(s.r)), (s.g = ui(s.g)), (s.b = ui(s.b)))),
          s
        );
      },
      workingToColorSpace: function (s, r) {
        return this.convert(s, this.workingColorSpace, r);
      },
      colorSpaceToWorking: function (s, r) {
        return this.convert(s, r, this.workingColorSpace);
      },
      getPrimaries: function (s) {
        return this.spaces[s].primaries;
      },
      getTransfer: function (s) {
        return s === An ? ps : this.spaces[s].transfer;
      },
      getToneMappingMode: function (s) {
        return (
          this.spaces[s].outputColorSpaceConfig.toneMappingMode || "standard"
        );
      },
      getLuminanceCoefficients: function (s, r = this.workingColorSpace) {
        return s.fromArray(this.spaces[r].luminanceCoefficients);
      },
      define: function (s) {
        Object.assign(this.spaces, s);
      },
      _getMatrix: function (s, r, a) {
        return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ);
      },
      _getDrawingBufferColorSpace: function (s) {
        return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace;
      },
      _getUnpackColorSpace: function (s = this.workingColorSpace) {
        return this.spaces[s].workingColorSpaceConfig.unpackColorSpace;
      },
      fromWorkingColorSpace: function (s, r) {
        return (
          Fi(
            "ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().",
          ),
          i.workingToColorSpace(s, r)
        );
      },
      toWorkingColorSpace: function (s, r) {
        return (
          Fi(
            "ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().",
          ),
          i.colorSpaceToWorking(s, r)
        );
      },
    },
    t = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06],
    e = [0.2126, 0.7152, 0.0722],
    n = [0.3127, 0.329];
  return (
    i.define({
      [mi]: {
        primaries: t,
        whitePoint: n,
        transfer: ps,
        toXYZ: Da,
        fromXYZ: La,
        luminanceCoefficients: e,
        workingColorSpaceConfig: { unpackColorSpace: Be },
        outputColorSpaceConfig: { drawingBufferColorSpace: Be },
      },
      [Be]: {
        primaries: t,
        whitePoint: n,
        transfer: $t,
        toXYZ: Da,
        fromXYZ: La,
        luminanceCoefficients: e,
        outputColorSpaceConfig: { drawingBufferColorSpace: Be },
      },
    }),
    i
  );
}
const Xt = Dl();
function xn(i) {
  return i < 0.04045
    ? i * 0.0773993808
    : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function ui(i) {
  return i < 0.0031308 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let Kn;
class Ll {
  static getDataURL(t, e = "image/png") {
    if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u") return t.src;
    let n;
    if (t instanceof HTMLCanvasElement) n = t;
    else {
      (Kn === void 0 && (Kn = xs("canvas")),
        (Kn.width = t.width),
        (Kn.height = t.height));
      const s = Kn.getContext("2d");
      (t instanceof ImageData
        ? s.putImageData(t, 0, 0)
        : s.drawImage(t, 0, 0, t.width, t.height),
        (n = Kn));
    }
    return n.toDataURL(e);
  }
  static sRGBToLinear(t) {
    if (
      (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement) ||
      (typeof ImageBitmap < "u" && t instanceof ImageBitmap)
    ) {
      const e = xs("canvas");
      ((e.width = t.width), (e.height = t.height));
      const n = e.getContext("2d");
      n.drawImage(t, 0, 0, t.width, t.height);
      const s = n.getImageData(0, 0, t.width, t.height),
        r = s.data;
      for (let a = 0; a < r.length; a++) r[a] = xn(r[a] / 255) * 255;
      return (n.putImageData(s, 0, 0), e);
    } else if (t.data) {
      const e = t.data.slice(0);
      for (let n = 0; n < e.length; n++)
        e instanceof Uint8Array || e instanceof Uint8ClampedArray
          ? (e[n] = Math.floor(xn(e[n] / 255) * 255))
          : (e[n] = xn(e[n]));
      return { data: e, width: t.width, height: t.height };
    } else
      return (
        Ut(
          "ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.",
        ),
        t
      );
  }
}
let Ul = 0;
class na {
  constructor(t = null) {
    ((this.isSource = !0),
      Object.defineProperty(this, "id", { value: Ul++ }),
      (this.uuid = Oi()),
      (this.data = t),
      (this.dataReady = !0),
      (this.version = 0));
  }
  getSize(t) {
    const e = this.data;
    return (
      typeof HTMLVideoElement < "u" && e instanceof HTMLVideoElement
        ? t.set(e.videoWidth, e.videoHeight, 0)
        : e instanceof VideoFrame
          ? t.set(e.displayHeight, e.displayWidth, 0)
          : e !== null
            ? t.set(e.width, e.height, e.depth || 0)
            : t.set(0, 0, 0),
      t
    );
  }
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.images[this.uuid] !== void 0) return t.images[this.uuid];
    const n = { uuid: this.uuid, url: "" },
      s = this.data;
    if (s !== null) {
      let r;
      if (Array.isArray(s)) {
        r = [];
        for (let a = 0, o = s.length; a < o; a++)
          s[a].isDataTexture ? r.push(Cs(s[a].image)) : r.push(Cs(s[a]));
      } else r = Cs(s);
      n.url = r;
    }
    return (e || (t.images[this.uuid] = n), n);
  }
}
function Cs(i) {
  return (typeof HTMLImageElement < "u" && i instanceof HTMLImageElement) ||
    (typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement) ||
    (typeof ImageBitmap < "u" && i instanceof ImageBitmap)
    ? Ll.getDataURL(i)
    : i.data
      ? {
          data: Array.from(i.data),
          width: i.width,
          height: i.height,
          type: i.data.constructor.name,
        }
      : (Ut("Texture: Unable to serialize Texture."), {});
}
let Il = 0;
const Ps = new F();
class be extends Yn {
  constructor(
    t = be.DEFAULT_IMAGE,
    e = be.DEFAULT_MAPPING,
    n = fn,
    s = fn,
    r = He,
    a = Hn,
    o = Ke,
    l = sn,
    c = be.DEFAULT_ANISOTROPY,
    u = An,
  ) {
    (super(),
      (this.isTexture = !0),
      Object.defineProperty(this, "id", { value: Il++ }),
      (this.uuid = Oi()),
      (this.name = ""),
      (this.source = new na(t)),
      (this.mipmaps = []),
      (this.mapping = e),
      (this.channel = 0),
      (this.wrapS = n),
      (this.wrapT = s),
      (this.magFilter = r),
      (this.minFilter = a),
      (this.anisotropy = c),
      (this.format = o),
      (this.internalFormat = null),
      (this.type = l),
      (this.offset = new Pt(0, 0)),
      (this.repeat = new Pt(1, 1)),
      (this.center = new Pt(0, 0)),
      (this.rotation = 0),
      (this.matrixAutoUpdate = !0),
      (this.matrix = new Nt()),
      (this.generateMipmaps = !0),
      (this.premultiplyAlpha = !1),
      (this.flipY = !0),
      (this.unpackAlignment = 4),
      (this.colorSpace = u),
      (this.userData = {}),
      (this.updateRanges = []),
      (this.version = 0),
      (this.onUpdate = null),
      (this.renderTarget = null),
      (this.isRenderTargetTexture = !1),
      (this.isArrayTexture = !!(t && t.depth && t.depth > 1)),
      (this.pmremVersion = 0));
  }
  get width() {
    return this.source.getSize(Ps).x;
  }
  get height() {
    return this.source.getSize(Ps).y;
  }
  get depth() {
    return this.source.getSize(Ps).z;
  }
  get image() {
    return this.source.data;
  }
  set image(t = null) {
    this.source.data = t;
  }
  updateMatrix() {
    this.matrix.setUvTransform(
      this.offset.x,
      this.offset.y,
      this.repeat.x,
      this.repeat.y,
      this.rotation,
      this.center.x,
      this.center.y,
    );
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return (
      (this.name = t.name),
      (this.source = t.source),
      (this.mipmaps = t.mipmaps.slice(0)),
      (this.mapping = t.mapping),
      (this.channel = t.channel),
      (this.wrapS = t.wrapS),
      (this.wrapT = t.wrapT),
      (this.magFilter = t.magFilter),
      (this.minFilter = t.minFilter),
      (this.anisotropy = t.anisotropy),
      (this.format = t.format),
      (this.internalFormat = t.internalFormat),
      (this.type = t.type),
      this.offset.copy(t.offset),
      this.repeat.copy(t.repeat),
      this.center.copy(t.center),
      (this.rotation = t.rotation),
      (this.matrixAutoUpdate = t.matrixAutoUpdate),
      this.matrix.copy(t.matrix),
      (this.generateMipmaps = t.generateMipmaps),
      (this.premultiplyAlpha = t.premultiplyAlpha),
      (this.flipY = t.flipY),
      (this.unpackAlignment = t.unpackAlignment),
      (this.colorSpace = t.colorSpace),
      (this.renderTarget = t.renderTarget),
      (this.isRenderTargetTexture = t.isRenderTargetTexture),
      (this.isArrayTexture = t.isArrayTexture),
      (this.userData = JSON.parse(JSON.stringify(t.userData))),
      (this.needsUpdate = !0),
      this
    );
  }
  setValues(t) {
    for (const e in t) {
      const n = t[e];
      if (n === void 0) {
        Ut(`Texture.setValues(): parameter '${e}' has value of undefined.`);
        continue;
      }
      const s = this[e];
      if (s === void 0) {
        Ut(`Texture.setValues(): property '${e}' does not exist.`);
        continue;
      }
      (s && n && s.isVector2 && n.isVector2) ||
      (s && n && s.isVector3 && n.isVector3) ||
      (s && n && s.isMatrix3 && n.isMatrix3)
        ? s.copy(n)
        : (this[e] = n);
    }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    if (!e && t.textures[this.uuid] !== void 0) return t.textures[this.uuid];
    const n = {
      metadata: { version: 4.7, type: "Texture", generator: "Texture.toJSON" },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(t).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment,
    };
    return (
      Object.keys(this.userData).length > 0 && (n.userData = this.userData),
      e || (t.textures[this.uuid] = n),
      n
    );
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(t) {
    if (this.mapping !== Co) return t;
    if ((t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1))
      switch (this.wrapS) {
        case mr:
          t.x = t.x - Math.floor(t.x);
          break;
        case fn:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case xr:
          Math.abs(Math.floor(t.x) % 2) === 1
            ? (t.x = Math.ceil(t.x) - t.x)
            : (t.x = t.x - Math.floor(t.x));
          break;
      }
    if (t.y < 0 || t.y > 1)
      switch (this.wrapT) {
        case mr:
          t.y = t.y - Math.floor(t.y);
          break;
        case fn:
          t.y = t.y < 0 ? 0 : 1;
          break;
        case xr:
          Math.abs(Math.floor(t.y) % 2) === 1
            ? (t.y = Math.ceil(t.y) - t.y)
            : (t.y = t.y - Math.floor(t.y));
          break;
      }
    return (this.flipY && (t.y = 1 - t.y), t);
  }
  set needsUpdate(t) {
    t === !0 && (this.version++, (this.source.needsUpdate = !0));
  }
  set needsPMREMUpdate(t) {
    t === !0 && this.pmremVersion++;
  }
}
be.DEFAULT_IMAGE = null;
be.DEFAULT_MAPPING = Co;
be.DEFAULT_ANISOTROPY = 1;
class le {
  constructor(t = 0, e = 0, n = 0, s = 1) {
    ((le.prototype.isVector4 = !0),
      (this.x = t),
      (this.y = e),
      (this.z = n),
      (this.w = s));
  }
  get width() {
    return this.z;
  }
  set width(t) {
    this.z = t;
  }
  get height() {
    return this.w;
  }
  set height(t) {
    this.w = t;
  }
  set(t, e, n, s) {
    return ((this.x = t), (this.y = e), (this.z = n), (this.w = s), this);
  }
  setScalar(t) {
    return ((this.x = t), (this.y = t), (this.z = t), (this.w = t), this);
  }
  setX(t) {
    return ((this.x = t), this);
  }
  setY(t) {
    return ((this.y = t), this);
  }
  setZ(t) {
    return ((this.z = t), this);
  }
  setW(t) {
    return ((this.w = t), this);
  }
  setComponent(t, e) {
    switch (t) {
      case 0:
        this.x = e;
        break;
      case 1:
        this.y = e;
        break;
      case 2:
        this.z = e;
        break;
      case 3:
        this.w = e;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(t) {
    return (
      (this.x = t.x),
      (this.y = t.y),
      (this.z = t.z),
      (this.w = t.w !== void 0 ? t.w : 1),
      this
    );
  }
  add(t) {
    return (
      (this.x += t.x),
      (this.y += t.y),
      (this.z += t.z),
      (this.w += t.w),
      this
    );
  }
  addScalar(t) {
    return ((this.x += t), (this.y += t), (this.z += t), (this.w += t), this);
  }
  addVectors(t, e) {
    return (
      (this.x = t.x + e.x),
      (this.y = t.y + e.y),
      (this.z = t.z + e.z),
      (this.w = t.w + e.w),
      this
    );
  }
  addScaledVector(t, e) {
    return (
      (this.x += t.x * e),
      (this.y += t.y * e),
      (this.z += t.z * e),
      (this.w += t.w * e),
      this
    );
  }
  sub(t) {
    return (
      (this.x -= t.x),
      (this.y -= t.y),
      (this.z -= t.z),
      (this.w -= t.w),
      this
    );
  }
  subScalar(t) {
    return ((this.x -= t), (this.y -= t), (this.z -= t), (this.w -= t), this);
  }
  subVectors(t, e) {
    return (
      (this.x = t.x - e.x),
      (this.y = t.y - e.y),
      (this.z = t.z - e.z),
      (this.w = t.w - e.w),
      this
    );
  }
  multiply(t) {
    return (
      (this.x *= t.x),
      (this.y *= t.y),
      (this.z *= t.z),
      (this.w *= t.w),
      this
    );
  }
  multiplyScalar(t) {
    return ((this.x *= t), (this.y *= t), (this.z *= t), (this.w *= t), this);
  }
  applyMatrix4(t) {
    const e = this.x,
      n = this.y,
      s = this.z,
      r = this.w,
      a = t.elements;
    return (
      (this.x = a[0] * e + a[4] * n + a[8] * s + a[12] * r),
      (this.y = a[1] * e + a[5] * n + a[9] * s + a[13] * r),
      (this.z = a[2] * e + a[6] * n + a[10] * s + a[14] * r),
      (this.w = a[3] * e + a[7] * n + a[11] * s + a[15] * r),
      this
    );
  }
  divide(t) {
    return (
      (this.x /= t.x),
      (this.y /= t.y),
      (this.z /= t.z),
      (this.w /= t.w),
      this
    );
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  setAxisAngleFromQuaternion(t) {
    this.w = 2 * Math.acos(t.w);
    const e = Math.sqrt(1 - t.w * t.w);
    return (
      e < 1e-4
        ? ((this.x = 1), (this.y = 0), (this.z = 0))
        : ((this.x = t.x / e), (this.y = t.y / e), (this.z = t.z / e)),
      this
    );
  }
  setAxisAngleFromRotationMatrix(t) {
    let e, n, s, r;
    const l = t.elements,
      c = l[0],
      u = l[4],
      h = l[8],
      f = l[1],
      p = l[5],
      _ = l[9],
      S = l[2],
      m = l[6],
      d = l[10];
    if (
      Math.abs(u - f) < 0.01 &&
      Math.abs(h - S) < 0.01 &&
      Math.abs(_ - m) < 0.01
    ) {
      if (
        Math.abs(u + f) < 0.1 &&
        Math.abs(h + S) < 0.1 &&
        Math.abs(_ + m) < 0.1 &&
        Math.abs(c + p + d - 3) < 0.1
      )
        return (this.set(1, 0, 0, 0), this);
      e = Math.PI;
      const b = (c + 1) / 2,
        y = (p + 1) / 2,
        R = (d + 1) / 2,
        T = (u + f) / 4,
        w = (h + S) / 4,
        L = (_ + m) / 4;
      return (
        b > y && b > R
          ? b < 0.01
            ? ((n = 0), (s = 0.707106781), (r = 0.707106781))
            : ((n = Math.sqrt(b)), (s = T / n), (r = w / n))
          : y > R
            ? y < 0.01
              ? ((n = 0.707106781), (s = 0), (r = 0.707106781))
              : ((s = Math.sqrt(y)), (n = T / s), (r = L / s))
            : R < 0.01
              ? ((n = 0.707106781), (s = 0.707106781), (r = 0))
              : ((r = Math.sqrt(R)), (n = w / r), (s = L / r)),
        this.set(n, s, r, e),
        this
      );
    }
    let E = Math.sqrt(
      (m - _) * (m - _) + (h - S) * (h - S) + (f - u) * (f - u),
    );
    return (
      Math.abs(E) < 0.001 && (E = 1),
      (this.x = (m - _) / E),
      (this.y = (h - S) / E),
      (this.z = (f - u) / E),
      (this.w = Math.acos((c + p + d - 1) / 2)),
      this
    );
  }
  setFromMatrixPosition(t) {
    const e = t.elements;
    return (
      (this.x = e[12]),
      (this.y = e[13]),
      (this.z = e[14]),
      (this.w = e[15]),
      this
    );
  }
  min(t) {
    return (
      (this.x = Math.min(this.x, t.x)),
      (this.y = Math.min(this.y, t.y)),
      (this.z = Math.min(this.z, t.z)),
      (this.w = Math.min(this.w, t.w)),
      this
    );
  }
  max(t) {
    return (
      (this.x = Math.max(this.x, t.x)),
      (this.y = Math.max(this.y, t.y)),
      (this.z = Math.max(this.z, t.z)),
      (this.w = Math.max(this.w, t.w)),
      this
    );
  }
  clamp(t, e) {
    return (
      (this.x = Bt(this.x, t.x, e.x)),
      (this.y = Bt(this.y, t.y, e.y)),
      (this.z = Bt(this.z, t.z, e.z)),
      (this.w = Bt(this.w, t.w, e.w)),
      this
    );
  }
  clampScalar(t, e) {
    return (
      (this.x = Bt(this.x, t, e)),
      (this.y = Bt(this.y, t, e)),
      (this.z = Bt(this.z, t, e)),
      (this.w = Bt(this.w, t, e)),
      this
    );
  }
  clampLength(t, e) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Bt(n, t, e));
  }
  floor() {
    return (
      (this.x = Math.floor(this.x)),
      (this.y = Math.floor(this.y)),
      (this.z = Math.floor(this.z)),
      (this.w = Math.floor(this.w)),
      this
    );
  }
  ceil() {
    return (
      (this.x = Math.ceil(this.x)),
      (this.y = Math.ceil(this.y)),
      (this.z = Math.ceil(this.z)),
      (this.w = Math.ceil(this.w)),
      this
    );
  }
  round() {
    return (
      (this.x = Math.round(this.x)),
      (this.y = Math.round(this.y)),
      (this.z = Math.round(this.z)),
      (this.w = Math.round(this.w)),
      this
    );
  }
  roundToZero() {
    return (
      (this.x = Math.trunc(this.x)),
      (this.y = Math.trunc(this.y)),
      (this.z = Math.trunc(this.z)),
      (this.w = Math.trunc(this.w)),
      this
    );
  }
  negate() {
    return (
      (this.x = -this.x),
      (this.y = -this.y),
      (this.z = -this.z),
      (this.w = -this.w),
      this
    );
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
  }
  lengthSq() {
    return (
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }
  length() {
    return Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w,
    );
  }
  manhattanLength() {
    return (
      Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
    );
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, e) {
    return (
      (this.x += (t.x - this.x) * e),
      (this.y += (t.y - this.y) * e),
      (this.z += (t.z - this.z) * e),
      (this.w += (t.w - this.w) * e),
      this
    );
  }
  lerpVectors(t, e, n) {
    return (
      (this.x = t.x + (e.x - t.x) * n),
      (this.y = t.y + (e.y - t.y) * n),
      (this.z = t.z + (e.z - t.z) * n),
      (this.w = t.w + (e.w - t.w) * n),
      this
    );
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
  }
  fromArray(t, e = 0) {
    return (
      (this.x = t[e]),
      (this.y = t[e + 1]),
      (this.z = t[e + 2]),
      (this.w = t[e + 3]),
      this
    );
  }
  toArray(t = [], e = 0) {
    return (
      (t[e] = this.x),
      (t[e + 1] = this.y),
      (t[e + 2] = this.z),
      (t[e + 3] = this.w),
      t
    );
  }
  fromBufferAttribute(t, e) {
    return (
      (this.x = t.getX(e)),
      (this.y = t.getY(e)),
      (this.z = t.getZ(e)),
      (this.w = t.getW(e)),
      this
    );
  }
  random() {
    return (
      (this.x = Math.random()),
      (this.y = Math.random()),
      (this.z = Math.random()),
      (this.w = Math.random()),
      this
    );
  }
  *[Symbol.iterator]() {
    (yield this.x, yield this.y, yield this.z, yield this.w);
  }
}
class Nl extends Yn {
  constructor(t = 1, e = 1, n = {}) {
    (super(),
      (n = Object.assign(
        {
          generateMipmaps: !1,
          internalFormat: null,
          minFilter: He,
          depthBuffer: !0,
          stencilBuffer: !1,
          resolveDepthBuffer: !0,
          resolveStencilBuffer: !0,
          depthTexture: null,
          samples: 0,
          count: 1,
          depth: 1,
          multiview: !1,
        },
        n,
      )),
      (this.isRenderTarget = !0),
      (this.width = t),
      (this.height = e),
      (this.depth = n.depth),
      (this.scissor = new le(0, 0, t, e)),
      (this.scissorTest = !1),
      (this.viewport = new le(0, 0, t, e)));
    const s = { width: t, height: e, depth: n.depth },
      r = new be(s);
    this.textures = [];
    const a = n.count;
    for (let o = 0; o < a; o++)
      ((this.textures[o] = r.clone()),
        (this.textures[o].isRenderTargetTexture = !0),
        (this.textures[o].renderTarget = this));
    (this._setTextureOptions(n),
      (this.depthBuffer = n.depthBuffer),
      (this.stencilBuffer = n.stencilBuffer),
      (this.resolveDepthBuffer = n.resolveDepthBuffer),
      (this.resolveStencilBuffer = n.resolveStencilBuffer),
      (this._depthTexture = null),
      (this.depthTexture = n.depthTexture),
      (this.samples = n.samples),
      (this.multiview = n.multiview));
  }
  _setTextureOptions(t = {}) {
    const e = {
      minFilter: He,
      generateMipmaps: !1,
      flipY: !1,
      internalFormat: null,
    };
    (t.mapping !== void 0 && (e.mapping = t.mapping),
      t.wrapS !== void 0 && (e.wrapS = t.wrapS),
      t.wrapT !== void 0 && (e.wrapT = t.wrapT),
      t.wrapR !== void 0 && (e.wrapR = t.wrapR),
      t.magFilter !== void 0 && (e.magFilter = t.magFilter),
      t.minFilter !== void 0 && (e.minFilter = t.minFilter),
      t.format !== void 0 && (e.format = t.format),
      t.type !== void 0 && (e.type = t.type),
      t.anisotropy !== void 0 && (e.anisotropy = t.anisotropy),
      t.colorSpace !== void 0 && (e.colorSpace = t.colorSpace),
      t.flipY !== void 0 && (e.flipY = t.flipY),
      t.generateMipmaps !== void 0 && (e.generateMipmaps = t.generateMipmaps),
      t.internalFormat !== void 0 && (e.internalFormat = t.internalFormat));
    for (let n = 0; n < this.textures.length; n++)
      this.textures[n].setValues(e);
  }
  get texture() {
    return this.textures[0];
  }
  set texture(t) {
    this.textures[0] = t;
  }
  set depthTexture(t) {
    (this._depthTexture !== null && (this._depthTexture.renderTarget = null),
      t !== null && (t.renderTarget = this),
      (this._depthTexture = t));
  }
  get depthTexture() {
    return this._depthTexture;
  }
  setSize(t, e, n = 1) {
    if (this.width !== t || this.height !== e || this.depth !== n) {
      ((this.width = t), (this.height = e), (this.depth = n));
      for (let s = 0, r = this.textures.length; s < r; s++)
        ((this.textures[s].image.width = t),
          (this.textures[s].image.height = e),
          (this.textures[s].image.depth = n),
          this.textures[s].isData3DTexture !== !0 &&
            (this.textures[s].isArrayTexture =
              this.textures[s].image.depth > 1));
      this.dispose();
    }
    (this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e));
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    ((this.width = t.width),
      (this.height = t.height),
      (this.depth = t.depth),
      this.scissor.copy(t.scissor),
      (this.scissorTest = t.scissorTest),
      this.viewport.copy(t.viewport),
      (this.textures.length = 0));
    for (let e = 0, n = t.textures.length; e < n; e++) {
      ((this.textures[e] = t.textures[e].clone()),
        (this.textures[e].isRenderTargetTexture = !0),
        (this.textures[e].renderTarget = this));
      const s = Object.assign({}, t.textures[e].image);
      this.textures[e].source = new na(s);
    }
    return (
      (this.depthBuffer = t.depthBuffer),
      (this.stencilBuffer = t.stencilBuffer),
      (this.resolveDepthBuffer = t.resolveDepthBuffer),
      (this.resolveStencilBuffer = t.resolveStencilBuffer),
      t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()),
      (this.samples = t.samples),
      this
    );
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class Xn extends Nl {
  constructor(t = 1, e = 1, n = {}) {
    (super(t, e, n), (this.isWebGLRenderTarget = !0));
  }
}
class Vo extends be {
  constructor(t = null, e = 1, n = 1, s = 1) {
    (super(null),
      (this.isDataArrayTexture = !0),
      (this.image = { data: t, width: e, height: n, depth: s }),
      (this.magFilter = Te),
      (this.minFilter = Te),
      (this.wrapR = fn),
      (this.generateMipmaps = !1),
      (this.flipY = !1),
      (this.unpackAlignment = 1),
      (this.layerUpdates = new Set()));
  }
  addLayerUpdate(t) {
    this.layerUpdates.add(t);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class Fl extends be {
  constructor(t = null, e = 1, n = 1, s = 1) {
    (super(null),
      (this.isData3DTexture = !0),
      (this.image = { data: t, width: e, height: n, depth: s }),
      (this.magFilter = Te),
      (this.minFilter = Te),
      (this.wrapR = fn),
      (this.generateMipmaps = !1),
      (this.flipY = !1),
      (this.unpackAlignment = 1));
  }
}
class gi {
  constructor(
    t = new F(1 / 0, 1 / 0, 1 / 0),
    e = new F(-1 / 0, -1 / 0, -1 / 0),
  ) {
    ((this.isBox3 = !0), (this.min = t), (this.max = e));
  }
  set(t, e) {
    return (this.min.copy(t), this.max.copy(e), this);
  }
  setFromArray(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e += 3)
      this.expandByPoint(Xe.fromArray(t, e));
    return this;
  }
  setFromBufferAttribute(t) {
    this.makeEmpty();
    for (let e = 0, n = t.count; e < n; e++)
      this.expandByPoint(Xe.fromBufferAttribute(t, e));
    return this;
  }
  setFromPoints(t) {
    this.makeEmpty();
    for (let e = 0, n = t.length; e < n; e++) this.expandByPoint(t[e]);
    return this;
  }
  setFromCenterAndSize(t, e) {
    const n = Xe.copy(e).multiplyScalar(0.5);
    return (this.min.copy(t).sub(n), this.max.copy(t).add(n), this);
  }
  setFromObject(t, e = !1) {
    return (this.makeEmpty(), this.expandByObject(t, e));
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return (this.min.copy(t.min), this.max.copy(t.max), this);
  }
  makeEmpty() {
    return (
      (this.min.x = this.min.y = this.min.z = 1 / 0),
      (this.max.x = this.max.y = this.max.z = -1 / 0),
      this
    );
  }
  isEmpty() {
    return (
      this.max.x < this.min.x ||
      this.max.y < this.min.y ||
      this.max.z < this.min.z
    );
  }
  getCenter(t) {
    return this.isEmpty()
      ? t.set(0, 0, 0)
      : t.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(t) {
    return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min);
  }
  expandByPoint(t) {
    return (this.min.min(t), this.max.max(t), this);
  }
  expandByVector(t) {
    return (this.min.sub(t), this.max.add(t), this);
  }
  expandByScalar(t) {
    return (this.min.addScalar(-t), this.max.addScalar(t), this);
  }
  expandByObject(t, e = !1) {
    t.updateWorldMatrix(!1, !1);
    const n = t.geometry;
    if (n !== void 0) {
      const r = n.getAttribute("position");
      if (e === !0 && r !== void 0 && t.isInstancedMesh !== !0)
        for (let a = 0, o = r.count; a < o; a++)
          (t.isMesh === !0
            ? t.getVertexPosition(a, Xe)
            : Xe.fromBufferAttribute(r, a),
            Xe.applyMatrix4(t.matrixWorld),
            this.expandByPoint(Xe));
      else
        (t.boundingBox !== void 0
          ? (t.boundingBox === null && t.computeBoundingBox(),
            Hi.copy(t.boundingBox))
          : (n.boundingBox === null && n.computeBoundingBox(),
            Hi.copy(n.boundingBox)),
          Hi.applyMatrix4(t.matrixWorld),
          this.union(Hi));
    }
    const s = t.children;
    for (let r = 0, a = s.length; r < a; r++) this.expandByObject(s[r], e);
    return this;
  }
  containsPoint(t) {
    return (
      t.x >= this.min.x &&
      t.x <= this.max.x &&
      t.y >= this.min.y &&
      t.y <= this.max.y &&
      t.z >= this.min.z &&
      t.z <= this.max.z
    );
  }
  containsBox(t) {
    return (
      this.min.x <= t.min.x &&
      t.max.x <= this.max.x &&
      this.min.y <= t.min.y &&
      t.max.y <= this.max.y &&
      this.min.z <= t.min.z &&
      t.max.z <= this.max.z
    );
  }
  getParameter(t, e) {
    return e.set(
      (t.x - this.min.x) / (this.max.x - this.min.x),
      (t.y - this.min.y) / (this.max.y - this.min.y),
      (t.z - this.min.z) / (this.max.z - this.min.z),
    );
  }
  intersectsBox(t) {
    return (
      t.max.x >= this.min.x &&
      t.min.x <= this.max.x &&
      t.max.y >= this.min.y &&
      t.min.y <= this.max.y &&
      t.max.z >= this.min.z &&
      t.min.z <= this.max.z
    );
  }
  intersectsSphere(t) {
    return (
      this.clampPoint(t.center, Xe),
      Xe.distanceToSquared(t.center) <= t.radius * t.radius
    );
  }
  intersectsPlane(t) {
    let e, n;
    return (
      t.normal.x > 0
        ? ((e = t.normal.x * this.min.x), (n = t.normal.x * this.max.x))
        : ((e = t.normal.x * this.max.x), (n = t.normal.x * this.min.x)),
      t.normal.y > 0
        ? ((e += t.normal.y * this.min.y), (n += t.normal.y * this.max.y))
        : ((e += t.normal.y * this.max.y), (n += t.normal.y * this.min.y)),
      t.normal.z > 0
        ? ((e += t.normal.z * this.min.z), (n += t.normal.z * this.max.z))
        : ((e += t.normal.z * this.max.z), (n += t.normal.z * this.min.z)),
      e <= -t.constant && n >= -t.constant
    );
  }
  intersectsTriangle(t) {
    if (this.isEmpty()) return !1;
    (this.getCenter(Ti),
      ki.subVectors(this.max, Ti),
      $n.subVectors(t.a, Ti),
      Zn.subVectors(t.b, Ti),
      Jn.subVectors(t.c, Ti),
      gn.subVectors(Zn, $n),
      vn.subVectors(Jn, Zn),
      Un.subVectors($n, Jn));
    let e = [
      0,
      -gn.z,
      gn.y,
      0,
      -vn.z,
      vn.y,
      0,
      -Un.z,
      Un.y,
      gn.z,
      0,
      -gn.x,
      vn.z,
      0,
      -vn.x,
      Un.z,
      0,
      -Un.x,
      -gn.y,
      gn.x,
      0,
      -vn.y,
      vn.x,
      0,
      -Un.y,
      Un.x,
      0,
    ];
    return !Ds(e, $n, Zn, Jn, ki) ||
      ((e = [1, 0, 0, 0, 1, 0, 0, 0, 1]), !Ds(e, $n, Zn, Jn, ki))
      ? !1
      : (Wi.crossVectors(gn, vn),
        (e = [Wi.x, Wi.y, Wi.z]),
        Ds(e, $n, Zn, Jn, ki));
  }
  clampPoint(t, e) {
    return e.copy(t).clamp(this.min, this.max);
  }
  distanceToPoint(t) {
    return this.clampPoint(t, Xe).distanceTo(t);
  }
  getBoundingSphere(t) {
    return (
      this.isEmpty()
        ? t.makeEmpty()
        : (this.getCenter(t.center),
          (t.radius = this.getSize(Xe).length() * 0.5)),
      t
    );
  }
  intersect(t) {
    return (
      this.min.max(t.min),
      this.max.min(t.max),
      this.isEmpty() && this.makeEmpty(),
      this
    );
  }
  union(t) {
    return (this.min.min(t.min), this.max.max(t.max), this);
  }
  applyMatrix4(t) {
    return this.isEmpty()
      ? this
      : (an[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t),
        an[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t),
        an[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t),
        an[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t),
        an[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t),
        an[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t),
        an[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t),
        an[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t),
        this.setFromPoints(an),
        this);
  }
  translate(t) {
    return (this.min.add(t), this.max.add(t), this);
  }
  equals(t) {
    return t.min.equals(this.min) && t.max.equals(this.max);
  }
  toJSON() {
    return { min: this.min.toArray(), max: this.max.toArray() };
  }
  fromJSON(t) {
    return (this.min.fromArray(t.min), this.max.fromArray(t.max), this);
  }
}
const an = [
    new F(),
    new F(),
    new F(),
    new F(),
    new F(),
    new F(),
    new F(),
    new F(),
  ],
  Xe = new F(),
  Hi = new gi(),
  $n = new F(),
  Zn = new F(),
  Jn = new F(),
  gn = new F(),
  vn = new F(),
  Un = new F(),
  Ti = new F(),
  ki = new F(),
  Wi = new F(),
  In = new F();
function Ds(i, t, e, n, s) {
  for (let r = 0, a = i.length - 3; r <= a; r += 3) {
    In.fromArray(i, r);
    const o =
        s.x * Math.abs(In.x) + s.y * Math.abs(In.y) + s.z * Math.abs(In.z),
      l = t.dot(In),
      c = e.dot(In),
      u = n.dot(In);
    if (Math.max(-Math.max(l, c, u), Math.min(l, c, u)) > o) return !1;
  }
  return !0;
}
const Ol = new gi(),
  Ai = new F(),
  Ls = new F();
class ia {
  constructor(t = new F(), e = -1) {
    ((this.isSphere = !0), (this.center = t), (this.radius = e));
  }
  set(t, e) {
    return (this.center.copy(t), (this.radius = e), this);
  }
  setFromPoints(t, e) {
    const n = this.center;
    e !== void 0 ? n.copy(e) : Ol.setFromPoints(t).getCenter(n);
    let s = 0;
    for (let r = 0, a = t.length; r < a; r++)
      s = Math.max(s, n.distanceToSquared(t[r]));
    return ((this.radius = Math.sqrt(s)), this);
  }
  copy(t) {
    return (this.center.copy(t.center), (this.radius = t.radius), this);
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return (this.center.set(0, 0, 0), (this.radius = -1), this);
  }
  containsPoint(t) {
    return t.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(t) {
    return t.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(t) {
    const e = this.radius + t.radius;
    return t.center.distanceToSquared(this.center) <= e * e;
  }
  intersectsBox(t) {
    return t.intersectsSphere(this);
  }
  intersectsPlane(t) {
    return Math.abs(t.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(t, e) {
    const n = this.center.distanceToSquared(t);
    return (
      e.copy(t),
      n > this.radius * this.radius &&
        (e.sub(this.center).normalize(),
        e.multiplyScalar(this.radius).add(this.center)),
      e
    );
  }
  getBoundingBox(t) {
    return this.isEmpty()
      ? (t.makeEmpty(), t)
      : (t.set(this.center, this.center), t.expandByScalar(this.radius), t);
  }
  applyMatrix4(t) {
    return (
      this.center.applyMatrix4(t),
      (this.radius = this.radius * t.getMaxScaleOnAxis()),
      this
    );
  }
  translate(t) {
    return (this.center.add(t), this);
  }
  expandByPoint(t) {
    if (this.isEmpty()) return (this.center.copy(t), (this.radius = 0), this);
    Ai.subVectors(t, this.center);
    const e = Ai.lengthSq();
    if (e > this.radius * this.radius) {
      const n = Math.sqrt(e),
        s = (n - this.radius) * 0.5;
      (this.center.addScaledVector(Ai, s / n), (this.radius += s));
    }
    return this;
  }
  union(t) {
    return t.isEmpty()
      ? this
      : this.isEmpty()
        ? (this.copy(t), this)
        : (this.center.equals(t.center) === !0
            ? (this.radius = Math.max(this.radius, t.radius))
            : (Ls.subVectors(t.center, this.center).setLength(t.radius),
              this.expandByPoint(Ai.copy(t.center).add(Ls)),
              this.expandByPoint(Ai.copy(t.center).sub(Ls))),
          this);
  }
  equals(t) {
    return t.center.equals(this.center) && t.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    return { radius: this.radius, center: this.center.toArray() };
  }
  fromJSON(t) {
    return ((this.radius = t.radius), this.center.fromArray(t.center), this);
  }
}
const on = new F(),
  Us = new F(),
  Xi = new F(),
  Mn = new F(),
  Is = new F(),
  Yi = new F(),
  Ns = new F();
class Go {
  constructor(t = new F(), e = new F(0, 0, -1)) {
    ((this.origin = t), (this.direction = e));
  }
  set(t, e) {
    return (this.origin.copy(t), this.direction.copy(e), this);
  }
  copy(t) {
    return (this.origin.copy(t.origin), this.direction.copy(t.direction), this);
  }
  at(t, e) {
    return e.copy(this.origin).addScaledVector(this.direction, t);
  }
  lookAt(t) {
    return (this.direction.copy(t).sub(this.origin).normalize(), this);
  }
  recast(t) {
    return (this.origin.copy(this.at(t, on)), this);
  }
  closestPointToPoint(t, e) {
    e.subVectors(t, this.origin);
    const n = e.dot(this.direction);
    return n < 0
      ? e.copy(this.origin)
      : e.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(t) {
    return Math.sqrt(this.distanceSqToPoint(t));
  }
  distanceSqToPoint(t) {
    const e = on.subVectors(t, this.origin).dot(this.direction);
    return e < 0
      ? this.origin.distanceToSquared(t)
      : (on.copy(this.origin).addScaledVector(this.direction, e),
        on.distanceToSquared(t));
  }
  distanceSqToSegment(t, e, n, s) {
    (Us.copy(t).add(e).multiplyScalar(0.5),
      Xi.copy(e).sub(t).normalize(),
      Mn.copy(this.origin).sub(Us));
    const r = t.distanceTo(e) * 0.5,
      a = -this.direction.dot(Xi),
      o = Mn.dot(this.direction),
      l = -Mn.dot(Xi),
      c = Mn.lengthSq(),
      u = Math.abs(1 - a * a);
    let h, f, p, _;
    if (u > 0)
      if (((h = a * l - o), (f = a * o - l), (_ = r * u), h >= 0))
        if (f >= -_)
          if (f <= _) {
            const S = 1 / u;
            ((h *= S),
              (f *= S),
              (p = h * (h + a * f + 2 * o) + f * (a * h + f + 2 * l) + c));
          } else
            ((f = r),
              (h = Math.max(0, -(a * f + o))),
              (p = -h * h + f * (f + 2 * l) + c));
        else
          ((f = -r),
            (h = Math.max(0, -(a * f + o))),
            (p = -h * h + f * (f + 2 * l) + c));
      else
        f <= -_
          ? ((h = Math.max(0, -(-a * r + o))),
            (f = h > 0 ? -r : Math.min(Math.max(-r, -l), r)),
            (p = -h * h + f * (f + 2 * l) + c))
          : f <= _
            ? ((h = 0),
              (f = Math.min(Math.max(-r, -l), r)),
              (p = f * (f + 2 * l) + c))
            : ((h = Math.max(0, -(a * r + o))),
              (f = h > 0 ? r : Math.min(Math.max(-r, -l), r)),
              (p = -h * h + f * (f + 2 * l) + c));
    else
      ((f = a > 0 ? -r : r),
        (h = Math.max(0, -(a * f + o))),
        (p = -h * h + f * (f + 2 * l) + c));
    return (
      n && n.copy(this.origin).addScaledVector(this.direction, h),
      s && s.copy(Us).addScaledVector(Xi, f),
      p
    );
  }
  intersectSphere(t, e) {
    on.subVectors(t.center, this.origin);
    const n = on.dot(this.direction),
      s = on.dot(on) - n * n,
      r = t.radius * t.radius;
    if (s > r) return null;
    const a = Math.sqrt(r - s),
      o = n - a,
      l = n + a;
    return l < 0 ? null : o < 0 ? this.at(l, e) : this.at(o, e);
  }
  intersectsSphere(t) {
    return t.radius < 0
      ? !1
      : this.distanceSqToPoint(t.center) <= t.radius * t.radius;
  }
  distanceToPlane(t) {
    const e = t.normal.dot(this.direction);
    if (e === 0) return t.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(t.normal) + t.constant) / e;
    return n >= 0 ? n : null;
  }
  intersectPlane(t, e) {
    const n = this.distanceToPlane(t);
    return n === null ? null : this.at(n, e);
  }
  intersectsPlane(t) {
    const e = t.distanceToPoint(this.origin);
    return e === 0 || t.normal.dot(this.direction) * e < 0;
  }
  intersectBox(t, e) {
    let n, s, r, a, o, l;
    const c = 1 / this.direction.x,
      u = 1 / this.direction.y,
      h = 1 / this.direction.z,
      f = this.origin;
    return (
      c >= 0
        ? ((n = (t.min.x - f.x) * c), (s = (t.max.x - f.x) * c))
        : ((n = (t.max.x - f.x) * c), (s = (t.min.x - f.x) * c)),
      u >= 0
        ? ((r = (t.min.y - f.y) * u), (a = (t.max.y - f.y) * u))
        : ((r = (t.max.y - f.y) * u), (a = (t.min.y - f.y) * u)),
      n > a ||
      r > s ||
      ((r > n || isNaN(n)) && (n = r),
      (a < s || isNaN(s)) && (s = a),
      h >= 0
        ? ((o = (t.min.z - f.z) * h), (l = (t.max.z - f.z) * h))
        : ((o = (t.max.z - f.z) * h), (l = (t.min.z - f.z) * h)),
      n > l || o > s) ||
      ((o > n || n !== n) && (n = o), (l < s || s !== s) && (s = l), s < 0)
        ? null
        : this.at(n >= 0 ? n : s, e)
    );
  }
  intersectsBox(t) {
    return this.intersectBox(t, on) !== null;
  }
  intersectTriangle(t, e, n, s, r) {
    (Is.subVectors(e, t), Yi.subVectors(n, t), Ns.crossVectors(Is, Yi));
    let a = this.direction.dot(Ns),
      o;
    if (a > 0) {
      if (s) return null;
      o = 1;
    } else if (a < 0) ((o = -1), (a = -a));
    else return null;
    Mn.subVectors(this.origin, t);
    const l = o * this.direction.dot(Yi.crossVectors(Mn, Yi));
    if (l < 0) return null;
    const c = o * this.direction.dot(Is.cross(Mn));
    if (c < 0 || l + c > a) return null;
    const u = -o * Mn.dot(Ns);
    return u < 0 ? null : this.at(u / a, r);
  }
  applyMatrix4(t) {
    return (
      this.origin.applyMatrix4(t),
      this.direction.transformDirection(t),
      this
    );
  }
  equals(t) {
    return t.origin.equals(this.origin) && t.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class ue {
  constructor(t, e, n, s, r, a, o, l, c, u, h, f, p, _, S, m) {
    ((ue.prototype.isMatrix4 = !0),
      (this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
      t !== void 0 && this.set(t, e, n, s, r, a, o, l, c, u, h, f, p, _, S, m));
  }
  set(t, e, n, s, r, a, o, l, c, u, h, f, p, _, S, m) {
    const d = this.elements;
    return (
      (d[0] = t),
      (d[4] = e),
      (d[8] = n),
      (d[12] = s),
      (d[1] = r),
      (d[5] = a),
      (d[9] = o),
      (d[13] = l),
      (d[2] = c),
      (d[6] = u),
      (d[10] = h),
      (d[14] = f),
      (d[3] = p),
      (d[7] = _),
      (d[11] = S),
      (d[15] = m),
      this
    );
  }
  identity() {
    return (this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this);
  }
  clone() {
    return new ue().fromArray(this.elements);
  }
  copy(t) {
    const e = this.elements,
      n = t.elements;
    return (
      (e[0] = n[0]),
      (e[1] = n[1]),
      (e[2] = n[2]),
      (e[3] = n[3]),
      (e[4] = n[4]),
      (e[5] = n[5]),
      (e[6] = n[6]),
      (e[7] = n[7]),
      (e[8] = n[8]),
      (e[9] = n[9]),
      (e[10] = n[10]),
      (e[11] = n[11]),
      (e[12] = n[12]),
      (e[13] = n[13]),
      (e[14] = n[14]),
      (e[15] = n[15]),
      this
    );
  }
  copyPosition(t) {
    const e = this.elements,
      n = t.elements;
    return ((e[12] = n[12]), (e[13] = n[13]), (e[14] = n[14]), this);
  }
  setFromMatrix3(t) {
    const e = t.elements;
    return (
      this.set(
        e[0],
        e[3],
        e[6],
        0,
        e[1],
        e[4],
        e[7],
        0,
        e[2],
        e[5],
        e[8],
        0,
        0,
        0,
        0,
        1,
      ),
      this
    );
  }
  extractBasis(t, e, n) {
    return (
      t.setFromMatrixColumn(this, 0),
      e.setFromMatrixColumn(this, 1),
      n.setFromMatrixColumn(this, 2),
      this
    );
  }
  makeBasis(t, e, n) {
    return (
      this.set(
        t.x,
        e.x,
        n.x,
        0,
        t.y,
        e.y,
        n.y,
        0,
        t.z,
        e.z,
        n.z,
        0,
        0,
        0,
        0,
        1,
      ),
      this
    );
  }
  extractRotation(t) {
    const e = this.elements,
      n = t.elements,
      s = 1 / Qn.setFromMatrixColumn(t, 0).length(),
      r = 1 / Qn.setFromMatrixColumn(t, 1).length(),
      a = 1 / Qn.setFromMatrixColumn(t, 2).length();
    return (
      (e[0] = n[0] * s),
      (e[1] = n[1] * s),
      (e[2] = n[2] * s),
      (e[3] = 0),
      (e[4] = n[4] * r),
      (e[5] = n[5] * r),
      (e[6] = n[6] * r),
      (e[7] = 0),
      (e[8] = n[8] * a),
      (e[9] = n[9] * a),
      (e[10] = n[10] * a),
      (e[11] = 0),
      (e[12] = 0),
      (e[13] = 0),
      (e[14] = 0),
      (e[15] = 1),
      this
    );
  }
  makeRotationFromEuler(t) {
    const e = this.elements,
      n = t.x,
      s = t.y,
      r = t.z,
      a = Math.cos(n),
      o = Math.sin(n),
      l = Math.cos(s),
      c = Math.sin(s),
      u = Math.cos(r),
      h = Math.sin(r);
    if (t.order === "XYZ") {
      const f = a * u,
        p = a * h,
        _ = o * u,
        S = o * h;
      ((e[0] = l * u),
        (e[4] = -l * h),
        (e[8] = c),
        (e[1] = p + _ * c),
        (e[5] = f - S * c),
        (e[9] = -o * l),
        (e[2] = S - f * c),
        (e[6] = _ + p * c),
        (e[10] = a * l));
    } else if (t.order === "YXZ") {
      const f = l * u,
        p = l * h,
        _ = c * u,
        S = c * h;
      ((e[0] = f + S * o),
        (e[4] = _ * o - p),
        (e[8] = a * c),
        (e[1] = a * h),
        (e[5] = a * u),
        (e[9] = -o),
        (e[2] = p * o - _),
        (e[6] = S + f * o),
        (e[10] = a * l));
    } else if (t.order === "ZXY") {
      const f = l * u,
        p = l * h,
        _ = c * u,
        S = c * h;
      ((e[0] = f - S * o),
        (e[4] = -a * h),
        (e[8] = _ + p * o),
        (e[1] = p + _ * o),
        (e[5] = a * u),
        (e[9] = S - f * o),
        (e[2] = -a * c),
        (e[6] = o),
        (e[10] = a * l));
    } else if (t.order === "ZYX") {
      const f = a * u,
        p = a * h,
        _ = o * u,
        S = o * h;
      ((e[0] = l * u),
        (e[4] = _ * c - p),
        (e[8] = f * c + S),
        (e[1] = l * h),
        (e[5] = S * c + f),
        (e[9] = p * c - _),
        (e[2] = -c),
        (e[6] = o * l),
        (e[10] = a * l));
    } else if (t.order === "YZX") {
      const f = a * l,
        p = a * c,
        _ = o * l,
        S = o * c;
      ((e[0] = l * u),
        (e[4] = S - f * h),
        (e[8] = _ * h + p),
        (e[1] = h),
        (e[5] = a * u),
        (e[9] = -o * u),
        (e[2] = -c * u),
        (e[6] = p * h + _),
        (e[10] = f - S * h));
    } else if (t.order === "XZY") {
      const f = a * l,
        p = a * c,
        _ = o * l,
        S = o * c;
      ((e[0] = l * u),
        (e[4] = -h),
        (e[8] = c * u),
        (e[1] = f * h + S),
        (e[5] = a * u),
        (e[9] = p * h - _),
        (e[2] = _ * h - p),
        (e[6] = o * u),
        (e[10] = S * h + f));
    }
    return (
      (e[3] = 0),
      (e[7] = 0),
      (e[11] = 0),
      (e[12] = 0),
      (e[13] = 0),
      (e[14] = 0),
      (e[15] = 1),
      this
    );
  }
  makeRotationFromQuaternion(t) {
    return this.compose(Bl, t, zl);
  }
  lookAt(t, e, n) {
    const s = this.elements;
    return (
      Ne.subVectors(t, e),
      Ne.lengthSq() === 0 && (Ne.z = 1),
      Ne.normalize(),
      Sn.crossVectors(n, Ne),
      Sn.lengthSq() === 0 &&
        (Math.abs(n.z) === 1 ? (Ne.x += 1e-4) : (Ne.z += 1e-4),
        Ne.normalize(),
        Sn.crossVectors(n, Ne)),
      Sn.normalize(),
      qi.crossVectors(Ne, Sn),
      (s[0] = Sn.x),
      (s[4] = qi.x),
      (s[8] = Ne.x),
      (s[1] = Sn.y),
      (s[5] = qi.y),
      (s[9] = Ne.y),
      (s[2] = Sn.z),
      (s[6] = qi.z),
      (s[10] = Ne.z),
      this
    );
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, e) {
    const n = t.elements,
      s = e.elements,
      r = this.elements,
      a = n[0],
      o = n[4],
      l = n[8],
      c = n[12],
      u = n[1],
      h = n[5],
      f = n[9],
      p = n[13],
      _ = n[2],
      S = n[6],
      m = n[10],
      d = n[14],
      E = n[3],
      b = n[7],
      y = n[11],
      R = n[15],
      T = s[0],
      w = s[4],
      L = s[8],
      M = s[12],
      g = s[1],
      D = s[5],
      N = s[9],
      V = s[13],
      W = s[2],
      k = s[6],
      q = s[10],
      J = s[14],
      H = s[3],
      nt = s[7],
      rt = s[11],
      bt = s[15];
    return (
      (r[0] = a * T + o * g + l * W + c * H),
      (r[4] = a * w + o * D + l * k + c * nt),
      (r[8] = a * L + o * N + l * q + c * rt),
      (r[12] = a * M + o * V + l * J + c * bt),
      (r[1] = u * T + h * g + f * W + p * H),
      (r[5] = u * w + h * D + f * k + p * nt),
      (r[9] = u * L + h * N + f * q + p * rt),
      (r[13] = u * M + h * V + f * J + p * bt),
      (r[2] = _ * T + S * g + m * W + d * H),
      (r[6] = _ * w + S * D + m * k + d * nt),
      (r[10] = _ * L + S * N + m * q + d * rt),
      (r[14] = _ * M + S * V + m * J + d * bt),
      (r[3] = E * T + b * g + y * W + R * H),
      (r[7] = E * w + b * D + y * k + R * nt),
      (r[11] = E * L + b * N + y * q + R * rt),
      (r[15] = E * M + b * V + y * J + R * bt),
      this
    );
  }
  multiplyScalar(t) {
    const e = this.elements;
    return (
      (e[0] *= t),
      (e[4] *= t),
      (e[8] *= t),
      (e[12] *= t),
      (e[1] *= t),
      (e[5] *= t),
      (e[9] *= t),
      (e[13] *= t),
      (e[2] *= t),
      (e[6] *= t),
      (e[10] *= t),
      (e[14] *= t),
      (e[3] *= t),
      (e[7] *= t),
      (e[11] *= t),
      (e[15] *= t),
      this
    );
  }
  determinant() {
    const t = this.elements,
      e = t[0],
      n = t[4],
      s = t[8],
      r = t[12],
      a = t[1],
      o = t[5],
      l = t[9],
      c = t[13],
      u = t[2],
      h = t[6],
      f = t[10],
      p = t[14],
      _ = t[3],
      S = t[7],
      m = t[11],
      d = t[15];
    return (
      _ *
        (+r * l * h -
          s * c * h -
          r * o * f +
          n * c * f +
          s * o * p -
          n * l * p) +
      S *
        (+e * l * p -
          e * c * f +
          r * a * f -
          s * a * p +
          s * c * u -
          r * l * u) +
      m *
        (+e * c * h -
          e * o * p -
          r * a * h +
          n * a * p +
          r * o * u -
          n * c * u) +
      d *
        (-s * o * u - e * l * h + e * o * f + s * a * h - n * a * f + n * l * u)
    );
  }
  transpose() {
    const t = this.elements;
    let e;
    return (
      (e = t[1]),
      (t[1] = t[4]),
      (t[4] = e),
      (e = t[2]),
      (t[2] = t[8]),
      (t[8] = e),
      (e = t[6]),
      (t[6] = t[9]),
      (t[9] = e),
      (e = t[3]),
      (t[3] = t[12]),
      (t[12] = e),
      (e = t[7]),
      (t[7] = t[13]),
      (t[13] = e),
      (e = t[11]),
      (t[11] = t[14]),
      (t[14] = e),
      this
    );
  }
  setPosition(t, e, n) {
    const s = this.elements;
    return (
      t.isVector3
        ? ((s[12] = t.x), (s[13] = t.y), (s[14] = t.z))
        : ((s[12] = t), (s[13] = e), (s[14] = n)),
      this
    );
  }
  invert() {
    const t = this.elements,
      e = t[0],
      n = t[1],
      s = t[2],
      r = t[3],
      a = t[4],
      o = t[5],
      l = t[6],
      c = t[7],
      u = t[8],
      h = t[9],
      f = t[10],
      p = t[11],
      _ = t[12],
      S = t[13],
      m = t[14],
      d = t[15],
      E = h * m * c - S * f * c + S * l * p - o * m * p - h * l * d + o * f * d,
      b = _ * f * c - u * m * c - _ * l * p + a * m * p + u * l * d - a * f * d,
      y = u * S * c - _ * h * c + _ * o * p - a * S * p - u * o * d + a * h * d,
      R = _ * h * l - u * S * l - _ * o * f + a * S * f + u * o * m - a * h * m,
      T = e * E + n * b + s * y + r * R;
    if (T === 0)
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const w = 1 / T;
    return (
      (t[0] = E * w),
      (t[1] =
        (S * f * r -
          h * m * r -
          S * s * p +
          n * m * p +
          h * s * d -
          n * f * d) *
        w),
      (t[2] =
        (o * m * r -
          S * l * r +
          S * s * c -
          n * m * c -
          o * s * d +
          n * l * d) *
        w),
      (t[3] =
        (h * l * r -
          o * f * r -
          h * s * c +
          n * f * c +
          o * s * p -
          n * l * p) *
        w),
      (t[4] = b * w),
      (t[5] =
        (u * m * r -
          _ * f * r +
          _ * s * p -
          e * m * p -
          u * s * d +
          e * f * d) *
        w),
      (t[6] =
        (_ * l * r -
          a * m * r -
          _ * s * c +
          e * m * c +
          a * s * d -
          e * l * d) *
        w),
      (t[7] =
        (a * f * r -
          u * l * r +
          u * s * c -
          e * f * c -
          a * s * p +
          e * l * p) *
        w),
      (t[8] = y * w),
      (t[9] =
        (_ * h * r -
          u * S * r -
          _ * n * p +
          e * S * p +
          u * n * d -
          e * h * d) *
        w),
      (t[10] =
        (a * S * r -
          _ * o * r +
          _ * n * c -
          e * S * c -
          a * n * d +
          e * o * d) *
        w),
      (t[11] =
        (u * o * r -
          a * h * r -
          u * n * c +
          e * h * c +
          a * n * p -
          e * o * p) *
        w),
      (t[12] = R * w),
      (t[13] =
        (u * S * s -
          _ * h * s +
          _ * n * f -
          e * S * f -
          u * n * m +
          e * h * m) *
        w),
      (t[14] =
        (_ * o * s -
          a * S * s -
          _ * n * l +
          e * S * l +
          a * n * m -
          e * o * m) *
        w),
      (t[15] =
        (a * h * s -
          u * o * s +
          u * n * l -
          e * h * l -
          a * n * f +
          e * o * f) *
        w),
      this
    );
  }
  scale(t) {
    const e = this.elements,
      n = t.x,
      s = t.y,
      r = t.z;
    return (
      (e[0] *= n),
      (e[4] *= s),
      (e[8] *= r),
      (e[1] *= n),
      (e[5] *= s),
      (e[9] *= r),
      (e[2] *= n),
      (e[6] *= s),
      (e[10] *= r),
      (e[3] *= n),
      (e[7] *= s),
      (e[11] *= r),
      this
    );
  }
  getMaxScaleOnAxis() {
    const t = this.elements,
      e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2],
      n = t[4] * t[4] + t[5] * t[5] + t[6] * t[6],
      s = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
    return Math.sqrt(Math.max(e, n, s));
  }
  makeTranslation(t, e, n) {
    return (
      t.isVector3
        ? this.set(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1)
        : this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, n, 0, 0, 0, 1),
      this
    );
  }
  makeRotationX(t) {
    const e = Math.cos(t),
      n = Math.sin(t);
    return (this.set(1, 0, 0, 0, 0, e, -n, 0, 0, n, e, 0, 0, 0, 0, 1), this);
  }
  makeRotationY(t) {
    const e = Math.cos(t),
      n = Math.sin(t);
    return (this.set(e, 0, n, 0, 0, 1, 0, 0, -n, 0, e, 0, 0, 0, 0, 1), this);
  }
  makeRotationZ(t) {
    const e = Math.cos(t),
      n = Math.sin(t);
    return (this.set(e, -n, 0, 0, n, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this);
  }
  makeRotationAxis(t, e) {
    const n = Math.cos(e),
      s = Math.sin(e),
      r = 1 - n,
      a = t.x,
      o = t.y,
      l = t.z,
      c = r * a,
      u = r * o;
    return (
      this.set(
        c * a + n,
        c * o - s * l,
        c * l + s * o,
        0,
        c * o + s * l,
        u * o + n,
        u * l - s * a,
        0,
        c * l - s * o,
        u * l + s * a,
        r * l * l + n,
        0,
        0,
        0,
        0,
        1,
      ),
      this
    );
  }
  makeScale(t, e, n) {
    return (this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this);
  }
  makeShear(t, e, n, s, r, a) {
    return (this.set(1, n, r, 0, t, 1, a, 0, e, s, 1, 0, 0, 0, 0, 1), this);
  }
  compose(t, e, n) {
    const s = this.elements,
      r = e._x,
      a = e._y,
      o = e._z,
      l = e._w,
      c = r + r,
      u = a + a,
      h = o + o,
      f = r * c,
      p = r * u,
      _ = r * h,
      S = a * u,
      m = a * h,
      d = o * h,
      E = l * c,
      b = l * u,
      y = l * h,
      R = n.x,
      T = n.y,
      w = n.z;
    return (
      (s[0] = (1 - (S + d)) * R),
      (s[1] = (p + y) * R),
      (s[2] = (_ - b) * R),
      (s[3] = 0),
      (s[4] = (p - y) * T),
      (s[5] = (1 - (f + d)) * T),
      (s[6] = (m + E) * T),
      (s[7] = 0),
      (s[8] = (_ + b) * w),
      (s[9] = (m - E) * w),
      (s[10] = (1 - (f + S)) * w),
      (s[11] = 0),
      (s[12] = t.x),
      (s[13] = t.y),
      (s[14] = t.z),
      (s[15] = 1),
      this
    );
  }
  decompose(t, e, n) {
    const s = this.elements;
    let r = Qn.set(s[0], s[1], s[2]).length();
    const a = Qn.set(s[4], s[5], s[6]).length(),
      o = Qn.set(s[8], s[9], s[10]).length();
    (this.determinant() < 0 && (r = -r),
      (t.x = s[12]),
      (t.y = s[13]),
      (t.z = s[14]),
      Ye.copy(this));
    const c = 1 / r,
      u = 1 / a,
      h = 1 / o;
    return (
      (Ye.elements[0] *= c),
      (Ye.elements[1] *= c),
      (Ye.elements[2] *= c),
      (Ye.elements[4] *= u),
      (Ye.elements[5] *= u),
      (Ye.elements[6] *= u),
      (Ye.elements[8] *= h),
      (Ye.elements[9] *= h),
      (Ye.elements[10] *= h),
      e.setFromRotationMatrix(Ye),
      (n.x = r),
      (n.y = a),
      (n.z = o),
      this
    );
  }
  makePerspective(t, e, n, s, r, a, o = en, l = !1) {
    const c = this.elements,
      u = (2 * r) / (e - t),
      h = (2 * r) / (n - s),
      f = (e + t) / (e - t),
      p = (n + s) / (n - s);
    let _, S;
    if (l) ((_ = r / (a - r)), (S = (a * r) / (a - r)));
    else if (o === en) ((_ = -(a + r) / (a - r)), (S = (-2 * a * r) / (a - r)));
    else if (o === ms) ((_ = -a / (a - r)), (S = (-a * r) / (a - r)));
    else
      throw new Error(
        "THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o,
      );
    return (
      (c[0] = u),
      (c[4] = 0),
      (c[8] = f),
      (c[12] = 0),
      (c[1] = 0),
      (c[5] = h),
      (c[9] = p),
      (c[13] = 0),
      (c[2] = 0),
      (c[6] = 0),
      (c[10] = _),
      (c[14] = S),
      (c[3] = 0),
      (c[7] = 0),
      (c[11] = -1),
      (c[15] = 0),
      this
    );
  }
  makeOrthographic(t, e, n, s, r, a, o = en, l = !1) {
    const c = this.elements,
      u = 2 / (e - t),
      h = 2 / (n - s),
      f = -(e + t) / (e - t),
      p = -(n + s) / (n - s);
    let _, S;
    if (l) ((_ = 1 / (a - r)), (S = a / (a - r)));
    else if (o === en) ((_ = -2 / (a - r)), (S = -(a + r) / (a - r)));
    else if (o === ms) ((_ = -1 / (a - r)), (S = -r / (a - r)));
    else
      throw new Error(
        "THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o,
      );
    return (
      (c[0] = u),
      (c[4] = 0),
      (c[8] = 0),
      (c[12] = f),
      (c[1] = 0),
      (c[5] = h),
      (c[9] = 0),
      (c[13] = p),
      (c[2] = 0),
      (c[6] = 0),
      (c[10] = _),
      (c[14] = S),
      (c[3] = 0),
      (c[7] = 0),
      (c[11] = 0),
      (c[15] = 1),
      this
    );
  }
  equals(t) {
    const e = this.elements,
      n = t.elements;
    for (let s = 0; s < 16; s++) if (e[s] !== n[s]) return !1;
    return !0;
  }
  fromArray(t, e = 0) {
    for (let n = 0; n < 16; n++) this.elements[n] = t[n + e];
    return this;
  }
  toArray(t = [], e = 0) {
    const n = this.elements;
    return (
      (t[e] = n[0]),
      (t[e + 1] = n[1]),
      (t[e + 2] = n[2]),
      (t[e + 3] = n[3]),
      (t[e + 4] = n[4]),
      (t[e + 5] = n[5]),
      (t[e + 6] = n[6]),
      (t[e + 7] = n[7]),
      (t[e + 8] = n[8]),
      (t[e + 9] = n[9]),
      (t[e + 10] = n[10]),
      (t[e + 11] = n[11]),
      (t[e + 12] = n[12]),
      (t[e + 13] = n[13]),
      (t[e + 14] = n[14]),
      (t[e + 15] = n[15]),
      t
    );
  }
}
const Qn = new F(),
  Ye = new ue(),
  Bl = new F(0, 0, 0),
  zl = new F(1, 1, 1),
  Sn = new F(),
  qi = new F(),
  Ne = new F(),
  Ua = new ue(),
  Ia = new Wn();
class rn {
  constructor(t = 0, e = 0, n = 0, s = rn.DEFAULT_ORDER) {
    ((this.isEuler = !0),
      (this._x = t),
      (this._y = e),
      (this._z = n),
      (this._order = s));
  }
  get x() {
    return this._x;
  }
  set x(t) {
    ((this._x = t), this._onChangeCallback());
  }
  get y() {
    return this._y;
  }
  set y(t) {
    ((this._y = t), this._onChangeCallback());
  }
  get z() {
    return this._z;
  }
  set z(t) {
    ((this._z = t), this._onChangeCallback());
  }
  get order() {
    return this._order;
  }
  set order(t) {
    ((this._order = t), this._onChangeCallback());
  }
  set(t, e, n, s = this._order) {
    return (
      (this._x = t),
      (this._y = e),
      (this._z = n),
      (this._order = s),
      this._onChangeCallback(),
      this
    );
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(t) {
    return (
      (this._x = t._x),
      (this._y = t._y),
      (this._z = t._z),
      (this._order = t._order),
      this._onChangeCallback(),
      this
    );
  }
  setFromRotationMatrix(t, e = this._order, n = !0) {
    const s = t.elements,
      r = s[0],
      a = s[4],
      o = s[8],
      l = s[1],
      c = s[5],
      u = s[9],
      h = s[2],
      f = s[6],
      p = s[10];
    switch (e) {
      case "XYZ":
        ((this._y = Math.asin(Bt(o, -1, 1))),
          Math.abs(o) < 0.9999999
            ? ((this._x = Math.atan2(-u, p)), (this._z = Math.atan2(-a, r)))
            : ((this._x = Math.atan2(f, c)), (this._z = 0)));
        break;
      case "YXZ":
        ((this._x = Math.asin(-Bt(u, -1, 1))),
          Math.abs(u) < 0.9999999
            ? ((this._y = Math.atan2(o, p)), (this._z = Math.atan2(l, c)))
            : ((this._y = Math.atan2(-h, r)), (this._z = 0)));
        break;
      case "ZXY":
        ((this._x = Math.asin(Bt(f, -1, 1))),
          Math.abs(f) < 0.9999999
            ? ((this._y = Math.atan2(-h, p)), (this._z = Math.atan2(-a, c)))
            : ((this._y = 0), (this._z = Math.atan2(l, r))));
        break;
      case "ZYX":
        ((this._y = Math.asin(-Bt(h, -1, 1))),
          Math.abs(h) < 0.9999999
            ? ((this._x = Math.atan2(f, p)), (this._z = Math.atan2(l, r)))
            : ((this._x = 0), (this._z = Math.atan2(-a, c))));
        break;
      case "YZX":
        ((this._z = Math.asin(Bt(l, -1, 1))),
          Math.abs(l) < 0.9999999
            ? ((this._x = Math.atan2(-u, c)), (this._y = Math.atan2(-h, r)))
            : ((this._x = 0), (this._y = Math.atan2(o, p))));
        break;
      case "XZY":
        ((this._z = Math.asin(-Bt(a, -1, 1))),
          Math.abs(a) < 0.9999999
            ? ((this._x = Math.atan2(f, c)), (this._y = Math.atan2(o, r)))
            : ((this._x = Math.atan2(-u, p)), (this._y = 0)));
        break;
      default:
        Ut(
          "Euler: .setFromRotationMatrix() encountered an unknown order: " + e,
        );
    }
    return ((this._order = e), n === !0 && this._onChangeCallback(), this);
  }
  setFromQuaternion(t, e, n) {
    return (
      Ua.makeRotationFromQuaternion(t),
      this.setFromRotationMatrix(Ua, e, n)
    );
  }
  setFromVector3(t, e = this._order) {
    return this.set(t.x, t.y, t.z, e);
  }
  reorder(t) {
    return (Ia.setFromEuler(this), this.setFromQuaternion(Ia, t));
  }
  equals(t) {
    return (
      t._x === this._x &&
      t._y === this._y &&
      t._z === this._z &&
      t._order === this._order
    );
  }
  fromArray(t) {
    return (
      (this._x = t[0]),
      (this._y = t[1]),
      (this._z = t[2]),
      t[3] !== void 0 && (this._order = t[3]),
      this._onChangeCallback(),
      this
    );
  }
  toArray(t = [], e = 0) {
    return (
      (t[e] = this._x),
      (t[e + 1] = this._y),
      (t[e + 2] = this._z),
      (t[e + 3] = this._order),
      t
    );
  }
  _onChange(t) {
    return ((this._onChangeCallback = t), this);
  }
  _onChangeCallback() {}
  *[Symbol.iterator]() {
    (yield this._x, yield this._y, yield this._z, yield this._order);
  }
}
rn.DEFAULT_ORDER = "XYZ";
class Ho {
  constructor() {
    this.mask = 1;
  }
  set(t) {
    this.mask = ((1 << t) | 0) >>> 0;
  }
  enable(t) {
    this.mask |= (1 << t) | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(t) {
    this.mask ^= (1 << t) | 0;
  }
  disable(t) {
    this.mask &= ~((1 << t) | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(t) {
    return (this.mask & t.mask) !== 0;
  }
  isEnabled(t) {
    return (this.mask & ((1 << t) | 0)) !== 0;
  }
}
let Vl = 0;
const Na = new F(),
  ti = new Wn(),
  cn = new ue(),
  ji = new F(),
  wi = new F(),
  Gl = new F(),
  Hl = new Wn(),
  Fa = new F(1, 0, 0),
  Oa = new F(0, 1, 0),
  Ba = new F(0, 0, 1),
  za = { type: "added" },
  kl = { type: "removed" },
  ei = { type: "childadded", child: null },
  Fs = { type: "childremoved", child: null };
class _e extends Yn {
  constructor() {
    (super(),
      (this.isObject3D = !0),
      Object.defineProperty(this, "id", { value: Vl++ }),
      (this.uuid = Oi()),
      (this.name = ""),
      (this.type = "Object3D"),
      (this.parent = null),
      (this.children = []),
      (this.up = _e.DEFAULT_UP.clone()));
    const t = new F(),
      e = new rn(),
      n = new Wn(),
      s = new F(1, 1, 1);
    function r() {
      n.setFromEuler(e, !1);
    }
    function a() {
      e.setFromQuaternion(n, void 0, !1);
    }
    (e._onChange(r),
      n._onChange(a),
      Object.defineProperties(this, {
        position: { configurable: !0, enumerable: !0, value: t },
        rotation: { configurable: !0, enumerable: !0, value: e },
        quaternion: { configurable: !0, enumerable: !0, value: n },
        scale: { configurable: !0, enumerable: !0, value: s },
        modelViewMatrix: { value: new ue() },
        normalMatrix: { value: new Nt() },
      }),
      (this.matrix = new ue()),
      (this.matrixWorld = new ue()),
      (this.matrixAutoUpdate = _e.DEFAULT_MATRIX_AUTO_UPDATE),
      (this.matrixWorldAutoUpdate = _e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE),
      (this.matrixWorldNeedsUpdate = !1),
      (this.layers = new Ho()),
      (this.visible = !0),
      (this.castShadow = !1),
      (this.receiveShadow = !1),
      (this.frustumCulled = !0),
      (this.renderOrder = 0),
      (this.animations = []),
      (this.customDepthMaterial = void 0),
      (this.customDistanceMaterial = void 0),
      (this.userData = {}));
  }
  onBeforeShadow() {}
  onAfterShadow() {}
  onBeforeRender() {}
  onAfterRender() {}
  applyMatrix4(t) {
    (this.matrixAutoUpdate && this.updateMatrix(),
      this.matrix.premultiply(t),
      this.matrix.decompose(this.position, this.quaternion, this.scale));
  }
  applyQuaternion(t) {
    return (this.quaternion.premultiply(t), this);
  }
  setRotationFromAxisAngle(t, e) {
    this.quaternion.setFromAxisAngle(t, e);
  }
  setRotationFromEuler(t) {
    this.quaternion.setFromEuler(t, !0);
  }
  setRotationFromMatrix(t) {
    this.quaternion.setFromRotationMatrix(t);
  }
  setRotationFromQuaternion(t) {
    this.quaternion.copy(t);
  }
  rotateOnAxis(t, e) {
    return (ti.setFromAxisAngle(t, e), this.quaternion.multiply(ti), this);
  }
  rotateOnWorldAxis(t, e) {
    return (ti.setFromAxisAngle(t, e), this.quaternion.premultiply(ti), this);
  }
  rotateX(t) {
    return this.rotateOnAxis(Fa, t);
  }
  rotateY(t) {
    return this.rotateOnAxis(Oa, t);
  }
  rotateZ(t) {
    return this.rotateOnAxis(Ba, t);
  }
  translateOnAxis(t, e) {
    return (
      Na.copy(t).applyQuaternion(this.quaternion),
      this.position.add(Na.multiplyScalar(e)),
      this
    );
  }
  translateX(t) {
    return this.translateOnAxis(Fa, t);
  }
  translateY(t) {
    return this.translateOnAxis(Oa, t);
  }
  translateZ(t) {
    return this.translateOnAxis(Ba, t);
  }
  localToWorld(t) {
    return (this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld));
  }
  worldToLocal(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      t.applyMatrix4(cn.copy(this.matrixWorld).invert())
    );
  }
  lookAt(t, e, n) {
    t.isVector3 ? ji.copy(t) : ji.set(t, e, n);
    const s = this.parent;
    (this.updateWorldMatrix(!0, !1),
      wi.setFromMatrixPosition(this.matrixWorld),
      this.isCamera || this.isLight
        ? cn.lookAt(wi, ji, this.up)
        : cn.lookAt(ji, wi, this.up),
      this.quaternion.setFromRotationMatrix(cn),
      s &&
        (cn.extractRotation(s.matrixWorld),
        ti.setFromRotationMatrix(cn),
        this.quaternion.premultiply(ti.invert())));
  }
  add(t) {
    if (arguments.length > 1) {
      for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
      return this;
    }
    return t === this
      ? (he("Object3D.add: object can't be added as a child of itself.", t),
        this)
      : (t && t.isObject3D
          ? (t.removeFromParent(),
            (t.parent = this),
            this.children.push(t),
            t.dispatchEvent(za),
            (ei.child = t),
            this.dispatchEvent(ei),
            (ei.child = null))
          : he("Object3D.add: object not an instance of THREE.Object3D.", t),
        this);
  }
  remove(t) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
      return this;
    }
    const e = this.children.indexOf(t);
    return (
      e !== -1 &&
        ((t.parent = null),
        this.children.splice(e, 1),
        t.dispatchEvent(kl),
        (Fs.child = t),
        this.dispatchEvent(Fs),
        (Fs.child = null)),
      this
    );
  }
  removeFromParent() {
    const t = this.parent;
    return (t !== null && t.remove(this), this);
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      cn.copy(this.matrixWorld).invert(),
      t.parent !== null &&
        (t.parent.updateWorldMatrix(!0, !1), cn.multiply(t.parent.matrixWorld)),
      t.applyMatrix4(cn),
      t.removeFromParent(),
      (t.parent = this),
      this.children.push(t),
      t.updateWorldMatrix(!1, !0),
      t.dispatchEvent(za),
      (ei.child = t),
      this.dispatchEvent(ei),
      (ei.child = null),
      this
    );
  }
  getObjectById(t) {
    return this.getObjectByProperty("id", t);
  }
  getObjectByName(t) {
    return this.getObjectByProperty("name", t);
  }
  getObjectByProperty(t, e) {
    if (this[t] === e) return this;
    for (let n = 0, s = this.children.length; n < s; n++) {
      const a = this.children[n].getObjectByProperty(t, e);
      if (a !== void 0) return a;
    }
  }
  getObjectsByProperty(t, e, n = []) {
    this[t] === e && n.push(this);
    const s = this.children;
    for (let r = 0, a = s.length; r < a; r++)
      s[r].getObjectsByProperty(t, e, n);
    return n;
  }
  getWorldPosition(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      t.setFromMatrixPosition(this.matrixWorld)
    );
  }
  getWorldQuaternion(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      this.matrixWorld.decompose(wi, t, Gl),
      t
    );
  }
  getWorldScale(t) {
    return (
      this.updateWorldMatrix(!0, !1),
      this.matrixWorld.decompose(wi, Hl, t),
      t
    );
  }
  getWorldDirection(t) {
    this.updateWorldMatrix(!0, !1);
    const e = this.matrixWorld.elements;
    return t.set(e[8], e[9], e[10]).normalize();
  }
  raycast() {}
  traverse(t) {
    t(this);
    const e = this.children;
    for (let n = 0, s = e.length; n < s; n++) e[n].traverse(t);
  }
  traverseVisible(t) {
    if (this.visible === !1) return;
    t(this);
    const e = this.children;
    for (let n = 0, s = e.length; n < s; n++) e[n].traverseVisible(t);
  }
  traverseAncestors(t) {
    const e = this.parent;
    e !== null && (t(e), e.traverseAncestors(t));
  }
  updateMatrix() {
    (this.matrix.compose(this.position, this.quaternion, this.scale),
      (this.matrixWorldNeedsUpdate = !0));
  }
  updateMatrixWorld(t) {
    (this.matrixAutoUpdate && this.updateMatrix(),
      (this.matrixWorldNeedsUpdate || t) &&
        (this.matrixWorldAutoUpdate === !0 &&
          (this.parent === null
            ? this.matrixWorld.copy(this.matrix)
            : this.matrixWorld.multiplyMatrices(
                this.parent.matrixWorld,
                this.matrix,
              )),
        (this.matrixWorldNeedsUpdate = !1),
        (t = !0)));
    const e = this.children;
    for (let n = 0, s = e.length; n < s; n++) e[n].updateMatrixWorld(t);
  }
  updateWorldMatrix(t, e) {
    const n = this.parent;
    if (
      (t === !0 && n !== null && n.updateWorldMatrix(!0, !1),
      this.matrixAutoUpdate && this.updateMatrix(),
      this.matrixWorldAutoUpdate === !0 &&
        (this.parent === null
          ? this.matrixWorld.copy(this.matrix)
          : this.matrixWorld.multiplyMatrices(
              this.parent.matrixWorld,
              this.matrix,
            )),
      e === !0)
    ) {
      const s = this.children;
      for (let r = 0, a = s.length; r < a; r++) s[r].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string",
      n = {};
    e &&
      ((t = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
        nodes: {},
      }),
      (n.metadata = {
        version: 4.7,
        type: "Object",
        generator: "Object3D.toJSON",
      }));
    const s = {};
    ((s.uuid = this.uuid),
      (s.type = this.type),
      this.name !== "" && (s.name = this.name),
      this.castShadow === !0 && (s.castShadow = !0),
      this.receiveShadow === !0 && (s.receiveShadow = !0),
      this.visible === !1 && (s.visible = !1),
      this.frustumCulled === !1 && (s.frustumCulled = !1),
      this.renderOrder !== 0 && (s.renderOrder = this.renderOrder),
      Object.keys(this.userData).length > 0 && (s.userData = this.userData),
      (s.layers = this.layers.mask),
      (s.matrix = this.matrix.toArray()),
      (s.up = this.up.toArray()),
      this.matrixAutoUpdate === !1 && (s.matrixAutoUpdate = !1),
      this.isInstancedMesh &&
        ((s.type = "InstancedMesh"),
        (s.count = this.count),
        (s.instanceMatrix = this.instanceMatrix.toJSON()),
        this.instanceColor !== null &&
          (s.instanceColor = this.instanceColor.toJSON())),
      this.isBatchedMesh &&
        ((s.type = "BatchedMesh"),
        (s.perObjectFrustumCulled = this.perObjectFrustumCulled),
        (s.sortObjects = this.sortObjects),
        (s.drawRanges = this._drawRanges),
        (s.reservedRanges = this._reservedRanges),
        (s.geometryInfo = this._geometryInfo.map((o) => ({
          ...o,
          boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0,
          boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0,
        }))),
        (s.instanceInfo = this._instanceInfo.map((o) => ({ ...o }))),
        (s.availableInstanceIds = this._availableInstanceIds.slice()),
        (s.availableGeometryIds = this._availableGeometryIds.slice()),
        (s.nextIndexStart = this._nextIndexStart),
        (s.nextVertexStart = this._nextVertexStart),
        (s.geometryCount = this._geometryCount),
        (s.maxInstanceCount = this._maxInstanceCount),
        (s.maxVertexCount = this._maxVertexCount),
        (s.maxIndexCount = this._maxIndexCount),
        (s.geometryInitialized = this._geometryInitialized),
        (s.matricesTexture = this._matricesTexture.toJSON(t)),
        (s.indirectTexture = this._indirectTexture.toJSON(t)),
        this._colorsTexture !== null &&
          (s.colorsTexture = this._colorsTexture.toJSON(t)),
        this.boundingSphere !== null &&
          (s.boundingSphere = this.boundingSphere.toJSON()),
        this.boundingBox !== null &&
          (s.boundingBox = this.boundingBox.toJSON())));
    function r(o, l) {
      return (o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(t)), l.uuid);
    }
    if (this.isScene)
      (this.background &&
        (this.background.isColor
          ? (s.background = this.background.toJSON())
          : this.background.isTexture &&
            (s.background = this.background.toJSON(t).uuid)),
        this.environment &&
          this.environment.isTexture &&
          this.environment.isRenderTargetTexture !== !0 &&
          (s.environment = this.environment.toJSON(t).uuid));
    else if (this.isMesh || this.isLine || this.isPoints) {
      s.geometry = r(t.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l))
          for (let c = 0, u = l.length; c < u; c++) {
            const h = l[c];
            r(t.shapes, h);
          }
        else r(t.shapes, l);
      }
    }
    if (
      (this.isSkinnedMesh &&
        ((s.bindMode = this.bindMode),
        (s.bindMatrix = this.bindMatrix.toArray()),
        this.skeleton !== void 0 &&
          (r(t.skeletons, this.skeleton), (s.skeleton = this.skeleton.uuid))),
      this.material !== void 0)
    )
      if (Array.isArray(this.material)) {
        const o = [];
        for (let l = 0, c = this.material.length; l < c; l++)
          o.push(r(t.materials, this.material[l]));
        s.material = o;
      } else s.material = r(t.materials, this.material);
    if (this.children.length > 0) {
      s.children = [];
      for (let o = 0; o < this.children.length; o++)
        s.children.push(this.children[o].toJSON(t).object);
    }
    if (this.animations.length > 0) {
      s.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        s.animations.push(r(t.animations, l));
      }
    }
    if (e) {
      const o = a(t.geometries),
        l = a(t.materials),
        c = a(t.textures),
        u = a(t.images),
        h = a(t.shapes),
        f = a(t.skeletons),
        p = a(t.animations),
        _ = a(t.nodes);
      (o.length > 0 && (n.geometries = o),
        l.length > 0 && (n.materials = l),
        c.length > 0 && (n.textures = c),
        u.length > 0 && (n.images = u),
        h.length > 0 && (n.shapes = h),
        f.length > 0 && (n.skeletons = f),
        p.length > 0 && (n.animations = p),
        _.length > 0 && (n.nodes = _));
    }
    return ((n.object = s), n);
    function a(o) {
      const l = [];
      for (const c in o) {
        const u = o[c];
        (delete u.metadata, l.push(u));
      }
      return l;
    }
  }
  clone(t) {
    return new this.constructor().copy(this, t);
  }
  copy(t, e = !0) {
    if (
      ((this.name = t.name),
      this.up.copy(t.up),
      this.position.copy(t.position),
      (this.rotation.order = t.rotation.order),
      this.quaternion.copy(t.quaternion),
      this.scale.copy(t.scale),
      this.matrix.copy(t.matrix),
      this.matrixWorld.copy(t.matrixWorld),
      (this.matrixAutoUpdate = t.matrixAutoUpdate),
      (this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate),
      (this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate),
      (this.layers.mask = t.layers.mask),
      (this.visible = t.visible),
      (this.castShadow = t.castShadow),
      (this.receiveShadow = t.receiveShadow),
      (this.frustumCulled = t.frustumCulled),
      (this.renderOrder = t.renderOrder),
      (this.animations = t.animations.slice()),
      (this.userData = JSON.parse(JSON.stringify(t.userData))),
      e === !0)
    )
      for (let n = 0; n < t.children.length; n++) {
        const s = t.children[n];
        this.add(s.clone());
      }
    return this;
  }
}
_e.DEFAULT_UP = new F(0, 1, 0);
_e.DEFAULT_MATRIX_AUTO_UPDATE = !0;
_e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const qe = new F(),
  ln = new F(),
  Os = new F(),
  hn = new F(),
  ni = new F(),
  ii = new F(),
  Va = new F(),
  Bs = new F(),
  zs = new F(),
  Vs = new F(),
  Gs = new le(),
  Hs = new le(),
  ks = new le();
class je {
  constructor(t = new F(), e = new F(), n = new F()) {
    ((this.a = t), (this.b = e), (this.c = n));
  }
  static getNormal(t, e, n, s) {
    (s.subVectors(n, e), qe.subVectors(t, e), s.cross(qe));
    const r = s.lengthSq();
    return r > 0 ? s.multiplyScalar(1 / Math.sqrt(r)) : s.set(0, 0, 0);
  }
  static getBarycoord(t, e, n, s, r) {
    (qe.subVectors(s, e), ln.subVectors(n, e), Os.subVectors(t, e));
    const a = qe.dot(qe),
      o = qe.dot(ln),
      l = qe.dot(Os),
      c = ln.dot(ln),
      u = ln.dot(Os),
      h = a * c - o * o;
    if (h === 0) return (r.set(0, 0, 0), null);
    const f = 1 / h,
      p = (c * l - o * u) * f,
      _ = (a * u - o * l) * f;
    return r.set(1 - p - _, _, p);
  }
  static containsPoint(t, e, n, s) {
    return this.getBarycoord(t, e, n, s, hn) === null
      ? !1
      : hn.x >= 0 && hn.y >= 0 && hn.x + hn.y <= 1;
  }
  static getInterpolation(t, e, n, s, r, a, o, l) {
    return this.getBarycoord(t, e, n, s, hn) === null
      ? ((l.x = 0),
        (l.y = 0),
        "z" in l && (l.z = 0),
        "w" in l && (l.w = 0),
        null)
      : (l.setScalar(0),
        l.addScaledVector(r, hn.x),
        l.addScaledVector(a, hn.y),
        l.addScaledVector(o, hn.z),
        l);
  }
  static getInterpolatedAttribute(t, e, n, s, r, a) {
    return (
      Gs.setScalar(0),
      Hs.setScalar(0),
      ks.setScalar(0),
      Gs.fromBufferAttribute(t, e),
      Hs.fromBufferAttribute(t, n),
      ks.fromBufferAttribute(t, s),
      a.setScalar(0),
      a.addScaledVector(Gs, r.x),
      a.addScaledVector(Hs, r.y),
      a.addScaledVector(ks, r.z),
      a
    );
  }
  static isFrontFacing(t, e, n, s) {
    return (qe.subVectors(n, e), ln.subVectors(t, e), qe.cross(ln).dot(s) < 0);
  }
  set(t, e, n) {
    return (this.a.copy(t), this.b.copy(e), this.c.copy(n), this);
  }
  setFromPointsAndIndices(t, e, n, s) {
    return (this.a.copy(t[e]), this.b.copy(t[n]), this.c.copy(t[s]), this);
  }
  setFromAttributeAndIndices(t, e, n, s) {
    return (
      this.a.fromBufferAttribute(t, e),
      this.b.fromBufferAttribute(t, n),
      this.c.fromBufferAttribute(t, s),
      this
    );
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return (this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this);
  }
  getArea() {
    return (
      qe.subVectors(this.c, this.b),
      ln.subVectors(this.a, this.b),
      qe.cross(ln).length() * 0.5
    );
  }
  getMidpoint(t) {
    return t
      .addVectors(this.a, this.b)
      .add(this.c)
      .multiplyScalar(1 / 3);
  }
  getNormal(t) {
    return je.getNormal(this.a, this.b, this.c, t);
  }
  getPlane(t) {
    return t.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(t, e) {
    return je.getBarycoord(t, this.a, this.b, this.c, e);
  }
  getInterpolation(t, e, n, s, r) {
    return je.getInterpolation(t, this.a, this.b, this.c, e, n, s, r);
  }
  containsPoint(t) {
    return je.containsPoint(t, this.a, this.b, this.c);
  }
  isFrontFacing(t) {
    return je.isFrontFacing(this.a, this.b, this.c, t);
  }
  intersectsBox(t) {
    return t.intersectsTriangle(this);
  }
  closestPointToPoint(t, e) {
    const n = this.a,
      s = this.b,
      r = this.c;
    let a, o;
    (ni.subVectors(s, n), ii.subVectors(r, n), Bs.subVectors(t, n));
    const l = ni.dot(Bs),
      c = ii.dot(Bs);
    if (l <= 0 && c <= 0) return e.copy(n);
    zs.subVectors(t, s);
    const u = ni.dot(zs),
      h = ii.dot(zs);
    if (u >= 0 && h <= u) return e.copy(s);
    const f = l * h - u * c;
    if (f <= 0 && l >= 0 && u <= 0)
      return ((a = l / (l - u)), e.copy(n).addScaledVector(ni, a));
    Vs.subVectors(t, r);
    const p = ni.dot(Vs),
      _ = ii.dot(Vs);
    if (_ >= 0 && p <= _) return e.copy(r);
    const S = p * c - l * _;
    if (S <= 0 && c >= 0 && _ <= 0)
      return ((o = c / (c - _)), e.copy(n).addScaledVector(ii, o));
    const m = u * _ - p * h;
    if (m <= 0 && h - u >= 0 && p - _ >= 0)
      return (
        Va.subVectors(r, s),
        (o = (h - u) / (h - u + (p - _))),
        e.copy(s).addScaledVector(Va, o)
      );
    const d = 1 / (m + S + f);
    return (
      (a = S * d),
      (o = f * d),
      e.copy(n).addScaledVector(ni, a).addScaledVector(ii, o)
    );
  }
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
}
const ko = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074,
  },
  bn = { h: 0, s: 0, l: 0 },
  Ki = { h: 0, s: 0, l: 0 };
function Ws(i, t, e) {
  return (
    e < 0 && (e += 1),
    e > 1 && (e -= 1),
    e < 1 / 6
      ? i + (t - i) * 6 * e
      : e < 1 / 2
        ? t
        : e < 2 / 3
          ? i + (t - i) * 6 * (2 / 3 - e)
          : i
  );
}
class Yt {
  constructor(t, e, n) {
    return (
      (this.isColor = !0),
      (this.r = 1),
      (this.g = 1),
      (this.b = 1),
      this.set(t, e, n)
    );
  }
  set(t, e, n) {
    if (e === void 0 && n === void 0) {
      const s = t;
      s && s.isColor
        ? this.copy(s)
        : typeof s == "number"
          ? this.setHex(s)
          : typeof s == "string" && this.setStyle(s);
    } else this.setRGB(t, e, n);
    return this;
  }
  setScalar(t) {
    return ((this.r = t), (this.g = t), (this.b = t), this);
  }
  setHex(t, e = Be) {
    return (
      (t = Math.floor(t)),
      (this.r = ((t >> 16) & 255) / 255),
      (this.g = ((t >> 8) & 255) / 255),
      (this.b = (t & 255) / 255),
      Xt.colorSpaceToWorking(this, e),
      this
    );
  }
  setRGB(t, e, n, s = Xt.workingColorSpace) {
    return (
      (this.r = t),
      (this.g = e),
      (this.b = n),
      Xt.colorSpaceToWorking(this, s),
      this
    );
  }
  setHSL(t, e, n, s = Xt.workingColorSpace) {
    if (((t = Cl(t, 1)), (e = Bt(e, 0, 1)), (n = Bt(n, 0, 1)), e === 0))
      this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + e) : n + e - n * e,
        a = 2 * n - r;
      ((this.r = Ws(a, r, t + 1 / 3)),
        (this.g = Ws(a, r, t)),
        (this.b = Ws(a, r, t - 1 / 3)));
    }
    return (Xt.colorSpaceToWorking(this, s), this);
  }
  setStyle(t, e = Be) {
    function n(r) {
      r !== void 0 &&
        parseFloat(r) < 1 &&
        Ut("Color: Alpha component of " + t + " will be ignored.");
    }
    let s;
    if ((s = /^(\w+)\(([^\)]*)\)/.exec(t))) {
      let r;
      const a = s[1],
        o = s[2];
      switch (a) {
        case "rgb":
        case "rgba":
          if (
            (r =
              /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                o,
              ))
          )
            return (
              n(r[4]),
              this.setRGB(
                Math.min(255, parseInt(r[1], 10)) / 255,
                Math.min(255, parseInt(r[2], 10)) / 255,
                Math.min(255, parseInt(r[3], 10)) / 255,
                e,
              )
            );
          if (
            (r =
              /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                o,
              ))
          )
            return (
              n(r[4]),
              this.setRGB(
                Math.min(100, parseInt(r[1], 10)) / 100,
                Math.min(100, parseInt(r[2], 10)) / 100,
                Math.min(100, parseInt(r[3], 10)) / 100,
                e,
              )
            );
          break;
        case "hsl":
        case "hsla":
          if (
            (r =
              /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                o,
              ))
          )
            return (
              n(r[4]),
              this.setHSL(
                parseFloat(r[1]) / 360,
                parseFloat(r[2]) / 100,
                parseFloat(r[3]) / 100,
                e,
              )
            );
          break;
        default:
          Ut("Color: Unknown color model " + t);
      }
    } else if ((s = /^\#([A-Fa-f\d]+)$/.exec(t))) {
      const r = s[1],
        a = r.length;
      if (a === 3)
        return this.setRGB(
          parseInt(r.charAt(0), 16) / 15,
          parseInt(r.charAt(1), 16) / 15,
          parseInt(r.charAt(2), 16) / 15,
          e,
        );
      if (a === 6) return this.setHex(parseInt(r, 16), e);
      Ut("Color: Invalid hex color " + t);
    } else if (t && t.length > 0) return this.setColorName(t, e);
    return this;
  }
  setColorName(t, e = Be) {
    const n = ko[t.toLowerCase()];
    return (
      n !== void 0 ? this.setHex(n, e) : Ut("Color: Unknown color " + t),
      this
    );
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(t) {
    return ((this.r = t.r), (this.g = t.g), (this.b = t.b), this);
  }
  copySRGBToLinear(t) {
    return ((this.r = xn(t.r)), (this.g = xn(t.g)), (this.b = xn(t.b)), this);
  }
  copyLinearToSRGB(t) {
    return ((this.r = ui(t.r)), (this.g = ui(t.g)), (this.b = ui(t.b)), this);
  }
  convertSRGBToLinear() {
    return (this.copySRGBToLinear(this), this);
  }
  convertLinearToSRGB() {
    return (this.copyLinearToSRGB(this), this);
  }
  getHex(t = Be) {
    return (
      Xt.workingToColorSpace(Se.copy(this), t),
      Math.round(Bt(Se.r * 255, 0, 255)) * 65536 +
        Math.round(Bt(Se.g * 255, 0, 255)) * 256 +
        Math.round(Bt(Se.b * 255, 0, 255))
    );
  }
  getHexString(t = Be) {
    return ("000000" + this.getHex(t).toString(16)).slice(-6);
  }
  getHSL(t, e = Xt.workingColorSpace) {
    Xt.workingToColorSpace(Se.copy(this), e);
    const n = Se.r,
      s = Se.g,
      r = Se.b,
      a = Math.max(n, s, r),
      o = Math.min(n, s, r);
    let l, c;
    const u = (o + a) / 2;
    if (o === a) ((l = 0), (c = 0));
    else {
      const h = a - o;
      switch (((c = u <= 0.5 ? h / (a + o) : h / (2 - a - o)), a)) {
        case n:
          l = (s - r) / h + (s < r ? 6 : 0);
          break;
        case s:
          l = (r - n) / h + 2;
          break;
        case r:
          l = (n - s) / h + 4;
          break;
      }
      l /= 6;
    }
    return ((t.h = l), (t.s = c), (t.l = u), t);
  }
  getRGB(t, e = Xt.workingColorSpace) {
    return (
      Xt.workingToColorSpace(Se.copy(this), e),
      (t.r = Se.r),
      (t.g = Se.g),
      (t.b = Se.b),
      t
    );
  }
  getStyle(t = Be) {
    Xt.workingToColorSpace(Se.copy(this), t);
    const e = Se.r,
      n = Se.g,
      s = Se.b;
    return t !== Be
      ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`
      : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(s * 255)})`;
  }
  offsetHSL(t, e, n) {
    return (this.getHSL(bn), this.setHSL(bn.h + t, bn.s + e, bn.l + n));
  }
  add(t) {
    return ((this.r += t.r), (this.g += t.g), (this.b += t.b), this);
  }
  addColors(t, e) {
    return (
      (this.r = t.r + e.r),
      (this.g = t.g + e.g),
      (this.b = t.b + e.b),
      this
    );
  }
  addScalar(t) {
    return ((this.r += t), (this.g += t), (this.b += t), this);
  }
  sub(t) {
    return (
      (this.r = Math.max(0, this.r - t.r)),
      (this.g = Math.max(0, this.g - t.g)),
      (this.b = Math.max(0, this.b - t.b)),
      this
    );
  }
  multiply(t) {
    return ((this.r *= t.r), (this.g *= t.g), (this.b *= t.b), this);
  }
  multiplyScalar(t) {
    return ((this.r *= t), (this.g *= t), (this.b *= t), this);
  }
  lerp(t, e) {
    return (
      (this.r += (t.r - this.r) * e),
      (this.g += (t.g - this.g) * e),
      (this.b += (t.b - this.b) * e),
      this
    );
  }
  lerpColors(t, e, n) {
    return (
      (this.r = t.r + (e.r - t.r) * n),
      (this.g = t.g + (e.g - t.g) * n),
      (this.b = t.b + (e.b - t.b) * n),
      this
    );
  }
  lerpHSL(t, e) {
    (this.getHSL(bn), t.getHSL(Ki));
    const n = As(bn.h, Ki.h, e),
      s = As(bn.s, Ki.s, e),
      r = As(bn.l, Ki.l, e);
    return (this.setHSL(n, s, r), this);
  }
  setFromVector3(t) {
    return ((this.r = t.x), (this.g = t.y), (this.b = t.z), this);
  }
  applyMatrix3(t) {
    const e = this.r,
      n = this.g,
      s = this.b,
      r = t.elements;
    return (
      (this.r = r[0] * e + r[3] * n + r[6] * s),
      (this.g = r[1] * e + r[4] * n + r[7] * s),
      (this.b = r[2] * e + r[5] * n + r[8] * s),
      this
    );
  }
  equals(t) {
    return t.r === this.r && t.g === this.g && t.b === this.b;
  }
  fromArray(t, e = 0) {
    return ((this.r = t[e]), (this.g = t[e + 1]), (this.b = t[e + 2]), this);
  }
  toArray(t = [], e = 0) {
    return ((t[e] = this.r), (t[e + 1] = this.g), (t[e + 2] = this.b), t);
  }
  fromBufferAttribute(t, e) {
    return (
      (this.r = t.getX(e)),
      (this.g = t.getY(e)),
      (this.b = t.getZ(e)),
      this
    );
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    (yield this.r, yield this.g, yield this.b);
  }
}
const Se = new Yt();
Yt.NAMES = ko;
let Wl = 0;
class Bi extends Yn {
  constructor() {
    (super(),
      (this.isMaterial = !0),
      Object.defineProperty(this, "id", { value: Wl++ }),
      (this.uuid = Oi()),
      (this.name = ""),
      (this.type = "Material"),
      (this.blending = hi),
      (this.side = Pn),
      (this.vertexColors = !1),
      (this.opacity = 1),
      (this.transparent = !1),
      (this.alphaHash = !1),
      (this.blendSrc = sr),
      (this.blendDst = rr),
      (this.blendEquation = Vn),
      (this.blendSrcAlpha = null),
      (this.blendDstAlpha = null),
      (this.blendEquationAlpha = null),
      (this.blendColor = new Yt(0, 0, 0)),
      (this.blendAlpha = 0),
      (this.depthFunc = di),
      (this.depthTest = !0),
      (this.depthWrite = !0),
      (this.stencilWriteMask = 255),
      (this.stencilFunc = Ta),
      (this.stencilRef = 0),
      (this.stencilFuncMask = 255),
      (this.stencilFail = jn),
      (this.stencilZFail = jn),
      (this.stencilZPass = jn),
      (this.stencilWrite = !1),
      (this.clippingPlanes = null),
      (this.clipIntersection = !1),
      (this.clipShadows = !1),
      (this.shadowSide = null),
      (this.colorWrite = !0),
      (this.precision = null),
      (this.polygonOffset = !1),
      (this.polygonOffsetFactor = 0),
      (this.polygonOffsetUnits = 0),
      (this.dithering = !1),
      (this.alphaToCoverage = !1),
      (this.premultipliedAlpha = !1),
      (this.forceSinglePass = !1),
      (this.allowOverride = !0),
      (this.visible = !0),
      (this.toneMapped = !0),
      (this.userData = {}),
      (this.version = 0),
      (this._alphaTest = 0));
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(t) {
    (this._alphaTest > 0 != t > 0 && this.version++, (this._alphaTest = t));
  }
  onBeforeRender() {}
  onBeforeCompile() {}
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(t) {
    if (t !== void 0)
      for (const e in t) {
        const n = t[e];
        if (n === void 0) {
          Ut(`Material: parameter '${e}' has value of undefined.`);
          continue;
        }
        const s = this[e];
        if (s === void 0) {
          Ut(`Material: '${e}' is not a property of THREE.${this.type}.`);
          continue;
        }
        s && s.isColor
          ? s.set(n)
          : s && s.isVector3 && n && n.isVector3
            ? s.copy(n)
            : (this[e] = n);
      }
  }
  toJSON(t) {
    const e = t === void 0 || typeof t == "string";
    e && (t = { textures: {}, images: {} });
    const n = {
      metadata: {
        version: 4.7,
        type: "Material",
        generator: "Material.toJSON",
      },
    };
    ((n.uuid = this.uuid),
      (n.type = this.type),
      this.name !== "" && (n.name = this.name),
      this.color && this.color.isColor && (n.color = this.color.getHex()),
      this.roughness !== void 0 && (n.roughness = this.roughness),
      this.metalness !== void 0 && (n.metalness = this.metalness),
      this.sheen !== void 0 && (n.sheen = this.sheen),
      this.sheenColor &&
        this.sheenColor.isColor &&
        (n.sheenColor = this.sheenColor.getHex()),
      this.sheenRoughness !== void 0 &&
        (n.sheenRoughness = this.sheenRoughness),
      this.emissive &&
        this.emissive.isColor &&
        (n.emissive = this.emissive.getHex()),
      this.emissiveIntensity !== void 0 &&
        this.emissiveIntensity !== 1 &&
        (n.emissiveIntensity = this.emissiveIntensity),
      this.specular &&
        this.specular.isColor &&
        (n.specular = this.specular.getHex()),
      this.specularIntensity !== void 0 &&
        (n.specularIntensity = this.specularIntensity),
      this.specularColor &&
        this.specularColor.isColor &&
        (n.specularColor = this.specularColor.getHex()),
      this.shininess !== void 0 && (n.shininess = this.shininess),
      this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat),
      this.clearcoatRoughness !== void 0 &&
        (n.clearcoatRoughness = this.clearcoatRoughness),
      this.clearcoatMap &&
        this.clearcoatMap.isTexture &&
        (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid),
      this.clearcoatRoughnessMap &&
        this.clearcoatRoughnessMap.isTexture &&
        (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid),
      this.clearcoatNormalMap &&
        this.clearcoatNormalMap.isTexture &&
        ((n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid),
        (n.clearcoatNormalScale = this.clearcoatNormalScale.toArray())),
      this.sheenColorMap &&
        this.sheenColorMap.isTexture &&
        (n.sheenColorMap = this.sheenColorMap.toJSON(t).uuid),
      this.sheenRoughnessMap &&
        this.sheenRoughnessMap.isTexture &&
        (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(t).uuid),
      this.dispersion !== void 0 && (n.dispersion = this.dispersion),
      this.iridescence !== void 0 && (n.iridescence = this.iridescence),
      this.iridescenceIOR !== void 0 &&
        (n.iridescenceIOR = this.iridescenceIOR),
      this.iridescenceThicknessRange !== void 0 &&
        (n.iridescenceThicknessRange = this.iridescenceThicknessRange),
      this.iridescenceMap &&
        this.iridescenceMap.isTexture &&
        (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid),
      this.iridescenceThicknessMap &&
        this.iridescenceThicknessMap.isTexture &&
        (n.iridescenceThicknessMap =
          this.iridescenceThicknessMap.toJSON(t).uuid),
      this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy),
      this.anisotropyRotation !== void 0 &&
        (n.anisotropyRotation = this.anisotropyRotation),
      this.anisotropyMap &&
        this.anisotropyMap.isTexture &&
        (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid),
      this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid),
      this.matcap &&
        this.matcap.isTexture &&
        (n.matcap = this.matcap.toJSON(t).uuid),
      this.alphaMap &&
        this.alphaMap.isTexture &&
        (n.alphaMap = this.alphaMap.toJSON(t).uuid),
      this.lightMap &&
        this.lightMap.isTexture &&
        ((n.lightMap = this.lightMap.toJSON(t).uuid),
        (n.lightMapIntensity = this.lightMapIntensity)),
      this.aoMap &&
        this.aoMap.isTexture &&
        ((n.aoMap = this.aoMap.toJSON(t).uuid),
        (n.aoMapIntensity = this.aoMapIntensity)),
      this.bumpMap &&
        this.bumpMap.isTexture &&
        ((n.bumpMap = this.bumpMap.toJSON(t).uuid),
        (n.bumpScale = this.bumpScale)),
      this.normalMap &&
        this.normalMap.isTexture &&
        ((n.normalMap = this.normalMap.toJSON(t).uuid),
        (n.normalMapType = this.normalMapType),
        (n.normalScale = this.normalScale.toArray())),
      this.displacementMap &&
        this.displacementMap.isTexture &&
        ((n.displacementMap = this.displacementMap.toJSON(t).uuid),
        (n.displacementScale = this.displacementScale),
        (n.displacementBias = this.displacementBias)),
      this.roughnessMap &&
        this.roughnessMap.isTexture &&
        (n.roughnessMap = this.roughnessMap.toJSON(t).uuid),
      this.metalnessMap &&
        this.metalnessMap.isTexture &&
        (n.metalnessMap = this.metalnessMap.toJSON(t).uuid),
      this.emissiveMap &&
        this.emissiveMap.isTexture &&
        (n.emissiveMap = this.emissiveMap.toJSON(t).uuid),
      this.specularMap &&
        this.specularMap.isTexture &&
        (n.specularMap = this.specularMap.toJSON(t).uuid),
      this.specularIntensityMap &&
        this.specularIntensityMap.isTexture &&
        (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid),
      this.specularColorMap &&
        this.specularColorMap.isTexture &&
        (n.specularColorMap = this.specularColorMap.toJSON(t).uuid),
      this.envMap &&
        this.envMap.isTexture &&
        ((n.envMap = this.envMap.toJSON(t).uuid),
        this.combine !== void 0 && (n.combine = this.combine)),
      this.envMapRotation !== void 0 &&
        (n.envMapRotation = this.envMapRotation.toArray()),
      this.envMapIntensity !== void 0 &&
        (n.envMapIntensity = this.envMapIntensity),
      this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity),
      this.refractionRatio !== void 0 &&
        (n.refractionRatio = this.refractionRatio),
      this.gradientMap &&
        this.gradientMap.isTexture &&
        (n.gradientMap = this.gradientMap.toJSON(t).uuid),
      this.transmission !== void 0 && (n.transmission = this.transmission),
      this.transmissionMap &&
        this.transmissionMap.isTexture &&
        (n.transmissionMap = this.transmissionMap.toJSON(t).uuid),
      this.thickness !== void 0 && (n.thickness = this.thickness),
      this.thicknessMap &&
        this.thicknessMap.isTexture &&
        (n.thicknessMap = this.thicknessMap.toJSON(t).uuid),
      this.attenuationDistance !== void 0 &&
        this.attenuationDistance !== 1 / 0 &&
        (n.attenuationDistance = this.attenuationDistance),
      this.attenuationColor !== void 0 &&
        (n.attenuationColor = this.attenuationColor.getHex()),
      this.size !== void 0 && (n.size = this.size),
      this.shadowSide !== null && (n.shadowSide = this.shadowSide),
      this.sizeAttenuation !== void 0 &&
        (n.sizeAttenuation = this.sizeAttenuation),
      this.blending !== hi && (n.blending = this.blending),
      this.side !== Pn && (n.side = this.side),
      this.vertexColors === !0 && (n.vertexColors = !0),
      this.opacity < 1 && (n.opacity = this.opacity),
      this.transparent === !0 && (n.transparent = !0),
      this.blendSrc !== sr && (n.blendSrc = this.blendSrc),
      this.blendDst !== rr && (n.blendDst = this.blendDst),
      this.blendEquation !== Vn && (n.blendEquation = this.blendEquation),
      this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha),
      this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha),
      this.blendEquationAlpha !== null &&
        (n.blendEquationAlpha = this.blendEquationAlpha),
      this.blendColor &&
        this.blendColor.isColor &&
        (n.blendColor = this.blendColor.getHex()),
      this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha),
      this.depthFunc !== di && (n.depthFunc = this.depthFunc),
      this.depthTest === !1 && (n.depthTest = this.depthTest),
      this.depthWrite === !1 && (n.depthWrite = this.depthWrite),
      this.colorWrite === !1 && (n.colorWrite = this.colorWrite),
      this.stencilWriteMask !== 255 &&
        (n.stencilWriteMask = this.stencilWriteMask),
      this.stencilFunc !== Ta && (n.stencilFunc = this.stencilFunc),
      this.stencilRef !== 0 && (n.stencilRef = this.stencilRef),
      this.stencilFuncMask !== 255 &&
        (n.stencilFuncMask = this.stencilFuncMask),
      this.stencilFail !== jn && (n.stencilFail = this.stencilFail),
      this.stencilZFail !== jn && (n.stencilZFail = this.stencilZFail),
      this.stencilZPass !== jn && (n.stencilZPass = this.stencilZPass),
      this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite),
      this.rotation !== void 0 &&
        this.rotation !== 0 &&
        (n.rotation = this.rotation),
      this.polygonOffset === !0 && (n.polygonOffset = !0),
      this.polygonOffsetFactor !== 0 &&
        (n.polygonOffsetFactor = this.polygonOffsetFactor),
      this.polygonOffsetUnits !== 0 &&
        (n.polygonOffsetUnits = this.polygonOffsetUnits),
      this.linewidth !== void 0 &&
        this.linewidth !== 1 &&
        (n.linewidth = this.linewidth),
      this.dashSize !== void 0 && (n.dashSize = this.dashSize),
      this.gapSize !== void 0 && (n.gapSize = this.gapSize),
      this.scale !== void 0 && (n.scale = this.scale),
      this.dithering === !0 && (n.dithering = !0),
      this.alphaTest > 0 && (n.alphaTest = this.alphaTest),
      this.alphaHash === !0 && (n.alphaHash = !0),
      this.alphaToCoverage === !0 && (n.alphaToCoverage = !0),
      this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0),
      this.forceSinglePass === !0 && (n.forceSinglePass = !0),
      this.wireframe === !0 && (n.wireframe = !0),
      this.wireframeLinewidth > 1 &&
        (n.wireframeLinewidth = this.wireframeLinewidth),
      this.wireframeLinecap !== "round" &&
        (n.wireframeLinecap = this.wireframeLinecap),
      this.wireframeLinejoin !== "round" &&
        (n.wireframeLinejoin = this.wireframeLinejoin),
      this.flatShading === !0 && (n.flatShading = !0),
      this.visible === !1 && (n.visible = !1),
      this.toneMapped === !1 && (n.toneMapped = !1),
      this.fog === !1 && (n.fog = !1),
      Object.keys(this.userData).length > 0 && (n.userData = this.userData));
    function s(r) {
      const a = [];
      for (const o in r) {
        const l = r[o];
        (delete l.metadata, a.push(l));
      }
      return a;
    }
    if (e) {
      const r = s(t.textures),
        a = s(t.images);
      (r.length > 0 && (n.textures = r), a.length > 0 && (n.images = a));
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    ((this.name = t.name),
      (this.blending = t.blending),
      (this.side = t.side),
      (this.vertexColors = t.vertexColors),
      (this.opacity = t.opacity),
      (this.transparent = t.transparent),
      (this.blendSrc = t.blendSrc),
      (this.blendDst = t.blendDst),
      (this.blendEquation = t.blendEquation),
      (this.blendSrcAlpha = t.blendSrcAlpha),
      (this.blendDstAlpha = t.blendDstAlpha),
      (this.blendEquationAlpha = t.blendEquationAlpha),
      this.blendColor.copy(t.blendColor),
      (this.blendAlpha = t.blendAlpha),
      (this.depthFunc = t.depthFunc),
      (this.depthTest = t.depthTest),
      (this.depthWrite = t.depthWrite),
      (this.stencilWriteMask = t.stencilWriteMask),
      (this.stencilFunc = t.stencilFunc),
      (this.stencilRef = t.stencilRef),
      (this.stencilFuncMask = t.stencilFuncMask),
      (this.stencilFail = t.stencilFail),
      (this.stencilZFail = t.stencilZFail),
      (this.stencilZPass = t.stencilZPass),
      (this.stencilWrite = t.stencilWrite));
    const e = t.clippingPlanes;
    let n = null;
    if (e !== null) {
      const s = e.length;
      n = new Array(s);
      for (let r = 0; r !== s; ++r) n[r] = e[r].clone();
    }
    return (
      (this.clippingPlanes = n),
      (this.clipIntersection = t.clipIntersection),
      (this.clipShadows = t.clipShadows),
      (this.shadowSide = t.shadowSide),
      (this.colorWrite = t.colorWrite),
      (this.precision = t.precision),
      (this.polygonOffset = t.polygonOffset),
      (this.polygonOffsetFactor = t.polygonOffsetFactor),
      (this.polygonOffsetUnits = t.polygonOffsetUnits),
      (this.dithering = t.dithering),
      (this.alphaTest = t.alphaTest),
      (this.alphaHash = t.alphaHash),
      (this.alphaToCoverage = t.alphaToCoverage),
      (this.premultipliedAlpha = t.premultipliedAlpha),
      (this.forceSinglePass = t.forceSinglePass),
      (this.visible = t.visible),
      (this.toneMapped = t.toneMapped),
      (this.userData = JSON.parse(JSON.stringify(t.userData))),
      this
    );
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
}
class sa extends Bi {
  constructor(t) {
    (super(),
      (this.isMeshBasicMaterial = !0),
      (this.type = "MeshBasicMaterial"),
      (this.color = new Yt(16777215)),
      (this.map = null),
      (this.lightMap = null),
      (this.lightMapIntensity = 1),
      (this.aoMap = null),
      (this.aoMapIntensity = 1),
      (this.specularMap = null),
      (this.alphaMap = null),
      (this.envMap = null),
      (this.envMapRotation = new rn()),
      (this.combine = Ro),
      (this.reflectivity = 1),
      (this.refractionRatio = 0.98),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      (this.wireframeLinecap = "round"),
      (this.wireframeLinejoin = "round"),
      (this.fog = !0),
      this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      this.color.copy(t.color),
      (this.map = t.map),
      (this.lightMap = t.lightMap),
      (this.lightMapIntensity = t.lightMapIntensity),
      (this.aoMap = t.aoMap),
      (this.aoMapIntensity = t.aoMapIntensity),
      (this.specularMap = t.specularMap),
      (this.alphaMap = t.alphaMap),
      (this.envMap = t.envMap),
      this.envMapRotation.copy(t.envMapRotation),
      (this.combine = t.combine),
      (this.reflectivity = t.reflectivity),
      (this.refractionRatio = t.refractionRatio),
      (this.wireframe = t.wireframe),
      (this.wireframeLinewidth = t.wireframeLinewidth),
      (this.wireframeLinecap = t.wireframeLinecap),
      (this.wireframeLinejoin = t.wireframeLinejoin),
      (this.fog = t.fog),
      this
    );
  }
}
const de = new F(),
  $i = new Pt();
let Xl = 0;
class nn {
  constructor(t, e, n = !1) {
    if (Array.isArray(t))
      throw new TypeError(
        "THREE.BufferAttribute: array should be a Typed Array.",
      );
    ((this.isBufferAttribute = !0),
      Object.defineProperty(this, "id", { value: Xl++ }),
      (this.name = ""),
      (this.array = t),
      (this.itemSize = e),
      (this.count = t !== void 0 ? t.length / e : 0),
      (this.normalized = n),
      (this.usage = Aa),
      (this.updateRanges = []),
      (this.gpuType = pn),
      (this.version = 0));
  }
  onUploadCallback() {}
  set needsUpdate(t) {
    t === !0 && this.version++;
  }
  setUsage(t) {
    return ((this.usage = t), this);
  }
  addUpdateRange(t, e) {
    this.updateRanges.push({ start: t, count: e });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(t) {
    return (
      (this.name = t.name),
      (this.array = new t.array.constructor(t.array)),
      (this.itemSize = t.itemSize),
      (this.count = t.count),
      (this.normalized = t.normalized),
      (this.usage = t.usage),
      (this.gpuType = t.gpuType),
      this
    );
  }
  copyAt(t, e, n) {
    ((t *= this.itemSize), (n *= e.itemSize));
    for (let s = 0, r = this.itemSize; s < r; s++)
      this.array[t + s] = e.array[n + s];
    return this;
  }
  copyArray(t) {
    return (this.array.set(t), this);
  }
  applyMatrix3(t) {
    if (this.itemSize === 2)
      for (let e = 0, n = this.count; e < n; e++)
        ($i.fromBufferAttribute(this, e),
          $i.applyMatrix3(t),
          this.setXY(e, $i.x, $i.y));
    else if (this.itemSize === 3)
      for (let e = 0, n = this.count; e < n; e++)
        (de.fromBufferAttribute(this, e),
          de.applyMatrix3(t),
          this.setXYZ(e, de.x, de.y, de.z));
    return this;
  }
  applyMatrix4(t) {
    for (let e = 0, n = this.count; e < n; e++)
      (de.fromBufferAttribute(this, e),
        de.applyMatrix4(t),
        this.setXYZ(e, de.x, de.y, de.z));
    return this;
  }
  applyNormalMatrix(t) {
    for (let e = 0, n = this.count; e < n; e++)
      (de.fromBufferAttribute(this, e),
        de.applyNormalMatrix(t),
        this.setXYZ(e, de.x, de.y, de.z));
    return this;
  }
  transformDirection(t) {
    for (let e = 0, n = this.count; e < n; e++)
      (de.fromBufferAttribute(this, e),
        de.transformDirection(t),
        this.setXYZ(e, de.x, de.y, de.z));
    return this;
  }
  set(t, e = 0) {
    return (this.array.set(t, e), this);
  }
  getComponent(t, e) {
    let n = this.array[t * this.itemSize + e];
    return (this.normalized && (n = yi(n, this.array)), n);
  }
  setComponent(t, e, n) {
    return (
      this.normalized && (n = Ce(n, this.array)),
      (this.array[t * this.itemSize + e] = n),
      this
    );
  }
  getX(t) {
    let e = this.array[t * this.itemSize];
    return (this.normalized && (e = yi(e, this.array)), e);
  }
  setX(t, e) {
    return (
      this.normalized && (e = Ce(e, this.array)),
      (this.array[t * this.itemSize] = e),
      this
    );
  }
  getY(t) {
    let e = this.array[t * this.itemSize + 1];
    return (this.normalized && (e = yi(e, this.array)), e);
  }
  setY(t, e) {
    return (
      this.normalized && (e = Ce(e, this.array)),
      (this.array[t * this.itemSize + 1] = e),
      this
    );
  }
  getZ(t) {
    let e = this.array[t * this.itemSize + 2];
    return (this.normalized && (e = yi(e, this.array)), e);
  }
  setZ(t, e) {
    return (
      this.normalized && (e = Ce(e, this.array)),
      (this.array[t * this.itemSize + 2] = e),
      this
    );
  }
  getW(t) {
    let e = this.array[t * this.itemSize + 3];
    return (this.normalized && (e = yi(e, this.array)), e);
  }
  setW(t, e) {
    return (
      this.normalized && (e = Ce(e, this.array)),
      (this.array[t * this.itemSize + 3] = e),
      this
    );
  }
  setXY(t, e, n) {
    return (
      (t *= this.itemSize),
      this.normalized && ((e = Ce(e, this.array)), (n = Ce(n, this.array))),
      (this.array[t + 0] = e),
      (this.array[t + 1] = n),
      this
    );
  }
  setXYZ(t, e, n, s) {
    return (
      (t *= this.itemSize),
      this.normalized &&
        ((e = Ce(e, this.array)),
        (n = Ce(n, this.array)),
        (s = Ce(s, this.array))),
      (this.array[t + 0] = e),
      (this.array[t + 1] = n),
      (this.array[t + 2] = s),
      this
    );
  }
  setXYZW(t, e, n, s, r) {
    return (
      (t *= this.itemSize),
      this.normalized &&
        ((e = Ce(e, this.array)),
        (n = Ce(n, this.array)),
        (s = Ce(s, this.array)),
        (r = Ce(r, this.array))),
      (this.array[t + 0] = e),
      (this.array[t + 1] = n),
      (this.array[t + 2] = s),
      (this.array[t + 3] = r),
      this
    );
  }
  onUpload(t) {
    return ((this.onUploadCallback = t), this);
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const t = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized,
    };
    return (
      this.name !== "" && (t.name = this.name),
      this.usage !== Aa && (t.usage = this.usage),
      t
    );
  }
}
class Wo extends nn {
  constructor(t, e, n) {
    super(new Uint16Array(t), e, n);
  }
}
class Xo extends nn {
  constructor(t, e, n) {
    super(new Uint32Array(t), e, n);
  }
}
class ve extends nn {
  constructor(t, e, n) {
    super(new Float32Array(t), e, n);
  }
}
let Yl = 0;
const Ve = new ue(),
  Xs = new _e(),
  si = new F(),
  Fe = new gi(),
  Ri = new gi(),
  xe = new F();
class ke extends Yn {
  constructor() {
    (super(),
      (this.isBufferGeometry = !0),
      Object.defineProperty(this, "id", { value: Yl++ }),
      (this.uuid = Oi()),
      (this.name = ""),
      (this.type = "BufferGeometry"),
      (this.index = null),
      (this.indirect = null),
      (this.attributes = {}),
      (this.morphAttributes = {}),
      (this.morphTargetsRelative = !1),
      (this.groups = []),
      (this.boundingBox = null),
      (this.boundingSphere = null),
      (this.drawRange = { start: 0, count: 1 / 0 }),
      (this.userData = {}));
  }
  getIndex() {
    return this.index;
  }
  setIndex(t) {
    return (
      Array.isArray(t)
        ? (this.index = new (zo(t) ? Xo : Wo)(t, 1))
        : (this.index = t),
      this
    );
  }
  setIndirect(t) {
    return ((this.indirect = t), this);
  }
  getIndirect() {
    return this.indirect;
  }
  getAttribute(t) {
    return this.attributes[t];
  }
  setAttribute(t, e) {
    return ((this.attributes[t] = e), this);
  }
  deleteAttribute(t) {
    return (delete this.attributes[t], this);
  }
  hasAttribute(t) {
    return this.attributes[t] !== void 0;
  }
  addGroup(t, e, n = 0) {
    this.groups.push({ start: t, count: e, materialIndex: n });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(t, e) {
    ((this.drawRange.start = t), (this.drawRange.count = e));
  }
  applyMatrix4(t) {
    const e = this.attributes.position;
    e !== void 0 && (e.applyMatrix4(t), (e.needsUpdate = !0));
    const n = this.attributes.normal;
    if (n !== void 0) {
      const r = new Nt().getNormalMatrix(t);
      (n.applyNormalMatrix(r), (n.needsUpdate = !0));
    }
    const s = this.attributes.tangent;
    return (
      s !== void 0 && (s.transformDirection(t), (s.needsUpdate = !0)),
      this.boundingBox !== null && this.computeBoundingBox(),
      this.boundingSphere !== null && this.computeBoundingSphere(),
      this
    );
  }
  applyQuaternion(t) {
    return (Ve.makeRotationFromQuaternion(t), this.applyMatrix4(Ve), this);
  }
  rotateX(t) {
    return (Ve.makeRotationX(t), this.applyMatrix4(Ve), this);
  }
  rotateY(t) {
    return (Ve.makeRotationY(t), this.applyMatrix4(Ve), this);
  }
  rotateZ(t) {
    return (Ve.makeRotationZ(t), this.applyMatrix4(Ve), this);
  }
  translate(t, e, n) {
    return (Ve.makeTranslation(t, e, n), this.applyMatrix4(Ve), this);
  }
  scale(t, e, n) {
    return (Ve.makeScale(t, e, n), this.applyMatrix4(Ve), this);
  }
  lookAt(t) {
    return (
      Xs.lookAt(t),
      Xs.updateMatrix(),
      this.applyMatrix4(Xs.matrix),
      this
    );
  }
  center() {
    return (
      this.computeBoundingBox(),
      this.boundingBox.getCenter(si).negate(),
      this.translate(si.x, si.y, si.z),
      this
    );
  }
  setFromPoints(t) {
    const e = this.getAttribute("position");
    if (e === void 0) {
      const n = [];
      for (let s = 0, r = t.length; s < r; s++) {
        const a = t[s];
        n.push(a.x, a.y, a.z || 0);
      }
      this.setAttribute("position", new ve(n, 3));
    } else {
      const n = Math.min(t.length, e.count);
      for (let s = 0; s < n; s++) {
        const r = t[s];
        e.setXYZ(s, r.x, r.y, r.z || 0);
      }
      (t.length > e.count &&
        Ut(
          "BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.",
        ),
        (e.needsUpdate = !0));
    }
    return this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new gi());
    const t = this.attributes.position,
      e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      (he(
        "BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",
        this,
      ),
        this.boundingBox.set(
          new F(-1 / 0, -1 / 0, -1 / 0),
          new F(1 / 0, 1 / 0, 1 / 0),
        ));
      return;
    }
    if (t !== void 0) {
      if ((this.boundingBox.setFromBufferAttribute(t), e))
        for (let n = 0, s = e.length; n < s; n++) {
          const r = e[n];
          (Fe.setFromBufferAttribute(r),
            this.morphTargetsRelative
              ? (xe.addVectors(this.boundingBox.min, Fe.min),
                this.boundingBox.expandByPoint(xe),
                xe.addVectors(this.boundingBox.max, Fe.max),
                this.boundingBox.expandByPoint(xe))
              : (this.boundingBox.expandByPoint(Fe.min),
                this.boundingBox.expandByPoint(Fe.max)));
        }
    } else this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) ||
      isNaN(this.boundingBox.min.y) ||
      isNaN(this.boundingBox.min.z)) &&
      he(
        'BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',
        this,
      );
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new ia());
    const t = this.attributes.position,
      e = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      (he(
        "BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",
        this,
      ),
        this.boundingSphere.set(new F(), 1 / 0));
      return;
    }
    if (t) {
      const n = this.boundingSphere.center;
      if ((Fe.setFromBufferAttribute(t), e))
        for (let r = 0, a = e.length; r < a; r++) {
          const o = e[r];
          (Ri.setFromBufferAttribute(o),
            this.morphTargetsRelative
              ? (xe.addVectors(Fe.min, Ri.min),
                Fe.expandByPoint(xe),
                xe.addVectors(Fe.max, Ri.max),
                Fe.expandByPoint(xe))
              : (Fe.expandByPoint(Ri.min), Fe.expandByPoint(Ri.max)));
        }
      Fe.getCenter(n);
      let s = 0;
      for (let r = 0, a = t.count; r < a; r++)
        (xe.fromBufferAttribute(t, r),
          (s = Math.max(s, n.distanceToSquared(xe))));
      if (e)
        for (let r = 0, a = e.length; r < a; r++) {
          const o = e[r],
            l = this.morphTargetsRelative;
          for (let c = 0, u = o.count; c < u; c++)
            (xe.fromBufferAttribute(o, c),
              l && (si.fromBufferAttribute(t, c), xe.add(si)),
              (s = Math.max(s, n.distanceToSquared(xe))));
        }
      ((this.boundingSphere.radius = Math.sqrt(s)),
        isNaN(this.boundingSphere.radius) &&
          he(
            'BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',
            this,
          ));
    }
  }
  computeTangents() {
    const t = this.index,
      e = this.attributes;
    if (
      t === null ||
      e.position === void 0 ||
      e.normal === void 0 ||
      e.uv === void 0
    ) {
      he(
        "BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)",
      );
      return;
    }
    const n = e.position,
      s = e.normal,
      r = e.uv;
    this.hasAttribute("tangent") === !1 &&
      this.setAttribute("tangent", new nn(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute("tangent"),
      o = [],
      l = [];
    for (let L = 0; L < n.count; L++) ((o[L] = new F()), (l[L] = new F()));
    const c = new F(),
      u = new F(),
      h = new F(),
      f = new Pt(),
      p = new Pt(),
      _ = new Pt(),
      S = new F(),
      m = new F();
    function d(L, M, g) {
      (c.fromBufferAttribute(n, L),
        u.fromBufferAttribute(n, M),
        h.fromBufferAttribute(n, g),
        f.fromBufferAttribute(r, L),
        p.fromBufferAttribute(r, M),
        _.fromBufferAttribute(r, g),
        u.sub(c),
        h.sub(c),
        p.sub(f),
        _.sub(f));
      const D = 1 / (p.x * _.y - _.x * p.y);
      isFinite(D) &&
        (S.copy(u)
          .multiplyScalar(_.y)
          .addScaledVector(h, -p.y)
          .multiplyScalar(D),
        m
          .copy(h)
          .multiplyScalar(p.x)
          .addScaledVector(u, -_.x)
          .multiplyScalar(D),
        o[L].add(S),
        o[M].add(S),
        o[g].add(S),
        l[L].add(m),
        l[M].add(m),
        l[g].add(m));
    }
    let E = this.groups;
    E.length === 0 && (E = [{ start: 0, count: t.count }]);
    for (let L = 0, M = E.length; L < M; ++L) {
      const g = E[L],
        D = g.start,
        N = g.count;
      for (let V = D, W = D + N; V < W; V += 3)
        d(t.getX(V + 0), t.getX(V + 1), t.getX(V + 2));
    }
    const b = new F(),
      y = new F(),
      R = new F(),
      T = new F();
    function w(L) {
      (R.fromBufferAttribute(s, L), T.copy(R));
      const M = o[L];
      (b.copy(M),
        b.sub(R.multiplyScalar(R.dot(M))).normalize(),
        y.crossVectors(T, M));
      const D = y.dot(l[L]) < 0 ? -1 : 1;
      a.setXYZW(L, b.x, b.y, b.z, D);
    }
    for (let L = 0, M = E.length; L < M; ++L) {
      const g = E[L],
        D = g.start,
        N = g.count;
      for (let V = D, W = D + N; V < W; V += 3)
        (w(t.getX(V + 0)), w(t.getX(V + 1)), w(t.getX(V + 2)));
    }
  }
  computeVertexNormals() {
    const t = this.index,
      e = this.getAttribute("position");
    if (e !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        ((n = new nn(new Float32Array(e.count * 3), 3)),
          this.setAttribute("normal", n));
      else for (let f = 0, p = n.count; f < p; f++) n.setXYZ(f, 0, 0, 0);
      const s = new F(),
        r = new F(),
        a = new F(),
        o = new F(),
        l = new F(),
        c = new F(),
        u = new F(),
        h = new F();
      if (t)
        for (let f = 0, p = t.count; f < p; f += 3) {
          const _ = t.getX(f + 0),
            S = t.getX(f + 1),
            m = t.getX(f + 2);
          (s.fromBufferAttribute(e, _),
            r.fromBufferAttribute(e, S),
            a.fromBufferAttribute(e, m),
            u.subVectors(a, r),
            h.subVectors(s, r),
            u.cross(h),
            o.fromBufferAttribute(n, _),
            l.fromBufferAttribute(n, S),
            c.fromBufferAttribute(n, m),
            o.add(u),
            l.add(u),
            c.add(u),
            n.setXYZ(_, o.x, o.y, o.z),
            n.setXYZ(S, l.x, l.y, l.z),
            n.setXYZ(m, c.x, c.y, c.z));
        }
      else
        for (let f = 0, p = e.count; f < p; f += 3)
          (s.fromBufferAttribute(e, f + 0),
            r.fromBufferAttribute(e, f + 1),
            a.fromBufferAttribute(e, f + 2),
            u.subVectors(a, r),
            h.subVectors(s, r),
            u.cross(h),
            n.setXYZ(f + 0, u.x, u.y, u.z),
            n.setXYZ(f + 1, u.x, u.y, u.z),
            n.setXYZ(f + 2, u.x, u.y, u.z));
      (this.normalizeNormals(), (n.needsUpdate = !0));
    }
  }
  normalizeNormals() {
    const t = this.attributes.normal;
    for (let e = 0, n = t.count; e < n; e++)
      (xe.fromBufferAttribute(t, e),
        xe.normalize(),
        t.setXYZ(e, xe.x, xe.y, xe.z));
  }
  toNonIndexed() {
    function t(o, l) {
      const c = o.array,
        u = o.itemSize,
        h = o.normalized,
        f = new c.constructor(l.length * u);
      let p = 0,
        _ = 0;
      for (let S = 0, m = l.length; S < m; S++) {
        o.isInterleavedBufferAttribute
          ? (p = l[S] * o.data.stride + o.offset)
          : (p = l[S] * u);
        for (let d = 0; d < u; d++) f[_++] = c[p++];
      }
      return new nn(f, u, h);
    }
    if (this.index === null)
      return (
        Ut(
          "BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.",
        ),
        this
      );
    const e = new ke(),
      n = this.index.array,
      s = this.attributes;
    for (const o in s) {
      const l = s[o],
        c = t(l, n);
      e.setAttribute(o, c);
    }
    const r = this.morphAttributes;
    for (const o in r) {
      const l = [],
        c = r[o];
      for (let u = 0, h = c.length; u < h; u++) {
        const f = c[u],
          p = t(f, n);
        l.push(p);
      }
      e.morphAttributes[o] = l;
    }
    e.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const c = a[o];
      e.addGroup(c.start, c.count, c.materialIndex);
    }
    return e;
  }
  toJSON() {
    const t = {
      metadata: {
        version: 4.7,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON",
      },
    };
    if (
      ((t.uuid = this.uuid),
      (t.type = this.type),
      this.name !== "" && (t.name = this.name),
      Object.keys(this.userData).length > 0 && (t.userData = this.userData),
      this.parameters !== void 0)
    ) {
      const l = this.parameters;
      for (const c in l) l[c] !== void 0 && (t[c] = l[c]);
      return t;
    }
    t.data = { attributes: {} };
    const e = this.index;
    e !== null &&
      (t.data.index = {
        type: e.array.constructor.name,
        array: Array.prototype.slice.call(e.array),
      });
    const n = this.attributes;
    for (const l in n) {
      const c = n[l];
      t.data.attributes[l] = c.toJSON(t.data);
    }
    const s = {};
    let r = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l],
        u = [];
      for (let h = 0, f = c.length; h < f; h++) {
        const p = c[h];
        u.push(p.toJSON(t.data));
      }
      u.length > 0 && ((s[l] = u), (r = !0));
    }
    r &&
      ((t.data.morphAttributes = s),
      (t.data.morphTargetsRelative = this.morphTargetsRelative));
    const a = this.groups;
    a.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return (o !== null && (t.data.boundingSphere = o.toJSON()), t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    ((this.index = null),
      (this.attributes = {}),
      (this.morphAttributes = {}),
      (this.groups = []),
      (this.boundingBox = null),
      (this.boundingSphere = null));
    const e = {};
    this.name = t.name;
    const n = t.index;
    n !== null && this.setIndex(n.clone());
    const s = t.attributes;
    for (const c in s) {
      const u = s[c];
      this.setAttribute(c, u.clone(e));
    }
    const r = t.morphAttributes;
    for (const c in r) {
      const u = [],
        h = r[c];
      for (let f = 0, p = h.length; f < p; f++) u.push(h[f].clone(e));
      this.morphAttributes[c] = u;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const a = t.groups;
    for (let c = 0, u = a.length; c < u; c++) {
      const h = a[c];
      this.addGroup(h.start, h.count, h.materialIndex);
    }
    const o = t.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = t.boundingSphere;
    return (
      l !== null && (this.boundingSphere = l.clone()),
      (this.drawRange.start = t.drawRange.start),
      (this.drawRange.count = t.drawRange.count),
      (this.userData = t.userData),
      this
    );
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
const Ga = new ue(),
  Nn = new Go(),
  Zi = new ia(),
  Ha = new F(),
  Ji = new F(),
  Qi = new F(),
  ts = new F(),
  Ys = new F(),
  es = new F(),
  ka = new F(),
  ns = new F();
class Ae extends _e {
  constructor(t = new ke(), e = new sa()) {
    (super(),
      (this.isMesh = !0),
      (this.type = "Mesh"),
      (this.geometry = t),
      (this.material = e),
      (this.morphTargetDictionary = void 0),
      (this.morphTargetInfluences = void 0),
      (this.count = 1),
      this.updateMorphTargets());
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      t.morphTargetInfluences !== void 0 &&
        (this.morphTargetInfluences = t.morphTargetInfluences.slice()),
      t.morphTargetDictionary !== void 0 &&
        (this.morphTargetDictionary = Object.assign(
          {},
          t.morphTargetDictionary,
        )),
      (this.material = Array.isArray(t.material)
        ? t.material.slice()
        : t.material),
      (this.geometry = t.geometry),
      this
    );
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes,
      n = Object.keys(e);
    if (n.length > 0) {
      const s = e[n[0]];
      if (s !== void 0) {
        ((this.morphTargetInfluences = []), (this.morphTargetDictionary = {}));
        for (let r = 0, a = s.length; r < a; r++) {
          const o = s[r].name || String(r);
          (this.morphTargetInfluences.push(0),
            (this.morphTargetDictionary[o] = r));
        }
      }
    }
  }
  getVertexPosition(t, e) {
    const n = this.geometry,
      s = n.attributes.position,
      r = n.morphAttributes.position,
      a = n.morphTargetsRelative;
    e.fromBufferAttribute(s, t);
    const o = this.morphTargetInfluences;
    if (r && o) {
      es.set(0, 0, 0);
      for (let l = 0, c = r.length; l < c; l++) {
        const u = o[l],
          h = r[l];
        u !== 0 &&
          (Ys.fromBufferAttribute(h, t),
          a ? es.addScaledVector(Ys, u) : es.addScaledVector(Ys.sub(e), u));
      }
      e.add(es);
    }
    return e;
  }
  raycast(t, e) {
    const n = this.geometry,
      s = this.material,
      r = this.matrixWorld;
    s !== void 0 &&
      (n.boundingSphere === null && n.computeBoundingSphere(),
      Zi.copy(n.boundingSphere),
      Zi.applyMatrix4(r),
      Nn.copy(t.ray).recast(t.near),
      !(
        Zi.containsPoint(Nn.origin) === !1 &&
        (Nn.intersectSphere(Zi, Ha) === null ||
          Nn.origin.distanceToSquared(Ha) > (t.far - t.near) ** 2)
      ) &&
        (Ga.copy(r).invert(),
        Nn.copy(t.ray).applyMatrix4(Ga),
        !(n.boundingBox !== null && Nn.intersectsBox(n.boundingBox) === !1) &&
          this._computeIntersections(t, e, Nn)));
  }
  _computeIntersections(t, e, n) {
    let s;
    const r = this.geometry,
      a = this.material,
      o = r.index,
      l = r.attributes.position,
      c = r.attributes.uv,
      u = r.attributes.uv1,
      h = r.attributes.normal,
      f = r.groups,
      p = r.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let _ = 0, S = f.length; _ < S; _++) {
          const m = f[_],
            d = a[m.materialIndex],
            E = Math.max(m.start, p.start),
            b = Math.min(
              o.count,
              Math.min(m.start + m.count, p.start + p.count),
            );
          for (let y = E, R = b; y < R; y += 3) {
            const T = o.getX(y),
              w = o.getX(y + 1),
              L = o.getX(y + 2);
            ((s = is(this, d, t, n, c, u, h, T, w, L)),
              s &&
                ((s.faceIndex = Math.floor(y / 3)),
                (s.face.materialIndex = m.materialIndex),
                e.push(s)));
          }
        }
      else {
        const _ = Math.max(0, p.start),
          S = Math.min(o.count, p.start + p.count);
        for (let m = _, d = S; m < d; m += 3) {
          const E = o.getX(m),
            b = o.getX(m + 1),
            y = o.getX(m + 2);
          ((s = is(this, a, t, n, c, u, h, E, b, y)),
            s && ((s.faceIndex = Math.floor(m / 3)), e.push(s)));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let _ = 0, S = f.length; _ < S; _++) {
          const m = f[_],
            d = a[m.materialIndex],
            E = Math.max(m.start, p.start),
            b = Math.min(
              l.count,
              Math.min(m.start + m.count, p.start + p.count),
            );
          for (let y = E, R = b; y < R; y += 3) {
            const T = y,
              w = y + 1,
              L = y + 2;
            ((s = is(this, d, t, n, c, u, h, T, w, L)),
              s &&
                ((s.faceIndex = Math.floor(y / 3)),
                (s.face.materialIndex = m.materialIndex),
                e.push(s)));
          }
        }
      else {
        const _ = Math.max(0, p.start),
          S = Math.min(l.count, p.start + p.count);
        for (let m = _, d = S; m < d; m += 3) {
          const E = m,
            b = m + 1,
            y = m + 2;
          ((s = is(this, a, t, n, c, u, h, E, b, y)),
            s && ((s.faceIndex = Math.floor(m / 3)), e.push(s)));
        }
      }
  }
}
function ql(i, t, e, n, s, r, a, o) {
  let l;
  if (
    (t.side === Le
      ? (l = n.intersectTriangle(a, r, s, !0, o))
      : (l = n.intersectTriangle(s, r, a, t.side === Pn, o)),
    l === null)
  )
    return null;
  (ns.copy(o), ns.applyMatrix4(i.matrixWorld));
  const c = e.ray.origin.distanceTo(ns);
  return c < e.near || c > e.far
    ? null
    : { distance: c, point: ns.clone(), object: i };
}
function is(i, t, e, n, s, r, a, o, l, c) {
  (i.getVertexPosition(o, Ji),
    i.getVertexPosition(l, Qi),
    i.getVertexPosition(c, ts));
  const u = ql(i, t, e, n, Ji, Qi, ts, ka);
  if (u) {
    const h = new F();
    (je.getBarycoord(ka, Ji, Qi, ts, h),
      s && (u.uv = je.getInterpolatedAttribute(s, o, l, c, h, new Pt())),
      r && (u.uv1 = je.getInterpolatedAttribute(r, o, l, c, h, new Pt())),
      a &&
        ((u.normal = je.getInterpolatedAttribute(a, o, l, c, h, new F())),
        u.normal.dot(n.direction) > 0 && u.normal.multiplyScalar(-1)));
    const f = { a: o, b: l, c, normal: new F(), materialIndex: 0 };
    (je.getNormal(Ji, Qi, ts, f.normal), (u.face = f), (u.barycoord = h));
  }
  return u;
}
class vi extends ke {
  constructor(t = 1, e = 1, n = 1, s = 1, r = 1, a = 1) {
    (super(),
      (this.type = "BoxGeometry"),
      (this.parameters = {
        width: t,
        height: e,
        depth: n,
        widthSegments: s,
        heightSegments: r,
        depthSegments: a,
      }));
    const o = this;
    ((s = Math.floor(s)), (r = Math.floor(r)), (a = Math.floor(a)));
    const l = [],
      c = [],
      u = [],
      h = [];
    let f = 0,
      p = 0;
    (_("z", "y", "x", -1, -1, n, e, t, a, r, 0),
      _("z", "y", "x", 1, -1, n, e, -t, a, r, 1),
      _("x", "z", "y", 1, 1, t, n, e, s, a, 2),
      _("x", "z", "y", 1, -1, t, n, -e, s, a, 3),
      _("x", "y", "z", 1, -1, t, e, n, s, r, 4),
      _("x", "y", "z", -1, -1, t, e, -n, s, r, 5),
      this.setIndex(l),
      this.setAttribute("position", new ve(c, 3)),
      this.setAttribute("normal", new ve(u, 3)),
      this.setAttribute("uv", new ve(h, 2)));
    function _(S, m, d, E, b, y, R, T, w, L, M) {
      const g = y / w,
        D = R / L,
        N = y / 2,
        V = R / 2,
        W = T / 2,
        k = w + 1,
        q = L + 1;
      let J = 0,
        H = 0;
      const nt = new F();
      for (let rt = 0; rt < q; rt++) {
        const bt = rt * D - V;
        for (let kt = 0; kt < k; kt++) {
          const qt = kt * g - N;
          ((nt[S] = qt * E),
            (nt[m] = bt * b),
            (nt[d] = W),
            c.push(nt.x, nt.y, nt.z),
            (nt[S] = 0),
            (nt[m] = 0),
            (nt[d] = T > 0 ? 1 : -1),
            u.push(nt.x, nt.y, nt.z),
            h.push(kt / w),
            h.push(1 - rt / L),
            (J += 1));
        }
      }
      for (let rt = 0; rt < L; rt++)
        for (let bt = 0; bt < w; bt++) {
          const kt = f + bt + k * rt,
            qt = f + bt + k * (rt + 1),
            Qt = f + (bt + 1) + k * (rt + 1),
            te = f + (bt + 1) + k * rt;
          (l.push(kt, qt, te), l.push(qt, Qt, te), (H += 6));
        }
      (o.addGroup(p, H, M), (p += H), (f += J));
    }
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new vi(
      t.width,
      t.height,
      t.depth,
      t.widthSegments,
      t.heightSegments,
      t.depthSegments,
    );
  }
}
function xi(i) {
  const t = {};
  for (const e in i) {
    t[e] = {};
    for (const n in i[e]) {
      const s = i[e][n];
      s &&
      (s.isColor ||
        s.isMatrix3 ||
        s.isMatrix4 ||
        s.isVector2 ||
        s.isVector3 ||
        s.isVector4 ||
        s.isTexture ||
        s.isQuaternion)
        ? s.isRenderTargetTexture
          ? (Ut(
              "UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().",
            ),
            (t[e][n] = null))
          : (t[e][n] = s.clone())
        : Array.isArray(s)
          ? (t[e][n] = s.slice())
          : (t[e][n] = s);
    }
  }
  return t;
}
function ye(i) {
  const t = {};
  for (let e = 0; e < i.length; e++) {
    const n = xi(i[e]);
    for (const s in n) t[s] = n[s];
  }
  return t;
}
function jl(i) {
  const t = [];
  for (let e = 0; e < i.length; e++) t.push(i[e].clone());
  return t;
}
function Yo(i) {
  const t = i.getRenderTarget();
  return t === null
    ? i.outputColorSpace
    : t.isXRRenderTarget === !0
      ? t.texture.colorSpace
      : Xt.workingColorSpace;
}
const Kl = { clone: xi, merge: ye };
var $l = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
  Zl = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class _n extends Bi {
  constructor(t) {
    (super(),
      (this.isShaderMaterial = !0),
      (this.type = "ShaderMaterial"),
      (this.defines = {}),
      (this.uniforms = {}),
      (this.uniformsGroups = []),
      (this.vertexShader = $l),
      (this.fragmentShader = Zl),
      (this.linewidth = 1),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      (this.fog = !1),
      (this.lights = !1),
      (this.clipping = !1),
      (this.forceSinglePass = !0),
      (this.extensions = { clipCullDistance: !1, multiDraw: !1 }),
      (this.defaultAttributeValues = {
        color: [1, 1, 1],
        uv: [0, 0],
        uv1: [0, 0],
      }),
      (this.index0AttributeName = void 0),
      (this.uniformsNeedUpdate = !1),
      (this.glslVersion = null),
      t !== void 0 && this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.fragmentShader = t.fragmentShader),
      (this.vertexShader = t.vertexShader),
      (this.uniforms = xi(t.uniforms)),
      (this.uniformsGroups = jl(t.uniformsGroups)),
      (this.defines = Object.assign({}, t.defines)),
      (this.wireframe = t.wireframe),
      (this.wireframeLinewidth = t.wireframeLinewidth),
      (this.fog = t.fog),
      (this.lights = t.lights),
      (this.clipping = t.clipping),
      (this.extensions = Object.assign({}, t.extensions)),
      (this.glslVersion = t.glslVersion),
      this
    );
  }
  toJSON(t) {
    const e = super.toJSON(t);
    ((e.glslVersion = this.glslVersion), (e.uniforms = {}));
    for (const s in this.uniforms) {
      const a = this.uniforms[s].value;
      a && a.isTexture
        ? (e.uniforms[s] = { type: "t", value: a.toJSON(t).uuid })
        : a && a.isColor
          ? (e.uniforms[s] = { type: "c", value: a.getHex() })
          : a && a.isVector2
            ? (e.uniforms[s] = { type: "v2", value: a.toArray() })
            : a && a.isVector3
              ? (e.uniforms[s] = { type: "v3", value: a.toArray() })
              : a && a.isVector4
                ? (e.uniforms[s] = { type: "v4", value: a.toArray() })
                : a && a.isMatrix3
                  ? (e.uniforms[s] = { type: "m3", value: a.toArray() })
                  : a && a.isMatrix4
                    ? (e.uniforms[s] = { type: "m4", value: a.toArray() })
                    : (e.uniforms[s] = { value: a });
    }
    (Object.keys(this.defines).length > 0 && (e.defines = this.defines),
      (e.vertexShader = this.vertexShader),
      (e.fragmentShader = this.fragmentShader),
      (e.lights = this.lights),
      (e.clipping = this.clipping));
    const n = {};
    for (const s in this.extensions) this.extensions[s] === !0 && (n[s] = !0);
    return (Object.keys(n).length > 0 && (e.extensions = n), e);
  }
}
class qo extends _e {
  constructor() {
    (super(),
      (this.isCamera = !0),
      (this.type = "Camera"),
      (this.matrixWorldInverse = new ue()),
      (this.projectionMatrix = new ue()),
      (this.projectionMatrixInverse = new ue()),
      (this.coordinateSystem = en),
      (this._reversedDepth = !1));
  }
  get reversedDepth() {
    return this._reversedDepth;
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      this.matrixWorldInverse.copy(t.matrixWorldInverse),
      this.projectionMatrix.copy(t.projectionMatrix),
      this.projectionMatrixInverse.copy(t.projectionMatrixInverse),
      (this.coordinateSystem = t.coordinateSystem),
      this
    );
  }
  getWorldDirection(t) {
    return super.getWorldDirection(t).negate();
  }
  updateMatrixWorld(t) {
    (super.updateMatrixWorld(t),
      this.matrixWorldInverse.copy(this.matrixWorld).invert());
  }
  updateWorldMatrix(t, e) {
    (super.updateWorldMatrix(t, e),
      this.matrixWorldInverse.copy(this.matrixWorld).invert());
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const En = new F(),
  Wa = new Pt(),
  Xa = new Pt();
class Ge extends qo {
  constructor(t = 50, e = 1, n = 0.1, s = 2e3) {
    (super(),
      (this.isPerspectiveCamera = !0),
      (this.type = "PerspectiveCamera"),
      (this.fov = t),
      (this.zoom = 1),
      (this.near = n),
      (this.far = s),
      (this.focus = 10),
      (this.aspect = e),
      (this.view = null),
      (this.filmGauge = 35),
      (this.filmOffset = 0),
      this.updateProjectionMatrix());
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      (this.fov = t.fov),
      (this.zoom = t.zoom),
      (this.near = t.near),
      (this.far = t.far),
      (this.focus = t.focus),
      (this.aspect = t.aspect),
      (this.view = t.view === null ? null : Object.assign({}, t.view)),
      (this.filmGauge = t.filmGauge),
      (this.filmOffset = t.filmOffset),
      this
    );
  }
  setFocalLength(t) {
    const e = (0.5 * this.getFilmHeight()) / t;
    ((this.fov = Xr * 2 * Math.atan(e)), this.updateProjectionMatrix());
  }
  getFocalLength() {
    const t = Math.tan(ds * 0.5 * this.fov);
    return (0.5 * this.getFilmHeight()) / t;
  }
  getEffectiveFOV() {
    return Xr * 2 * Math.atan(Math.tan(ds * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(t, e, n) {
    (En.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse),
      e.set(En.x, En.y).multiplyScalar(-t / En.z),
      En.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse),
      n.set(En.x, En.y).multiplyScalar(-t / En.z));
  }
  getViewSize(t, e) {
    return (this.getViewBounds(t, Wa, Xa), e.subVectors(Xa, Wa));
  }
  setViewOffset(t, e, n, s, r, a) {
    ((this.aspect = t / e),
      this.view === null &&
        (this.view = {
          enabled: !0,
          fullWidth: 1,
          fullHeight: 1,
          offsetX: 0,
          offsetY: 0,
          width: 1,
          height: 1,
        }),
      (this.view.enabled = !0),
      (this.view.fullWidth = t),
      (this.view.fullHeight = e),
      (this.view.offsetX = n),
      (this.view.offsetY = s),
      (this.view.width = r),
      (this.view.height = a),
      this.updateProjectionMatrix());
  }
  clearViewOffset() {
    (this.view !== null && (this.view.enabled = !1),
      this.updateProjectionMatrix());
  }
  updateProjectionMatrix() {
    const t = this.near;
    let e = (t * Math.tan(ds * 0.5 * this.fov)) / this.zoom,
      n = 2 * e,
      s = this.aspect * n,
      r = -0.5 * s;
    const a = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = a.fullWidth,
        c = a.fullHeight;
      ((r += (a.offsetX * s) / l),
        (e -= (a.offsetY * n) / c),
        (s *= a.width / l),
        (n *= a.height / c));
    }
    const o = this.filmOffset;
    (o !== 0 && (r += (t * o) / this.getFilmWidth()),
      this.projectionMatrix.makePerspective(
        r,
        r + s,
        e,
        e - n,
        t,
        this.far,
        this.coordinateSystem,
        this.reversedDepth,
      ),
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert());
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      (e.object.fov = this.fov),
      (e.object.zoom = this.zoom),
      (e.object.near = this.near),
      (e.object.far = this.far),
      (e.object.focus = this.focus),
      (e.object.aspect = this.aspect),
      this.view !== null && (e.object.view = Object.assign({}, this.view)),
      (e.object.filmGauge = this.filmGauge),
      (e.object.filmOffset = this.filmOffset),
      e
    );
  }
}
const ri = -90,
  ai = 1;
class Jl extends _e {
  constructor(t, e, n) {
    (super(),
      (this.type = "CubeCamera"),
      (this.renderTarget = n),
      (this.coordinateSystem = null),
      (this.activeMipmapLevel = 0));
    const s = new Ge(ri, ai, t, e);
    ((s.layers = this.layers), this.add(s));
    const r = new Ge(ri, ai, t, e);
    ((r.layers = this.layers), this.add(r));
    const a = new Ge(ri, ai, t, e);
    ((a.layers = this.layers), this.add(a));
    const o = new Ge(ri, ai, t, e);
    ((o.layers = this.layers), this.add(o));
    const l = new Ge(ri, ai, t, e);
    ((l.layers = this.layers), this.add(l));
    const c = new Ge(ri, ai, t, e);
    ((c.layers = this.layers), this.add(c));
  }
  updateCoordinateSystem() {
    const t = this.coordinateSystem,
      e = this.children.concat(),
      [n, s, r, a, o, l] = e;
    for (const c of e) this.remove(c);
    if (t === en)
      (n.up.set(0, 1, 0),
        n.lookAt(1, 0, 0),
        s.up.set(0, 1, 0),
        s.lookAt(-1, 0, 0),
        r.up.set(0, 0, -1),
        r.lookAt(0, 1, 0),
        a.up.set(0, 0, 1),
        a.lookAt(0, -1, 0),
        o.up.set(0, 1, 0),
        o.lookAt(0, 0, 1),
        l.up.set(0, 1, 0),
        l.lookAt(0, 0, -1));
    else if (t === ms)
      (n.up.set(0, -1, 0),
        n.lookAt(-1, 0, 0),
        s.up.set(0, -1, 0),
        s.lookAt(1, 0, 0),
        r.up.set(0, 0, 1),
        r.lookAt(0, 1, 0),
        a.up.set(0, 0, -1),
        a.lookAt(0, -1, 0),
        o.up.set(0, -1, 0),
        o.lookAt(0, 0, 1),
        l.up.set(0, -1, 0),
        l.lookAt(0, 0, -1));
    else
      throw new Error(
        "THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " +
          t,
      );
    for (const c of e) (this.add(c), c.updateMatrixWorld());
  }
  update(t, e) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: s } = this;
    this.coordinateSystem !== t.coordinateSystem &&
      ((this.coordinateSystem = t.coordinateSystem),
      this.updateCoordinateSystem());
    const [r, a, o, l, c, u] = this.children,
      h = t.getRenderTarget(),
      f = t.getActiveCubeFace(),
      p = t.getActiveMipmapLevel(),
      _ = t.xr.enabled;
    t.xr.enabled = !1;
    const S = n.texture.generateMipmaps;
    ((n.texture.generateMipmaps = !1),
      t.setRenderTarget(n, 0, s),
      t.render(e, r),
      t.setRenderTarget(n, 1, s),
      t.render(e, a),
      t.setRenderTarget(n, 2, s),
      t.render(e, o),
      t.setRenderTarget(n, 3, s),
      t.render(e, l),
      t.setRenderTarget(n, 4, s),
      t.render(e, c),
      (n.texture.generateMipmaps = S),
      t.setRenderTarget(n, 5, s),
      t.render(e, u),
      t.setRenderTarget(h, f, p),
      (t.xr.enabled = _),
      (n.texture.needsPMREMUpdate = !0));
  }
}
class jo extends be {
  constructor(t = [], e = fi, n, s, r, a, o, l, c, u) {
    (super(t, e, n, s, r, a, o, l, c, u),
      (this.isCubeTexture = !0),
      (this.flipY = !1));
  }
  get images() {
    return this.image;
  }
  set images(t) {
    this.image = t;
  }
}
class Ql extends Xn {
  constructor(t = 1, e = {}) {
    (super(t, t, e), (this.isWebGLCubeRenderTarget = !0));
    const n = { width: t, height: t, depth: 1 },
      s = [n, n, n, n, n, n];
    ((this.texture = new jo(s)),
      this._setTextureOptions(e),
      (this.texture.isRenderTargetTexture = !0));
  }
  fromEquirectangularTexture(t, e) {
    ((this.texture.type = e.type),
      (this.texture.colorSpace = e.colorSpace),
      (this.texture.generateMipmaps = e.generateMipmaps),
      (this.texture.minFilter = e.minFilter),
      (this.texture.magFilter = e.magFilter));
    const n = {
        uniforms: { tEquirect: { value: null } },
        vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
        fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`,
      },
      s = new vi(5, 5, 5),
      r = new _n({
        name: "CubemapFromEquirect",
        uniforms: xi(n.uniforms),
        vertexShader: n.vertexShader,
        fragmentShader: n.fragmentShader,
        side: Le,
        blending: mn,
      });
    r.uniforms.tEquirect.value = e;
    const a = new Ae(s, r),
      o = e.minFilter;
    return (
      e.minFilter === Hn && (e.minFilter = He),
      new Jl(1, 10, this).update(t, a),
      (e.minFilter = o),
      a.geometry.dispose(),
      a.material.dispose(),
      this
    );
  }
  clear(t, e = !0, n = !0, s = !0) {
    const r = t.getRenderTarget();
    for (let a = 0; a < 6; a++) (t.setRenderTarget(this, a), t.clear(e, n, s));
    t.setRenderTarget(r);
  }
}
class $e extends _e {
  constructor() {
    (super(), (this.isGroup = !0), (this.type = "Group"));
  }
}
const th = { type: "move" };
class qs {
  constructor() {
    ((this._targetRay = null), (this._grip = null), (this._hand = null));
  }
  getHandSpace() {
    return (
      this._hand === null &&
        ((this._hand = new $e()),
        (this._hand.matrixAutoUpdate = !1),
        (this._hand.visible = !1),
        (this._hand.joints = {}),
        (this._hand.inputState = { pinching: !1 })),
      this._hand
    );
  }
  getTargetRaySpace() {
    return (
      this._targetRay === null &&
        ((this._targetRay = new $e()),
        (this._targetRay.matrixAutoUpdate = !1),
        (this._targetRay.visible = !1),
        (this._targetRay.hasLinearVelocity = !1),
        (this._targetRay.linearVelocity = new F()),
        (this._targetRay.hasAngularVelocity = !1),
        (this._targetRay.angularVelocity = new F())),
      this._targetRay
    );
  }
  getGripSpace() {
    return (
      this._grip === null &&
        ((this._grip = new $e()),
        (this._grip.matrixAutoUpdate = !1),
        (this._grip.visible = !1),
        (this._grip.hasLinearVelocity = !1),
        (this._grip.linearVelocity = new F()),
        (this._grip.hasAngularVelocity = !1),
        (this._grip.angularVelocity = new F())),
      this._grip
    );
  }
  dispatchEvent(t) {
    return (
      this._targetRay !== null && this._targetRay.dispatchEvent(t),
      this._grip !== null && this._grip.dispatchEvent(t),
      this._hand !== null && this._hand.dispatchEvent(t),
      this
    );
  }
  connect(t) {
    if (t && t.hand) {
      const e = this._hand;
      if (e) for (const n of t.hand.values()) this._getHandJoint(e, n);
    }
    return (this.dispatchEvent({ type: "connected", data: t }), this);
  }
  disconnect(t) {
    return (
      this.dispatchEvent({ type: "disconnected", data: t }),
      this._targetRay !== null && (this._targetRay.visible = !1),
      this._grip !== null && (this._grip.visible = !1),
      this._hand !== null && (this._hand.visible = !1),
      this
    );
  }
  update(t, e, n) {
    let s = null,
      r = null,
      a = null;
    const o = this._targetRay,
      l = this._grip,
      c = this._hand;
    if (t && e.session.visibilityState !== "visible-blurred") {
      if (c && t.hand) {
        a = !0;
        for (const S of t.hand.values()) {
          const m = e.getJointPose(S, n),
            d = this._getHandJoint(c, S);
          (m !== null &&
            (d.matrix.fromArray(m.transform.matrix),
            d.matrix.decompose(d.position, d.rotation, d.scale),
            (d.matrixWorldNeedsUpdate = !0),
            (d.jointRadius = m.radius)),
            (d.visible = m !== null));
        }
        const u = c.joints["index-finger-tip"],
          h = c.joints["thumb-tip"],
          f = u.position.distanceTo(h.position),
          p = 0.02,
          _ = 0.005;
        c.inputState.pinching && f > p + _
          ? ((c.inputState.pinching = !1),
            this.dispatchEvent({
              type: "pinchend",
              handedness: t.handedness,
              target: this,
            }))
          : !c.inputState.pinching &&
            f <= p - _ &&
            ((c.inputState.pinching = !0),
            this.dispatchEvent({
              type: "pinchstart",
              handedness: t.handedness,
              target: this,
            }));
      } else
        l !== null &&
          t.gripSpace &&
          ((r = e.getPose(t.gripSpace, n)),
          r !== null &&
            (l.matrix.fromArray(r.transform.matrix),
            l.matrix.decompose(l.position, l.rotation, l.scale),
            (l.matrixWorldNeedsUpdate = !0),
            r.linearVelocity
              ? ((l.hasLinearVelocity = !0),
                l.linearVelocity.copy(r.linearVelocity))
              : (l.hasLinearVelocity = !1),
            r.angularVelocity
              ? ((l.hasAngularVelocity = !0),
                l.angularVelocity.copy(r.angularVelocity))
              : (l.hasAngularVelocity = !1)));
      o !== null &&
        ((s = e.getPose(t.targetRaySpace, n)),
        s === null && r !== null && (s = r),
        s !== null &&
          (o.matrix.fromArray(s.transform.matrix),
          o.matrix.decompose(o.position, o.rotation, o.scale),
          (o.matrixWorldNeedsUpdate = !0),
          s.linearVelocity
            ? ((o.hasLinearVelocity = !0),
              o.linearVelocity.copy(s.linearVelocity))
            : (o.hasLinearVelocity = !1),
          s.angularVelocity
            ? ((o.hasAngularVelocity = !0),
              o.angularVelocity.copy(s.angularVelocity))
            : (o.hasAngularVelocity = !1),
          this.dispatchEvent(th)));
    }
    return (
      o !== null && (o.visible = s !== null),
      l !== null && (l.visible = r !== null),
      c !== null && (c.visible = a !== null),
      this
    );
  }
  _getHandJoint(t, e) {
    if (t.joints[e.jointName] === void 0) {
      const n = new $e();
      ((n.matrixAutoUpdate = !1),
        (n.visible = !1),
        (t.joints[e.jointName] = n),
        t.add(n));
    }
    return t.joints[e.jointName];
  }
}
class eh extends _e {
  constructor() {
    (super(),
      (this.isScene = !0),
      (this.type = "Scene"),
      (this.background = null),
      (this.environment = null),
      (this.fog = null),
      (this.backgroundBlurriness = 0),
      (this.backgroundIntensity = 1),
      (this.backgroundRotation = new rn()),
      (this.environmentIntensity = 1),
      (this.environmentRotation = new rn()),
      (this.overrideMaterial = null),
      typeof __THREE_DEVTOOLS__ < "u" &&
        __THREE_DEVTOOLS__.dispatchEvent(
          new CustomEvent("observe", { detail: this }),
        ));
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      t.background !== null && (this.background = t.background.clone()),
      t.environment !== null && (this.environment = t.environment.clone()),
      t.fog !== null && (this.fog = t.fog.clone()),
      (this.backgroundBlurriness = t.backgroundBlurriness),
      (this.backgroundIntensity = t.backgroundIntensity),
      this.backgroundRotation.copy(t.backgroundRotation),
      (this.environmentIntensity = t.environmentIntensity),
      this.environmentRotation.copy(t.environmentRotation),
      t.overrideMaterial !== null &&
        (this.overrideMaterial = t.overrideMaterial.clone()),
      (this.matrixAutoUpdate = t.matrixAutoUpdate),
      this
    );
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      this.fog !== null && (e.object.fog = this.fog.toJSON()),
      this.backgroundBlurriness > 0 &&
        (e.object.backgroundBlurriness = this.backgroundBlurriness),
      this.backgroundIntensity !== 1 &&
        (e.object.backgroundIntensity = this.backgroundIntensity),
      (e.object.backgroundRotation = this.backgroundRotation.toArray()),
      this.environmentIntensity !== 1 &&
        (e.object.environmentIntensity = this.environmentIntensity),
      (e.object.environmentRotation = this.environmentRotation.toArray()),
      e
    );
  }
}
class nh extends be {
  constructor(t = null, e = 1, n = 1, s, r, a, o, l, c = Te, u = Te, h, f) {
    (super(null, a, o, l, c, u, s, r, h, f),
      (this.isDataTexture = !0),
      (this.image = { data: t, width: e, height: n }),
      (this.generateMipmaps = !1),
      (this.flipY = !1),
      (this.unpackAlignment = 1));
  }
}
const js = new F(),
  ih = new F(),
  sh = new Nt();
class Tn {
  constructor(t = new F(1, 0, 0), e = 0) {
    ((this.isPlane = !0), (this.normal = t), (this.constant = e));
  }
  set(t, e) {
    return (this.normal.copy(t), (this.constant = e), this);
  }
  setComponents(t, e, n, s) {
    return (this.normal.set(t, e, n), (this.constant = s), this);
  }
  setFromNormalAndCoplanarPoint(t, e) {
    return (this.normal.copy(t), (this.constant = -e.dot(this.normal)), this);
  }
  setFromCoplanarPoints(t, e, n) {
    const s = js.subVectors(n, e).cross(ih.subVectors(t, e)).normalize();
    return (this.setFromNormalAndCoplanarPoint(s, t), this);
  }
  copy(t) {
    return (this.normal.copy(t.normal), (this.constant = t.constant), this);
  }
  normalize() {
    const t = 1 / this.normal.length();
    return (this.normal.multiplyScalar(t), (this.constant *= t), this);
  }
  negate() {
    return ((this.constant *= -1), this.normal.negate(), this);
  }
  distanceToPoint(t) {
    return this.normal.dot(t) + this.constant;
  }
  distanceToSphere(t) {
    return this.distanceToPoint(t.center) - t.radius;
  }
  projectPoint(t, e) {
    return e.copy(t).addScaledVector(this.normal, -this.distanceToPoint(t));
  }
  intersectLine(t, e) {
    const n = t.delta(js),
      s = this.normal.dot(n);
    if (s === 0)
      return this.distanceToPoint(t.start) === 0 ? e.copy(t.start) : null;
    const r = -(t.start.dot(this.normal) + this.constant) / s;
    return r < 0 || r > 1 ? null : e.copy(t.start).addScaledVector(n, r);
  }
  intersectsLine(t) {
    const e = this.distanceToPoint(t.start),
      n = this.distanceToPoint(t.end);
    return (e < 0 && n > 0) || (n < 0 && e > 0);
  }
  intersectsBox(t) {
    return t.intersectsPlane(this);
  }
  intersectsSphere(t) {
    return t.intersectsPlane(this);
  }
  coplanarPoint(t) {
    return t.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(t, e) {
    const n = e || sh.getNormalMatrix(t),
      s = this.coplanarPoint(js).applyMatrix4(t),
      r = this.normal.applyMatrix3(n).normalize();
    return ((this.constant = -s.dot(r)), this);
  }
  translate(t) {
    return ((this.constant -= t.dot(this.normal)), this);
  }
  equals(t) {
    return t.normal.equals(this.normal) && t.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Fn = new ia(),
  rh = new Pt(0.5, 0.5),
  ss = new F();
class ra {
  constructor(
    t = new Tn(),
    e = new Tn(),
    n = new Tn(),
    s = new Tn(),
    r = new Tn(),
    a = new Tn(),
  ) {
    this.planes = [t, e, n, s, r, a];
  }
  set(t, e, n, s, r, a) {
    const o = this.planes;
    return (
      o[0].copy(t),
      o[1].copy(e),
      o[2].copy(n),
      o[3].copy(s),
      o[4].copy(r),
      o[5].copy(a),
      this
    );
  }
  copy(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) e[n].copy(t.planes[n]);
    return this;
  }
  setFromProjectionMatrix(t, e = en, n = !1) {
    const s = this.planes,
      r = t.elements,
      a = r[0],
      o = r[1],
      l = r[2],
      c = r[3],
      u = r[4],
      h = r[5],
      f = r[6],
      p = r[7],
      _ = r[8],
      S = r[9],
      m = r[10],
      d = r[11],
      E = r[12],
      b = r[13],
      y = r[14],
      R = r[15];
    if (
      (s[0].setComponents(c - a, p - u, d - _, R - E).normalize(),
      s[1].setComponents(c + a, p + u, d + _, R + E).normalize(),
      s[2].setComponents(c + o, p + h, d + S, R + b).normalize(),
      s[3].setComponents(c - o, p - h, d - S, R - b).normalize(),
      n)
    )
      (s[4].setComponents(l, f, m, y).normalize(),
        s[5].setComponents(c - l, p - f, d - m, R - y).normalize());
    else if (
      (s[4].setComponents(c - l, p - f, d - m, R - y).normalize(), e === en)
    )
      s[5].setComponents(c + l, p + f, d + m, R + y).normalize();
    else if (e === ms) s[5].setComponents(l, f, m, y).normalize();
    else
      throw new Error(
        "THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " +
          e,
      );
    return this;
  }
  intersectsObject(t) {
    if (t.boundingSphere !== void 0)
      (t.boundingSphere === null && t.computeBoundingSphere(),
        Fn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld));
    else {
      const e = t.geometry;
      (e.boundingSphere === null && e.computeBoundingSphere(),
        Fn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld));
    }
    return this.intersectsSphere(Fn);
  }
  intersectsSprite(t) {
    Fn.center.set(0, 0, 0);
    const e = rh.distanceTo(t.center);
    return (
      (Fn.radius = 0.7071067811865476 + e),
      Fn.applyMatrix4(t.matrixWorld),
      this.intersectsSphere(Fn)
    );
  }
  intersectsSphere(t) {
    const e = this.planes,
      n = t.center,
      s = -t.radius;
    for (let r = 0; r < 6; r++) if (e[r].distanceToPoint(n) < s) return !1;
    return !0;
  }
  intersectsBox(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) {
      const s = e[n];
      if (
        ((ss.x = s.normal.x > 0 ? t.max.x : t.min.x),
        (ss.y = s.normal.y > 0 ? t.max.y : t.min.y),
        (ss.z = s.normal.z > 0 ? t.max.z : t.min.z),
        s.distanceToPoint(ss) < 0)
      )
        return !1;
    }
    return !0;
  }
  containsPoint(t) {
    const e = this.planes;
    for (let n = 0; n < 6; n++) if (e[n].distanceToPoint(t) < 0) return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class ah extends be {
  constructor(t, e, n, s, r, a, o, l, c) {
    (super(t, e, n, s, r, a, o, l, c),
      (this.isCanvasTexture = !0),
      (this.needsUpdate = !0));
  }
}
class Ko extends be {
  constructor(t, e, n = kn, s, r, a, o = Te, l = Te, c, u = Ii, h = 1) {
    if (u !== Ii && u !== Ni)
      throw new Error(
        "DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat",
      );
    const f = { width: t, height: e, depth: h };
    (super(f, s, r, a, o, l, u, n, c),
      (this.isDepthTexture = !0),
      (this.flipY = !1),
      (this.generateMipmaps = !1),
      (this.compareFunction = null));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.source = new na(Object.assign({}, t.image))),
      (this.compareFunction = t.compareFunction),
      this
    );
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      this.compareFunction !== null &&
        (e.compareFunction = this.compareFunction),
      e
    );
  }
}
class $o extends be {
  constructor(t = null) {
    (super(), (this.sourceTexture = t), (this.isExternalTexture = !0));
  }
  copy(t) {
    return (super.copy(t), (this.sourceTexture = t.sourceTexture), this);
  }
}
class aa extends ke {
  constructor(
    t = 1,
    e = 1,
    n = 1,
    s = 32,
    r = 1,
    a = !1,
    o = 0,
    l = Math.PI * 2,
  ) {
    (super(),
      (this.type = "CylinderGeometry"),
      (this.parameters = {
        radiusTop: t,
        radiusBottom: e,
        height: n,
        radialSegments: s,
        heightSegments: r,
        openEnded: a,
        thetaStart: o,
        thetaLength: l,
      }));
    const c = this;
    ((s = Math.floor(s)), (r = Math.floor(r)));
    const u = [],
      h = [],
      f = [],
      p = [];
    let _ = 0;
    const S = [],
      m = n / 2;
    let d = 0;
    (E(),
      a === !1 && (t > 0 && b(!0), e > 0 && b(!1)),
      this.setIndex(u),
      this.setAttribute("position", new ve(h, 3)),
      this.setAttribute("normal", new ve(f, 3)),
      this.setAttribute("uv", new ve(p, 2)));
    function E() {
      const y = new F(),
        R = new F();
      let T = 0;
      const w = (e - t) / n;
      for (let L = 0; L <= r; L++) {
        const M = [],
          g = L / r,
          D = g * (e - t) + t;
        for (let N = 0; N <= s; N++) {
          const V = N / s,
            W = V * l + o,
            k = Math.sin(W),
            q = Math.cos(W);
          ((R.x = D * k),
            (R.y = -g * n + m),
            (R.z = D * q),
            h.push(R.x, R.y, R.z),
            y.set(k, w, q).normalize(),
            f.push(y.x, y.y, y.z),
            p.push(V, 1 - g),
            M.push(_++));
        }
        S.push(M);
      }
      for (let L = 0; L < s; L++)
        for (let M = 0; M < r; M++) {
          const g = S[M][L],
            D = S[M + 1][L],
            N = S[M + 1][L + 1],
            V = S[M][L + 1];
          ((t > 0 || M !== 0) && (u.push(g, D, V), (T += 3)),
            (e > 0 || M !== r - 1) && (u.push(D, N, V), (T += 3)));
        }
      (c.addGroup(d, T, 0), (d += T));
    }
    function b(y) {
      const R = _,
        T = new Pt(),
        w = new F();
      let L = 0;
      const M = y === !0 ? t : e,
        g = y === !0 ? 1 : -1;
      for (let N = 1; N <= s; N++)
        (h.push(0, m * g, 0), f.push(0, g, 0), p.push(0.5, 0.5), _++);
      const D = _;
      for (let N = 0; N <= s; N++) {
        const W = (N / s) * l + o,
          k = Math.cos(W),
          q = Math.sin(W);
        ((w.x = M * q),
          (w.y = m * g),
          (w.z = M * k),
          h.push(w.x, w.y, w.z),
          f.push(0, g, 0),
          (T.x = k * 0.5 + 0.5),
          (T.y = q * 0.5 * g + 0.5),
          p.push(T.x, T.y),
          _++);
      }
      for (let N = 0; N < s; N++) {
        const V = R + N,
          W = D + N;
        (y === !0 ? u.push(W, W + 1, V) : u.push(W + 1, W, V), (L += 3));
      }
      (c.addGroup(d, L, y === !0 ? 1 : 2), (d += L));
    }
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new aa(
      t.radiusTop,
      t.radiusBottom,
      t.height,
      t.radialSegments,
      t.heightSegments,
      t.openEnded,
      t.thetaStart,
      t.thetaLength,
    );
  }
}
class oa extends ke {
  constructor(t = [], e = [], n = 1, s = 0) {
    (super(),
      (this.type = "PolyhedronGeometry"),
      (this.parameters = { vertices: t, indices: e, radius: n, detail: s }));
    const r = [],
      a = [];
    (o(s),
      c(n),
      u(),
      this.setAttribute("position", new ve(r, 3)),
      this.setAttribute("normal", new ve(r.slice(), 3)),
      this.setAttribute("uv", new ve(a, 2)),
      s === 0 ? this.computeVertexNormals() : this.normalizeNormals());
    function o(E) {
      const b = new F(),
        y = new F(),
        R = new F();
      for (let T = 0; T < e.length; T += 3)
        (p(e[T + 0], b), p(e[T + 1], y), p(e[T + 2], R), l(b, y, R, E));
    }
    function l(E, b, y, R) {
      const T = R + 1,
        w = [];
      for (let L = 0; L <= T; L++) {
        w[L] = [];
        const M = E.clone().lerp(y, L / T),
          g = b.clone().lerp(y, L / T),
          D = T - L;
        for (let N = 0; N <= D; N++)
          N === 0 && L === T
            ? (w[L][N] = M)
            : (w[L][N] = M.clone().lerp(g, N / D));
      }
      for (let L = 0; L < T; L++)
        for (let M = 0; M < 2 * (T - L) - 1; M++) {
          const g = Math.floor(M / 2);
          M % 2 === 0
            ? (f(w[L][g + 1]), f(w[L + 1][g]), f(w[L][g]))
            : (f(w[L][g + 1]), f(w[L + 1][g + 1]), f(w[L + 1][g]));
        }
    }
    function c(E) {
      const b = new F();
      for (let y = 0; y < r.length; y += 3)
        ((b.x = r[y + 0]),
          (b.y = r[y + 1]),
          (b.z = r[y + 2]),
          b.normalize().multiplyScalar(E),
          (r[y + 0] = b.x),
          (r[y + 1] = b.y),
          (r[y + 2] = b.z));
    }
    function u() {
      const E = new F();
      for (let b = 0; b < r.length; b += 3) {
        ((E.x = r[b + 0]), (E.y = r[b + 1]), (E.z = r[b + 2]));
        const y = m(E) / 2 / Math.PI + 0.5,
          R = d(E) / Math.PI + 0.5;
        a.push(y, 1 - R);
      }
      (_(), h());
    }
    function h() {
      for (let E = 0; E < a.length; E += 6) {
        const b = a[E + 0],
          y = a[E + 2],
          R = a[E + 4],
          T = Math.max(b, y, R),
          w = Math.min(b, y, R);
        T > 0.9 &&
          w < 0.1 &&
          (b < 0.2 && (a[E + 0] += 1),
          y < 0.2 && (a[E + 2] += 1),
          R < 0.2 && (a[E + 4] += 1));
      }
    }
    function f(E) {
      r.push(E.x, E.y, E.z);
    }
    function p(E, b) {
      const y = E * 3;
      ((b.x = t[y + 0]), (b.y = t[y + 1]), (b.z = t[y + 2]));
    }
    function _() {
      const E = new F(),
        b = new F(),
        y = new F(),
        R = new F(),
        T = new Pt(),
        w = new Pt(),
        L = new Pt();
      for (let M = 0, g = 0; M < r.length; M += 9, g += 6) {
        (E.set(r[M + 0], r[M + 1], r[M + 2]),
          b.set(r[M + 3], r[M + 4], r[M + 5]),
          y.set(r[M + 6], r[M + 7], r[M + 8]),
          T.set(a[g + 0], a[g + 1]),
          w.set(a[g + 2], a[g + 3]),
          L.set(a[g + 4], a[g + 5]),
          R.copy(E).add(b).add(y).divideScalar(3));
        const D = m(R);
        (S(T, g + 0, E, D), S(w, g + 2, b, D), S(L, g + 4, y, D));
      }
    }
    function S(E, b, y, R) {
      (R < 0 && E.x === 1 && (a[b] = E.x - 1),
        y.x === 0 && y.z === 0 && (a[b] = R / 2 / Math.PI + 0.5));
    }
    function m(E) {
      return Math.atan2(E.z, -E.x);
    }
    function d(E) {
      return Math.atan2(-E.y, Math.sqrt(E.x * E.x + E.z * E.z));
    }
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new oa(t.vertices, t.indices, t.radius, t.details);
  }
}
class ca extends oa {
  constructor(t = 1, e = 0) {
    const n = (1 + Math.sqrt(5)) / 2,
      s = [
        -1,
        n,
        0,
        1,
        n,
        0,
        -1,
        -n,
        0,
        1,
        -n,
        0,
        0,
        -1,
        n,
        0,
        1,
        n,
        0,
        -1,
        -n,
        0,
        1,
        -n,
        n,
        0,
        -1,
        n,
        0,
        1,
        -n,
        0,
        -1,
        -n,
        0,
        1,
      ],
      r = [
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11,
        10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
        4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1,
      ];
    (super(s, r, t, e),
      (this.type = "IcosahedronGeometry"),
      (this.parameters = { radius: t, detail: e }));
  }
  static fromJSON(t) {
    return new ca(t.radius, t.detail);
  }
}
class Mi extends ke {
  constructor(t = 1, e = 1, n = 1, s = 1) {
    (super(),
      (this.type = "PlaneGeometry"),
      (this.parameters = {
        width: t,
        height: e,
        widthSegments: n,
        heightSegments: s,
      }));
    const r = t / 2,
      a = e / 2,
      o = Math.floor(n),
      l = Math.floor(s),
      c = o + 1,
      u = l + 1,
      h = t / o,
      f = e / l,
      p = [],
      _ = [],
      S = [],
      m = [];
    for (let d = 0; d < u; d++) {
      const E = d * f - a;
      for (let b = 0; b < c; b++) {
        const y = b * h - r;
        (_.push(y, -E, 0), S.push(0, 0, 1), m.push(b / o), m.push(1 - d / l));
      }
    }
    for (let d = 0; d < l; d++)
      for (let E = 0; E < o; E++) {
        const b = E + c * d,
          y = E + c * (d + 1),
          R = E + 1 + c * (d + 1),
          T = E + 1 + c * d;
        (p.push(b, y, T), p.push(y, R, T));
      }
    (this.setIndex(p),
      this.setAttribute("position", new ve(_, 3)),
      this.setAttribute("normal", new ve(S, 3)),
      this.setAttribute("uv", new ve(m, 2)));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new Mi(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}
class la extends ke {
  constructor(t = 1, e = 0.4, n = 12, s = 48, r = Math.PI * 2) {
    (super(),
      (this.type = "TorusGeometry"),
      (this.parameters = {
        radius: t,
        tube: e,
        radialSegments: n,
        tubularSegments: s,
        arc: r,
      }),
      (n = Math.floor(n)),
      (s = Math.floor(s)));
    const a = [],
      o = [],
      l = [],
      c = [],
      u = new F(),
      h = new F(),
      f = new F();
    for (let p = 0; p <= n; p++)
      for (let _ = 0; _ <= s; _++) {
        const S = (_ / s) * r,
          m = (p / n) * Math.PI * 2;
        ((h.x = (t + e * Math.cos(m)) * Math.cos(S)),
          (h.y = (t + e * Math.cos(m)) * Math.sin(S)),
          (h.z = e * Math.sin(m)),
          o.push(h.x, h.y, h.z),
          (u.x = t * Math.cos(S)),
          (u.y = t * Math.sin(S)),
          f.subVectors(h, u).normalize(),
          l.push(f.x, f.y, f.z),
          c.push(_ / s),
          c.push(p / n));
      }
    for (let p = 1; p <= n; p++)
      for (let _ = 1; _ <= s; _++) {
        const S = (s + 1) * p + _ - 1,
          m = (s + 1) * (p - 1) + _ - 1,
          d = (s + 1) * (p - 1) + _,
          E = (s + 1) * p + _;
        (a.push(S, m, E), a.push(m, d, E));
      }
    (this.setIndex(a),
      this.setAttribute("position", new ve(o, 3)),
      this.setAttribute("normal", new ve(l, 3)),
      this.setAttribute("uv", new ve(c, 2)));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.parameters = Object.assign({}, t.parameters)),
      this
    );
  }
  static fromJSON(t) {
    return new la(t.radius, t.tube, t.radialSegments, t.tubularSegments, t.arc);
  }
}
class ha extends Bi {
  constructor(t) {
    (super(),
      (this.isMeshStandardMaterial = !0),
      (this.type = "MeshStandardMaterial"),
      (this.defines = { STANDARD: "" }),
      (this.color = new Yt(16777215)),
      (this.roughness = 1),
      (this.metalness = 0),
      (this.map = null),
      (this.lightMap = null),
      (this.lightMapIntensity = 1),
      (this.aoMap = null),
      (this.aoMapIntensity = 1),
      (this.emissive = new Yt(0)),
      (this.emissiveIntensity = 1),
      (this.emissiveMap = null),
      (this.bumpMap = null),
      (this.bumpScale = 1),
      (this.normalMap = null),
      (this.normalMapType = Oo),
      (this.normalScale = new Pt(1, 1)),
      (this.displacementMap = null),
      (this.displacementScale = 1),
      (this.displacementBias = 0),
      (this.roughnessMap = null),
      (this.metalnessMap = null),
      (this.alphaMap = null),
      (this.envMap = null),
      (this.envMapRotation = new rn()),
      (this.envMapIntensity = 1),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      (this.wireframeLinecap = "round"),
      (this.wireframeLinejoin = "round"),
      (this.flatShading = !1),
      (this.fog = !0),
      this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.defines = { STANDARD: "" }),
      this.color.copy(t.color),
      (this.roughness = t.roughness),
      (this.metalness = t.metalness),
      (this.map = t.map),
      (this.lightMap = t.lightMap),
      (this.lightMapIntensity = t.lightMapIntensity),
      (this.aoMap = t.aoMap),
      (this.aoMapIntensity = t.aoMapIntensity),
      this.emissive.copy(t.emissive),
      (this.emissiveMap = t.emissiveMap),
      (this.emissiveIntensity = t.emissiveIntensity),
      (this.bumpMap = t.bumpMap),
      (this.bumpScale = t.bumpScale),
      (this.normalMap = t.normalMap),
      (this.normalMapType = t.normalMapType),
      this.normalScale.copy(t.normalScale),
      (this.displacementMap = t.displacementMap),
      (this.displacementScale = t.displacementScale),
      (this.displacementBias = t.displacementBias),
      (this.roughnessMap = t.roughnessMap),
      (this.metalnessMap = t.metalnessMap),
      (this.alphaMap = t.alphaMap),
      (this.envMap = t.envMap),
      this.envMapRotation.copy(t.envMapRotation),
      (this.envMapIntensity = t.envMapIntensity),
      (this.wireframe = t.wireframe),
      (this.wireframeLinewidth = t.wireframeLinewidth),
      (this.wireframeLinecap = t.wireframeLinecap),
      (this.wireframeLinejoin = t.wireframeLinejoin),
      (this.flatShading = t.flatShading),
      (this.fog = t.fog),
      this
    );
  }
}
class oh extends Bi {
  constructor(t) {
    (super(),
      (this.isMeshDepthMaterial = !0),
      (this.type = "MeshDepthMaterial"),
      (this.depthPacking = _l),
      (this.map = null),
      (this.alphaMap = null),
      (this.displacementMap = null),
      (this.displacementScale = 1),
      (this.displacementBias = 0),
      (this.wireframe = !1),
      (this.wireframeLinewidth = 1),
      this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.depthPacking = t.depthPacking),
      (this.map = t.map),
      (this.alphaMap = t.alphaMap),
      (this.displacementMap = t.displacementMap),
      (this.displacementScale = t.displacementScale),
      (this.displacementBias = t.displacementBias),
      (this.wireframe = t.wireframe),
      (this.wireframeLinewidth = t.wireframeLinewidth),
      this
    );
  }
}
class ch extends Bi {
  constructor(t) {
    (super(),
      (this.isMeshDistanceMaterial = !0),
      (this.type = "MeshDistanceMaterial"),
      (this.map = null),
      (this.alphaMap = null),
      (this.displacementMap = null),
      (this.displacementScale = 1),
      (this.displacementBias = 0),
      this.setValues(t));
  }
  copy(t) {
    return (
      super.copy(t),
      (this.map = t.map),
      (this.alphaMap = t.alphaMap),
      (this.displacementMap = t.displacementMap),
      (this.displacementScale = t.displacementScale),
      (this.displacementBias = t.displacementBias),
      this
    );
  }
}
class Zo extends _e {
  constructor(t, e = 1) {
    (super(),
      (this.isLight = !0),
      (this.type = "Light"),
      (this.color = new Yt(t)),
      (this.intensity = e));
  }
  dispose() {}
  copy(t, e) {
    return (
      super.copy(t, e),
      this.color.copy(t.color),
      (this.intensity = t.intensity),
      this
    );
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      (e.object.color = this.color.getHex()),
      (e.object.intensity = this.intensity),
      this.groundColor !== void 0 &&
        (e.object.groundColor = this.groundColor.getHex()),
      this.distance !== void 0 && (e.object.distance = this.distance),
      this.angle !== void 0 && (e.object.angle = this.angle),
      this.decay !== void 0 && (e.object.decay = this.decay),
      this.penumbra !== void 0 && (e.object.penumbra = this.penumbra),
      this.shadow !== void 0 && (e.object.shadow = this.shadow.toJSON()),
      this.target !== void 0 && (e.object.target = this.target.uuid),
      e
    );
  }
}
const Ks = new ue(),
  Ya = new F(),
  qa = new F();
class lh {
  constructor(t) {
    ((this.camera = t),
      (this.intensity = 1),
      (this.bias = 0),
      (this.normalBias = 0),
      (this.radius = 1),
      (this.blurSamples = 8),
      (this.mapSize = new Pt(512, 512)),
      (this.mapType = sn),
      (this.map = null),
      (this.mapPass = null),
      (this.matrix = new ue()),
      (this.autoUpdate = !0),
      (this.needsUpdate = !1),
      (this._frustum = new ra()),
      (this._frameExtents = new Pt(1, 1)),
      (this._viewportCount = 1),
      (this._viewports = [new le(0, 0, 1, 1)]));
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(t) {
    const e = this.camera,
      n = this.matrix;
    (Ya.setFromMatrixPosition(t.matrixWorld),
      e.position.copy(Ya),
      qa.setFromMatrixPosition(t.target.matrixWorld),
      e.lookAt(qa),
      e.updateMatrixWorld(),
      Ks.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse),
      this._frustum.setFromProjectionMatrix(
        Ks,
        e.coordinateSystem,
        e.reversedDepth,
      ),
      e.reversedDepth
        ? n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0, 0, 1)
        : n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1),
      n.multiply(Ks));
  }
  getViewport(t) {
    return this._viewports[t];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    (this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose());
  }
  copy(t) {
    return (
      (this.camera = t.camera.clone()),
      (this.intensity = t.intensity),
      (this.bias = t.bias),
      (this.radius = t.radius),
      (this.autoUpdate = t.autoUpdate),
      (this.needsUpdate = t.needsUpdate),
      (this.normalBias = t.normalBias),
      (this.blurSamples = t.blurSamples),
      this.mapSize.copy(t.mapSize),
      this
    );
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const t = {};
    return (
      this.intensity !== 1 && (t.intensity = this.intensity),
      this.bias !== 0 && (t.bias = this.bias),
      this.normalBias !== 0 && (t.normalBias = this.normalBias),
      this.radius !== 1 && (t.radius = this.radius),
      (this.mapSize.x !== 512 || this.mapSize.y !== 512) &&
        (t.mapSize = this.mapSize.toArray()),
      (t.camera = this.camera.toJSON(!1).object),
      delete t.camera.matrix,
      t
    );
  }
}
class Jo extends qo {
  constructor(t = -1, e = 1, n = 1, s = -1, r = 0.1, a = 2e3) {
    (super(),
      (this.isOrthographicCamera = !0),
      (this.type = "OrthographicCamera"),
      (this.zoom = 1),
      (this.view = null),
      (this.left = t),
      (this.right = e),
      (this.top = n),
      (this.bottom = s),
      (this.near = r),
      (this.far = a),
      this.updateProjectionMatrix());
  }
  copy(t, e) {
    return (
      super.copy(t, e),
      (this.left = t.left),
      (this.right = t.right),
      (this.top = t.top),
      (this.bottom = t.bottom),
      (this.near = t.near),
      (this.far = t.far),
      (this.zoom = t.zoom),
      (this.view = t.view === null ? null : Object.assign({}, t.view)),
      this
    );
  }
  setViewOffset(t, e, n, s, r, a) {
    (this.view === null &&
      (this.view = {
        enabled: !0,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1,
      }),
      (this.view.enabled = !0),
      (this.view.fullWidth = t),
      (this.view.fullHeight = e),
      (this.view.offsetX = n),
      (this.view.offsetY = s),
      (this.view.width = r),
      (this.view.height = a),
      this.updateProjectionMatrix());
  }
  clearViewOffset() {
    (this.view !== null && (this.view.enabled = !1),
      this.updateProjectionMatrix());
  }
  updateProjectionMatrix() {
    const t = (this.right - this.left) / (2 * this.zoom),
      e = (this.top - this.bottom) / (2 * this.zoom),
      n = (this.right + this.left) / 2,
      s = (this.top + this.bottom) / 2;
    let r = n - t,
      a = n + t,
      o = s + e,
      l = s - e;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom,
        u = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      ((r += c * this.view.offsetX),
        (a = r + c * this.view.width),
        (o -= u * this.view.offsetY),
        (l = o - u * this.view.height));
    }
    (this.projectionMatrix.makeOrthographic(
      r,
      a,
      o,
      l,
      this.near,
      this.far,
      this.coordinateSystem,
      this.reversedDepth,
    ),
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert());
  }
  toJSON(t) {
    const e = super.toJSON(t);
    return (
      (e.object.zoom = this.zoom),
      (e.object.left = this.left),
      (e.object.right = this.right),
      (e.object.top = this.top),
      (e.object.bottom = this.bottom),
      (e.object.near = this.near),
      (e.object.far = this.far),
      this.view !== null && (e.object.view = Object.assign({}, this.view)),
      e
    );
  }
}
class hh extends lh {
  constructor() {
    (super(new Jo(-5, 5, 5, -5, 0.5, 500)),
      (this.isDirectionalLightShadow = !0));
  }
}
class ja extends Zo {
  constructor(t, e) {
    (super(t, e),
      (this.isDirectionalLight = !0),
      (this.type = "DirectionalLight"),
      this.position.copy(_e.DEFAULT_UP),
      this.updateMatrix(),
      (this.target = new _e()),
      (this.shadow = new hh()));
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(t) {
    return (
      super.copy(t),
      (this.target = t.target.clone()),
      (this.shadow = t.shadow.clone()),
      this
    );
  }
}
class uh extends Zo {
  constructor(t, e) {
    (super(t, e), (this.isAmbientLight = !0), (this.type = "AmbientLight"));
  }
}
class dh extends Ge {
  constructor(t = []) {
    (super(),
      (this.isArrayCamera = !0),
      (this.isMultiViewCamera = !1),
      (this.cameras = t));
  }
}
class Ka {
  constructor(t = 1, e = 0, n = 0) {
    ((this.radius = t), (this.phi = e), (this.theta = n));
  }
  set(t, e, n) {
    return ((this.radius = t), (this.phi = e), (this.theta = n), this);
  }
  copy(t) {
    return (
      (this.radius = t.radius),
      (this.phi = t.phi),
      (this.theta = t.theta),
      this
    );
  }
  makeSafe() {
    return ((this.phi = Bt(this.phi, 1e-6, Math.PI - 1e-6)), this);
  }
  setFromVector3(t) {
    return this.setFromCartesianCoords(t.x, t.y, t.z);
  }
  setFromCartesianCoords(t, e, n) {
    return (
      (this.radius = Math.sqrt(t * t + e * e + n * n)),
      this.radius === 0
        ? ((this.theta = 0), (this.phi = 0))
        : ((this.theta = Math.atan2(t, n)),
          (this.phi = Math.acos(Bt(e / this.radius, -1, 1)))),
      this
    );
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class fh extends Yn {
  constructor(t, e = null) {
    (super(),
      (this.object = t),
      (this.domElement = e),
      (this.enabled = !0),
      (this.state = -1),
      (this.keys = {}),
      (this.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null }),
      (this.touches = { ONE: null, TWO: null }));
  }
  connect(t) {
    if (t === void 0) {
      Ut("Controls: connect() now requires an element.");
      return;
    }
    (this.domElement !== null && this.disconnect(), (this.domElement = t));
  }
  disconnect() {}
  dispose() {}
  update() {}
}
function $a(i, t, e, n) {
  const s = ph(n);
  switch (e) {
    case Io:
      return i * t;
    case Fo:
      return ((i * t) / s.components) * s.byteLength;
    case Jr:
      return ((i * t) / s.components) * s.byteLength;
    case Qr:
      return ((i * t * 2) / s.components) * s.byteLength;
    case ta:
      return ((i * t * 2) / s.components) * s.byteLength;
    case No:
      return ((i * t * 3) / s.components) * s.byteLength;
    case Ke:
      return ((i * t * 4) / s.components) * s.byteLength;
    case ea:
      return ((i * t * 4) / s.components) * s.byteLength;
    case cs:
    case ls:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case hs:
    case us:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case gr:
    case Mr:
      return (Math.max(i, 16) * Math.max(t, 8)) / 4;
    case _r:
    case vr:
      return (Math.max(i, 8) * Math.max(t, 8)) / 2;
    case Sr:
    case br:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Er:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case yr:
      return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Tr:
      return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case Ar:
      return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case wr:
      return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case Rr:
      return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case Cr:
      return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case Pr:
      return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case Dr:
      return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case Lr:
      return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case Ur:
      return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case Ir:
      return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case Nr:
      return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case Fr:
      return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case Or:
      return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case Br:
    case zr:
    case Vr:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
    case Gr:
    case Hr:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
    case kr:
    case Wr:
      return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${e} format.`);
}
function ph(i) {
  switch (i) {
    case sn:
    case Po:
      return { byteLength: 1, components: 1 };
    case Li:
    case Do:
    case _i:
      return { byteLength: 2, components: 1 };
    case $r:
    case Zr:
      return { byteLength: 2, components: 4 };
    case kn:
    case Kr:
    case pn:
      return { byteLength: 4, components: 1 };
    case Lo:
    case Uo:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${i}.`);
}
typeof __THREE_DEVTOOLS__ < "u" &&
  __THREE_DEVTOOLS__.dispatchEvent(
    new CustomEvent("register", { detail: { revision: jr } }),
  );
typeof window < "u" &&
  (window.__THREE__
    ? Ut("WARNING: Multiple instances of Three.js being imported.")
    : (window.__THREE__ = jr));
/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */ function Qo() {
  let i = null,
    t = !1,
    e = null,
    n = null;
  function s(r, a) {
    (e(r, a), (n = i.requestAnimationFrame(s)));
  }
  return {
    start: function () {
      t !== !0 && e !== null && ((n = i.requestAnimationFrame(s)), (t = !0));
    },
    stop: function () {
      (i.cancelAnimationFrame(n), (t = !1));
    },
    setAnimationLoop: function (r) {
      e = r;
    },
    setContext: function (r) {
      i = r;
    },
  };
}
function mh(i) {
  const t = new WeakMap();
  function e(o, l) {
    const c = o.array,
      u = o.usage,
      h = c.byteLength,
      f = i.createBuffer();
    (i.bindBuffer(l, f), i.bufferData(l, c, u), o.onUploadCallback());
    let p;
    if (c instanceof Float32Array) p = i.FLOAT;
    else if (typeof Float16Array < "u" && c instanceof Float16Array)
      p = i.HALF_FLOAT;
    else if (c instanceof Uint16Array)
      o.isFloat16BufferAttribute ? (p = i.HALF_FLOAT) : (p = i.UNSIGNED_SHORT);
    else if (c instanceof Int16Array) p = i.SHORT;
    else if (c instanceof Uint32Array) p = i.UNSIGNED_INT;
    else if (c instanceof Int32Array) p = i.INT;
    else if (c instanceof Int8Array) p = i.BYTE;
    else if (c instanceof Uint8Array) p = i.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray) p = i.UNSIGNED_BYTE;
    else
      throw new Error(
        "THREE.WebGLAttributes: Unsupported buffer data format: " + c,
      );
    return {
      buffer: f,
      type: p,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: o.version,
      size: h,
    };
  }
  function n(o, l, c) {
    const u = l.array,
      h = l.updateRanges;
    if ((i.bindBuffer(c, o), h.length === 0)) i.bufferSubData(c, 0, u);
    else {
      h.sort((p, _) => p.start - _.start);
      let f = 0;
      for (let p = 1; p < h.length; p++) {
        const _ = h[f],
          S = h[p];
        S.start <= _.start + _.count + 1
          ? (_.count = Math.max(_.count, S.start + S.count - _.start))
          : (++f, (h[f] = S));
      }
      h.length = f + 1;
      for (let p = 0, _ = h.length; p < _; p++) {
        const S = h[p];
        i.bufferSubData(c, S.start * u.BYTES_PER_ELEMENT, u, S.start, S.count);
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function s(o) {
    return (o.isInterleavedBufferAttribute && (o = o.data), t.get(o));
  }
  function r(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = t.get(o);
    l && (i.deleteBuffer(l.buffer), t.delete(o));
  }
  function a(o, l) {
    if (
      (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute)
    ) {
      const u = t.get(o);
      (!u || u.version < o.version) &&
        t.set(o, {
          buffer: o.buffer,
          type: o.type,
          bytesPerElement: o.elementSize,
          version: o.version,
        });
      return;
    }
    const c = t.get(o);
    if (c === void 0) t.set(o, e(o, l));
    else if (c.version < o.version) {
      if (c.size !== o.array.byteLength)
        throw new Error(
          "THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.",
        );
      (n(c.buffer, o, l), (c.version = o.version));
    }
  }
  return { get: s, remove: r, update: a };
}
var xh = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,
  _h = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,
  gh = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,
  vh = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  Mh = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,
  Sh = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
  bh = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
  Eh = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
  yh = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,
  Th = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,
  Ah = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,
  wh = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
  Rh = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,
  Ch = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
  Ph = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
  Dh = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,
  Lh = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
  Uh = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
  Ih = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
  Nh = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
  Fh = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
  Oh = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,
  Bh = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,
  zh = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,
  Vh = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
  Gh = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
  Hh = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
  kh = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,
  Wh = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
  Xh = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
  Yh = "gl_FragColor = linearToOutputTexel( gl_FragColor );",
  qh = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
  jh = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
  Kh = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,
  $h = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
  Zh = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
  Jh = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
  Qh = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
  tu = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
  eu = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
  nu = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
  iu = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
  su = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
  ru = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
  au = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
  ou = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
  cu = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,
  lu = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
  hu = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
  uu = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
  du = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
  fu = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,
  pu = `uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 uv = vec2( roughness, dotNV );
	return texture2D( dfgLUT, uv ).rg;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNV * dotNV), 0.0, dotNV), material.roughness );
	vec2 dfgL = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNL * dotNL), 0.0, dotNL), material.roughness );
	vec3 FssEss_V = material.specularColor * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColor * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColor + ( 1.0 - material.specularColor ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
  mu = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
  xu = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
  _u = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,
  gu = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
  vu = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  Mu = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  Su = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,
  bu = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
  Eu = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
  yu = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
  Tu = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  Au = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
  wu = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
  Ru = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,
  Cu = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
  Pu = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  Du = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,
  Lu = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  Uu = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,
  Iu = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
  Nu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  Fu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  Ou = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
  Bu = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,
  zu = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,
  Vu = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,
  Gu = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,
  Hu = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
  ku = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
  Wu = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,
  Xu = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
  Yu = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
  qu = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
  ju = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
  Ku = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
  $u = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
  Zu = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,
  Ju = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
  Qu = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
  td = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
  ed = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
  nd = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,
  id = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
  sd = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
  rd = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
  ad = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
  od = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
  cd = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
  ld = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,
  hd = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,
  ud = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  dd = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  fd = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,
  pd = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const md = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
  xd = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  _d = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  gd = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  vd = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  Md = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  Sd = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
  bd = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,
  Ed = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
  yd = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
  Td = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
  Ad = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  wd = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  Rd = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  Cd = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
  Pd = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Dd = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Ld = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Ud = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
  Id = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Nd = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
  Fd = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
  Od = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Bd = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  zd = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
  Vd = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Gd = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Hd = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  kd = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
  Wd = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  Xd = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Yd = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  qd = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  jd = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  Ft = {
    alphahash_fragment: xh,
    alphahash_pars_fragment: _h,
    alphamap_fragment: gh,
    alphamap_pars_fragment: vh,
    alphatest_fragment: Mh,
    alphatest_pars_fragment: Sh,
    aomap_fragment: bh,
    aomap_pars_fragment: Eh,
    batching_pars_vertex: yh,
    batching_vertex: Th,
    begin_vertex: Ah,
    beginnormal_vertex: wh,
    bsdfs: Rh,
    iridescence_fragment: Ch,
    bumpmap_pars_fragment: Ph,
    clipping_planes_fragment: Dh,
    clipping_planes_pars_fragment: Lh,
    clipping_planes_pars_vertex: Uh,
    clipping_planes_vertex: Ih,
    color_fragment: Nh,
    color_pars_fragment: Fh,
    color_pars_vertex: Oh,
    color_vertex: Bh,
    common: zh,
    cube_uv_reflection_fragment: Vh,
    defaultnormal_vertex: Gh,
    displacementmap_pars_vertex: Hh,
    displacementmap_vertex: kh,
    emissivemap_fragment: Wh,
    emissivemap_pars_fragment: Xh,
    colorspace_fragment: Yh,
    colorspace_pars_fragment: qh,
    envmap_fragment: jh,
    envmap_common_pars_fragment: Kh,
    envmap_pars_fragment: $h,
    envmap_pars_vertex: Zh,
    envmap_physical_pars_fragment: cu,
    envmap_vertex: Jh,
    fog_vertex: Qh,
    fog_pars_vertex: tu,
    fog_fragment: eu,
    fog_pars_fragment: nu,
    gradientmap_pars_fragment: iu,
    lightmap_pars_fragment: su,
    lights_lambert_fragment: ru,
    lights_lambert_pars_fragment: au,
    lights_pars_begin: ou,
    lights_toon_fragment: lu,
    lights_toon_pars_fragment: hu,
    lights_phong_fragment: uu,
    lights_phong_pars_fragment: du,
    lights_physical_fragment: fu,
    lights_physical_pars_fragment: pu,
    lights_fragment_begin: mu,
    lights_fragment_maps: xu,
    lights_fragment_end: _u,
    logdepthbuf_fragment: gu,
    logdepthbuf_pars_fragment: vu,
    logdepthbuf_pars_vertex: Mu,
    logdepthbuf_vertex: Su,
    map_fragment: bu,
    map_pars_fragment: Eu,
    map_particle_fragment: yu,
    map_particle_pars_fragment: Tu,
    metalnessmap_fragment: Au,
    metalnessmap_pars_fragment: wu,
    morphinstance_vertex: Ru,
    morphcolor_vertex: Cu,
    morphnormal_vertex: Pu,
    morphtarget_pars_vertex: Du,
    morphtarget_vertex: Lu,
    normal_fragment_begin: Uu,
    normal_fragment_maps: Iu,
    normal_pars_fragment: Nu,
    normal_pars_vertex: Fu,
    normal_vertex: Ou,
    normalmap_pars_fragment: Bu,
    clearcoat_normal_fragment_begin: zu,
    clearcoat_normal_fragment_maps: Vu,
    clearcoat_pars_fragment: Gu,
    iridescence_pars_fragment: Hu,
    opaque_fragment: ku,
    packing: Wu,
    premultiplied_alpha_fragment: Xu,
    project_vertex: Yu,
    dithering_fragment: qu,
    dithering_pars_fragment: ju,
    roughnessmap_fragment: Ku,
    roughnessmap_pars_fragment: $u,
    shadowmap_pars_fragment: Zu,
    shadowmap_pars_vertex: Ju,
    shadowmap_vertex: Qu,
    shadowmask_pars_fragment: td,
    skinbase_vertex: ed,
    skinning_pars_vertex: nd,
    skinning_vertex: id,
    skinnormal_vertex: sd,
    specularmap_fragment: rd,
    specularmap_pars_fragment: ad,
    tonemapping_fragment: od,
    tonemapping_pars_fragment: cd,
    transmission_fragment: ld,
    transmission_pars_fragment: hd,
    uv_pars_fragment: ud,
    uv_pars_vertex: dd,
    uv_vertex: fd,
    worldpos_vertex: pd,
    background_vert: md,
    background_frag: xd,
    backgroundCube_vert: _d,
    backgroundCube_frag: gd,
    cube_vert: vd,
    cube_frag: Md,
    depth_vert: Sd,
    depth_frag: bd,
    distanceRGBA_vert: Ed,
    distanceRGBA_frag: yd,
    equirect_vert: Td,
    equirect_frag: Ad,
    linedashed_vert: wd,
    linedashed_frag: Rd,
    meshbasic_vert: Cd,
    meshbasic_frag: Pd,
    meshlambert_vert: Dd,
    meshlambert_frag: Ld,
    meshmatcap_vert: Ud,
    meshmatcap_frag: Id,
    meshnormal_vert: Nd,
    meshnormal_frag: Fd,
    meshphong_vert: Od,
    meshphong_frag: Bd,
    meshphysical_vert: zd,
    meshphysical_frag: Vd,
    meshtoon_vert: Gd,
    meshtoon_frag: Hd,
    points_vert: kd,
    points_frag: Wd,
    shadow_vert: Xd,
    shadow_frag: Yd,
    sprite_vert: qd,
    sprite_frag: jd,
  },
  at = {
    common: {
      diffuse: { value: new Yt(16777215) },
      opacity: { value: 1 },
      map: { value: null },
      mapTransform: { value: new Nt() },
      alphaMap: { value: null },
      alphaMapTransform: { value: new Nt() },
      alphaTest: { value: 0 },
    },
    specularmap: {
      specularMap: { value: null },
      specularMapTransform: { value: new Nt() },
    },
    envmap: {
      envMap: { value: null },
      envMapRotation: { value: new Nt() },
      flipEnvMap: { value: -1 },
      reflectivity: { value: 1 },
      ior: { value: 1.5 },
      refractionRatio: { value: 0.98 },
      dfgLUT: { value: null },
    },
    aomap: {
      aoMap: { value: null },
      aoMapIntensity: { value: 1 },
      aoMapTransform: { value: new Nt() },
    },
    lightmap: {
      lightMap: { value: null },
      lightMapIntensity: { value: 1 },
      lightMapTransform: { value: new Nt() },
    },
    bumpmap: {
      bumpMap: { value: null },
      bumpMapTransform: { value: new Nt() },
      bumpScale: { value: 1 },
    },
    normalmap: {
      normalMap: { value: null },
      normalMapTransform: { value: new Nt() },
      normalScale: { value: new Pt(1, 1) },
    },
    displacementmap: {
      displacementMap: { value: null },
      displacementMapTransform: { value: new Nt() },
      displacementScale: { value: 1 },
      displacementBias: { value: 0 },
    },
    emissivemap: {
      emissiveMap: { value: null },
      emissiveMapTransform: { value: new Nt() },
    },
    metalnessmap: {
      metalnessMap: { value: null },
      metalnessMapTransform: { value: new Nt() },
    },
    roughnessmap: {
      roughnessMap: { value: null },
      roughnessMapTransform: { value: new Nt() },
    },
    gradientmap: { gradientMap: { value: null } },
    fog: {
      fogDensity: { value: 25e-5 },
      fogNear: { value: 1 },
      fogFar: { value: 2e3 },
      fogColor: { value: new Yt(16777215) },
    },
    lights: {
      ambientLightColor: { value: [] },
      lightProbe: { value: [] },
      directionalLights: {
        value: [],
        properties: { direction: {}, color: {} },
      },
      directionalLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
        },
      },
      directionalShadowMap: { value: [] },
      directionalShadowMatrix: { value: [] },
      spotLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          direction: {},
          distance: {},
          coneCos: {},
          penumbraCos: {},
          decay: {},
        },
      },
      spotLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
        },
      },
      spotLightMap: { value: [] },
      spotShadowMap: { value: [] },
      spotLightMatrix: { value: [] },
      pointLights: {
        value: [],
        properties: { color: {}, position: {}, decay: {}, distance: {} },
      },
      pointLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
          shadowCameraNear: {},
          shadowCameraFar: {},
        },
      },
      pointShadowMap: { value: [] },
      pointShadowMatrix: { value: [] },
      hemisphereLights: {
        value: [],
        properties: { direction: {}, skyColor: {}, groundColor: {} },
      },
      rectAreaLights: {
        value: [],
        properties: { color: {}, position: {}, width: {}, height: {} },
      },
      ltc_1: { value: null },
      ltc_2: { value: null },
    },
    points: {
      diffuse: { value: new Yt(16777215) },
      opacity: { value: 1 },
      size: { value: 1 },
      scale: { value: 1 },
      map: { value: null },
      alphaMap: { value: null },
      alphaMapTransform: { value: new Nt() },
      alphaTest: { value: 0 },
      uvTransform: { value: new Nt() },
    },
    sprite: {
      diffuse: { value: new Yt(16777215) },
      opacity: { value: 1 },
      center: { value: new Pt(0.5, 0.5) },
      rotation: { value: 0 },
      map: { value: null },
      mapTransform: { value: new Nt() },
      alphaMap: { value: null },
      alphaMapTransform: { value: new Nt() },
      alphaTest: { value: 0 },
    },
  },
  Qe = {
    basic: {
      uniforms: ye([
        at.common,
        at.specularmap,
        at.envmap,
        at.aomap,
        at.lightmap,
        at.fog,
      ]),
      vertexShader: Ft.meshbasic_vert,
      fragmentShader: Ft.meshbasic_frag,
    },
    lambert: {
      uniforms: ye([
        at.common,
        at.specularmap,
        at.envmap,
        at.aomap,
        at.lightmap,
        at.emissivemap,
        at.bumpmap,
        at.normalmap,
        at.displacementmap,
        at.fog,
        at.lights,
        { emissive: { value: new Yt(0) } },
      ]),
      vertexShader: Ft.meshlambert_vert,
      fragmentShader: Ft.meshlambert_frag,
    },
    phong: {
      uniforms: ye([
        at.common,
        at.specularmap,
        at.envmap,
        at.aomap,
        at.lightmap,
        at.emissivemap,
        at.bumpmap,
        at.normalmap,
        at.displacementmap,
        at.fog,
        at.lights,
        {
          emissive: { value: new Yt(0) },
          specular: { value: new Yt(1118481) },
          shininess: { value: 30 },
        },
      ]),
      vertexShader: Ft.meshphong_vert,
      fragmentShader: Ft.meshphong_frag,
    },
    standard: {
      uniforms: ye([
        at.common,
        at.envmap,
        at.aomap,
        at.lightmap,
        at.emissivemap,
        at.bumpmap,
        at.normalmap,
        at.displacementmap,
        at.roughnessmap,
        at.metalnessmap,
        at.fog,
        at.lights,
        {
          emissive: { value: new Yt(0) },
          roughness: { value: 1 },
          metalness: { value: 0 },
          envMapIntensity: { value: 1 },
        },
      ]),
      vertexShader: Ft.meshphysical_vert,
      fragmentShader: Ft.meshphysical_frag,
    },
    toon: {
      uniforms: ye([
        at.common,
        at.aomap,
        at.lightmap,
        at.emissivemap,
        at.bumpmap,
        at.normalmap,
        at.displacementmap,
        at.gradientmap,
        at.fog,
        at.lights,
        { emissive: { value: new Yt(0) } },
      ]),
      vertexShader: Ft.meshtoon_vert,
      fragmentShader: Ft.meshtoon_frag,
    },
    matcap: {
      uniforms: ye([
        at.common,
        at.bumpmap,
        at.normalmap,
        at.displacementmap,
        at.fog,
        { matcap: { value: null } },
      ]),
      vertexShader: Ft.meshmatcap_vert,
      fragmentShader: Ft.meshmatcap_frag,
    },
    points: {
      uniforms: ye([at.points, at.fog]),
      vertexShader: Ft.points_vert,
      fragmentShader: Ft.points_frag,
    },
    dashed: {
      uniforms: ye([
        at.common,
        at.fog,
        {
          scale: { value: 1 },
          dashSize: { value: 1 },
          totalSize: { value: 2 },
        },
      ]),
      vertexShader: Ft.linedashed_vert,
      fragmentShader: Ft.linedashed_frag,
    },
    depth: {
      uniforms: ye([at.common, at.displacementmap]),
      vertexShader: Ft.depth_vert,
      fragmentShader: Ft.depth_frag,
    },
    normal: {
      uniforms: ye([
        at.common,
        at.bumpmap,
        at.normalmap,
        at.displacementmap,
        { opacity: { value: 1 } },
      ]),
      vertexShader: Ft.meshnormal_vert,
      fragmentShader: Ft.meshnormal_frag,
    },
    sprite: {
      uniforms: ye([at.sprite, at.fog]),
      vertexShader: Ft.sprite_vert,
      fragmentShader: Ft.sprite_frag,
    },
    background: {
      uniforms: {
        uvTransform: { value: new Nt() },
        t2D: { value: null },
        backgroundIntensity: { value: 1 },
      },
      vertexShader: Ft.background_vert,
      fragmentShader: Ft.background_frag,
    },
    backgroundCube: {
      uniforms: {
        envMap: { value: null },
        flipEnvMap: { value: -1 },
        backgroundBlurriness: { value: 0 },
        backgroundIntensity: { value: 1 },
        backgroundRotation: { value: new Nt() },
      },
      vertexShader: Ft.backgroundCube_vert,
      fragmentShader: Ft.backgroundCube_frag,
    },
    cube: {
      uniforms: {
        tCube: { value: null },
        tFlip: { value: -1 },
        opacity: { value: 1 },
      },
      vertexShader: Ft.cube_vert,
      fragmentShader: Ft.cube_frag,
    },
    equirect: {
      uniforms: { tEquirect: { value: null } },
      vertexShader: Ft.equirect_vert,
      fragmentShader: Ft.equirect_frag,
    },
    distanceRGBA: {
      uniforms: ye([
        at.common,
        at.displacementmap,
        {
          referencePosition: { value: new F() },
          nearDistance: { value: 1 },
          farDistance: { value: 1e3 },
        },
      ]),
      vertexShader: Ft.distanceRGBA_vert,
      fragmentShader: Ft.distanceRGBA_frag,
    },
    shadow: {
      uniforms: ye([
        at.lights,
        at.fog,
        { color: { value: new Yt(0) }, opacity: { value: 1 } },
      ]),
      vertexShader: Ft.shadow_vert,
      fragmentShader: Ft.shadow_frag,
    },
  };
Qe.physical = {
  uniforms: ye([
    Qe.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: new Nt() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: new Nt() },
      clearcoatNormalScale: { value: new Pt(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: new Nt() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: new Nt() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: new Nt() },
      sheen: { value: 0 },
      sheenColor: { value: new Yt(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: new Nt() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: new Nt() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: new Nt() },
      transmissionSamplerSize: { value: new Pt() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: new Nt() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: new Yt(0) },
      specularColor: { value: new Yt(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: new Nt() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: new Nt() },
      anisotropyVector: { value: new Pt() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: new Nt() },
    },
  ]),
  vertexShader: Ft.meshphysical_vert,
  fragmentShader: Ft.meshphysical_frag,
};
const rs = { r: 0, b: 0, g: 0 },
  On = new rn(),
  Kd = new ue();
function $d(i, t, e, n, s, r, a) {
  const o = new Yt(0);
  let l = r === !0 ? 0 : 1,
    c,
    u,
    h = null,
    f = 0,
    p = null;
  function _(b) {
    let y = b.isScene === !0 ? b.background : null;
    return (
      y && y.isTexture && (y = (b.backgroundBlurriness > 0 ? e : t).get(y)),
      y
    );
  }
  function S(b) {
    let y = !1;
    const R = _(b);
    R === null ? d(o, l) : R && R.isColor && (d(R, 1), (y = !0));
    const T = i.xr.getEnvironmentBlendMode();
    (T === "additive"
      ? n.buffers.color.setClear(0, 0, 0, 1, a)
      : T === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a),
      (i.autoClear || y) &&
        (n.buffers.depth.setTest(!0),
        n.buffers.depth.setMask(!0),
        n.buffers.color.setMask(!0),
        i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil)));
  }
  function m(b, y) {
    const R = _(y);
    R && (R.isCubeTexture || R.mapping === _s)
      ? (u === void 0 &&
          ((u = new Ae(
            new vi(1, 1, 1),
            new _n({
              name: "BackgroundCubeMaterial",
              uniforms: xi(Qe.backgroundCube.uniforms),
              vertexShader: Qe.backgroundCube.vertexShader,
              fragmentShader: Qe.backgroundCube.fragmentShader,
              side: Le,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1,
            }),
          )),
          u.geometry.deleteAttribute("normal"),
          u.geometry.deleteAttribute("uv"),
          (u.onBeforeRender = function (T, w, L) {
            this.matrixWorld.copyPosition(L.matrixWorld);
          }),
          Object.defineProperty(u.material, "envMap", {
            get: function () {
              return this.uniforms.envMap.value;
            },
          }),
          s.update(u)),
        On.copy(y.backgroundRotation),
        (On.x *= -1),
        (On.y *= -1),
        (On.z *= -1),
        R.isCubeTexture &&
          R.isRenderTargetTexture === !1 &&
          ((On.y *= -1), (On.z *= -1)),
        (u.material.uniforms.envMap.value = R),
        (u.material.uniforms.flipEnvMap.value =
          R.isCubeTexture && R.isRenderTargetTexture === !1 ? -1 : 1),
        (u.material.uniforms.backgroundBlurriness.value =
          y.backgroundBlurriness),
        (u.material.uniforms.backgroundIntensity.value = y.backgroundIntensity),
        u.material.uniforms.backgroundRotation.value.setFromMatrix4(
          Kd.makeRotationFromEuler(On),
        ),
        (u.material.toneMapped = Xt.getTransfer(R.colorSpace) !== $t),
        (h !== R || f !== R.version || p !== i.toneMapping) &&
          ((u.material.needsUpdate = !0),
          (h = R),
          (f = R.version),
          (p = i.toneMapping)),
        u.layers.enableAll(),
        b.unshift(u, u.geometry, u.material, 0, 0, null))
      : R &&
        R.isTexture &&
        (c === void 0 &&
          ((c = new Ae(
            new Mi(2, 2),
            new _n({
              name: "BackgroundMaterial",
              uniforms: xi(Qe.background.uniforms),
              vertexShader: Qe.background.vertexShader,
              fragmentShader: Qe.background.fragmentShader,
              side: Pn,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1,
            }),
          )),
          c.geometry.deleteAttribute("normal"),
          Object.defineProperty(c.material, "map", {
            get: function () {
              return this.uniforms.t2D.value;
            },
          }),
          s.update(c)),
        (c.material.uniforms.t2D.value = R),
        (c.material.uniforms.backgroundIntensity.value = y.backgroundIntensity),
        (c.material.toneMapped = Xt.getTransfer(R.colorSpace) !== $t),
        R.matrixAutoUpdate === !0 && R.updateMatrix(),
        c.material.uniforms.uvTransform.value.copy(R.matrix),
        (h !== R || f !== R.version || p !== i.toneMapping) &&
          ((c.material.needsUpdate = !0),
          (h = R),
          (f = R.version),
          (p = i.toneMapping)),
        c.layers.enableAll(),
        b.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function d(b, y) {
    (b.getRGB(rs, Yo(i)), n.buffers.color.setClear(rs.r, rs.g, rs.b, y, a));
  }
  function E() {
    (u !== void 0 && (u.geometry.dispose(), u.material.dispose(), (u = void 0)),
      c !== void 0 &&
        (c.geometry.dispose(), c.material.dispose(), (c = void 0)));
  }
  return {
    getClearColor: function () {
      return o;
    },
    setClearColor: function (b, y = 1) {
      (o.set(b), (l = y), d(o, l));
    },
    getClearAlpha: function () {
      return l;
    },
    setClearAlpha: function (b) {
      ((l = b), d(o, l));
    },
    render: S,
    addToRenderList: m,
    dispose: E,
  };
}
function Zd(i, t) {
  const e = i.getParameter(i.MAX_VERTEX_ATTRIBS),
    n = {},
    s = f(null);
  let r = s,
    a = !1;
  function o(g, D, N, V, W) {
    let k = !1;
    const q = h(V, N, D);
    (r !== q && ((r = q), c(r.object)),
      (k = p(g, V, N, W)),
      k && _(g, V, N, W),
      W !== null && t.update(W, i.ELEMENT_ARRAY_BUFFER),
      (k || a) &&
        ((a = !1),
        y(g, D, N, V),
        W !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get(W).buffer)));
  }
  function l() {
    return i.createVertexArray();
  }
  function c(g) {
    return i.bindVertexArray(g);
  }
  function u(g) {
    return i.deleteVertexArray(g);
  }
  function h(g, D, N) {
    const V = N.wireframe === !0;
    let W = n[g.id];
    W === void 0 && ((W = {}), (n[g.id] = W));
    let k = W[D.id];
    k === void 0 && ((k = {}), (W[D.id] = k));
    let q = k[V];
    return (q === void 0 && ((q = f(l())), (k[V] = q)), q);
  }
  function f(g) {
    const D = [],
      N = [],
      V = [];
    for (let W = 0; W < e; W++) ((D[W] = 0), (N[W] = 0), (V[W] = 0));
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: D,
      enabledAttributes: N,
      attributeDivisors: V,
      object: g,
      attributes: {},
      index: null,
    };
  }
  function p(g, D, N, V) {
    const W = r.attributes,
      k = D.attributes;
    let q = 0;
    const J = N.getAttributes();
    for (const H in J)
      if (J[H].location >= 0) {
        const rt = W[H];
        let bt = k[H];
        if (
          (bt === void 0 &&
            (H === "instanceMatrix" &&
              g.instanceMatrix &&
              (bt = g.instanceMatrix),
            H === "instanceColor" && g.instanceColor && (bt = g.instanceColor)),
          rt === void 0 || rt.attribute !== bt || (bt && rt.data !== bt.data))
        )
          return !0;
        q++;
      }
    return r.attributesNum !== q || r.index !== V;
  }
  function _(g, D, N, V) {
    const W = {},
      k = D.attributes;
    let q = 0;
    const J = N.getAttributes();
    for (const H in J)
      if (J[H].location >= 0) {
        let rt = k[H];
        rt === void 0 &&
          (H === "instanceMatrix" &&
            g.instanceMatrix &&
            (rt = g.instanceMatrix),
          H === "instanceColor" && g.instanceColor && (rt = g.instanceColor));
        const bt = {};
        ((bt.attribute = rt),
          rt && rt.data && (bt.data = rt.data),
          (W[H] = bt),
          q++);
      }
    ((r.attributes = W), (r.attributesNum = q), (r.index = V));
  }
  function S() {
    const g = r.newAttributes;
    for (let D = 0, N = g.length; D < N; D++) g[D] = 0;
  }
  function m(g) {
    d(g, 0);
  }
  function d(g, D) {
    const N = r.newAttributes,
      V = r.enabledAttributes,
      W = r.attributeDivisors;
    ((N[g] = 1),
      V[g] === 0 && (i.enableVertexAttribArray(g), (V[g] = 1)),
      W[g] !== D && (i.vertexAttribDivisor(g, D), (W[g] = D)));
  }
  function E() {
    const g = r.newAttributes,
      D = r.enabledAttributes;
    for (let N = 0, V = D.length; N < V; N++)
      D[N] !== g[N] && (i.disableVertexAttribArray(N), (D[N] = 0));
  }
  function b(g, D, N, V, W, k, q) {
    q === !0
      ? i.vertexAttribIPointer(g, D, N, W, k)
      : i.vertexAttribPointer(g, D, N, V, W, k);
  }
  function y(g, D, N, V) {
    S();
    const W = V.attributes,
      k = N.getAttributes(),
      q = D.defaultAttributeValues;
    for (const J in k) {
      const H = k[J];
      if (H.location >= 0) {
        let nt = W[J];
        if (
          (nt === void 0 &&
            (J === "instanceMatrix" &&
              g.instanceMatrix &&
              (nt = g.instanceMatrix),
            J === "instanceColor" && g.instanceColor && (nt = g.instanceColor)),
          nt !== void 0)
        ) {
          const rt = nt.normalized,
            bt = nt.itemSize,
            kt = t.get(nt);
          if (kt === void 0) continue;
          const qt = kt.buffer,
            Qt = kt.type,
            te = kt.bytesPerElement,
            Y = Qt === i.INT || Qt === i.UNSIGNED_INT || nt.gpuType === Kr;
          if (nt.isInterleavedBufferAttribute) {
            const $ = nt.data,
              ft = $.stride,
              It = nt.offset;
            if ($.isInstancedInterleavedBuffer) {
              for (let vt = 0; vt < H.locationSize; vt++)
                d(H.location + vt, $.meshPerAttribute);
              g.isInstancedMesh !== !0 &&
                V._maxInstanceCount === void 0 &&
                (V._maxInstanceCount = $.meshPerAttribute * $.count);
            } else
              for (let vt = 0; vt < H.locationSize; vt++) m(H.location + vt);
            i.bindBuffer(i.ARRAY_BUFFER, qt);
            for (let vt = 0; vt < H.locationSize; vt++)
              b(
                H.location + vt,
                bt / H.locationSize,
                Qt,
                rt,
                ft * te,
                (It + (bt / H.locationSize) * vt) * te,
                Y,
              );
          } else {
            if (nt.isInstancedBufferAttribute) {
              for (let $ = 0; $ < H.locationSize; $++)
                d(H.location + $, nt.meshPerAttribute);
              g.isInstancedMesh !== !0 &&
                V._maxInstanceCount === void 0 &&
                (V._maxInstanceCount = nt.meshPerAttribute * nt.count);
            } else for (let $ = 0; $ < H.locationSize; $++) m(H.location + $);
            i.bindBuffer(i.ARRAY_BUFFER, qt);
            for (let $ = 0; $ < H.locationSize; $++)
              b(
                H.location + $,
                bt / H.locationSize,
                Qt,
                rt,
                bt * te,
                (bt / H.locationSize) * $ * te,
                Y,
              );
          }
        } else if (q !== void 0) {
          const rt = q[J];
          if (rt !== void 0)
            switch (rt.length) {
              case 2:
                i.vertexAttrib2fv(H.location, rt);
                break;
              case 3:
                i.vertexAttrib3fv(H.location, rt);
                break;
              case 4:
                i.vertexAttrib4fv(H.location, rt);
                break;
              default:
                i.vertexAttrib1fv(H.location, rt);
            }
        }
      }
    }
    E();
  }
  function R() {
    L();
    for (const g in n) {
      const D = n[g];
      for (const N in D) {
        const V = D[N];
        for (const W in V) (u(V[W].object), delete V[W]);
        delete D[N];
      }
      delete n[g];
    }
  }
  function T(g) {
    if (n[g.id] === void 0) return;
    const D = n[g.id];
    for (const N in D) {
      const V = D[N];
      for (const W in V) (u(V[W].object), delete V[W]);
      delete D[N];
    }
    delete n[g.id];
  }
  function w(g) {
    for (const D in n) {
      const N = n[D];
      if (N[g.id] === void 0) continue;
      const V = N[g.id];
      for (const W in V) (u(V[W].object), delete V[W]);
      delete N[g.id];
    }
  }
  function L() {
    (M(), (a = !0), r !== s && ((r = s), c(r.object)));
  }
  function M() {
    ((s.geometry = null), (s.program = null), (s.wireframe = !1));
  }
  return {
    setup: o,
    reset: L,
    resetDefaultState: M,
    dispose: R,
    releaseStatesOfGeometry: T,
    releaseStatesOfProgram: w,
    initAttributes: S,
    enableAttribute: m,
    disableUnusedAttributes: E,
  };
}
function Jd(i, t, e) {
  let n;
  function s(c) {
    n = c;
  }
  function r(c, u) {
    (i.drawArrays(n, c, u), e.update(u, n, 1));
  }
  function a(c, u, h) {
    h !== 0 && (i.drawArraysInstanced(n, c, u, h), e.update(u, n, h));
  }
  function o(c, u, h) {
    if (h === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, u, 0, h);
    let p = 0;
    for (let _ = 0; _ < h; _++) p += u[_];
    e.update(p, n, 1);
  }
  function l(c, u, h, f) {
    if (h === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null) for (let _ = 0; _ < c.length; _++) a(c[_], u[_], f[_]);
    else {
      p.multiDrawArraysInstancedWEBGL(n, c, 0, u, 0, f, 0, h);
      let _ = 0;
      for (let S = 0; S < h; S++) _ += u[S] * f[S];
      e.update(_, n, 1);
    }
  }
  ((this.setMode = s),
    (this.render = r),
    (this.renderInstances = a),
    (this.renderMultiDraw = o),
    (this.renderMultiDrawInstances = l));
}
function Qd(i, t, e, n) {
  let s;
  function r() {
    if (s !== void 0) return s;
    if (t.has("EXT_texture_filter_anisotropic") === !0) {
      const w = t.get("EXT_texture_filter_anisotropic");
      s = i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else s = 0;
    return s;
  }
  function a(w) {
    return !(
      w !== Ke &&
      n.convert(w) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT)
    );
  }
  function o(w) {
    const L =
      w === _i &&
      (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(
      w !== sn &&
      n.convert(w) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) &&
      w !== pn &&
      !L
    );
  }
  function l(w) {
    if (w === "highp") {
      if (
        i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision >
          0 &&
        i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision >
          0
      )
        return "highp";
      w = "mediump";
    }
    return w === "mediump" &&
      i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision >
        0 &&
      i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision >
        0
      ? "mediump"
      : "lowp";
  }
  let c = e.precision !== void 0 ? e.precision : "highp";
  const u = l(c);
  u !== c &&
    (Ut("WebGLRenderer:", c, "not supported, using", u, "instead."), (c = u));
  const h = e.logarithmicDepthBuffer === !0,
    f = e.reversedDepthBuffer === !0 && t.has("EXT_clip_control"),
    p = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),
    _ = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    S = i.getParameter(i.MAX_TEXTURE_SIZE),
    m = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),
    d = i.getParameter(i.MAX_VERTEX_ATTRIBS),
    E = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),
    b = i.getParameter(i.MAX_VARYING_VECTORS),
    y = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),
    R = _ > 0,
    T = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: r,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: h,
    reversedDepthBuffer: f,
    maxTextures: p,
    maxVertexTextures: _,
    maxTextureSize: S,
    maxCubemapSize: m,
    maxAttributes: d,
    maxVertexUniforms: E,
    maxVaryings: b,
    maxFragmentUniforms: y,
    vertexTextures: R,
    maxSamples: T,
  };
}
function tf(i) {
  const t = this;
  let e = null,
    n = 0,
    s = !1,
    r = !1;
  const a = new Tn(),
    o = new Nt(),
    l = { value: null, needsUpdate: !1 };
  ((this.uniform = l),
    (this.numPlanes = 0),
    (this.numIntersection = 0),
    (this.init = function (h, f) {
      const p = h.length !== 0 || f || n !== 0 || s;
      return ((s = f), (n = h.length), p);
    }),
    (this.beginShadows = function () {
      ((r = !0), u(null));
    }),
    (this.endShadows = function () {
      r = !1;
    }),
    (this.setGlobalState = function (h, f) {
      e = u(h, f, 0);
    }),
    (this.setState = function (h, f, p) {
      const _ = h.clippingPlanes,
        S = h.clipIntersection,
        m = h.clipShadows,
        d = i.get(h);
      if (!s || _ === null || _.length === 0 || (r && !m)) r ? u(null) : c();
      else {
        const E = r ? 0 : n,
          b = E * 4;
        let y = d.clippingState || null;
        ((l.value = y), (y = u(_, f, b, p)));
        for (let R = 0; R !== b; ++R) y[R] = e[R];
        ((d.clippingState = y),
          (this.numIntersection = S ? this.numPlanes : 0),
          (this.numPlanes += E));
      }
    }));
  function c() {
    (l.value !== e && ((l.value = e), (l.needsUpdate = n > 0)),
      (t.numPlanes = n),
      (t.numIntersection = 0));
  }
  function u(h, f, p, _) {
    const S = h !== null ? h.length : 0;
    let m = null;
    if (S !== 0) {
      if (((m = l.value), _ !== !0 || m === null)) {
        const d = p + S * 4,
          E = f.matrixWorldInverse;
        (o.getNormalMatrix(E),
          (m === null || m.length < d) && (m = new Float32Array(d)));
        for (let b = 0, y = p; b !== S; ++b, y += 4)
          (a.copy(h[b]).applyMatrix4(E, o),
            a.normal.toArray(m, y),
            (m[y + 3] = a.constant));
      }
      ((l.value = m), (l.needsUpdate = !0));
    }
    return ((t.numPlanes = S), (t.numIntersection = 0), m);
  }
}
function ef(i) {
  let t = new WeakMap();
  function e(a, o) {
    return (o === fr ? (a.mapping = fi) : o === pr && (a.mapping = pi), a);
  }
  function n(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === fr || o === pr)
        if (t.has(a)) {
          const l = t.get(a).texture;
          return e(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new Ql(l.height);
            return (
              c.fromEquirectangularTexture(i, a),
              t.set(a, c),
              a.addEventListener("dispose", s),
              e(c.texture, a.mapping)
            );
          } else return null;
        }
    }
    return a;
  }
  function s(a) {
    const o = a.target;
    o.removeEventListener("dispose", s);
    const l = t.get(o);
    l !== void 0 && (t.delete(o), l.dispose());
  }
  function r() {
    t = new WeakMap();
  }
  return { get: n, dispose: r };
}
const wn = 4,
  Za = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582],
  Gn = 20,
  nf = 512,
  Ci = new Jo(),
  Ja = new Yt();
let $s = null,
  Zs = 0,
  Js = 0,
  Qs = !1;
const sf = new F();
class Qa {
  constructor(t) {
    ((this._renderer = t),
      (this._pingPongRenderTarget = null),
      (this._lodMax = 0),
      (this._cubeSize = 0),
      (this._sizeLods = []),
      (this._sigmas = []),
      (this._lodMeshes = []),
      (this._backgroundBox = null),
      (this._cubemapMaterial = null),
      (this._equirectMaterial = null),
      (this._blurMaterial = null),
      (this._ggxMaterial = null));
  }
  fromScene(t, e = 0, n = 0.1, s = 100, r = {}) {
    const { size: a = 256, position: o = sf } = r;
    (($s = this._renderer.getRenderTarget()),
      (Zs = this._renderer.getActiveCubeFace()),
      (Js = this._renderer.getActiveMipmapLevel()),
      (Qs = this._renderer.xr.enabled),
      (this._renderer.xr.enabled = !1),
      this._setSize(a));
    const l = this._allocateTargets();
    return (
      (l.depthBuffer = !0),
      this._sceneToCubeUV(t, n, s, l, o),
      e > 0 && this._blur(l, 0, 0, e),
      this._applyPMREM(l),
      this._cleanup(l),
      l
    );
  }
  fromEquirectangular(t, e = null) {
    return this._fromTexture(t, e);
  }
  fromCubemap(t, e = null) {
    return this._fromTexture(t, e);
  }
  compileCubemapShader() {
    this._cubemapMaterial === null &&
      ((this._cubemapMaterial = no()),
      this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null &&
      ((this._equirectMaterial = eo()),
      this._compileMaterial(this._equirectMaterial));
  }
  dispose() {
    (this._dispose(),
      this._cubemapMaterial !== null && this._cubemapMaterial.dispose(),
      this._equirectMaterial !== null && this._equirectMaterial.dispose(),
      this._backgroundBox !== null &&
        (this._backgroundBox.geometry.dispose(),
        this._backgroundBox.material.dispose()));
  }
  _setSize(t) {
    ((this._lodMax = Math.floor(Math.log2(t))),
      (this._cubeSize = Math.pow(2, this._lodMax)));
  }
  _dispose() {
    (this._blurMaterial !== null && this._blurMaterial.dispose(),
      this._ggxMaterial !== null && this._ggxMaterial.dispose(),
      this._pingPongRenderTarget !== null &&
        this._pingPongRenderTarget.dispose());
    for (let t = 0; t < this._lodMeshes.length; t++)
      this._lodMeshes[t].geometry.dispose();
  }
  _cleanup(t) {
    (this._renderer.setRenderTarget($s, Zs, Js),
      (this._renderer.xr.enabled = Qs),
      (t.scissorTest = !1),
      oi(t, 0, 0, t.width, t.height));
  }
  _fromTexture(t, e) {
    (t.mapping === fi || t.mapping === pi
      ? this._setSize(
          t.image.length === 0
            ? 16
            : t.image[0].width || t.image[0].image.width,
        )
      : this._setSize(t.image.width / 4),
      ($s = this._renderer.getRenderTarget()),
      (Zs = this._renderer.getActiveCubeFace()),
      (Js = this._renderer.getActiveMipmapLevel()),
      (Qs = this._renderer.xr.enabled),
      (this._renderer.xr.enabled = !1));
    const n = e || this._allocateTargets();
    return (
      this._textureToCubeUV(t, n),
      this._applyPMREM(n),
      this._cleanup(n),
      n
    );
  }
  _allocateTargets() {
    const t = 3 * Math.max(this._cubeSize, 112),
      e = 4 * this._cubeSize,
      n = {
        magFilter: He,
        minFilter: He,
        generateMipmaps: !1,
        type: _i,
        format: Ke,
        colorSpace: mi,
        depthBuffer: !1,
      },
      s = to(t, e, n);
    if (
      this._pingPongRenderTarget === null ||
      this._pingPongRenderTarget.width !== t ||
      this._pingPongRenderTarget.height !== e
    ) {
      (this._pingPongRenderTarget !== null && this._dispose(),
        (this._pingPongRenderTarget = to(t, e, n)));
      const { _lodMax: r } = this;
      (({
        lodMeshes: this._lodMeshes,
        sizeLods: this._sizeLods,
        sigmas: this._sigmas,
      } = rf(r)),
        (this._blurMaterial = of(r, t, e)));
    }
    return s;
  }
  _compileMaterial(t) {
    const e = new Ae(new ke(), t);
    this._renderer.compile(e, Ci);
  }
  _sceneToCubeUV(t, e, n, s, r) {
    const l = new Ge(90, 1, e, n),
      c = [1, -1, 1, 1, 1, 1],
      u = [1, 1, 1, -1, -1, -1],
      h = this._renderer,
      f = h.autoClear,
      p = h.toneMapping;
    (h.getClearColor(Ja),
      (h.toneMapping = Rn),
      (h.autoClear = !1),
      h.state.buffers.depth.getReversed() &&
        (h.setRenderTarget(s), h.clearDepth(), h.setRenderTarget(null)),
      this._backgroundBox === null &&
        (this._backgroundBox = new Ae(
          new vi(),
          new sa({
            name: "PMREM.Background",
            side: Le,
            depthWrite: !1,
            depthTest: !1,
          }),
        )));
    const S = this._backgroundBox,
      m = S.material;
    let d = !1;
    const E = t.background;
    E
      ? E.isColor && (m.color.copy(E), (t.background = null), (d = !0))
      : (m.color.copy(Ja), (d = !0));
    for (let b = 0; b < 6; b++) {
      const y = b % 3;
      y === 0
        ? (l.up.set(0, c[b], 0),
          l.position.set(r.x, r.y, r.z),
          l.lookAt(r.x + u[b], r.y, r.z))
        : y === 1
          ? (l.up.set(0, 0, c[b]),
            l.position.set(r.x, r.y, r.z),
            l.lookAt(r.x, r.y + u[b], r.z))
          : (l.up.set(0, c[b], 0),
            l.position.set(r.x, r.y, r.z),
            l.lookAt(r.x, r.y, r.z + u[b]));
      const R = this._cubeSize;
      (oi(s, y * R, b > 2 ? R : 0, R, R),
        h.setRenderTarget(s),
        d && h.render(S, l),
        h.render(t, l));
    }
    ((h.toneMapping = p), (h.autoClear = f), (t.background = E));
  }
  _textureToCubeUV(t, e) {
    const n = this._renderer,
      s = t.mapping === fi || t.mapping === pi;
    s
      ? (this._cubemapMaterial === null && (this._cubemapMaterial = no()),
        (this._cubemapMaterial.uniforms.flipEnvMap.value =
          t.isRenderTargetTexture === !1 ? -1 : 1))
      : this._equirectMaterial === null && (this._equirectMaterial = eo());
    const r = s ? this._cubemapMaterial : this._equirectMaterial,
      a = this._lodMeshes[0];
    a.material = r;
    const o = r.uniforms;
    o.envMap.value = t;
    const l = this._cubeSize;
    (oi(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(a, Ci));
  }
  _applyPMREM(t) {
    const e = this._renderer,
      n = e.autoClear;
    e.autoClear = !1;
    const s = this._lodMeshes.length;
    for (let r = 1; r < s; r++) this._applyGGXFilter(t, r - 1, r);
    e.autoClear = n;
  }
  _applyGGXFilter(t, e, n) {
    const s = this._renderer,
      r = this._pingPongRenderTarget;
    if (this._ggxMaterial === null) {
      const E = 3 * Math.max(this._cubeSize, 16),
        b = 4 * this._cubeSize;
      this._ggxMaterial = af(this._lodMax, E, b);
    }
    const a = this._ggxMaterial,
      o = this._lodMeshes[n];
    o.material = a;
    const l = a.uniforms,
      c = n / (this._lodMeshes.length - 1),
      u = e / (this._lodMeshes.length - 1),
      h = Math.sqrt(c * c - u * u),
      f = 0.05 + c * 0.95,
      p = h * f,
      { _lodMax: _ } = this,
      S = this._sizeLods[n],
      m = 3 * S * (n > _ - wn ? n - _ + wn : 0),
      d = 4 * (this._cubeSize - S);
    ((l.envMap.value = t.texture),
      (l.roughness.value = p),
      (l.mipInt.value = _ - e),
      oi(r, m, d, 3 * S, 2 * S),
      s.setRenderTarget(r),
      s.render(o, Ci),
      (l.envMap.value = r.texture),
      (l.roughness.value = 0),
      (l.mipInt.value = _ - n),
      oi(t, m, d, 3 * S, 2 * S),
      s.setRenderTarget(t),
      s.render(o, Ci));
  }
  _blur(t, e, n, s, r) {
    const a = this._pingPongRenderTarget;
    (this._halfBlur(t, a, e, n, s, "latitudinal", r),
      this._halfBlur(a, t, n, n, s, "longitudinal", r));
  }
  _halfBlur(t, e, n, s, r, a, o) {
    const l = this._renderer,
      c = this._blurMaterial;
    a !== "latitudinal" &&
      a !== "longitudinal" &&
      he("blur direction must be either latitudinal or longitudinal!");
    const u = 3,
      h = this._lodMeshes[s];
    h.material = c;
    const f = c.uniforms,
      p = this._sizeLods[n] - 1,
      _ = isFinite(r) ? Math.PI / (2 * p) : (2 * Math.PI) / (2 * Gn - 1),
      S = r / _,
      m = isFinite(r) ? 1 + Math.floor(u * S) : Gn;
    m > Gn &&
      Ut(
        `sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Gn}`,
      );
    const d = [];
    let E = 0;
    for (let w = 0; w < Gn; ++w) {
      const L = w / S,
        M = Math.exp((-L * L) / 2);
      (d.push(M), w === 0 ? (E += M) : w < m && (E += 2 * M));
    }
    for (let w = 0; w < d.length; w++) d[w] = d[w] / E;
    ((f.envMap.value = t.texture),
      (f.samples.value = m),
      (f.weights.value = d),
      (f.latitudinal.value = a === "latitudinal"),
      o && (f.poleAxis.value = o));
    const { _lodMax: b } = this;
    ((f.dTheta.value = _), (f.mipInt.value = b - n));
    const y = this._sizeLods[s],
      R = 3 * y * (s > b - wn ? s - b + wn : 0),
      T = 4 * (this._cubeSize - y);
    (oi(e, R, T, 3 * y, 2 * y), l.setRenderTarget(e), l.render(h, Ci));
  }
}
function rf(i) {
  const t = [],
    e = [],
    n = [];
  let s = i;
  const r = i - wn + 1 + Za.length;
  for (let a = 0; a < r; a++) {
    const o = Math.pow(2, s);
    t.push(o);
    let l = 1 / o;
    (a > i - wn ? (l = Za[a - i + wn - 1]) : a === 0 && (l = 0), e.push(l));
    const c = 1 / (o - 2),
      u = -c,
      h = 1 + c,
      f = [u, u, h, u, h, h, u, u, h, h, u, h],
      p = 6,
      _ = 6,
      S = 3,
      m = 2,
      d = 1,
      E = new Float32Array(S * _ * p),
      b = new Float32Array(m * _ * p),
      y = new Float32Array(d * _ * p);
    for (let T = 0; T < p; T++) {
      const w = ((T % 3) * 2) / 3 - 1,
        L = T > 2 ? 0 : -1,
        M = [
          w,
          L,
          0,
          w + 2 / 3,
          L,
          0,
          w + 2 / 3,
          L + 1,
          0,
          w,
          L,
          0,
          w + 2 / 3,
          L + 1,
          0,
          w,
          L + 1,
          0,
        ];
      (E.set(M, S * _ * T), b.set(f, m * _ * T));
      const g = [T, T, T, T, T, T];
      y.set(g, d * _ * T);
    }
    const R = new ke();
    (R.setAttribute("position", new nn(E, S)),
      R.setAttribute("uv", new nn(b, m)),
      R.setAttribute("faceIndex", new nn(y, d)),
      n.push(new Ae(R, null)),
      s > wn && s--);
  }
  return { lodMeshes: n, sizeLods: t, sigmas: e };
}
function to(i, t, e) {
  const n = new Xn(i, t, e);
  return (
    (n.texture.mapping = _s),
    (n.texture.name = "PMREM.cubeUv"),
    (n.scissorTest = !0),
    n
  );
}
function oi(i, t, e, n, s) {
  (i.viewport.set(t, e, n, s), i.scissor.set(t, e, n, s));
}
function af(i, t, e) {
  return new _n({
    name: "PMREMGGXConvolution",
    defines: {
      GGX_SAMPLES: nf,
      CUBEUV_TEXEL_WIDTH: 1 / t,
      CUBEUV_TEXEL_HEIGHT: 1 / e,
      CUBEUV_MAX_MIP: `${i}.0`,
    },
    uniforms: {
      envMap: { value: null },
      roughness: { value: 0 },
      mipInt: { value: 0 },
    },
    vertexShader: gs(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,
    blending: mn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function of(i, t, e) {
  const n = new Float32Array(Gn),
    s = new F(0, 1, 0);
  return new _n({
    name: "SphericalGaussianBlur",
    defines: {
      n: Gn,
      CUBEUV_TEXEL_WIDTH: 1 / t,
      CUBEUV_TEXEL_HEIGHT: 1 / e,
      CUBEUV_MAX_MIP: `${i}.0`,
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: n },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: s },
    },
    vertexShader: gs(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
    blending: mn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function eo() {
  return new _n({
    name: "EquirectangularToCubeUV",
    uniforms: { envMap: { value: null } },
    vertexShader: gs(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
    blending: mn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function no() {
  return new _n({
    name: "CubemapToCubeUV",
    uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 } },
    vertexShader: gs(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
    blending: mn,
    depthTest: !1,
    depthWrite: !1,
  });
}
function gs() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function cf(i) {
  let t = new WeakMap(),
    e = null;
  function n(o) {
    if (o && o.isTexture) {
      const l = o.mapping,
        c = l === fr || l === pr,
        u = l === fi || l === pi;
      if (c || u) {
        let h = t.get(o);
        const f = h !== void 0 ? h.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== f)
          return (
            e === null && (e = new Qa(i)),
            (h = c ? e.fromEquirectangular(o, h) : e.fromCubemap(o, h)),
            (h.texture.pmremVersion = o.pmremVersion),
            t.set(o, h),
            h.texture
          );
        if (h !== void 0) return h.texture;
        {
          const p = o.image;
          return (c && p && p.height > 0) || (u && p && s(p))
            ? (e === null && (e = new Qa(i)),
              (h = c ? e.fromEquirectangular(o) : e.fromCubemap(o)),
              (h.texture.pmremVersion = o.pmremVersion),
              t.set(o, h),
              o.addEventListener("dispose", r),
              h.texture)
            : null;
        }
      }
    }
    return o;
  }
  function s(o) {
    let l = 0;
    const c = 6;
    for (let u = 0; u < c; u++) o[u] !== void 0 && l++;
    return l === c;
  }
  function r(o) {
    const l = o.target;
    l.removeEventListener("dispose", r);
    const c = t.get(l);
    c !== void 0 && (t.delete(l), c.dispose());
  }
  function a() {
    ((t = new WeakMap()), e !== null && (e.dispose(), (e = null)));
  }
  return { get: n, dispose: a };
}
function lf(i) {
  const t = {};
  function e(n) {
    if (t[n] !== void 0) return t[n];
    const s = i.getExtension(n);
    return ((t[n] = s), s);
  }
  return {
    has: function (n) {
      return e(n) !== null;
    },
    init: function () {
      (e("EXT_color_buffer_float"),
        e("WEBGL_clip_cull_distance"),
        e("OES_texture_float_linear"),
        e("EXT_color_buffer_half_float"),
        e("WEBGL_multisampled_render_to_texture"),
        e("WEBGL_render_shared_exponent"));
    },
    get: function (n) {
      const s = e(n);
      return (
        s === null && Fi("WebGLRenderer: " + n + " extension not supported."),
        s
      );
    },
  };
}
function hf(i, t, e, n) {
  const s = {},
    r = new WeakMap();
  function a(h) {
    const f = h.target;
    f.index !== null && t.remove(f.index);
    for (const _ in f.attributes) t.remove(f.attributes[_]);
    (f.removeEventListener("dispose", a), delete s[f.id]);
    const p = r.get(f);
    (p && (t.remove(p), r.delete(f)),
      n.releaseStatesOfGeometry(f),
      f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount,
      e.memory.geometries--);
  }
  function o(h, f) {
    return (
      s[f.id] === !0 ||
        (f.addEventListener("dispose", a),
        (s[f.id] = !0),
        e.memory.geometries++),
      f
    );
  }
  function l(h) {
    const f = h.attributes;
    for (const p in f) t.update(f[p], i.ARRAY_BUFFER);
  }
  function c(h) {
    const f = [],
      p = h.index,
      _ = h.attributes.position;
    let S = 0;
    if (p !== null) {
      const E = p.array;
      S = p.version;
      for (let b = 0, y = E.length; b < y; b += 3) {
        const R = E[b + 0],
          T = E[b + 1],
          w = E[b + 2];
        f.push(R, T, T, w, w, R);
      }
    } else if (_ !== void 0) {
      const E = _.array;
      S = _.version;
      for (let b = 0, y = E.length / 3 - 1; b < y; b += 3) {
        const R = b + 0,
          T = b + 1,
          w = b + 2;
        f.push(R, T, T, w, w, R);
      }
    } else return;
    const m = new (zo(f) ? Xo : Wo)(f, 1);
    m.version = S;
    const d = r.get(h);
    (d && t.remove(d), r.set(h, m));
  }
  function u(h) {
    const f = r.get(h);
    if (f) {
      const p = h.index;
      p !== null && f.version < p.version && c(h);
    } else c(h);
    return r.get(h);
  }
  return { get: o, update: l, getWireframeAttribute: u };
}
function uf(i, t, e) {
  let n;
  function s(f) {
    n = f;
  }
  let r, a;
  function o(f) {
    ((r = f.type), (a = f.bytesPerElement));
  }
  function l(f, p) {
    (i.drawElements(n, p, r, f * a), e.update(p, n, 1));
  }
  function c(f, p, _) {
    _ !== 0 && (i.drawElementsInstanced(n, p, r, f * a, _), e.update(p, n, _));
  }
  function u(f, p, _) {
    if (_ === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, p, 0, r, f, 0, _);
    let m = 0;
    for (let d = 0; d < _; d++) m += p[d];
    e.update(m, n, 1);
  }
  function h(f, p, _, S) {
    if (_ === 0) return;
    const m = t.get("WEBGL_multi_draw");
    if (m === null) for (let d = 0; d < f.length; d++) c(f[d] / a, p[d], S[d]);
    else {
      m.multiDrawElementsInstancedWEBGL(n, p, 0, r, f, 0, S, 0, _);
      let d = 0;
      for (let E = 0; E < _; E++) d += p[E] * S[E];
      e.update(d, n, 1);
    }
  }
  ((this.setMode = s),
    (this.setIndex = o),
    (this.render = l),
    (this.renderInstances = c),
    (this.renderMultiDraw = u),
    (this.renderMultiDrawInstances = h));
}
function df(i) {
  const t = { geometries: 0, textures: 0 },
    e = { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 };
  function n(r, a, o) {
    switch ((e.calls++, a)) {
      case i.TRIANGLES:
        e.triangles += o * (r / 3);
        break;
      case i.LINES:
        e.lines += o * (r / 2);
        break;
      case i.LINE_STRIP:
        e.lines += o * (r - 1);
        break;
      case i.LINE_LOOP:
        e.lines += o * r;
        break;
      case i.POINTS:
        e.points += o * r;
        break;
      default:
        he("WebGLInfo: Unknown draw mode:", a);
        break;
    }
  }
  function s() {
    ((e.calls = 0), (e.triangles = 0), (e.points = 0), (e.lines = 0));
  }
  return {
    memory: t,
    render: e,
    programs: null,
    autoReset: !0,
    reset: s,
    update: n,
  };
}
function ff(i, t, e) {
  const n = new WeakMap(),
    s = new le();
  function r(a, o, l) {
    const c = a.morphTargetInfluences,
      u =
        o.morphAttributes.position ||
        o.morphAttributes.normal ||
        o.morphAttributes.color,
      h = u !== void 0 ? u.length : 0;
    let f = n.get(o);
    if (f === void 0 || f.count !== h) {
      let g = function () {
        (L.dispose(), n.delete(o), o.removeEventListener("dispose", g));
      };
      var p = g;
      f !== void 0 && f.texture.dispose();
      const _ = o.morphAttributes.position !== void 0,
        S = o.morphAttributes.normal !== void 0,
        m = o.morphAttributes.color !== void 0,
        d = o.morphAttributes.position || [],
        E = o.morphAttributes.normal || [],
        b = o.morphAttributes.color || [];
      let y = 0;
      (_ === !0 && (y = 1), S === !0 && (y = 2), m === !0 && (y = 3));
      let R = o.attributes.position.count * y,
        T = 1;
      R > t.maxTextureSize &&
        ((T = Math.ceil(R / t.maxTextureSize)), (R = t.maxTextureSize));
      const w = new Float32Array(R * T * 4 * h),
        L = new Vo(w, R, T, h);
      ((L.type = pn), (L.needsUpdate = !0));
      const M = y * 4;
      for (let D = 0; D < h; D++) {
        const N = d[D],
          V = E[D],
          W = b[D],
          k = R * T * 4 * D;
        for (let q = 0; q < N.count; q++) {
          const J = q * M;
          (_ === !0 &&
            (s.fromBufferAttribute(N, q),
            (w[k + J + 0] = s.x),
            (w[k + J + 1] = s.y),
            (w[k + J + 2] = s.z),
            (w[k + J + 3] = 0)),
            S === !0 &&
              (s.fromBufferAttribute(V, q),
              (w[k + J + 4] = s.x),
              (w[k + J + 5] = s.y),
              (w[k + J + 6] = s.z),
              (w[k + J + 7] = 0)),
            m === !0 &&
              (s.fromBufferAttribute(W, q),
              (w[k + J + 8] = s.x),
              (w[k + J + 9] = s.y),
              (w[k + J + 10] = s.z),
              (w[k + J + 11] = W.itemSize === 4 ? s.w : 1)));
        }
      }
      ((f = { count: h, texture: L, size: new Pt(R, T) }),
        n.set(o, f),
        o.addEventListener("dispose", g));
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      l.getUniforms().setValue(i, "morphTexture", a.morphTexture, e);
    else {
      let _ = 0;
      for (let m = 0; m < c.length; m++) _ += c[m];
      const S = o.morphTargetsRelative ? 1 : 1 - _;
      (l.getUniforms().setValue(i, "morphTargetBaseInfluence", S),
        l.getUniforms().setValue(i, "morphTargetInfluences", c));
    }
    (l.getUniforms().setValue(i, "morphTargetsTexture", f.texture, e),
      l.getUniforms().setValue(i, "morphTargetsTextureSize", f.size));
  }
  return { update: r };
}
function pf(i, t, e, n) {
  let s = new WeakMap();
  function r(l) {
    const c = n.render.frame,
      u = l.geometry,
      h = t.get(l, u);
    if (
      (s.get(h) !== c && (t.update(h), s.set(h, c)),
      l.isInstancedMesh &&
        (l.hasEventListener("dispose", o) === !1 &&
          l.addEventListener("dispose", o),
        s.get(l) !== c &&
          (e.update(l.instanceMatrix, i.ARRAY_BUFFER),
          l.instanceColor !== null && e.update(l.instanceColor, i.ARRAY_BUFFER),
          s.set(l, c))),
      l.isSkinnedMesh)
    ) {
      const f = l.skeleton;
      s.get(f) !== c && (f.update(), s.set(f, c));
    }
    return h;
  }
  function a() {
    s = new WeakMap();
  }
  function o(l) {
    const c = l.target;
    (c.removeEventListener("dispose", o),
      e.remove(c.instanceMatrix),
      c.instanceColor !== null && e.remove(c.instanceColor));
  }
  return { update: r, dispose: a };
}
const tc = new be(),
  io = new Ko(1, 1),
  ec = new Vo(),
  nc = new Fl(),
  ic = new jo(),
  so = [],
  ro = [],
  ao = new Float32Array(16),
  oo = new Float32Array(9),
  co = new Float32Array(4);
function Si(i, t, e) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const s = t * e;
  let r = so[s];
  if ((r === void 0 && ((r = new Float32Array(s)), (so[s] = r)), t !== 0)) {
    n.toArray(r, 0);
    for (let a = 1, o = 0; a !== t; ++a) ((o += e), i[a].toArray(r, o));
  }
  return r;
}
function pe(i, t) {
  if (i.length !== t.length) return !1;
  for (let e = 0, n = i.length; e < n; e++) if (i[e] !== t[e]) return !1;
  return !0;
}
function me(i, t) {
  for (let e = 0, n = t.length; e < n; e++) i[e] = t[e];
}
function vs(i, t) {
  let e = ro[t];
  e === void 0 && ((e = new Int32Array(t)), (ro[t] = e));
  for (let n = 0; n !== t; ++n) e[n] = i.allocateTextureUnit();
  return e;
}
function mf(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1f(this.addr, t), (e[0] = t));
}
function xf(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) &&
      (i.uniform2f(this.addr, t.x, t.y), (e[0] = t.x), (e[1] = t.y));
  else {
    if (pe(e, t)) return;
    (i.uniform2fv(this.addr, t), me(e, t));
  }
}
function _f(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) &&
      (i.uniform3f(this.addr, t.x, t.y, t.z),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z));
  else if (t.r !== void 0)
    (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) &&
      (i.uniform3f(this.addr, t.r, t.g, t.b),
      (e[0] = t.r),
      (e[1] = t.g),
      (e[2] = t.b));
  else {
    if (pe(e, t)) return;
    (i.uniform3fv(this.addr, t), me(e, t));
  }
}
function gf(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) &&
      (i.uniform4f(this.addr, t.x, t.y, t.z, t.w),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z),
      (e[3] = t.w));
  else {
    if (pe(e, t)) return;
    (i.uniform4fv(this.addr, t), me(e, t));
  }
}
function vf(i, t) {
  const e = this.cache,
    n = t.elements;
  if (n === void 0) {
    if (pe(e, t)) return;
    (i.uniformMatrix2fv(this.addr, !1, t), me(e, t));
  } else {
    if (pe(e, n)) return;
    (co.set(n), i.uniformMatrix2fv(this.addr, !1, co), me(e, n));
  }
}
function Mf(i, t) {
  const e = this.cache,
    n = t.elements;
  if (n === void 0) {
    if (pe(e, t)) return;
    (i.uniformMatrix3fv(this.addr, !1, t), me(e, t));
  } else {
    if (pe(e, n)) return;
    (oo.set(n), i.uniformMatrix3fv(this.addr, !1, oo), me(e, n));
  }
}
function Sf(i, t) {
  const e = this.cache,
    n = t.elements;
  if (n === void 0) {
    if (pe(e, t)) return;
    (i.uniformMatrix4fv(this.addr, !1, t), me(e, t));
  } else {
    if (pe(e, n)) return;
    (ao.set(n), i.uniformMatrix4fv(this.addr, !1, ao), me(e, n));
  }
}
function bf(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1i(this.addr, t), (e[0] = t));
}
function Ef(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) &&
      (i.uniform2i(this.addr, t.x, t.y), (e[0] = t.x), (e[1] = t.y));
  else {
    if (pe(e, t)) return;
    (i.uniform2iv(this.addr, t), me(e, t));
  }
}
function yf(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) &&
      (i.uniform3i(this.addr, t.x, t.y, t.z),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z));
  else {
    if (pe(e, t)) return;
    (i.uniform3iv(this.addr, t), me(e, t));
  }
}
function Tf(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) &&
      (i.uniform4i(this.addr, t.x, t.y, t.z, t.w),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z),
      (e[3] = t.w));
  else {
    if (pe(e, t)) return;
    (i.uniform4iv(this.addr, t), me(e, t));
  }
}
function Af(i, t) {
  const e = this.cache;
  e[0] !== t && (i.uniform1ui(this.addr, t), (e[0] = t));
}
function wf(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y) &&
      (i.uniform2ui(this.addr, t.x, t.y), (e[0] = t.x), (e[1] = t.y));
  else {
    if (pe(e, t)) return;
    (i.uniform2uiv(this.addr, t), me(e, t));
  }
}
function Rf(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) &&
      (i.uniform3ui(this.addr, t.x, t.y, t.z),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z));
  else {
    if (pe(e, t)) return;
    (i.uniform3uiv(this.addr, t), me(e, t));
  }
}
function Cf(i, t) {
  const e = this.cache;
  if (t.x !== void 0)
    (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) &&
      (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w),
      (e[0] = t.x),
      (e[1] = t.y),
      (e[2] = t.z),
      (e[3] = t.w));
  else {
    if (pe(e, t)) return;
    (i.uniform4uiv(this.addr, t), me(e, t));
  }
}
function Pf(i, t, e) {
  const n = this.cache,
    s = e.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s));
  let r;
  (this.type === i.SAMPLER_2D_SHADOW
    ? ((io.compareFunction = Bo), (r = io))
    : (r = tc),
    e.setTexture2D(t || r, s));
}
function Df(i, t, e) {
  const n = this.cache,
    s = e.allocateTextureUnit();
  (n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s)),
    e.setTexture3D(t || nc, s));
}
function Lf(i, t, e) {
  const n = this.cache,
    s = e.allocateTextureUnit();
  (n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s)),
    e.setTextureCube(t || ic, s));
}
function Uf(i, t, e) {
  const n = this.cache,
    s = e.allocateTextureUnit();
  (n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s)),
    e.setTexture2DArray(t || ec, s));
}
function If(i) {
  switch (i) {
    case 5126:
      return mf;
    case 35664:
      return xf;
    case 35665:
      return _f;
    case 35666:
      return gf;
    case 35674:
      return vf;
    case 35675:
      return Mf;
    case 35676:
      return Sf;
    case 5124:
    case 35670:
      return bf;
    case 35667:
    case 35671:
      return Ef;
    case 35668:
    case 35672:
      return yf;
    case 35669:
    case 35673:
      return Tf;
    case 5125:
      return Af;
    case 36294:
      return wf;
    case 36295:
      return Rf;
    case 36296:
      return Cf;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Pf;
    case 35679:
    case 36299:
    case 36307:
      return Df;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Lf;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Uf;
  }
}
function Nf(i, t) {
  i.uniform1fv(this.addr, t);
}
function Ff(i, t) {
  const e = Si(t, this.size, 2);
  i.uniform2fv(this.addr, e);
}
function Of(i, t) {
  const e = Si(t, this.size, 3);
  i.uniform3fv(this.addr, e);
}
function Bf(i, t) {
  const e = Si(t, this.size, 4);
  i.uniform4fv(this.addr, e);
}
function zf(i, t) {
  const e = Si(t, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, e);
}
function Vf(i, t) {
  const e = Si(t, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, e);
}
function Gf(i, t) {
  const e = Si(t, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, e);
}
function Hf(i, t) {
  i.uniform1iv(this.addr, t);
}
function kf(i, t) {
  i.uniform2iv(this.addr, t);
}
function Wf(i, t) {
  i.uniform3iv(this.addr, t);
}
function Xf(i, t) {
  i.uniform4iv(this.addr, t);
}
function Yf(i, t) {
  i.uniform1uiv(this.addr, t);
}
function qf(i, t) {
  i.uniform2uiv(this.addr, t);
}
function jf(i, t) {
  i.uniform3uiv(this.addr, t);
}
function Kf(i, t) {
  i.uniform4uiv(this.addr, t);
}
function $f(i, t, e) {
  const n = this.cache,
    s = t.length,
    r = vs(e, s);
  pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
  for (let a = 0; a !== s; ++a) e.setTexture2D(t[a] || tc, r[a]);
}
function Zf(i, t, e) {
  const n = this.cache,
    s = t.length,
    r = vs(e, s);
  pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
  for (let a = 0; a !== s; ++a) e.setTexture3D(t[a] || nc, r[a]);
}
function Jf(i, t, e) {
  const n = this.cache,
    s = t.length,
    r = vs(e, s);
  pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
  for (let a = 0; a !== s; ++a) e.setTextureCube(t[a] || ic, r[a]);
}
function Qf(i, t, e) {
  const n = this.cache,
    s = t.length,
    r = vs(e, s);
  pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
  for (let a = 0; a !== s; ++a) e.setTexture2DArray(t[a] || ec, r[a]);
}
function tp(i) {
  switch (i) {
    case 5126:
      return Nf;
    case 35664:
      return Ff;
    case 35665:
      return Of;
    case 35666:
      return Bf;
    case 35674:
      return zf;
    case 35675:
      return Vf;
    case 35676:
      return Gf;
    case 5124:
    case 35670:
      return Hf;
    case 35667:
    case 35671:
      return kf;
    case 35668:
    case 35672:
      return Wf;
    case 35669:
    case 35673:
      return Xf;
    case 5125:
      return Yf;
    case 36294:
      return qf;
    case 36295:
      return jf;
    case 36296:
      return Kf;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return $f;
    case 35679:
    case 36299:
    case 36307:
      return Zf;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Jf;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Qf;
  }
}
class ep {
  constructor(t, e, n) {
    ((this.id = t),
      (this.addr = n),
      (this.cache = []),
      (this.type = e.type),
      (this.setValue = If(e.type)));
  }
}
class np {
  constructor(t, e, n) {
    ((this.id = t),
      (this.addr = n),
      (this.cache = []),
      (this.type = e.type),
      (this.size = e.size),
      (this.setValue = tp(e.type)));
  }
}
class ip {
  constructor(t) {
    ((this.id = t), (this.seq = []), (this.map = {}));
  }
  setValue(t, e, n) {
    const s = this.seq;
    for (let r = 0, a = s.length; r !== a; ++r) {
      const o = s[r];
      o.setValue(t, e[o.id], n);
    }
  }
}
const tr = /(\w+)(\])?(\[|\.)?/g;
function lo(i, t) {
  (i.seq.push(t), (i.map[t.id] = t));
}
function sp(i, t, e) {
  const n = i.name,
    s = n.length;
  for (tr.lastIndex = 0; ; ) {
    const r = tr.exec(n),
      a = tr.lastIndex;
    let o = r[1];
    const l = r[2] === "]",
      c = r[3];
    if ((l && (o = o | 0), c === void 0 || (c === "[" && a + 2 === s))) {
      lo(e, c === void 0 ? new ep(o, i, t) : new np(o, i, t));
      break;
    } else {
      let h = e.map[o];
      (h === void 0 && ((h = new ip(o)), lo(e, h)), (e = h));
    }
  }
}
class fs {
  constructor(t, e) {
    ((this.seq = []), (this.map = {}));
    const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let s = 0; s < n; ++s) {
      const r = t.getActiveUniform(e, s),
        a = t.getUniformLocation(e, r.name);
      sp(r, a, this);
    }
  }
  setValue(t, e, n, s) {
    const r = this.map[e];
    r !== void 0 && r.setValue(t, n, s);
  }
  setOptional(t, e, n) {
    const s = e[n];
    s !== void 0 && this.setValue(t, n, s);
  }
  static upload(t, e, n, s) {
    for (let r = 0, a = e.length; r !== a; ++r) {
      const o = e[r],
        l = n[o.id];
      l.needsUpdate !== !1 && o.setValue(t, l.value, s);
    }
  }
  static seqWithValue(t, e) {
    const n = [];
    for (let s = 0, r = t.length; s !== r; ++s) {
      const a = t[s];
      a.id in e && n.push(a);
    }
    return n;
  }
}
function ho(i, t, e) {
  const n = i.createShader(t);
  return (i.shaderSource(n, e), i.compileShader(n), n);
}
const rp = 37297;
let ap = 0;
function op(i, t) {
  const e = i.split(`
`),
    n = [],
    s = Math.max(t - 6, 0),
    r = Math.min(t + 6, e.length);
  for (let a = s; a < r; a++) {
    const o = a + 1;
    n.push(`${o === t ? ">" : " "} ${o}: ${e[a]}`);
  }
  return n.join(`
`);
}
const uo = new Nt();
function cp(i) {
  Xt._getMatrix(uo, Xt.workingColorSpace, i);
  const t = `mat3( ${uo.elements.map((e) => e.toFixed(4))} )`;
  switch (Xt.getTransfer(i)) {
    case ps:
      return [t, "LinearTransferOETF"];
    case $t:
      return [t, "sRGBTransferOETF"];
    default:
      return (
        Ut("WebGLProgram: Unsupported color space: ", i),
        [t, "LinearTransferOETF"]
      );
  }
}
function fo(i, t, e) {
  const n = i.getShaderParameter(t, i.COMPILE_STATUS),
    r = (i.getShaderInfoLog(t) || "").trim();
  if (n && r === "") return "";
  const a = /ERROR: 0:(\d+)/.exec(r);
  if (a) {
    const o = parseInt(a[1]);
    return (
      e.toUpperCase() +
      `

` +
      r +
      `

` +
      op(i.getShaderSource(t), o)
    );
  } else return r;
}
function lp(i, t) {
  const e = cp(t);
  return [
    `vec4 ${i}( vec4 value ) {`,
    `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,
    "}",
  ].join(`
`);
}
function hp(i, t) {
  let e;
  switch (t) {
    case ll:
      e = "Linear";
      break;
    case hl:
      e = "Reinhard";
      break;
    case ul:
      e = "Cineon";
      break;
    case dl:
      e = "ACESFilmic";
      break;
    case pl:
      e = "AgX";
      break;
    case ml:
      e = "Neutral";
      break;
    case fl:
      e = "Custom";
      break;
    default:
      (Ut("WebGLProgram: Unsupported toneMapping:", t), (e = "Linear"));
  }
  return (
    "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }"
  );
}
const as = new F();
function up() {
  Xt.getLuminanceCoefficients(as);
  const i = as.x.toFixed(4),
    t = as.y.toFixed(4),
    e = as.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,
    "	return dot( weights, rgb );",
    "}",
  ].join(`
`);
}
function dp(i) {
  return [
    i.extensionClipCullDistance
      ? "#extension GL_ANGLE_clip_cull_distance : require"
      : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : "",
  ].filter(Di).join(`
`);
}
function fp(i) {
  const t = [];
  for (const e in i) {
    const n = i[e];
    n !== !1 && t.push("#define " + e + " " + n);
  }
  return t.join(`
`);
}
function pp(i, t) {
  const e = {},
    n = i.getProgramParameter(t, i.ACTIVE_ATTRIBUTES);
  for (let s = 0; s < n; s++) {
    const r = i.getActiveAttrib(t, s),
      a = r.name;
    let o = 1;
    (r.type === i.FLOAT_MAT2 && (o = 2),
      r.type === i.FLOAT_MAT3 && (o = 3),
      r.type === i.FLOAT_MAT4 && (o = 4),
      (e[a] = {
        type: r.type,
        location: i.getAttribLocation(t, a),
        locationSize: o,
      }));
  }
  return e;
}
function Di(i) {
  return i !== "";
}
function po(i, t) {
  const e =
    t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return i
    .replace(/NUM_DIR_LIGHTS/g, t.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights)
    .replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps)
    .replace(/NUM_SPOT_LIGHT_COORDS/g, e)
    .replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights)
    .replace(/NUM_POINT_LIGHTS/g, t.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights)
    .replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows)
    .replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps)
    .replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows)
    .replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function mo(i, t) {
  return i
    .replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes)
    .replace(
      /UNION_CLIPPING_PLANES/g,
      t.numClippingPlanes - t.numClipIntersection,
    );
}
const mp = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Yr(i) {
  return i.replace(mp, _p);
}
const xp = new Map();
function _p(i, t) {
  let e = Ft[t];
  if (e === void 0) {
    const n = xp.get(t);
    if (n !== void 0)
      ((e = Ft[n]),
        Ut(
          'WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',
          t,
          n,
        ));
    else throw new Error("Can not resolve #include <" + t + ">");
  }
  return Yr(e);
}
const gp =
  /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function xo(i) {
  return i.replace(gp, vp);
}
function vp(i, t, e, n) {
  let s = "";
  for (let r = parseInt(t); r < parseInt(e); r++)
    s += n
      .replace(/\[\s*i\s*\]/g, "[ " + r + " ]")
      .replace(/UNROLLED_LOOP_INDEX/g, r);
  return s;
}
function _o(i) {
  let t = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
  return (
    i.precision === "highp"
      ? (t += `
#define HIGH_PRECISION`)
      : i.precision === "mediump"
        ? (t += `
#define MEDIUM_PRECISION`)
        : i.precision === "lowp" &&
          (t += `
#define LOW_PRECISION`),
    t
  );
}
function Mp(i) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return (
    i.shadowMapType === Ao
      ? (t = "SHADOWMAP_TYPE_PCF")
      : i.shadowMapType === wo
        ? (t = "SHADOWMAP_TYPE_PCF_SOFT")
        : i.shadowMapType === dn && (t = "SHADOWMAP_TYPE_VSM"),
    t
  );
}
function Sp(i) {
  let t = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case fi:
      case pi:
        t = "ENVMAP_TYPE_CUBE";
        break;
      case _s:
        t = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return t;
}
function bp(i) {
  let t = "ENVMAP_MODE_REFLECTION";
  if (i.envMap)
    switch (i.envMapMode) {
      case pi:
        t = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return t;
}
function Ep(i) {
  let t = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case Ro:
        t = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case ol:
        t = "ENVMAP_BLENDING_MIX";
        break;
      case cl:
        t = "ENVMAP_BLENDING_ADD";
        break;
    }
  return t;
}
function yp(i) {
  const t = i.envMapCubeUVHeight;
  if (t === null) return null;
  const e = Math.log2(t) - 2,
    n = 1 / t;
  return {
    texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 112)),
    texelHeight: n,
    maxMip: e,
  };
}
function Tp(i, t, e, n) {
  const s = i.getContext(),
    r = e.defines;
  let a = e.vertexShader,
    o = e.fragmentShader;
  const l = Mp(e),
    c = Sp(e),
    u = bp(e),
    h = Ep(e),
    f = yp(e),
    p = dp(e),
    _ = fp(r),
    S = s.createProgram();
  let m,
    d,
    E = e.glslVersion
      ? "#version " +
        e.glslVersion +
        `
`
      : "";
  (e.isRawShaderMaterial
    ? ((m = [
        "#define SHADER_TYPE " + e.shaderType,
        "#define SHADER_NAME " + e.shaderName,
        _,
      ].filter(Di).join(`
`)),
      m.length > 0 &&
        (m += `
`),
      (d = [
        "#define SHADER_TYPE " + e.shaderType,
        "#define SHADER_NAME " + e.shaderName,
        _,
      ].filter(Di).join(`
`)),
      d.length > 0 &&
        (d += `
`))
    : ((m = [
        _o(e),
        "#define SHADER_TYPE " + e.shaderType,
        "#define SHADER_NAME " + e.shaderName,
        _,
        e.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
        e.batching ? "#define USE_BATCHING" : "",
        e.batchingColor ? "#define USE_BATCHING_COLOR" : "",
        e.instancing ? "#define USE_INSTANCING" : "",
        e.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
        e.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
        e.useFog && e.fog ? "#define USE_FOG" : "",
        e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
        e.map ? "#define USE_MAP" : "",
        e.envMap ? "#define USE_ENVMAP" : "",
        e.envMap ? "#define " + u : "",
        e.lightMap ? "#define USE_LIGHTMAP" : "",
        e.aoMap ? "#define USE_AOMAP" : "",
        e.bumpMap ? "#define USE_BUMPMAP" : "",
        e.normalMap ? "#define USE_NORMALMAP" : "",
        e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
        e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
        e.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
        e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
        e.anisotropy ? "#define USE_ANISOTROPY" : "",
        e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
        e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
        e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
        e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
        e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
        e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
        e.specularMap ? "#define USE_SPECULARMAP" : "",
        e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
        e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
        e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
        e.metalnessMap ? "#define USE_METALNESSMAP" : "",
        e.alphaMap ? "#define USE_ALPHAMAP" : "",
        e.alphaHash ? "#define USE_ALPHAHASH" : "",
        e.transmission ? "#define USE_TRANSMISSION" : "",
        e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
        e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
        e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
        e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
        e.mapUv ? "#define MAP_UV " + e.mapUv : "",
        e.alphaMapUv ? "#define ALPHAMAP_UV " + e.alphaMapUv : "",
        e.lightMapUv ? "#define LIGHTMAP_UV " + e.lightMapUv : "",
        e.aoMapUv ? "#define AOMAP_UV " + e.aoMapUv : "",
        e.emissiveMapUv ? "#define EMISSIVEMAP_UV " + e.emissiveMapUv : "",
        e.bumpMapUv ? "#define BUMPMAP_UV " + e.bumpMapUv : "",
        e.normalMapUv ? "#define NORMALMAP_UV " + e.normalMapUv : "",
        e.displacementMapUv
          ? "#define DISPLACEMENTMAP_UV " + e.displacementMapUv
          : "",
        e.metalnessMapUv ? "#define METALNESSMAP_UV " + e.metalnessMapUv : "",
        e.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + e.roughnessMapUv : "",
        e.anisotropyMapUv
          ? "#define ANISOTROPYMAP_UV " + e.anisotropyMapUv
          : "",
        e.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + e.clearcoatMapUv : "",
        e.clearcoatNormalMapUv
          ? "#define CLEARCOAT_NORMALMAP_UV " + e.clearcoatNormalMapUv
          : "",
        e.clearcoatRoughnessMapUv
          ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + e.clearcoatRoughnessMapUv
          : "",
        e.iridescenceMapUv
          ? "#define IRIDESCENCEMAP_UV " + e.iridescenceMapUv
          : "",
        e.iridescenceThicknessMapUv
          ? "#define IRIDESCENCE_THICKNESSMAP_UV " + e.iridescenceThicknessMapUv
          : "",
        e.sheenColorMapUv
          ? "#define SHEEN_COLORMAP_UV " + e.sheenColorMapUv
          : "",
        e.sheenRoughnessMapUv
          ? "#define SHEEN_ROUGHNESSMAP_UV " + e.sheenRoughnessMapUv
          : "",
        e.specularMapUv ? "#define SPECULARMAP_UV " + e.specularMapUv : "",
        e.specularColorMapUv
          ? "#define SPECULAR_COLORMAP_UV " + e.specularColorMapUv
          : "",
        e.specularIntensityMapUv
          ? "#define SPECULAR_INTENSITYMAP_UV " + e.specularIntensityMapUv
          : "",
        e.transmissionMapUv
          ? "#define TRANSMISSIONMAP_UV " + e.transmissionMapUv
          : "",
        e.thicknessMapUv ? "#define THICKNESSMAP_UV " + e.thicknessMapUv : "",
        e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "",
        e.vertexColors ? "#define USE_COLOR" : "",
        e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
        e.vertexUv1s ? "#define USE_UV1" : "",
        e.vertexUv2s ? "#define USE_UV2" : "",
        e.vertexUv3s ? "#define USE_UV3" : "",
        e.pointsUvs ? "#define USE_POINTS_UV" : "",
        e.flatShading ? "#define FLAT_SHADED" : "",
        e.skinning ? "#define USE_SKINNING" : "",
        e.morphTargets ? "#define USE_MORPHTARGETS" : "",
        e.morphNormals && e.flatShading === !1
          ? "#define USE_MORPHNORMALS"
          : "",
        e.morphColors ? "#define USE_MORPHCOLORS" : "",
        e.morphTargetsCount > 0
          ? "#define MORPHTARGETS_TEXTURE_STRIDE " + e.morphTextureStride
          : "",
        e.morphTargetsCount > 0
          ? "#define MORPHTARGETS_COUNT " + e.morphTargetsCount
          : "",
        e.doubleSided ? "#define DOUBLE_SIDED" : "",
        e.flipSided ? "#define FLIP_SIDED" : "",
        e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
        e.shadowMapEnabled ? "#define " + l : "",
        e.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
        e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
        e.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
        e.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
        "uniform mat4 modelMatrix;",
        "uniform mat4 modelViewMatrix;",
        "uniform mat4 projectionMatrix;",
        "uniform mat4 viewMatrix;",
        "uniform mat3 normalMatrix;",
        "uniform vec3 cameraPosition;",
        "uniform bool isOrthographic;",
        "#ifdef USE_INSTANCING",
        "	attribute mat4 instanceMatrix;",
        "#endif",
        "#ifdef USE_INSTANCING_COLOR",
        "	attribute vec3 instanceColor;",
        "#endif",
        "#ifdef USE_INSTANCING_MORPH",
        "	uniform sampler2D morphTexture;",
        "#endif",
        "attribute vec3 position;",
        "attribute vec3 normal;",
        "attribute vec2 uv;",
        "#ifdef USE_UV1",
        "	attribute vec2 uv1;",
        "#endif",
        "#ifdef USE_UV2",
        "	attribute vec2 uv2;",
        "#endif",
        "#ifdef USE_UV3",
        "	attribute vec2 uv3;",
        "#endif",
        "#ifdef USE_TANGENT",
        "	attribute vec4 tangent;",
        "#endif",
        "#if defined( USE_COLOR_ALPHA )",
        "	attribute vec4 color;",
        "#elif defined( USE_COLOR )",
        "	attribute vec3 color;",
        "#endif",
        "#ifdef USE_SKINNING",
        "	attribute vec4 skinIndex;",
        "	attribute vec4 skinWeight;",
        "#endif",
        `
`,
      ].filter(Di).join(`
`)),
      (d = [
        _o(e),
        "#define SHADER_TYPE " + e.shaderType,
        "#define SHADER_NAME " + e.shaderName,
        _,
        e.useFog && e.fog ? "#define USE_FOG" : "",
        e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
        e.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
        e.map ? "#define USE_MAP" : "",
        e.matcap ? "#define USE_MATCAP" : "",
        e.envMap ? "#define USE_ENVMAP" : "",
        e.envMap ? "#define " + c : "",
        e.envMap ? "#define " + u : "",
        e.envMap ? "#define " + h : "",
        f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
        f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
        f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
        e.lightMap ? "#define USE_LIGHTMAP" : "",
        e.aoMap ? "#define USE_AOMAP" : "",
        e.bumpMap ? "#define USE_BUMPMAP" : "",
        e.normalMap ? "#define USE_NORMALMAP" : "",
        e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
        e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
        e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
        e.anisotropy ? "#define USE_ANISOTROPY" : "",
        e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
        e.clearcoat ? "#define USE_CLEARCOAT" : "",
        e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
        e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
        e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
        e.dispersion ? "#define USE_DISPERSION" : "",
        e.iridescence ? "#define USE_IRIDESCENCE" : "",
        e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
        e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
        e.specularMap ? "#define USE_SPECULARMAP" : "",
        e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
        e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
        e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
        e.metalnessMap ? "#define USE_METALNESSMAP" : "",
        e.alphaMap ? "#define USE_ALPHAMAP" : "",
        e.alphaTest ? "#define USE_ALPHATEST" : "",
        e.alphaHash ? "#define USE_ALPHAHASH" : "",
        e.sheen ? "#define USE_SHEEN" : "",
        e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
        e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
        e.transmission ? "#define USE_TRANSMISSION" : "",
        e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
        e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
        e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "",
        e.vertexColors || e.instancingColor || e.batchingColor
          ? "#define USE_COLOR"
          : "",
        e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
        e.vertexUv1s ? "#define USE_UV1" : "",
        e.vertexUv2s ? "#define USE_UV2" : "",
        e.vertexUv3s ? "#define USE_UV3" : "",
        e.pointsUvs ? "#define USE_POINTS_UV" : "",
        e.gradientMap ? "#define USE_GRADIENTMAP" : "",
        e.flatShading ? "#define FLAT_SHADED" : "",
        e.doubleSided ? "#define DOUBLE_SIDED" : "",
        e.flipSided ? "#define FLIP_SIDED" : "",
        e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
        e.shadowMapEnabled ? "#define " + l : "",
        e.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
        e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
        e.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
        e.decodeVideoTextureEmissive
          ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE"
          : "",
        e.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
        e.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
        "uniform mat4 viewMatrix;",
        "uniform vec3 cameraPosition;",
        "uniform bool isOrthographic;",
        e.toneMapping !== Rn ? "#define TONE_MAPPING" : "",
        e.toneMapping !== Rn ? Ft.tonemapping_pars_fragment : "",
        e.toneMapping !== Rn ? hp("toneMapping", e.toneMapping) : "",
        e.dithering ? "#define DITHERING" : "",
        e.opaque ? "#define OPAQUE" : "",
        Ft.colorspace_pars_fragment,
        lp("linearToOutputTexel", e.outputColorSpace),
        up(),
        e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "",
        `
`,
      ].filter(Di).join(`
`))),
    (a = Yr(a)),
    (a = po(a, e)),
    (a = mo(a, e)),
    (o = Yr(o)),
    (o = po(o, e)),
    (o = mo(o, e)),
    (a = xo(a)),
    (o = xo(o)),
    e.isRawShaderMaterial !== !0 &&
      ((E = `#version 300 es
`),
      (m =
        [
          p,
          "#define attribute in",
          "#define varying out",
          "#define texture2D texture",
        ].join(`
`) +
        `
` +
        m),
      (d =
        [
          "#define varying in",
          e.glslVersion === wa
            ? ""
            : "layout(location = 0) out highp vec4 pc_fragColor;",
          e.glslVersion === wa ? "" : "#define gl_FragColor pc_fragColor",
          "#define gl_FragDepthEXT gl_FragDepth",
          "#define texture2D texture",
          "#define textureCube texture",
          "#define texture2DProj textureProj",
          "#define texture2DLodEXT textureLod",
          "#define texture2DProjLodEXT textureProjLod",
          "#define textureCubeLodEXT textureLod",
          "#define texture2DGradEXT textureGrad",
          "#define texture2DProjGradEXT textureProjGrad",
          "#define textureCubeGradEXT textureGrad",
        ].join(`
`) +
        `
` +
        d)));
  const b = E + m + a,
    y = E + d + o,
    R = ho(s, s.VERTEX_SHADER, b),
    T = ho(s, s.FRAGMENT_SHADER, y);
  (s.attachShader(S, R),
    s.attachShader(S, T),
    e.index0AttributeName !== void 0
      ? s.bindAttribLocation(S, 0, e.index0AttributeName)
      : e.morphTargets === !0 && s.bindAttribLocation(S, 0, "position"),
    s.linkProgram(S));
  function w(D) {
    if (i.debug.checkShaderErrors) {
      const N = s.getProgramInfoLog(S) || "",
        V = s.getShaderInfoLog(R) || "",
        W = s.getShaderInfoLog(T) || "",
        k = N.trim(),
        q = V.trim(),
        J = W.trim();
      let H = !0,
        nt = !0;
      if (s.getProgramParameter(S, s.LINK_STATUS) === !1)
        if (((H = !1), typeof i.debug.onShaderError == "function"))
          i.debug.onShaderError(s, S, R, T);
        else {
          const rt = fo(s, R, "vertex"),
            bt = fo(s, T, "fragment");
          he(
            "THREE.WebGLProgram: Shader Error " +
              s.getError() +
              " - VALIDATE_STATUS " +
              s.getProgramParameter(S, s.VALIDATE_STATUS) +
              `

Material Name: ` +
              D.name +
              `
Material Type: ` +
              D.type +
              `

Program Info Log: ` +
              k +
              `
` +
              rt +
              `
` +
              bt,
          );
        }
      else
        k !== ""
          ? Ut("WebGLProgram: Program Info Log:", k)
          : (q === "" || J === "") && (nt = !1);
      nt &&
        (D.diagnostics = {
          runnable: H,
          programLog: k,
          vertexShader: { log: q, prefix: m },
          fragmentShader: { log: J, prefix: d },
        });
    }
    (s.deleteShader(R), s.deleteShader(T), (L = new fs(s, S)), (M = pp(s, S)));
  }
  let L;
  this.getUniforms = function () {
    return (L === void 0 && w(this), L);
  };
  let M;
  this.getAttributes = function () {
    return (M === void 0 && w(this), M);
  };
  let g = e.rendererExtensionParallelShaderCompile === !1;
  return (
    (this.isReady = function () {
      return (g === !1 && (g = s.getProgramParameter(S, rp)), g);
    }),
    (this.destroy = function () {
      (n.releaseStatesOfProgram(this),
        s.deleteProgram(S),
        (this.program = void 0));
    }),
    (this.type = e.shaderType),
    (this.name = e.shaderName),
    (this.id = ap++),
    (this.cacheKey = t),
    (this.usedTimes = 1),
    (this.program = S),
    (this.vertexShader = R),
    (this.fragmentShader = T),
    this
  );
}
let Ap = 0;
class wp {
  constructor() {
    ((this.shaderCache = new Map()), (this.materialCache = new Map()));
  }
  update(t) {
    const e = t.vertexShader,
      n = t.fragmentShader,
      s = this._getShaderStage(e),
      r = this._getShaderStage(n),
      a = this._getShaderCacheForMaterial(t);
    return (
      a.has(s) === !1 && (a.add(s), s.usedTimes++),
      a.has(r) === !1 && (a.add(r), r.usedTimes++),
      this
    );
  }
  remove(t) {
    const e = this.materialCache.get(t);
    for (const n of e)
      (n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code));
    return (this.materialCache.delete(t), this);
  }
  getVertexShaderID(t) {
    return this._getShaderStage(t.vertexShader).id;
  }
  getFragmentShaderID(t) {
    return this._getShaderStage(t.fragmentShader).id;
  }
  dispose() {
    (this.shaderCache.clear(), this.materialCache.clear());
  }
  _getShaderCacheForMaterial(t) {
    const e = this.materialCache;
    let n = e.get(t);
    return (n === void 0 && ((n = new Set()), e.set(t, n)), n);
  }
  _getShaderStage(t) {
    const e = this.shaderCache;
    let n = e.get(t);
    return (n === void 0 && ((n = new Rp(t)), e.set(t, n)), n);
  }
}
class Rp {
  constructor(t) {
    ((this.id = Ap++), (this.code = t), (this.usedTimes = 0));
  }
}
function Cp(i, t, e, n, s, r, a) {
  const o = new Ho(),
    l = new wp(),
    c = new Set(),
    u = [],
    h = s.logarithmicDepthBuffer,
    f = s.vertexTextures;
  let p = s.precision;
  const _ = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite",
  };
  function S(M) {
    return (c.add(M), M === 0 ? "uv" : `uv${M}`);
  }
  function m(M, g, D, N, V) {
    const W = N.fog,
      k = V.geometry,
      q = M.isMeshStandardMaterial ? N.environment : null,
      J = (M.isMeshStandardMaterial ? e : t).get(M.envMap || q),
      H = J && J.mapping === _s ? J.image.height : null,
      nt = _[M.type];
    M.precision !== null &&
      ((p = s.getMaxPrecision(M.precision)),
      p !== M.precision &&
        Ut(
          "WebGLProgram.getParameters:",
          M.precision,
          "not supported, using",
          p,
          "instead.",
        ));
    const rt =
        k.morphAttributes.position ||
        k.morphAttributes.normal ||
        k.morphAttributes.color,
      bt = rt !== void 0 ? rt.length : 0;
    let kt = 0;
    (k.morphAttributes.position !== void 0 && (kt = 1),
      k.morphAttributes.normal !== void 0 && (kt = 2),
      k.morphAttributes.color !== void 0 && (kt = 3));
    let qt, Qt, te, Y;
    if (nt) {
      const jt = Qe[nt];
      ((qt = jt.vertexShader), (Qt = jt.fragmentShader));
    } else
      ((qt = M.vertexShader),
        (Qt = M.fragmentShader),
        l.update(M),
        (te = l.getVertexShaderID(M)),
        (Y = l.getFragmentShaderID(M)));
    const $ = i.getRenderTarget(),
      ft = i.state.buffers.depth.getReversed(),
      It = V.isInstancedMesh === !0,
      vt = V.isBatchedMesh === !0,
      zt = !!M.map,
      ge = !!M.matcap,
      Ot = !!J,
      ie = !!M.aoMap,
      C = !!M.lightMap,
      Vt = !!M.bumpMap,
      Gt = !!M.normalMap,
      ee = !!M.displacementMap,
      xt = !!M.emissiveMap,
      se = !!M.metalnessMap,
      St = !!M.roughnessMap,
      Lt = M.anisotropy > 0,
      A = M.clearcoat > 0,
      x = M.dispersion > 0,
      O = M.iridescence > 0,
      X = M.sheen > 0,
      K = M.transmission > 0,
      G = Lt && !!M.anisotropyMap,
      gt = A && !!M.clearcoatMap,
      ot = A && !!M.clearcoatNormalMap,
      Et = A && !!M.clearcoatRoughnessMap,
      _t = O && !!M.iridescenceMap,
      Z = O && !!M.iridescenceThicknessMap,
      et = X && !!M.sheenColorMap,
      wt = X && !!M.sheenRoughnessMap,
      Tt = !!M.specularMap,
      ut = !!M.specularColorMap,
      Ct = !!M.specularIntensityMap,
      P = K && !!M.transmissionMap,
      ct = K && !!M.thicknessMap,
      it = !!M.gradientMap,
      st = !!M.alphaMap,
      Q = M.alphaTest > 0,
      j = !!M.alphaHash,
      pt = !!M.extensions;
    let Dt = Rn;
    M.toneMapped &&
      ($ === null || $.isXRRenderTarget === !0) &&
      (Dt = i.toneMapping);
    const ne = {
      shaderID: nt,
      shaderType: M.type,
      shaderName: M.name,
      vertexShader: qt,
      fragmentShader: Qt,
      defines: M.defines,
      customVertexShaderID: te,
      customFragmentShaderID: Y,
      isRawShaderMaterial: M.isRawShaderMaterial === !0,
      glslVersion: M.glslVersion,
      precision: p,
      batching: vt,
      batchingColor: vt && V._colorsTexture !== null,
      instancing: It,
      instancingColor: It && V.instanceColor !== null,
      instancingMorph: It && V.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace:
        $ === null
          ? i.outputColorSpace
          : $.isXRRenderTarget === !0
            ? $.texture.colorSpace
            : mi,
      alphaToCoverage: !!M.alphaToCoverage,
      map: zt,
      matcap: ge,
      envMap: Ot,
      envMapMode: Ot && J.mapping,
      envMapCubeUVHeight: H,
      aoMap: ie,
      lightMap: C,
      bumpMap: Vt,
      normalMap: Gt,
      displacementMap: f && ee,
      emissiveMap: xt,
      normalMapObjectSpace: Gt && M.normalMapType === vl,
      normalMapTangentSpace: Gt && M.normalMapType === Oo,
      metalnessMap: se,
      roughnessMap: St,
      anisotropy: Lt,
      anisotropyMap: G,
      clearcoat: A,
      clearcoatMap: gt,
      clearcoatNormalMap: ot,
      clearcoatRoughnessMap: Et,
      dispersion: x,
      iridescence: O,
      iridescenceMap: _t,
      iridescenceThicknessMap: Z,
      sheen: X,
      sheenColorMap: et,
      sheenRoughnessMap: wt,
      specularMap: Tt,
      specularColorMap: ut,
      specularIntensityMap: Ct,
      transmission: K,
      transmissionMap: P,
      thicknessMap: ct,
      gradientMap: it,
      opaque:
        M.transparent === !1 && M.blending === hi && M.alphaToCoverage === !1,
      alphaMap: st,
      alphaTest: Q,
      alphaHash: j,
      combine: M.combine,
      mapUv: zt && S(M.map.channel),
      aoMapUv: ie && S(M.aoMap.channel),
      lightMapUv: C && S(M.lightMap.channel),
      bumpMapUv: Vt && S(M.bumpMap.channel),
      normalMapUv: Gt && S(M.normalMap.channel),
      displacementMapUv: ee && S(M.displacementMap.channel),
      emissiveMapUv: xt && S(M.emissiveMap.channel),
      metalnessMapUv: se && S(M.metalnessMap.channel),
      roughnessMapUv: St && S(M.roughnessMap.channel),
      anisotropyMapUv: G && S(M.anisotropyMap.channel),
      clearcoatMapUv: gt && S(M.clearcoatMap.channel),
      clearcoatNormalMapUv: ot && S(M.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: Et && S(M.clearcoatRoughnessMap.channel),
      iridescenceMapUv: _t && S(M.iridescenceMap.channel),
      iridescenceThicknessMapUv: Z && S(M.iridescenceThicknessMap.channel),
      sheenColorMapUv: et && S(M.sheenColorMap.channel),
      sheenRoughnessMapUv: wt && S(M.sheenRoughnessMap.channel),
      specularMapUv: Tt && S(M.specularMap.channel),
      specularColorMapUv: ut && S(M.specularColorMap.channel),
      specularIntensityMapUv: Ct && S(M.specularIntensityMap.channel),
      transmissionMapUv: P && S(M.transmissionMap.channel),
      thicknessMapUv: ct && S(M.thicknessMap.channel),
      alphaMapUv: st && S(M.alphaMap.channel),
      vertexTangents: !!k.attributes.tangent && (Gt || Lt),
      vertexColors: M.vertexColors,
      vertexAlphas:
        M.vertexColors === !0 &&
        !!k.attributes.color &&
        k.attributes.color.itemSize === 4,
      pointsUvs: V.isPoints === !0 && !!k.attributes.uv && (zt || st),
      fog: !!W,
      useFog: M.fog === !0,
      fogExp2: !!W && W.isFogExp2,
      flatShading: M.flatShading === !0 && M.wireframe === !1,
      sizeAttenuation: M.sizeAttenuation === !0,
      logarithmicDepthBuffer: h,
      reversedDepthBuffer: ft,
      skinning: V.isSkinnedMesh === !0,
      morphTargets: k.morphAttributes.position !== void 0,
      morphNormals: k.morphAttributes.normal !== void 0,
      morphColors: k.morphAttributes.color !== void 0,
      morphTargetsCount: bt,
      morphTextureStride: kt,
      numDirLights: g.directional.length,
      numPointLights: g.point.length,
      numSpotLights: g.spot.length,
      numSpotLightMaps: g.spotLightMap.length,
      numRectAreaLights: g.rectArea.length,
      numHemiLights: g.hemi.length,
      numDirLightShadows: g.directionalShadowMap.length,
      numPointLightShadows: g.pointShadowMap.length,
      numSpotLightShadows: g.spotShadowMap.length,
      numSpotLightShadowsWithMaps: g.numSpotLightShadowsWithMaps,
      numLightProbes: g.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: M.dithering,
      shadowMapEnabled: i.shadowMap.enabled && D.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: Dt,
      decodeVideoTexture:
        zt &&
        M.map.isVideoTexture === !0 &&
        Xt.getTransfer(M.map.colorSpace) === $t,
      decodeVideoTextureEmissive:
        xt &&
        M.emissiveMap.isVideoTexture === !0 &&
        Xt.getTransfer(M.emissiveMap.colorSpace) === $t,
      premultipliedAlpha: M.premultipliedAlpha,
      doubleSided: M.side === tn,
      flipSided: M.side === Le,
      useDepthPacking: M.depthPacking >= 0,
      depthPacking: M.depthPacking || 0,
      index0AttributeName: M.index0AttributeName,
      extensionClipCullDistance:
        pt &&
        M.extensions.clipCullDistance === !0 &&
        n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw:
        ((pt && M.extensions.multiDraw === !0) || vt) &&
        n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has(
        "KHR_parallel_shader_compile",
      ),
      customProgramCacheKey: M.customProgramCacheKey(),
    };
    return (
      (ne.vertexUv1s = c.has(1)),
      (ne.vertexUv2s = c.has(2)),
      (ne.vertexUv3s = c.has(3)),
      c.clear(),
      ne
    );
  }
  function d(M) {
    const g = [];
    if (
      (M.shaderID
        ? g.push(M.shaderID)
        : (g.push(M.customVertexShaderID), g.push(M.customFragmentShaderID)),
      M.defines !== void 0)
    )
      for (const D in M.defines) (g.push(D), g.push(M.defines[D]));
    return (
      M.isRawShaderMaterial === !1 &&
        (E(g, M), b(g, M), g.push(i.outputColorSpace)),
      g.push(M.customProgramCacheKey),
      g.join()
    );
  }
  function E(M, g) {
    (M.push(g.precision),
      M.push(g.outputColorSpace),
      M.push(g.envMapMode),
      M.push(g.envMapCubeUVHeight),
      M.push(g.mapUv),
      M.push(g.alphaMapUv),
      M.push(g.lightMapUv),
      M.push(g.aoMapUv),
      M.push(g.bumpMapUv),
      M.push(g.normalMapUv),
      M.push(g.displacementMapUv),
      M.push(g.emissiveMapUv),
      M.push(g.metalnessMapUv),
      M.push(g.roughnessMapUv),
      M.push(g.anisotropyMapUv),
      M.push(g.clearcoatMapUv),
      M.push(g.clearcoatNormalMapUv),
      M.push(g.clearcoatRoughnessMapUv),
      M.push(g.iridescenceMapUv),
      M.push(g.iridescenceThicknessMapUv),
      M.push(g.sheenColorMapUv),
      M.push(g.sheenRoughnessMapUv),
      M.push(g.specularMapUv),
      M.push(g.specularColorMapUv),
      M.push(g.specularIntensityMapUv),
      M.push(g.transmissionMapUv),
      M.push(g.thicknessMapUv),
      M.push(g.combine),
      M.push(g.fogExp2),
      M.push(g.sizeAttenuation),
      M.push(g.morphTargetsCount),
      M.push(g.morphAttributeCount),
      M.push(g.numDirLights),
      M.push(g.numPointLights),
      M.push(g.numSpotLights),
      M.push(g.numSpotLightMaps),
      M.push(g.numHemiLights),
      M.push(g.numRectAreaLights),
      M.push(g.numDirLightShadows),
      M.push(g.numPointLightShadows),
      M.push(g.numSpotLightShadows),
      M.push(g.numSpotLightShadowsWithMaps),
      M.push(g.numLightProbes),
      M.push(g.shadowMapType),
      M.push(g.toneMapping),
      M.push(g.numClippingPlanes),
      M.push(g.numClipIntersection),
      M.push(g.depthPacking));
  }
  function b(M, g) {
    (o.disableAll(),
      g.supportsVertexTextures && o.enable(0),
      g.instancing && o.enable(1),
      g.instancingColor && o.enable(2),
      g.instancingMorph && o.enable(3),
      g.matcap && o.enable(4),
      g.envMap && o.enable(5),
      g.normalMapObjectSpace && o.enable(6),
      g.normalMapTangentSpace && o.enable(7),
      g.clearcoat && o.enable(8),
      g.iridescence && o.enable(9),
      g.alphaTest && o.enable(10),
      g.vertexColors && o.enable(11),
      g.vertexAlphas && o.enable(12),
      g.vertexUv1s && o.enable(13),
      g.vertexUv2s && o.enable(14),
      g.vertexUv3s && o.enable(15),
      g.vertexTangents && o.enable(16),
      g.anisotropy && o.enable(17),
      g.alphaHash && o.enable(18),
      g.batching && o.enable(19),
      g.dispersion && o.enable(20),
      g.batchingColor && o.enable(21),
      g.gradientMap && o.enable(22),
      M.push(o.mask),
      o.disableAll(),
      g.fog && o.enable(0),
      g.useFog && o.enable(1),
      g.flatShading && o.enable(2),
      g.logarithmicDepthBuffer && o.enable(3),
      g.reversedDepthBuffer && o.enable(4),
      g.skinning && o.enable(5),
      g.morphTargets && o.enable(6),
      g.morphNormals && o.enable(7),
      g.morphColors && o.enable(8),
      g.premultipliedAlpha && o.enable(9),
      g.shadowMapEnabled && o.enable(10),
      g.doubleSided && o.enable(11),
      g.flipSided && o.enable(12),
      g.useDepthPacking && o.enable(13),
      g.dithering && o.enable(14),
      g.transmission && o.enable(15),
      g.sheen && o.enable(16),
      g.opaque && o.enable(17),
      g.pointsUvs && o.enable(18),
      g.decodeVideoTexture && o.enable(19),
      g.decodeVideoTextureEmissive && o.enable(20),
      g.alphaToCoverage && o.enable(21),
      M.push(o.mask));
  }
  function y(M) {
    const g = _[M.type];
    let D;
    if (g) {
      const N = Qe[g];
      D = Kl.clone(N.uniforms);
    } else D = M.uniforms;
    return D;
  }
  function R(M, g) {
    let D;
    for (let N = 0, V = u.length; N < V; N++) {
      const W = u[N];
      if (W.cacheKey === g) {
        ((D = W), ++D.usedTimes);
        break;
      }
    }
    return (D === void 0 && ((D = new Tp(i, g, M, r)), u.push(D)), D);
  }
  function T(M) {
    if (--M.usedTimes === 0) {
      const g = u.indexOf(M);
      ((u[g] = u[u.length - 1]), u.pop(), M.destroy());
    }
  }
  function w(M) {
    l.remove(M);
  }
  function L() {
    l.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: d,
    getUniforms: y,
    acquireProgram: R,
    releaseProgram: T,
    releaseShaderCache: w,
    programs: u,
    dispose: L,
  };
}
function Pp() {
  let i = new WeakMap();
  function t(a) {
    return i.has(a);
  }
  function e(a) {
    let o = i.get(a);
    return (o === void 0 && ((o = {}), i.set(a, o)), o);
  }
  function n(a) {
    i.delete(a);
  }
  function s(a, o, l) {
    i.get(a)[o] = l;
  }
  function r() {
    i = new WeakMap();
  }
  return { has: t, get: e, remove: n, update: s, dispose: r };
}
function Dp(i, t) {
  return i.groupOrder !== t.groupOrder
    ? i.groupOrder - t.groupOrder
    : i.renderOrder !== t.renderOrder
      ? i.renderOrder - t.renderOrder
      : i.material.id !== t.material.id
        ? i.material.id - t.material.id
        : i.z !== t.z
          ? i.z - t.z
          : i.id - t.id;
}
function go(i, t) {
  return i.groupOrder !== t.groupOrder
    ? i.groupOrder - t.groupOrder
    : i.renderOrder !== t.renderOrder
      ? i.renderOrder - t.renderOrder
      : i.z !== t.z
        ? t.z - i.z
        : i.id - t.id;
}
function vo() {
  const i = [];
  let t = 0;
  const e = [],
    n = [],
    s = [];
  function r() {
    ((t = 0), (e.length = 0), (n.length = 0), (s.length = 0));
  }
  function a(h, f, p, _, S, m) {
    let d = i[t];
    return (
      d === void 0
        ? ((d = {
            id: h.id,
            object: h,
            geometry: f,
            material: p,
            groupOrder: _,
            renderOrder: h.renderOrder,
            z: S,
            group: m,
          }),
          (i[t] = d))
        : ((d.id = h.id),
          (d.object = h),
          (d.geometry = f),
          (d.material = p),
          (d.groupOrder = _),
          (d.renderOrder = h.renderOrder),
          (d.z = S),
          (d.group = m)),
      t++,
      d
    );
  }
  function o(h, f, p, _, S, m) {
    const d = a(h, f, p, _, S, m);
    p.transmission > 0
      ? n.push(d)
      : p.transparent === !0
        ? s.push(d)
        : e.push(d);
  }
  function l(h, f, p, _, S, m) {
    const d = a(h, f, p, _, S, m);
    p.transmission > 0
      ? n.unshift(d)
      : p.transparent === !0
        ? s.unshift(d)
        : e.unshift(d);
  }
  function c(h, f) {
    (e.length > 1 && e.sort(h || Dp),
      n.length > 1 && n.sort(f || go),
      s.length > 1 && s.sort(f || go));
  }
  function u() {
    for (let h = t, f = i.length; h < f; h++) {
      const p = i[h];
      if (p.id === null) break;
      ((p.id = null),
        (p.object = null),
        (p.geometry = null),
        (p.material = null),
        (p.group = null));
    }
  }
  return {
    opaque: e,
    transmissive: n,
    transparent: s,
    init: r,
    push: o,
    unshift: l,
    finish: u,
    sort: c,
  };
}
function Lp() {
  let i = new WeakMap();
  function t(n, s) {
    const r = i.get(n);
    let a;
    return (
      r === void 0
        ? ((a = new vo()), i.set(n, [a]))
        : s >= r.length
          ? ((a = new vo()), r.push(a))
          : (a = r[s]),
      a
    );
  }
  function e() {
    i = new WeakMap();
  }
  return { get: t, dispose: e };
}
function Up() {
  const i = {};
  return {
    get: function (t) {
      if (i[t.id] !== void 0) return i[t.id];
      let e;
      switch (t.type) {
        case "DirectionalLight":
          e = { direction: new F(), color: new Yt() };
          break;
        case "SpotLight":
          e = {
            position: new F(),
            direction: new F(),
            color: new Yt(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0,
          };
          break;
        case "PointLight":
          e = { position: new F(), color: new Yt(), distance: 0, decay: 0 };
          break;
        case "HemisphereLight":
          e = { direction: new F(), skyColor: new Yt(), groundColor: new Yt() };
          break;
        case "RectAreaLight":
          e = {
            color: new Yt(),
            position: new F(),
            halfWidth: new F(),
            halfHeight: new F(),
          };
          break;
      }
      return ((i[t.id] = e), e);
    },
  };
}
function Ip() {
  const i = {};
  return {
    get: function (t) {
      if (i[t.id] !== void 0) return i[t.id];
      let e;
      switch (t.type) {
        case "DirectionalLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Pt(),
          };
          break;
        case "SpotLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Pt(),
          };
          break;
        case "PointLight":
          e = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Pt(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3,
          };
          break;
      }
      return ((i[t.id] = e), e);
    },
  };
}
let Np = 0;
function Fp(i, t) {
  return (
    (t.castShadow ? 2 : 0) -
    (i.castShadow ? 2 : 0) +
    (t.map ? 1 : 0) -
    (i.map ? 1 : 0)
  );
}
function Op(i) {
  const t = new Up(),
    e = Ip(),
    n = {
      version: 0,
      hash: {
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1,
        numLightProbes: -1,
      },
      ambient: [0, 0, 0],
      probe: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0,
    };
  for (let c = 0; c < 9; c++) n.probe.push(new F());
  const s = new F(),
    r = new ue(),
    a = new ue();
  function o(c) {
    let u = 0,
      h = 0,
      f = 0;
    for (let M = 0; M < 9; M++) n.probe[M].set(0, 0, 0);
    let p = 0,
      _ = 0,
      S = 0,
      m = 0,
      d = 0,
      E = 0,
      b = 0,
      y = 0,
      R = 0,
      T = 0,
      w = 0;
    c.sort(Fp);
    for (let M = 0, g = c.length; M < g; M++) {
      const D = c[M],
        N = D.color,
        V = D.intensity,
        W = D.distance,
        k = D.shadow && D.shadow.map ? D.shadow.map.texture : null;
      if (D.isAmbientLight) ((u += N.r * V), (h += N.g * V), (f += N.b * V));
      else if (D.isLightProbe) {
        for (let q = 0; q < 9; q++)
          n.probe[q].addScaledVector(D.sh.coefficients[q], V);
        w++;
      } else if (D.isDirectionalLight) {
        const q = t.get(D);
        if ((q.color.copy(D.color).multiplyScalar(D.intensity), D.castShadow)) {
          const J = D.shadow,
            H = e.get(D);
          ((H.shadowIntensity = J.intensity),
            (H.shadowBias = J.bias),
            (H.shadowNormalBias = J.normalBias),
            (H.shadowRadius = J.radius),
            (H.shadowMapSize = J.mapSize),
            (n.directionalShadow[p] = H),
            (n.directionalShadowMap[p] = k),
            (n.directionalShadowMatrix[p] = D.shadow.matrix),
            E++);
        }
        ((n.directional[p] = q), p++);
      } else if (D.isSpotLight) {
        const q = t.get(D);
        (q.position.setFromMatrixPosition(D.matrixWorld),
          q.color.copy(N).multiplyScalar(V),
          (q.distance = W),
          (q.coneCos = Math.cos(D.angle)),
          (q.penumbraCos = Math.cos(D.angle * (1 - D.penumbra))),
          (q.decay = D.decay),
          (n.spot[S] = q));
        const J = D.shadow;
        if (
          (D.map &&
            ((n.spotLightMap[R] = D.map),
            R++,
            J.updateMatrices(D),
            D.castShadow && T++),
          (n.spotLightMatrix[S] = J.matrix),
          D.castShadow)
        ) {
          const H = e.get(D);
          ((H.shadowIntensity = J.intensity),
            (H.shadowBias = J.bias),
            (H.shadowNormalBias = J.normalBias),
            (H.shadowRadius = J.radius),
            (H.shadowMapSize = J.mapSize),
            (n.spotShadow[S] = H),
            (n.spotShadowMap[S] = k),
            y++);
        }
        S++;
      } else if (D.isRectAreaLight) {
        const q = t.get(D);
        (q.color.copy(N).multiplyScalar(V),
          q.halfWidth.set(D.width * 0.5, 0, 0),
          q.halfHeight.set(0, D.height * 0.5, 0),
          (n.rectArea[m] = q),
          m++);
      } else if (D.isPointLight) {
        const q = t.get(D);
        if (
          (q.color.copy(D.color).multiplyScalar(D.intensity),
          (q.distance = D.distance),
          (q.decay = D.decay),
          D.castShadow)
        ) {
          const J = D.shadow,
            H = e.get(D);
          ((H.shadowIntensity = J.intensity),
            (H.shadowBias = J.bias),
            (H.shadowNormalBias = J.normalBias),
            (H.shadowRadius = J.radius),
            (H.shadowMapSize = J.mapSize),
            (H.shadowCameraNear = J.camera.near),
            (H.shadowCameraFar = J.camera.far),
            (n.pointShadow[_] = H),
            (n.pointShadowMap[_] = k),
            (n.pointShadowMatrix[_] = D.shadow.matrix),
            b++);
        }
        ((n.point[_] = q), _++);
      } else if (D.isHemisphereLight) {
        const q = t.get(D);
        (q.skyColor.copy(D.color).multiplyScalar(V),
          q.groundColor.copy(D.groundColor).multiplyScalar(V),
          (n.hemi[d] = q),
          d++);
      }
    }
    (m > 0 &&
      (i.has("OES_texture_float_linear") === !0
        ? ((n.rectAreaLTC1 = at.LTC_FLOAT_1), (n.rectAreaLTC2 = at.LTC_FLOAT_2))
        : ((n.rectAreaLTC1 = at.LTC_HALF_1), (n.rectAreaLTC2 = at.LTC_HALF_2))),
      (n.ambient[0] = u),
      (n.ambient[1] = h),
      (n.ambient[2] = f));
    const L = n.hash;
    (L.directionalLength !== p ||
      L.pointLength !== _ ||
      L.spotLength !== S ||
      L.rectAreaLength !== m ||
      L.hemiLength !== d ||
      L.numDirectionalShadows !== E ||
      L.numPointShadows !== b ||
      L.numSpotShadows !== y ||
      L.numSpotMaps !== R ||
      L.numLightProbes !== w) &&
      ((n.directional.length = p),
      (n.spot.length = S),
      (n.rectArea.length = m),
      (n.point.length = _),
      (n.hemi.length = d),
      (n.directionalShadow.length = E),
      (n.directionalShadowMap.length = E),
      (n.pointShadow.length = b),
      (n.pointShadowMap.length = b),
      (n.spotShadow.length = y),
      (n.spotShadowMap.length = y),
      (n.directionalShadowMatrix.length = E),
      (n.pointShadowMatrix.length = b),
      (n.spotLightMatrix.length = y + R - T),
      (n.spotLightMap.length = R),
      (n.numSpotLightShadowsWithMaps = T),
      (n.numLightProbes = w),
      (L.directionalLength = p),
      (L.pointLength = _),
      (L.spotLength = S),
      (L.rectAreaLength = m),
      (L.hemiLength = d),
      (L.numDirectionalShadows = E),
      (L.numPointShadows = b),
      (L.numSpotShadows = y),
      (L.numSpotMaps = R),
      (L.numLightProbes = w),
      (n.version = Np++));
  }
  function l(c, u) {
    let h = 0,
      f = 0,
      p = 0,
      _ = 0,
      S = 0;
    const m = u.matrixWorldInverse;
    for (let d = 0, E = c.length; d < E; d++) {
      const b = c[d];
      if (b.isDirectionalLight) {
        const y = n.directional[h];
        (y.direction.setFromMatrixPosition(b.matrixWorld),
          s.setFromMatrixPosition(b.target.matrixWorld),
          y.direction.sub(s),
          y.direction.transformDirection(m),
          h++);
      } else if (b.isSpotLight) {
        const y = n.spot[p];
        (y.position.setFromMatrixPosition(b.matrixWorld),
          y.position.applyMatrix4(m),
          y.direction.setFromMatrixPosition(b.matrixWorld),
          s.setFromMatrixPosition(b.target.matrixWorld),
          y.direction.sub(s),
          y.direction.transformDirection(m),
          p++);
      } else if (b.isRectAreaLight) {
        const y = n.rectArea[_];
        (y.position.setFromMatrixPosition(b.matrixWorld),
          y.position.applyMatrix4(m),
          a.identity(),
          r.copy(b.matrixWorld),
          r.premultiply(m),
          a.extractRotation(r),
          y.halfWidth.set(b.width * 0.5, 0, 0),
          y.halfHeight.set(0, b.height * 0.5, 0),
          y.halfWidth.applyMatrix4(a),
          y.halfHeight.applyMatrix4(a),
          _++);
      } else if (b.isPointLight) {
        const y = n.point[f];
        (y.position.setFromMatrixPosition(b.matrixWorld),
          y.position.applyMatrix4(m),
          f++);
      } else if (b.isHemisphereLight) {
        const y = n.hemi[S];
        (y.direction.setFromMatrixPosition(b.matrixWorld),
          y.direction.transformDirection(m),
          S++);
      }
    }
  }
  return { setup: o, setupView: l, state: n };
}
function Mo(i) {
  const t = new Op(i),
    e = [],
    n = [];
  function s(u) {
    ((c.camera = u), (e.length = 0), (n.length = 0));
  }
  function r(u) {
    e.push(u);
  }
  function a(u) {
    n.push(u);
  }
  function o() {
    t.setup(e);
  }
  function l(u) {
    t.setupView(e, u);
  }
  const c = {
    lightsArray: e,
    shadowsArray: n,
    camera: null,
    lights: t,
    transmissionRenderTarget: {},
  };
  return {
    init: s,
    state: c,
    setupLights: o,
    setupLightsView: l,
    pushLight: r,
    pushShadow: a,
  };
}
function Bp(i) {
  let t = new WeakMap();
  function e(s, r = 0) {
    const a = t.get(s);
    let o;
    return (
      a === void 0
        ? ((o = new Mo(i)), t.set(s, [o]))
        : r >= a.length
          ? ((o = new Mo(i)), a.push(o))
          : (o = a[r]),
      o
    );
  }
  function n() {
    t = new WeakMap();
  }
  return { get: e, dispose: n };
}
const zp = `void main() {
	gl_Position = vec4( position, 1.0 );
}`,
  Vp = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function Gp(i, t, e) {
  let n = new ra();
  const s = new Pt(),
    r = new Pt(),
    a = new le(),
    o = new oh({ depthPacking: gl }),
    l = new ch(),
    c = {},
    u = e.maxTextureSize,
    h = { [Pn]: Le, [Le]: Pn, [tn]: tn },
    f = new _n({
      defines: { VSM_SAMPLES: 8 },
      uniforms: {
        shadow_pass: { value: null },
        resolution: { value: new Pt() },
        radius: { value: 4 },
      },
      vertexShader: zp,
      fragmentShader: Vp,
    }),
    p = f.clone();
  p.defines.HORIZONTAL_PASS = 1;
  const _ = new ke();
  _.setAttribute(
    "position",
    new nn(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3),
  );
  const S = new Ae(_, f),
    m = this;
  ((this.enabled = !1),
    (this.autoUpdate = !0),
    (this.needsUpdate = !1),
    (this.type = Ao));
  let d = this.type;
  this.render = function (T, w, L) {
    if (
      m.enabled === !1 ||
      (m.autoUpdate === !1 && m.needsUpdate === !1) ||
      T.length === 0
    )
      return;
    const M = i.getRenderTarget(),
      g = i.getActiveCubeFace(),
      D = i.getActiveMipmapLevel(),
      N = i.state;
    (N.setBlending(mn),
      N.buffers.depth.getReversed() === !0
        ? N.buffers.color.setClear(0, 0, 0, 0)
        : N.buffers.color.setClear(1, 1, 1, 1),
      N.buffers.depth.setTest(!0),
      N.setScissorTest(!1));
    const V = d !== dn && this.type === dn,
      W = d === dn && this.type !== dn;
    for (let k = 0, q = T.length; k < q; k++) {
      const J = T[k],
        H = J.shadow;
      if (H === void 0) {
        Ut("WebGLShadowMap:", J, "has no shadow.");
        continue;
      }
      if (H.autoUpdate === !1 && H.needsUpdate === !1) continue;
      s.copy(H.mapSize);
      const nt = H.getFrameExtents();
      if (
        (s.multiply(nt),
        r.copy(H.mapSize),
        (s.x > u || s.y > u) &&
          (s.x > u &&
            ((r.x = Math.floor(u / nt.x)),
            (s.x = r.x * nt.x),
            (H.mapSize.x = r.x)),
          s.y > u &&
            ((r.y = Math.floor(u / nt.y)),
            (s.y = r.y * nt.y),
            (H.mapSize.y = r.y))),
        H.map === null || V === !0 || W === !0)
      ) {
        const bt = this.type !== dn ? { minFilter: Te, magFilter: Te } : {};
        (H.map !== null && H.map.dispose(),
          (H.map = new Xn(s.x, s.y, bt)),
          (H.map.texture.name = J.name + ".shadowMap"),
          H.camera.updateProjectionMatrix());
      }
      (i.setRenderTarget(H.map), i.clear());
      const rt = H.getViewportCount();
      for (let bt = 0; bt < rt; bt++) {
        const kt = H.getViewport(bt);
        (a.set(r.x * kt.x, r.y * kt.y, r.x * kt.z, r.y * kt.w),
          N.viewport(a),
          H.updateMatrices(J, bt),
          (n = H.getFrustum()),
          y(w, L, H.camera, J, this.type));
      }
      (H.isPointLightShadow !== !0 && this.type === dn && E(H, L),
        (H.needsUpdate = !1));
    }
    ((d = this.type), (m.needsUpdate = !1), i.setRenderTarget(M, g, D));
  };
  function E(T, w) {
    const L = t.update(S);
    (f.defines.VSM_SAMPLES !== T.blurSamples &&
      ((f.defines.VSM_SAMPLES = T.blurSamples),
      (p.defines.VSM_SAMPLES = T.blurSamples),
      (f.needsUpdate = !0),
      (p.needsUpdate = !0)),
      T.mapPass === null && (T.mapPass = new Xn(s.x, s.y)),
      (f.uniforms.shadow_pass.value = T.map.texture),
      (f.uniforms.resolution.value = T.mapSize),
      (f.uniforms.radius.value = T.radius),
      i.setRenderTarget(T.mapPass),
      i.clear(),
      i.renderBufferDirect(w, null, L, f, S, null),
      (p.uniforms.shadow_pass.value = T.mapPass.texture),
      (p.uniforms.resolution.value = T.mapSize),
      (p.uniforms.radius.value = T.radius),
      i.setRenderTarget(T.map),
      i.clear(),
      i.renderBufferDirect(w, null, L, p, S, null));
  }
  function b(T, w, L, M) {
    let g = null;
    const D =
      L.isPointLight === !0 ? T.customDistanceMaterial : T.customDepthMaterial;
    if (D !== void 0) g = D;
    else if (
      ((g = L.isPointLight === !0 ? l : o),
      (i.localClippingEnabled &&
        w.clipShadows === !0 &&
        Array.isArray(w.clippingPlanes) &&
        w.clippingPlanes.length !== 0) ||
        (w.displacementMap && w.displacementScale !== 0) ||
        (w.alphaMap && w.alphaTest > 0) ||
        (w.map && w.alphaTest > 0) ||
        w.alphaToCoverage === !0)
    ) {
      const N = g.uuid,
        V = w.uuid;
      let W = c[N];
      W === void 0 && ((W = {}), (c[N] = W));
      let k = W[V];
      (k === void 0 &&
        ((k = g.clone()), (W[V] = k), w.addEventListener("dispose", R)),
        (g = k));
    }
    if (
      ((g.visible = w.visible),
      (g.wireframe = w.wireframe),
      M === dn
        ? (g.side = w.shadowSide !== null ? w.shadowSide : w.side)
        : (g.side = w.shadowSide !== null ? w.shadowSide : h[w.side]),
      (g.alphaMap = w.alphaMap),
      (g.alphaTest = w.alphaToCoverage === !0 ? 0.5 : w.alphaTest),
      (g.map = w.map),
      (g.clipShadows = w.clipShadows),
      (g.clippingPlanes = w.clippingPlanes),
      (g.clipIntersection = w.clipIntersection),
      (g.displacementMap = w.displacementMap),
      (g.displacementScale = w.displacementScale),
      (g.displacementBias = w.displacementBias),
      (g.wireframeLinewidth = w.wireframeLinewidth),
      (g.linewidth = w.linewidth),
      L.isPointLight === !0 && g.isMeshDistanceMaterial === !0)
    ) {
      const N = i.properties.get(g);
      N.light = L;
    }
    return g;
  }
  function y(T, w, L, M, g) {
    if (T.visible === !1) return;
    if (
      T.layers.test(w.layers) &&
      (T.isMesh || T.isLine || T.isPoints) &&
      (T.castShadow || (T.receiveShadow && g === dn)) &&
      (!T.frustumCulled || n.intersectsObject(T))
    ) {
      T.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse, T.matrixWorld);
      const V = t.update(T),
        W = T.material;
      if (Array.isArray(W)) {
        const k = V.groups;
        for (let q = 0, J = k.length; q < J; q++) {
          const H = k[q],
            nt = W[H.materialIndex];
          if (nt && nt.visible) {
            const rt = b(T, nt, M, g);
            (T.onBeforeShadow(i, T, w, L, V, rt, H),
              i.renderBufferDirect(L, null, V, rt, T, H),
              T.onAfterShadow(i, T, w, L, V, rt, H));
          }
        }
      } else if (W.visible) {
        const k = b(T, W, M, g);
        (T.onBeforeShadow(i, T, w, L, V, k, null),
          i.renderBufferDirect(L, null, V, k, T, null),
          T.onAfterShadow(i, T, w, L, V, k, null));
      }
    }
    const N = T.children;
    for (let V = 0, W = N.length; V < W; V++) y(N[V], w, L, M, g);
  }
  function R(T) {
    T.target.removeEventListener("dispose", R);
    for (const L in c) {
      const M = c[L],
        g = T.target.uuid;
      g in M && (M[g].dispose(), delete M[g]);
    }
  }
}
const Hp = {
  [ar]: or,
  [cr]: ur,
  [lr]: dr,
  [di]: hr,
  [or]: ar,
  [ur]: cr,
  [dr]: lr,
  [hr]: di,
};
function kp(i, t) {
  function e() {
    let P = !1;
    const ct = new le();
    let it = null;
    const st = new le(0, 0, 0, 0);
    return {
      setMask: function (Q) {
        it !== Q && !P && (i.colorMask(Q, Q, Q, Q), (it = Q));
      },
      setLocked: function (Q) {
        P = Q;
      },
      setClear: function (Q, j, pt, Dt, ne) {
        (ne === !0 && ((Q *= Dt), (j *= Dt), (pt *= Dt)),
          ct.set(Q, j, pt, Dt),
          st.equals(ct) === !1 && (i.clearColor(Q, j, pt, Dt), st.copy(ct)));
      },
      reset: function () {
        ((P = !1), (it = null), st.set(-1, 0, 0, 0));
      },
    };
  }
  function n() {
    let P = !1,
      ct = !1,
      it = null,
      st = null,
      Q = null;
    return {
      setReversed: function (j) {
        if (ct !== j) {
          const pt = t.get("EXT_clip_control");
          (j
            ? pt.clipControlEXT(pt.LOWER_LEFT_EXT, pt.ZERO_TO_ONE_EXT)
            : pt.clipControlEXT(pt.LOWER_LEFT_EXT, pt.NEGATIVE_ONE_TO_ONE_EXT),
            (ct = j));
          const Dt = Q;
          ((Q = null), this.setClear(Dt));
        }
      },
      getReversed: function () {
        return ct;
      },
      setTest: function (j) {
        j ? $(i.DEPTH_TEST) : ft(i.DEPTH_TEST);
      },
      setMask: function (j) {
        it !== j && !P && (i.depthMask(j), (it = j));
      },
      setFunc: function (j) {
        if ((ct && (j = Hp[j]), st !== j)) {
          switch (j) {
            case ar:
              i.depthFunc(i.NEVER);
              break;
            case or:
              i.depthFunc(i.ALWAYS);
              break;
            case cr:
              i.depthFunc(i.LESS);
              break;
            case di:
              i.depthFunc(i.LEQUAL);
              break;
            case lr:
              i.depthFunc(i.EQUAL);
              break;
            case hr:
              i.depthFunc(i.GEQUAL);
              break;
            case ur:
              i.depthFunc(i.GREATER);
              break;
            case dr:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          st = j;
        }
      },
      setLocked: function (j) {
        P = j;
      },
      setClear: function (j) {
        Q !== j && (ct && (j = 1 - j), i.clearDepth(j), (Q = j));
      },
      reset: function () {
        ((P = !1), (it = null), (st = null), (Q = null), (ct = !1));
      },
    };
  }
  function s() {
    let P = !1,
      ct = null,
      it = null,
      st = null,
      Q = null,
      j = null,
      pt = null,
      Dt = null,
      ne = null;
    return {
      setTest: function (jt) {
        P || (jt ? $(i.STENCIL_TEST) : ft(i.STENCIL_TEST));
      },
      setMask: function (jt) {
        ct !== jt && !P && (i.stencilMask(jt), (ct = jt));
      },
      setFunc: function (jt, Ze, We) {
        (it !== jt || st !== Ze || Q !== We) &&
          (i.stencilFunc(jt, Ze, We), (it = jt), (st = Ze), (Q = We));
      },
      setOp: function (jt, Ze, We) {
        (j !== jt || pt !== Ze || Dt !== We) &&
          (i.stencilOp(jt, Ze, We), (j = jt), (pt = Ze), (Dt = We));
      },
      setLocked: function (jt) {
        P = jt;
      },
      setClear: function (jt) {
        ne !== jt && (i.clearStencil(jt), (ne = jt));
      },
      reset: function () {
        ((P = !1),
          (ct = null),
          (it = null),
          (st = null),
          (Q = null),
          (j = null),
          (pt = null),
          (Dt = null),
          (ne = null));
      },
    };
  }
  const r = new e(),
    a = new n(),
    o = new s(),
    l = new WeakMap(),
    c = new WeakMap();
  let u = {},
    h = {},
    f = new WeakMap(),
    p = [],
    _ = null,
    S = !1,
    m = null,
    d = null,
    E = null,
    b = null,
    y = null,
    R = null,
    T = null,
    w = new Yt(0, 0, 0),
    L = 0,
    M = !1,
    g = null,
    D = null,
    N = null,
    V = null,
    W = null;
  const k = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let q = !1,
    J = 0;
  const H = i.getParameter(i.VERSION);
  H.indexOf("WebGL") !== -1
    ? ((J = parseFloat(/^WebGL (\d)/.exec(H)[1])), (q = J >= 1))
    : H.indexOf("OpenGL ES") !== -1 &&
      ((J = parseFloat(/^OpenGL ES (\d)/.exec(H)[1])), (q = J >= 2));
  let nt = null,
    rt = {};
  const bt = i.getParameter(i.SCISSOR_BOX),
    kt = i.getParameter(i.VIEWPORT),
    qt = new le().fromArray(bt),
    Qt = new le().fromArray(kt);
  function te(P, ct, it, st) {
    const Q = new Uint8Array(4),
      j = i.createTexture();
    (i.bindTexture(P, j),
      i.texParameteri(P, i.TEXTURE_MIN_FILTER, i.NEAREST),
      i.texParameteri(P, i.TEXTURE_MAG_FILTER, i.NEAREST));
    for (let pt = 0; pt < it; pt++)
      P === i.TEXTURE_3D || P === i.TEXTURE_2D_ARRAY
        ? i.texImage3D(ct, 0, i.RGBA, 1, 1, st, 0, i.RGBA, i.UNSIGNED_BYTE, Q)
        : i.texImage2D(ct + pt, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, Q);
    return j;
  }
  const Y = {};
  ((Y[i.TEXTURE_2D] = te(i.TEXTURE_2D, i.TEXTURE_2D, 1)),
    (Y[i.TEXTURE_CUBE_MAP] = te(
      i.TEXTURE_CUBE_MAP,
      i.TEXTURE_CUBE_MAP_POSITIVE_X,
      6,
    )),
    (Y[i.TEXTURE_2D_ARRAY] = te(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1)),
    (Y[i.TEXTURE_3D] = te(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1)),
    r.setClear(0, 0, 0, 1),
    a.setClear(1),
    o.setClear(0),
    $(i.DEPTH_TEST),
    a.setFunc(di),
    Vt(!1),
    Gt(Sa),
    $(i.CULL_FACE),
    ie(mn));
  function $(P) {
    u[P] !== !0 && (i.enable(P), (u[P] = !0));
  }
  function ft(P) {
    u[P] !== !1 && (i.disable(P), (u[P] = !1));
  }
  function It(P, ct) {
    return h[P] !== ct
      ? (i.bindFramebuffer(P, ct),
        (h[P] = ct),
        P === i.DRAW_FRAMEBUFFER && (h[i.FRAMEBUFFER] = ct),
        P === i.FRAMEBUFFER && (h[i.DRAW_FRAMEBUFFER] = ct),
        !0)
      : !1;
  }
  function vt(P, ct) {
    let it = p,
      st = !1;
    if (P) {
      ((it = f.get(ct)), it === void 0 && ((it = []), f.set(ct, it)));
      const Q = P.textures;
      if (it.length !== Q.length || it[0] !== i.COLOR_ATTACHMENT0) {
        for (let j = 0, pt = Q.length; j < pt; j++)
          it[j] = i.COLOR_ATTACHMENT0 + j;
        ((it.length = Q.length), (st = !0));
      }
    } else it[0] !== i.BACK && ((it[0] = i.BACK), (st = !0));
    st && i.drawBuffers(it);
  }
  function zt(P) {
    return _ !== P ? (i.useProgram(P), (_ = P), !0) : !1;
  }
  const ge = {
    [Vn]: i.FUNC_ADD,
    [Wc]: i.FUNC_SUBTRACT,
    [Xc]: i.FUNC_REVERSE_SUBTRACT,
  };
  ((ge[Yc] = i.MIN), (ge[qc] = i.MAX));
  const Ot = {
    [jc]: i.ZERO,
    [Kc]: i.ONE,
    [$c]: i.SRC_COLOR,
    [sr]: i.SRC_ALPHA,
    [nl]: i.SRC_ALPHA_SATURATE,
    [tl]: i.DST_COLOR,
    [Jc]: i.DST_ALPHA,
    [Zc]: i.ONE_MINUS_SRC_COLOR,
    [rr]: i.ONE_MINUS_SRC_ALPHA,
    [el]: i.ONE_MINUS_DST_COLOR,
    [Qc]: i.ONE_MINUS_DST_ALPHA,
    [il]: i.CONSTANT_COLOR,
    [sl]: i.ONE_MINUS_CONSTANT_COLOR,
    [rl]: i.CONSTANT_ALPHA,
    [al]: i.ONE_MINUS_CONSTANT_ALPHA,
  };
  function ie(P, ct, it, st, Q, j, pt, Dt, ne, jt) {
    if (P === mn) {
      S === !0 && (ft(i.BLEND), (S = !1));
      return;
    }
    if ((S === !1 && ($(i.BLEND), (S = !0)), P !== kc)) {
      if (P !== m || jt !== M) {
        if (
          ((d !== Vn || y !== Vn) &&
            (i.blendEquation(i.FUNC_ADD), (d = Vn), (y = Vn)),
          jt)
        )
          switch (P) {
            case hi:
              i.blendFuncSeparate(
                i.ONE,
                i.ONE_MINUS_SRC_ALPHA,
                i.ONE,
                i.ONE_MINUS_SRC_ALPHA,
              );
              break;
            case ba:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case Ea:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case ya:
              i.blendFuncSeparate(
                i.DST_COLOR,
                i.ONE_MINUS_SRC_ALPHA,
                i.ZERO,
                i.ONE,
              );
              break;
            default:
              he("WebGLState: Invalid blending: ", P);
              break;
          }
        else
          switch (P) {
            case hi:
              i.blendFuncSeparate(
                i.SRC_ALPHA,
                i.ONE_MINUS_SRC_ALPHA,
                i.ONE,
                i.ONE_MINUS_SRC_ALPHA,
              );
              break;
            case ba:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE, i.ONE, i.ONE);
              break;
            case Ea:
              he(
                "WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true",
              );
              break;
            case ya:
              he(
                "WebGLState: MultiplyBlending requires material.premultipliedAlpha = true",
              );
              break;
            default:
              he("WebGLState: Invalid blending: ", P);
              break;
          }
        ((E = null),
          (b = null),
          (R = null),
          (T = null),
          w.set(0, 0, 0),
          (L = 0),
          (m = P),
          (M = jt));
      }
      return;
    }
    ((Q = Q || ct),
      (j = j || it),
      (pt = pt || st),
      (ct !== d || Q !== y) &&
        (i.blendEquationSeparate(ge[ct], ge[Q]), (d = ct), (y = Q)),
      (it !== E || st !== b || j !== R || pt !== T) &&
        (i.blendFuncSeparate(Ot[it], Ot[st], Ot[j], Ot[pt]),
        (E = it),
        (b = st),
        (R = j),
        (T = pt)),
      (Dt.equals(w) === !1 || ne !== L) &&
        (i.blendColor(Dt.r, Dt.g, Dt.b, ne), w.copy(Dt), (L = ne)),
      (m = P),
      (M = !1));
  }
  function C(P, ct) {
    P.side === tn ? ft(i.CULL_FACE) : $(i.CULL_FACE);
    let it = P.side === Le;
    (ct && (it = !it),
      Vt(it),
      P.blending === hi && P.transparent === !1
        ? ie(mn)
        : ie(
            P.blending,
            P.blendEquation,
            P.blendSrc,
            P.blendDst,
            P.blendEquationAlpha,
            P.blendSrcAlpha,
            P.blendDstAlpha,
            P.blendColor,
            P.blendAlpha,
            P.premultipliedAlpha,
          ),
      a.setFunc(P.depthFunc),
      a.setTest(P.depthTest),
      a.setMask(P.depthWrite),
      r.setMask(P.colorWrite));
    const st = P.stencilWrite;
    (o.setTest(st),
      st &&
        (o.setMask(P.stencilWriteMask),
        o.setFunc(P.stencilFunc, P.stencilRef, P.stencilFuncMask),
        o.setOp(P.stencilFail, P.stencilZFail, P.stencilZPass)),
      xt(P.polygonOffset, P.polygonOffsetFactor, P.polygonOffsetUnits),
      P.alphaToCoverage === !0
        ? $(i.SAMPLE_ALPHA_TO_COVERAGE)
        : ft(i.SAMPLE_ALPHA_TO_COVERAGE));
  }
  function Vt(P) {
    g !== P && (P ? i.frontFace(i.CW) : i.frontFace(i.CCW), (g = P));
  }
  function Gt(P) {
    (P !== Gc
      ? ($(i.CULL_FACE),
        P !== D &&
          (P === Sa
            ? i.cullFace(i.BACK)
            : P === Hc
              ? i.cullFace(i.FRONT)
              : i.cullFace(i.FRONT_AND_BACK)))
      : ft(i.CULL_FACE),
      (D = P));
  }
  function ee(P) {
    P !== N && (q && i.lineWidth(P), (N = P));
  }
  function xt(P, ct, it) {
    P
      ? ($(i.POLYGON_OFFSET_FILL),
        (V !== ct || W !== it) && (i.polygonOffset(ct, it), (V = ct), (W = it)))
      : ft(i.POLYGON_OFFSET_FILL);
  }
  function se(P) {
    P ? $(i.SCISSOR_TEST) : ft(i.SCISSOR_TEST);
  }
  function St(P) {
    (P === void 0 && (P = i.TEXTURE0 + k - 1),
      nt !== P && (i.activeTexture(P), (nt = P)));
  }
  function Lt(P, ct, it) {
    it === void 0 && (nt === null ? (it = i.TEXTURE0 + k - 1) : (it = nt));
    let st = rt[it];
    (st === void 0 && ((st = { type: void 0, texture: void 0 }), (rt[it] = st)),
      (st.type !== P || st.texture !== ct) &&
        (nt !== it && (i.activeTexture(it), (nt = it)),
        i.bindTexture(P, ct || Y[P]),
        (st.type = P),
        (st.texture = ct)));
  }
  function A() {
    const P = rt[nt];
    P !== void 0 &&
      P.type !== void 0 &&
      (i.bindTexture(P.type, null), (P.type = void 0), (P.texture = void 0));
  }
  function x() {
    try {
      i.compressedTexImage2D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function O() {
    try {
      i.compressedTexImage3D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function X() {
    try {
      i.texSubImage2D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function K() {
    try {
      i.texSubImage3D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function G() {
    try {
      i.compressedTexSubImage2D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function gt() {
    try {
      i.compressedTexSubImage3D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function ot() {
    try {
      i.texStorage2D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function Et() {
    try {
      i.texStorage3D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function _t() {
    try {
      i.texImage2D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function Z() {
    try {
      i.texImage3D(...arguments);
    } catch (P) {
      P("WebGLState:", P);
    }
  }
  function et(P) {
    qt.equals(P) === !1 && (i.scissor(P.x, P.y, P.z, P.w), qt.copy(P));
  }
  function wt(P) {
    Qt.equals(P) === !1 && (i.viewport(P.x, P.y, P.z, P.w), Qt.copy(P));
  }
  function Tt(P, ct) {
    let it = c.get(ct);
    it === void 0 && ((it = new WeakMap()), c.set(ct, it));
    let st = it.get(P);
    st === void 0 && ((st = i.getUniformBlockIndex(ct, P.name)), it.set(P, st));
  }
  function ut(P, ct) {
    const st = c.get(ct).get(P);
    l.get(ct) !== st &&
      (i.uniformBlockBinding(ct, st, P.__bindingPointIndex), l.set(ct, st));
  }
  function Ct() {
    (i.disable(i.BLEND),
      i.disable(i.CULL_FACE),
      i.disable(i.DEPTH_TEST),
      i.disable(i.POLYGON_OFFSET_FILL),
      i.disable(i.SCISSOR_TEST),
      i.disable(i.STENCIL_TEST),
      i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),
      i.blendEquation(i.FUNC_ADD),
      i.blendFunc(i.ONE, i.ZERO),
      i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO),
      i.blendColor(0, 0, 0, 0),
      i.colorMask(!0, !0, !0, !0),
      i.clearColor(0, 0, 0, 0),
      i.depthMask(!0),
      i.depthFunc(i.LESS),
      a.setReversed(!1),
      i.clearDepth(1),
      i.stencilMask(4294967295),
      i.stencilFunc(i.ALWAYS, 0, 4294967295),
      i.stencilOp(i.KEEP, i.KEEP, i.KEEP),
      i.clearStencil(0),
      i.cullFace(i.BACK),
      i.frontFace(i.CCW),
      i.polygonOffset(0, 0),
      i.activeTexture(i.TEXTURE0),
      i.bindFramebuffer(i.FRAMEBUFFER, null),
      i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null),
      i.bindFramebuffer(i.READ_FRAMEBUFFER, null),
      i.useProgram(null),
      i.lineWidth(1),
      i.scissor(0, 0, i.canvas.width, i.canvas.height),
      i.viewport(0, 0, i.canvas.width, i.canvas.height),
      (u = {}),
      (nt = null),
      (rt = {}),
      (h = {}),
      (f = new WeakMap()),
      (p = []),
      (_ = null),
      (S = !1),
      (m = null),
      (d = null),
      (E = null),
      (b = null),
      (y = null),
      (R = null),
      (T = null),
      (w = new Yt(0, 0, 0)),
      (L = 0),
      (M = !1),
      (g = null),
      (D = null),
      (N = null),
      (V = null),
      (W = null),
      qt.set(0, 0, i.canvas.width, i.canvas.height),
      Qt.set(0, 0, i.canvas.width, i.canvas.height),
      r.reset(),
      a.reset(),
      o.reset());
  }
  return {
    buffers: { color: r, depth: a, stencil: o },
    enable: $,
    disable: ft,
    bindFramebuffer: It,
    drawBuffers: vt,
    useProgram: zt,
    setBlending: ie,
    setMaterial: C,
    setFlipSided: Vt,
    setCullFace: Gt,
    setLineWidth: ee,
    setPolygonOffset: xt,
    setScissorTest: se,
    activeTexture: St,
    bindTexture: Lt,
    unbindTexture: A,
    compressedTexImage2D: x,
    compressedTexImage3D: O,
    texImage2D: _t,
    texImage3D: Z,
    updateUBOMapping: Tt,
    uniformBlockBinding: ut,
    texStorage2D: ot,
    texStorage3D: Et,
    texSubImage2D: X,
    texSubImage3D: K,
    compressedTexSubImage2D: G,
    compressedTexSubImage3D: gt,
    scissor: et,
    viewport: wt,
    reset: Ct,
  };
}
function Wp(i, t, e, n, s, r, a) {
  const o = t.has("WEBGL_multisampled_render_to_texture")
      ? t.get("WEBGL_multisampled_render_to_texture")
      : null,
    l =
      typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
    c = new Pt(),
    u = new WeakMap();
  let h;
  const f = new WeakMap();
  let p = !1;
  try {
    p =
      typeof OffscreenCanvas < "u" &&
      new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {}
  function _(A, x) {
    return p ? new OffscreenCanvas(A, x) : xs("canvas");
  }
  function S(A, x, O) {
    let X = 1;
    const K = Lt(A);
    if (
      ((K.width > O || K.height > O) && (X = O / Math.max(K.width, K.height)),
      X < 1)
    )
      if (
        (typeof HTMLImageElement < "u" && A instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement < "u" && A instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap < "u" && A instanceof ImageBitmap) ||
        (typeof VideoFrame < "u" && A instanceof VideoFrame)
      ) {
        const G = Math.floor(X * K.width),
          gt = Math.floor(X * K.height);
        h === void 0 && (h = _(G, gt));
        const ot = x ? _(G, gt) : h;
        return (
          (ot.width = G),
          (ot.height = gt),
          ot.getContext("2d").drawImage(A, 0, 0, G, gt),
          Ut(
            "WebGLRenderer: Texture has been resized from (" +
              K.width +
              "x" +
              K.height +
              ") to (" +
              G +
              "x" +
              gt +
              ").",
          ),
          ot
        );
      } else
        return (
          "data" in A &&
            Ut(
              "WebGLRenderer: Image in DataTexture is too big (" +
                K.width +
                "x" +
                K.height +
                ").",
            ),
          A
        );
    return A;
  }
  function m(A) {
    return A.generateMipmaps;
  }
  function d(A) {
    i.generateMipmap(A);
  }
  function E(A) {
    return A.isWebGLCubeRenderTarget
      ? i.TEXTURE_CUBE_MAP
      : A.isWebGL3DRenderTarget
        ? i.TEXTURE_3D
        : A.isWebGLArrayRenderTarget || A.isCompressedArrayTexture
          ? i.TEXTURE_2D_ARRAY
          : i.TEXTURE_2D;
  }
  function b(A, x, O, X, K = !1) {
    if (A !== null) {
      if (i[A] !== void 0) return i[A];
      Ut(
        "WebGLRenderer: Attempt to use non-existing WebGL internal format '" +
          A +
          "'",
      );
    }
    let G = x;
    if (
      (x === i.RED &&
        (O === i.FLOAT && (G = i.R32F),
        O === i.HALF_FLOAT && (G = i.R16F),
        O === i.UNSIGNED_BYTE && (G = i.R8)),
      x === i.RED_INTEGER &&
        (O === i.UNSIGNED_BYTE && (G = i.R8UI),
        O === i.UNSIGNED_SHORT && (G = i.R16UI),
        O === i.UNSIGNED_INT && (G = i.R32UI),
        O === i.BYTE && (G = i.R8I),
        O === i.SHORT && (G = i.R16I),
        O === i.INT && (G = i.R32I)),
      x === i.RG &&
        (O === i.FLOAT && (G = i.RG32F),
        O === i.HALF_FLOAT && (G = i.RG16F),
        O === i.UNSIGNED_BYTE && (G = i.RG8)),
      x === i.RG_INTEGER &&
        (O === i.UNSIGNED_BYTE && (G = i.RG8UI),
        O === i.UNSIGNED_SHORT && (G = i.RG16UI),
        O === i.UNSIGNED_INT && (G = i.RG32UI),
        O === i.BYTE && (G = i.RG8I),
        O === i.SHORT && (G = i.RG16I),
        O === i.INT && (G = i.RG32I)),
      x === i.RGB_INTEGER &&
        (O === i.UNSIGNED_BYTE && (G = i.RGB8UI),
        O === i.UNSIGNED_SHORT && (G = i.RGB16UI),
        O === i.UNSIGNED_INT && (G = i.RGB32UI),
        O === i.BYTE && (G = i.RGB8I),
        O === i.SHORT && (G = i.RGB16I),
        O === i.INT && (G = i.RGB32I)),
      x === i.RGBA_INTEGER &&
        (O === i.UNSIGNED_BYTE && (G = i.RGBA8UI),
        O === i.UNSIGNED_SHORT && (G = i.RGBA16UI),
        O === i.UNSIGNED_INT && (G = i.RGBA32UI),
        O === i.BYTE && (G = i.RGBA8I),
        O === i.SHORT && (G = i.RGBA16I),
        O === i.INT && (G = i.RGBA32I)),
      x === i.RGB &&
        (O === i.UNSIGNED_INT_5_9_9_9_REV && (G = i.RGB9_E5),
        O === i.UNSIGNED_INT_10F_11F_11F_REV && (G = i.R11F_G11F_B10F)),
      x === i.RGBA)
    ) {
      const gt = K ? ps : Xt.getTransfer(X);
      (O === i.FLOAT && (G = i.RGBA32F),
        O === i.HALF_FLOAT && (G = i.RGBA16F),
        O === i.UNSIGNED_BYTE && (G = gt === $t ? i.SRGB8_ALPHA8 : i.RGBA8),
        O === i.UNSIGNED_SHORT_4_4_4_4 && (G = i.RGBA4),
        O === i.UNSIGNED_SHORT_5_5_5_1 && (G = i.RGB5_A1));
    }
    return (
      (G === i.R16F ||
        G === i.R32F ||
        G === i.RG16F ||
        G === i.RG32F ||
        G === i.RGBA16F ||
        G === i.RGBA32F) &&
        t.get("EXT_color_buffer_float"),
      G
    );
  }
  function y(A, x) {
    let O;
    return (
      A
        ? x === null || x === kn || x === Ui
          ? (O = i.DEPTH24_STENCIL8)
          : x === pn
            ? (O = i.DEPTH32F_STENCIL8)
            : x === Li &&
              ((O = i.DEPTH24_STENCIL8),
              Ut(
                "DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.",
              ))
        : x === null || x === kn || x === Ui
          ? (O = i.DEPTH_COMPONENT24)
          : x === pn
            ? (O = i.DEPTH_COMPONENT32F)
            : x === Li && (O = i.DEPTH_COMPONENT16),
      O
    );
  }
  function R(A, x) {
    return m(A) === !0 ||
      (A.isFramebufferTexture && A.minFilter !== Te && A.minFilter !== He)
      ? Math.log2(Math.max(x.width, x.height)) + 1
      : A.mipmaps !== void 0 && A.mipmaps.length > 0
        ? A.mipmaps.length
        : A.isCompressedTexture && Array.isArray(A.image)
          ? x.mipmaps.length
          : 1;
  }
  function T(A) {
    const x = A.target;
    (x.removeEventListener("dispose", T),
      L(x),
      x.isVideoTexture && u.delete(x));
  }
  function w(A) {
    const x = A.target;
    (x.removeEventListener("dispose", w), g(x));
  }
  function L(A) {
    const x = n.get(A);
    if (x.__webglInit === void 0) return;
    const O = A.source,
      X = f.get(O);
    if (X) {
      const K = X[x.__cacheKey];
      (K.usedTimes--,
        K.usedTimes === 0 && M(A),
        Object.keys(X).length === 0 && f.delete(O));
    }
    n.remove(A);
  }
  function M(A) {
    const x = n.get(A);
    i.deleteTexture(x.__webglTexture);
    const O = A.source,
      X = f.get(O);
    (delete X[x.__cacheKey], a.memory.textures--);
  }
  function g(A) {
    const x = n.get(A);
    if (
      (A.depthTexture && (A.depthTexture.dispose(), n.remove(A.depthTexture)),
      A.isWebGLCubeRenderTarget)
    )
      for (let X = 0; X < 6; X++) {
        if (Array.isArray(x.__webglFramebuffer[X]))
          for (let K = 0; K < x.__webglFramebuffer[X].length; K++)
            i.deleteFramebuffer(x.__webglFramebuffer[X][K]);
        else i.deleteFramebuffer(x.__webglFramebuffer[X]);
        x.__webglDepthbuffer && i.deleteRenderbuffer(x.__webglDepthbuffer[X]);
      }
    else {
      if (Array.isArray(x.__webglFramebuffer))
        for (let X = 0; X < x.__webglFramebuffer.length; X++)
          i.deleteFramebuffer(x.__webglFramebuffer[X]);
      else i.deleteFramebuffer(x.__webglFramebuffer);
      if (
        (x.__webglDepthbuffer && i.deleteRenderbuffer(x.__webglDepthbuffer),
        x.__webglMultisampledFramebuffer &&
          i.deleteFramebuffer(x.__webglMultisampledFramebuffer),
        x.__webglColorRenderbuffer)
      )
        for (let X = 0; X < x.__webglColorRenderbuffer.length; X++)
          x.__webglColorRenderbuffer[X] &&
            i.deleteRenderbuffer(x.__webglColorRenderbuffer[X]);
      x.__webglDepthRenderbuffer &&
        i.deleteRenderbuffer(x.__webglDepthRenderbuffer);
    }
    const O = A.textures;
    for (let X = 0, K = O.length; X < K; X++) {
      const G = n.get(O[X]);
      (G.__webglTexture &&
        (i.deleteTexture(G.__webglTexture), a.memory.textures--),
        n.remove(O[X]));
    }
    n.remove(A);
  }
  let D = 0;
  function N() {
    D = 0;
  }
  function V() {
    const A = D;
    return (
      A >= s.maxTextures &&
        Ut(
          "WebGLTextures: Trying to use " +
            A +
            " texture units while this GPU supports only " +
            s.maxTextures,
        ),
      (D += 1),
      A
    );
  }
  function W(A) {
    const x = [];
    return (
      x.push(A.wrapS),
      x.push(A.wrapT),
      x.push(A.wrapR || 0),
      x.push(A.magFilter),
      x.push(A.minFilter),
      x.push(A.anisotropy),
      x.push(A.internalFormat),
      x.push(A.format),
      x.push(A.type),
      x.push(A.generateMipmaps),
      x.push(A.premultiplyAlpha),
      x.push(A.flipY),
      x.push(A.unpackAlignment),
      x.push(A.colorSpace),
      x.join()
    );
  }
  function k(A, x) {
    const O = n.get(A);
    if (
      (A.isVideoTexture && se(A),
      A.isRenderTargetTexture === !1 &&
        A.isExternalTexture !== !0 &&
        A.version > 0 &&
        O.__version !== A.version)
    ) {
      const X = A.image;
      if (X === null)
        Ut("WebGLRenderer: Texture marked for update but no image data found.");
      else if (X.complete === !1)
        Ut("WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        Y(O, A, x);
        return;
      }
    } else
      A.isExternalTexture &&
        (O.__webglTexture = A.sourceTexture ? A.sourceTexture : null);
    e.bindTexture(i.TEXTURE_2D, O.__webglTexture, i.TEXTURE0 + x);
  }
  function q(A, x) {
    const O = n.get(A);
    if (
      A.isRenderTargetTexture === !1 &&
      A.version > 0 &&
      O.__version !== A.version
    ) {
      Y(O, A, x);
      return;
    } else
      A.isExternalTexture &&
        (O.__webglTexture = A.sourceTexture ? A.sourceTexture : null);
    e.bindTexture(i.TEXTURE_2D_ARRAY, O.__webglTexture, i.TEXTURE0 + x);
  }
  function J(A, x) {
    const O = n.get(A);
    if (
      A.isRenderTargetTexture === !1 &&
      A.version > 0 &&
      O.__version !== A.version
    ) {
      Y(O, A, x);
      return;
    }
    e.bindTexture(i.TEXTURE_3D, O.__webglTexture, i.TEXTURE0 + x);
  }
  function H(A, x) {
    const O = n.get(A);
    if (A.version > 0 && O.__version !== A.version) {
      $(O, A, x);
      return;
    }
    e.bindTexture(i.TEXTURE_CUBE_MAP, O.__webglTexture, i.TEXTURE0 + x);
  }
  const nt = { [mr]: i.REPEAT, [fn]: i.CLAMP_TO_EDGE, [xr]: i.MIRRORED_REPEAT },
    rt = {
      [Te]: i.NEAREST,
      [xl]: i.NEAREST_MIPMAP_NEAREST,
      [Gi]: i.NEAREST_MIPMAP_LINEAR,
      [He]: i.LINEAR,
      [Ts]: i.LINEAR_MIPMAP_NEAREST,
      [Hn]: i.LINEAR_MIPMAP_LINEAR,
    },
    bt = {
      [Ml]: i.NEVER,
      [Al]: i.ALWAYS,
      [Sl]: i.LESS,
      [Bo]: i.LEQUAL,
      [bl]: i.EQUAL,
      [Tl]: i.GEQUAL,
      [El]: i.GREATER,
      [yl]: i.NOTEQUAL,
    };
  function kt(A, x) {
    if (
      (x.type === pn &&
        t.has("OES_texture_float_linear") === !1 &&
        (x.magFilter === He ||
          x.magFilter === Ts ||
          x.magFilter === Gi ||
          x.magFilter === Hn ||
          x.minFilter === He ||
          x.minFilter === Ts ||
          x.minFilter === Gi ||
          x.minFilter === Hn) &&
        Ut(
          "WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.",
        ),
      i.texParameteri(A, i.TEXTURE_WRAP_S, nt[x.wrapS]),
      i.texParameteri(A, i.TEXTURE_WRAP_T, nt[x.wrapT]),
      (A === i.TEXTURE_3D || A === i.TEXTURE_2D_ARRAY) &&
        i.texParameteri(A, i.TEXTURE_WRAP_R, nt[x.wrapR]),
      i.texParameteri(A, i.TEXTURE_MAG_FILTER, rt[x.magFilter]),
      i.texParameteri(A, i.TEXTURE_MIN_FILTER, rt[x.minFilter]),
      x.compareFunction &&
        (i.texParameteri(A, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE),
        i.texParameteri(A, i.TEXTURE_COMPARE_FUNC, bt[x.compareFunction])),
      t.has("EXT_texture_filter_anisotropic") === !0)
    ) {
      if (
        x.magFilter === Te ||
        (x.minFilter !== Gi && x.minFilter !== Hn) ||
        (x.type === pn && t.has("OES_texture_float_linear") === !1)
      )
        return;
      if (x.anisotropy > 1 || n.get(x).__currentAnisotropy) {
        const O = t.get("EXT_texture_filter_anisotropic");
        (i.texParameterf(
          A,
          O.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(x.anisotropy, s.getMaxAnisotropy()),
        ),
          (n.get(x).__currentAnisotropy = x.anisotropy));
      }
    }
  }
  function qt(A, x) {
    let O = !1;
    A.__webglInit === void 0 &&
      ((A.__webglInit = !0), x.addEventListener("dispose", T));
    const X = x.source;
    let K = f.get(X);
    K === void 0 && ((K = {}), f.set(X, K));
    const G = W(x);
    if (G !== A.__cacheKey) {
      (K[G] === void 0 &&
        ((K[G] = { texture: i.createTexture(), usedTimes: 0 }),
        a.memory.textures++,
        (O = !0)),
        K[G].usedTimes++);
      const gt = K[A.__cacheKey];
      (gt !== void 0 &&
        (K[A.__cacheKey].usedTimes--, gt.usedTimes === 0 && M(x)),
        (A.__cacheKey = G),
        (A.__webglTexture = K[G].texture));
    }
    return O;
  }
  function Qt(A, x, O) {
    return Math.floor(Math.floor(A / O) / x);
  }
  function te(A, x, O, X) {
    const G = A.updateRanges;
    if (G.length === 0)
      e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, x.width, x.height, O, X, x.data);
    else {
      G.sort((Z, et) => Z.start - et.start);
      let gt = 0;
      for (let Z = 1; Z < G.length; Z++) {
        const et = G[gt],
          wt = G[Z],
          Tt = et.start + et.count,
          ut = Qt(wt.start, x.width, 4),
          Ct = Qt(et.start, x.width, 4);
        wt.start <= Tt + 1 &&
        ut === Ct &&
        Qt(wt.start + wt.count - 1, x.width, 4) === ut
          ? (et.count = Math.max(et.count, wt.start + wt.count - et.start))
          : (++gt, (G[gt] = wt));
      }
      G.length = gt + 1;
      const ot = i.getParameter(i.UNPACK_ROW_LENGTH),
        Et = i.getParameter(i.UNPACK_SKIP_PIXELS),
        _t = i.getParameter(i.UNPACK_SKIP_ROWS);
      i.pixelStorei(i.UNPACK_ROW_LENGTH, x.width);
      for (let Z = 0, et = G.length; Z < et; Z++) {
        const wt = G[Z],
          Tt = Math.floor(wt.start / 4),
          ut = Math.ceil(wt.count / 4),
          Ct = Tt % x.width,
          P = Math.floor(Tt / x.width),
          ct = ut,
          it = 1;
        (i.pixelStorei(i.UNPACK_SKIP_PIXELS, Ct),
          i.pixelStorei(i.UNPACK_SKIP_ROWS, P),
          e.texSubImage2D(i.TEXTURE_2D, 0, Ct, P, ct, it, O, X, x.data));
      }
      (A.clearUpdateRanges(),
        i.pixelStorei(i.UNPACK_ROW_LENGTH, ot),
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, Et),
        i.pixelStorei(i.UNPACK_SKIP_ROWS, _t));
    }
  }
  function Y(A, x, O) {
    let X = i.TEXTURE_2D;
    ((x.isDataArrayTexture || x.isCompressedArrayTexture) &&
      (X = i.TEXTURE_2D_ARRAY),
      x.isData3DTexture && (X = i.TEXTURE_3D));
    const K = qt(A, x),
      G = x.source;
    e.bindTexture(X, A.__webglTexture, i.TEXTURE0 + O);
    const gt = n.get(G);
    if (G.version !== gt.__version || K === !0) {
      e.activeTexture(i.TEXTURE0 + O);
      const ot = Xt.getPrimaries(Xt.workingColorSpace),
        Et = x.colorSpace === An ? null : Xt.getPrimaries(x.colorSpace),
        _t =
          x.colorSpace === An || ot === Et ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      (i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, x.flipY),
        i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, x.premultiplyAlpha),
        i.pixelStorei(i.UNPACK_ALIGNMENT, x.unpackAlignment),
        i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, _t));
      let Z = S(x.image, !1, s.maxTextureSize);
      Z = St(x, Z);
      const et = r.convert(x.format, x.colorSpace),
        wt = r.convert(x.type);
      let Tt = b(x.internalFormat, et, wt, x.colorSpace, x.isVideoTexture);
      kt(X, x);
      let ut;
      const Ct = x.mipmaps,
        P = x.isVideoTexture !== !0,
        ct = gt.__version === void 0 || K === !0,
        it = G.dataReady,
        st = R(x, Z);
      if (x.isDepthTexture)
        ((Tt = y(x.format === Ni, x.type)),
          ct &&
            (P
              ? e.texStorage2D(i.TEXTURE_2D, 1, Tt, Z.width, Z.height)
              : e.texImage2D(
                  i.TEXTURE_2D,
                  0,
                  Tt,
                  Z.width,
                  Z.height,
                  0,
                  et,
                  wt,
                  null,
                )));
      else if (x.isDataTexture)
        if (Ct.length > 0) {
          P &&
            ct &&
            e.texStorage2D(i.TEXTURE_2D, st, Tt, Ct[0].width, Ct[0].height);
          for (let Q = 0, j = Ct.length; Q < j; Q++)
            ((ut = Ct[Q]),
              P
                ? it &&
                  e.texSubImage2D(
                    i.TEXTURE_2D,
                    Q,
                    0,
                    0,
                    ut.width,
                    ut.height,
                    et,
                    wt,
                    ut.data,
                  )
                : e.texImage2D(
                    i.TEXTURE_2D,
                    Q,
                    Tt,
                    ut.width,
                    ut.height,
                    0,
                    et,
                    wt,
                    ut.data,
                  ));
          x.generateMipmaps = !1;
        } else
          P
            ? (ct && e.texStorage2D(i.TEXTURE_2D, st, Tt, Z.width, Z.height),
              it && te(x, Z, et, wt))
            : e.texImage2D(
                i.TEXTURE_2D,
                0,
                Tt,
                Z.width,
                Z.height,
                0,
                et,
                wt,
                Z.data,
              );
      else if (x.isCompressedTexture)
        if (x.isCompressedArrayTexture) {
          P &&
            ct &&
            e.texStorage3D(
              i.TEXTURE_2D_ARRAY,
              st,
              Tt,
              Ct[0].width,
              Ct[0].height,
              Z.depth,
            );
          for (let Q = 0, j = Ct.length; Q < j; Q++)
            if (((ut = Ct[Q]), x.format !== Ke))
              if (et !== null)
                if (P) {
                  if (it)
                    if (x.layerUpdates.size > 0) {
                      const pt = $a(ut.width, ut.height, x.format, x.type);
                      for (const Dt of x.layerUpdates) {
                        const ne = ut.data.subarray(
                          (Dt * pt) / ut.data.BYTES_PER_ELEMENT,
                          ((Dt + 1) * pt) / ut.data.BYTES_PER_ELEMENT,
                        );
                        e.compressedTexSubImage3D(
                          i.TEXTURE_2D_ARRAY,
                          Q,
                          0,
                          0,
                          Dt,
                          ut.width,
                          ut.height,
                          1,
                          et,
                          ne,
                        );
                      }
                      x.clearLayerUpdates();
                    } else
                      e.compressedTexSubImage3D(
                        i.TEXTURE_2D_ARRAY,
                        Q,
                        0,
                        0,
                        0,
                        ut.width,
                        ut.height,
                        Z.depth,
                        et,
                        ut.data,
                      );
                } else
                  e.compressedTexImage3D(
                    i.TEXTURE_2D_ARRAY,
                    Q,
                    Tt,
                    ut.width,
                    ut.height,
                    Z.depth,
                    0,
                    ut.data,
                    0,
                    0,
                  );
              else
                Ut(
                  "WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()",
                );
            else
              P
                ? it &&
                  e.texSubImage3D(
                    i.TEXTURE_2D_ARRAY,
                    Q,
                    0,
                    0,
                    0,
                    ut.width,
                    ut.height,
                    Z.depth,
                    et,
                    wt,
                    ut.data,
                  )
                : e.texImage3D(
                    i.TEXTURE_2D_ARRAY,
                    Q,
                    Tt,
                    ut.width,
                    ut.height,
                    Z.depth,
                    0,
                    et,
                    wt,
                    ut.data,
                  );
        } else {
          P &&
            ct &&
            e.texStorage2D(i.TEXTURE_2D, st, Tt, Ct[0].width, Ct[0].height);
          for (let Q = 0, j = Ct.length; Q < j; Q++)
            ((ut = Ct[Q]),
              x.format !== Ke
                ? et !== null
                  ? P
                    ? it &&
                      e.compressedTexSubImage2D(
                        i.TEXTURE_2D,
                        Q,
                        0,
                        0,
                        ut.width,
                        ut.height,
                        et,
                        ut.data,
                      )
                    : e.compressedTexImage2D(
                        i.TEXTURE_2D,
                        Q,
                        Tt,
                        ut.width,
                        ut.height,
                        0,
                        ut.data,
                      )
                  : Ut(
                      "WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()",
                    )
                : P
                  ? it &&
                    e.texSubImage2D(
                      i.TEXTURE_2D,
                      Q,
                      0,
                      0,
                      ut.width,
                      ut.height,
                      et,
                      wt,
                      ut.data,
                    )
                  : e.texImage2D(
                      i.TEXTURE_2D,
                      Q,
                      Tt,
                      ut.width,
                      ut.height,
                      0,
                      et,
                      wt,
                      ut.data,
                    ));
        }
      else if (x.isDataArrayTexture)
        if (P) {
          if (
            (ct &&
              e.texStorage3D(
                i.TEXTURE_2D_ARRAY,
                st,
                Tt,
                Z.width,
                Z.height,
                Z.depth,
              ),
            it)
          )
            if (x.layerUpdates.size > 0) {
              const Q = $a(Z.width, Z.height, x.format, x.type);
              for (const j of x.layerUpdates) {
                const pt = Z.data.subarray(
                  (j * Q) / Z.data.BYTES_PER_ELEMENT,
                  ((j + 1) * Q) / Z.data.BYTES_PER_ELEMENT,
                );
                e.texSubImage3D(
                  i.TEXTURE_2D_ARRAY,
                  0,
                  0,
                  0,
                  j,
                  Z.width,
                  Z.height,
                  1,
                  et,
                  wt,
                  pt,
                );
              }
              x.clearLayerUpdates();
            } else
              e.texSubImage3D(
                i.TEXTURE_2D_ARRAY,
                0,
                0,
                0,
                0,
                Z.width,
                Z.height,
                Z.depth,
                et,
                wt,
                Z.data,
              );
        } else
          e.texImage3D(
            i.TEXTURE_2D_ARRAY,
            0,
            Tt,
            Z.width,
            Z.height,
            Z.depth,
            0,
            et,
            wt,
            Z.data,
          );
      else if (x.isData3DTexture)
        P
          ? (ct &&
              e.texStorage3D(i.TEXTURE_3D, st, Tt, Z.width, Z.height, Z.depth),
            it &&
              e.texSubImage3D(
                i.TEXTURE_3D,
                0,
                0,
                0,
                0,
                Z.width,
                Z.height,
                Z.depth,
                et,
                wt,
                Z.data,
              ))
          : e.texImage3D(
              i.TEXTURE_3D,
              0,
              Tt,
              Z.width,
              Z.height,
              Z.depth,
              0,
              et,
              wt,
              Z.data,
            );
      else if (x.isFramebufferTexture) {
        if (ct)
          if (P) e.texStorage2D(i.TEXTURE_2D, st, Tt, Z.width, Z.height);
          else {
            let Q = Z.width,
              j = Z.height;
            for (let pt = 0; pt < st; pt++)
              (e.texImage2D(i.TEXTURE_2D, pt, Tt, Q, j, 0, et, wt, null),
                (Q >>= 1),
                (j >>= 1));
          }
      } else if (Ct.length > 0) {
        if (P && ct) {
          const Q = Lt(Ct[0]);
          e.texStorage2D(i.TEXTURE_2D, st, Tt, Q.width, Q.height);
        }
        for (let Q = 0, j = Ct.length; Q < j; Q++)
          ((ut = Ct[Q]),
            P
              ? it && e.texSubImage2D(i.TEXTURE_2D, Q, 0, 0, et, wt, ut)
              : e.texImage2D(i.TEXTURE_2D, Q, Tt, et, wt, ut));
        x.generateMipmaps = !1;
      } else if (P) {
        if (ct) {
          const Q = Lt(Z);
          e.texStorage2D(i.TEXTURE_2D, st, Tt, Q.width, Q.height);
        }
        it && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, et, wt, Z);
      } else e.texImage2D(i.TEXTURE_2D, 0, Tt, et, wt, Z);
      (m(x) && d(X), (gt.__version = G.version), x.onUpdate && x.onUpdate(x));
    }
    A.__version = x.version;
  }
  function $(A, x, O) {
    if (x.image.length !== 6) return;
    const X = qt(A, x),
      K = x.source;
    e.bindTexture(i.TEXTURE_CUBE_MAP, A.__webglTexture, i.TEXTURE0 + O);
    const G = n.get(K);
    if (K.version !== G.__version || X === !0) {
      e.activeTexture(i.TEXTURE0 + O);
      const gt = Xt.getPrimaries(Xt.workingColorSpace),
        ot = x.colorSpace === An ? null : Xt.getPrimaries(x.colorSpace),
        Et =
          x.colorSpace === An || gt === ot ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      (i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, x.flipY),
        i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, x.premultiplyAlpha),
        i.pixelStorei(i.UNPACK_ALIGNMENT, x.unpackAlignment),
        i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Et));
      const _t = x.isCompressedTexture || x.image[0].isCompressedTexture,
        Z = x.image[0] && x.image[0].isDataTexture,
        et = [];
      for (let j = 0; j < 6; j++)
        (!_t && !Z
          ? (et[j] = S(x.image[j], !0, s.maxCubemapSize))
          : (et[j] = Z ? x.image[j].image : x.image[j]),
          (et[j] = St(x, et[j])));
      const wt = et[0],
        Tt = r.convert(x.format, x.colorSpace),
        ut = r.convert(x.type),
        Ct = b(x.internalFormat, Tt, ut, x.colorSpace),
        P = x.isVideoTexture !== !0,
        ct = G.__version === void 0 || X === !0,
        it = K.dataReady;
      let st = R(x, wt);
      kt(i.TEXTURE_CUBE_MAP, x);
      let Q;
      if (_t) {
        P &&
          ct &&
          e.texStorage2D(i.TEXTURE_CUBE_MAP, st, Ct, wt.width, wt.height);
        for (let j = 0; j < 6; j++) {
          Q = et[j].mipmaps;
          for (let pt = 0; pt < Q.length; pt++) {
            const Dt = Q[pt];
            x.format !== Ke
              ? Tt !== null
                ? P
                  ? it &&
                    e.compressedTexSubImage2D(
                      i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                      pt,
                      0,
                      0,
                      Dt.width,
                      Dt.height,
                      Tt,
                      Dt.data,
                    )
                  : e.compressedTexImage2D(
                      i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                      pt,
                      Ct,
                      Dt.width,
                      Dt.height,
                      0,
                      Dt.data,
                    )
                : Ut(
                    "WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()",
                  )
              : P
                ? it &&
                  e.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                    pt,
                    0,
                    0,
                    Dt.width,
                    Dt.height,
                    Tt,
                    ut,
                    Dt.data,
                  )
                : e.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                    pt,
                    Ct,
                    Dt.width,
                    Dt.height,
                    0,
                    Tt,
                    ut,
                    Dt.data,
                  );
          }
        }
      } else {
        if (((Q = x.mipmaps), P && ct)) {
          Q.length > 0 && st++;
          const j = Lt(et[0]);
          e.texStorage2D(i.TEXTURE_CUBE_MAP, st, Ct, j.width, j.height);
        }
        for (let j = 0; j < 6; j++)
          if (Z) {
            P
              ? it &&
                e.texSubImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                  0,
                  0,
                  0,
                  et[j].width,
                  et[j].height,
                  Tt,
                  ut,
                  et[j].data,
                )
              : e.texImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                  0,
                  Ct,
                  et[j].width,
                  et[j].height,
                  0,
                  Tt,
                  ut,
                  et[j].data,
                );
            for (let pt = 0; pt < Q.length; pt++) {
              const ne = Q[pt].image[j].image;
              P
                ? it &&
                  e.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                    pt + 1,
                    0,
                    0,
                    ne.width,
                    ne.height,
                    Tt,
                    ut,
                    ne.data,
                  )
                : e.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                    pt + 1,
                    Ct,
                    ne.width,
                    ne.height,
                    0,
                    Tt,
                    ut,
                    ne.data,
                  );
            }
          } else {
            P
              ? it &&
                e.texSubImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                  0,
                  0,
                  0,
                  Tt,
                  ut,
                  et[j],
                )
              : e.texImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                  0,
                  Ct,
                  Tt,
                  ut,
                  et[j],
                );
            for (let pt = 0; pt < Q.length; pt++) {
              const Dt = Q[pt];
              P
                ? it &&
                  e.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                    pt + 1,
                    0,
                    0,
                    Tt,
                    ut,
                    Dt.image[j],
                  )
                : e.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + j,
                    pt + 1,
                    Ct,
                    Tt,
                    ut,
                    Dt.image[j],
                  );
            }
          }
      }
      (m(x) && d(i.TEXTURE_CUBE_MAP),
        (G.__version = K.version),
        x.onUpdate && x.onUpdate(x));
    }
    A.__version = x.version;
  }
  function ft(A, x, O, X, K, G) {
    const gt = r.convert(O.format, O.colorSpace),
      ot = r.convert(O.type),
      Et = b(O.internalFormat, gt, ot, O.colorSpace),
      _t = n.get(x),
      Z = n.get(O);
    if (((Z.__renderTarget = x), !_t.__hasExternalTextures)) {
      const et = Math.max(1, x.width >> G),
        wt = Math.max(1, x.height >> G);
      K === i.TEXTURE_3D || K === i.TEXTURE_2D_ARRAY
        ? e.texImage3D(K, G, Et, et, wt, x.depth, 0, gt, ot, null)
        : e.texImage2D(K, G, Et, et, wt, 0, gt, ot, null);
    }
    (e.bindFramebuffer(i.FRAMEBUFFER, A),
      xt(x)
        ? o.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            X,
            K,
            Z.__webglTexture,
            0,
            ee(x),
          )
        : (K === i.TEXTURE_2D ||
            (K >= i.TEXTURE_CUBE_MAP_POSITIVE_X &&
              K <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z)) &&
          i.framebufferTexture2D(i.FRAMEBUFFER, X, K, Z.__webglTexture, G),
      e.bindFramebuffer(i.FRAMEBUFFER, null));
  }
  function It(A, x, O) {
    if ((i.bindRenderbuffer(i.RENDERBUFFER, A), x.depthBuffer)) {
      const X = x.depthTexture,
        K = X && X.isDepthTexture ? X.type : null,
        G = y(x.stencilBuffer, K),
        gt = x.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
        ot = ee(x);
      (xt(x)
        ? o.renderbufferStorageMultisampleEXT(
            i.RENDERBUFFER,
            ot,
            G,
            x.width,
            x.height,
          )
        : O
          ? i.renderbufferStorageMultisample(
              i.RENDERBUFFER,
              ot,
              G,
              x.width,
              x.height,
            )
          : i.renderbufferStorage(i.RENDERBUFFER, G, x.width, x.height),
        i.framebufferRenderbuffer(i.FRAMEBUFFER, gt, i.RENDERBUFFER, A));
    } else {
      const X = x.textures;
      for (let K = 0; K < X.length; K++) {
        const G = X[K],
          gt = r.convert(G.format, G.colorSpace),
          ot = r.convert(G.type),
          Et = b(G.internalFormat, gt, ot, G.colorSpace),
          _t = ee(x);
        O && xt(x) === !1
          ? i.renderbufferStorageMultisample(
              i.RENDERBUFFER,
              _t,
              Et,
              x.width,
              x.height,
            )
          : xt(x)
            ? o.renderbufferStorageMultisampleEXT(
                i.RENDERBUFFER,
                _t,
                Et,
                x.width,
                x.height,
              )
            : i.renderbufferStorage(i.RENDERBUFFER, Et, x.width, x.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function vt(A, x) {
    if (x && x.isWebGLCubeRenderTarget)
      throw new Error(
        "Depth Texture with cube render targets is not supported",
      );
    if (
      (e.bindFramebuffer(i.FRAMEBUFFER, A),
      !(x.depthTexture && x.depthTexture.isDepthTexture))
    )
      throw new Error(
        "renderTarget.depthTexture must be an instance of THREE.DepthTexture",
      );
    const X = n.get(x.depthTexture);
    ((X.__renderTarget = x),
      (!X.__webglTexture ||
        x.depthTexture.image.width !== x.width ||
        x.depthTexture.image.height !== x.height) &&
        ((x.depthTexture.image.width = x.width),
        (x.depthTexture.image.height = x.height),
        (x.depthTexture.needsUpdate = !0)),
      k(x.depthTexture, 0));
    const K = X.__webglTexture,
      G = ee(x);
    if (x.depthTexture.format === Ii)
      xt(x)
        ? o.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            i.DEPTH_ATTACHMENT,
            i.TEXTURE_2D,
            K,
            0,
            G,
          )
        : i.framebufferTexture2D(
            i.FRAMEBUFFER,
            i.DEPTH_ATTACHMENT,
            i.TEXTURE_2D,
            K,
            0,
          );
    else if (x.depthTexture.format === Ni)
      xt(x)
        ? o.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            i.DEPTH_STENCIL_ATTACHMENT,
            i.TEXTURE_2D,
            K,
            0,
            G,
          )
        : i.framebufferTexture2D(
            i.FRAMEBUFFER,
            i.DEPTH_STENCIL_ATTACHMENT,
            i.TEXTURE_2D,
            K,
            0,
          );
    else throw new Error("Unknown depthTexture format");
  }
  function zt(A) {
    const x = n.get(A),
      O = A.isWebGLCubeRenderTarget === !0;
    if (x.__boundDepthTexture !== A.depthTexture) {
      const X = A.depthTexture;
      if ((x.__depthDisposeCallback && x.__depthDisposeCallback(), X)) {
        const K = () => {
          (delete x.__boundDepthTexture,
            delete x.__depthDisposeCallback,
            X.removeEventListener("dispose", K));
        };
        (X.addEventListener("dispose", K), (x.__depthDisposeCallback = K));
      }
      x.__boundDepthTexture = X;
    }
    if (A.depthTexture && !x.__autoAllocateDepthBuffer) {
      if (O)
        throw new Error(
          "target.depthTexture not supported in Cube render targets",
        );
      const X = A.texture.mipmaps;
      X && X.length > 0
        ? vt(x.__webglFramebuffer[0], A)
        : vt(x.__webglFramebuffer, A);
    } else if (O) {
      x.__webglDepthbuffer = [];
      for (let X = 0; X < 6; X++)
        if (
          (e.bindFramebuffer(i.FRAMEBUFFER, x.__webglFramebuffer[X]),
          x.__webglDepthbuffer[X] === void 0)
        )
          ((x.__webglDepthbuffer[X] = i.createRenderbuffer()),
            It(x.__webglDepthbuffer[X], A, !1));
        else {
          const K = A.stencilBuffer
              ? i.DEPTH_STENCIL_ATTACHMENT
              : i.DEPTH_ATTACHMENT,
            G = x.__webglDepthbuffer[X];
          (i.bindRenderbuffer(i.RENDERBUFFER, G),
            i.framebufferRenderbuffer(i.FRAMEBUFFER, K, i.RENDERBUFFER, G));
        }
    } else {
      const X = A.texture.mipmaps;
      if (
        (X && X.length > 0
          ? e.bindFramebuffer(i.FRAMEBUFFER, x.__webglFramebuffer[0])
          : e.bindFramebuffer(i.FRAMEBUFFER, x.__webglFramebuffer),
        x.__webglDepthbuffer === void 0)
      )
        ((x.__webglDepthbuffer = i.createRenderbuffer()),
          It(x.__webglDepthbuffer, A, !1));
      else {
        const K = A.stencilBuffer
            ? i.DEPTH_STENCIL_ATTACHMENT
            : i.DEPTH_ATTACHMENT,
          G = x.__webglDepthbuffer;
        (i.bindRenderbuffer(i.RENDERBUFFER, G),
          i.framebufferRenderbuffer(i.FRAMEBUFFER, K, i.RENDERBUFFER, G));
      }
    }
    e.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function ge(A, x, O) {
    const X = n.get(A);
    (x !== void 0 &&
      ft(
        X.__webglFramebuffer,
        A,
        A.texture,
        i.COLOR_ATTACHMENT0,
        i.TEXTURE_2D,
        0,
      ),
      O !== void 0 && zt(A));
  }
  function Ot(A) {
    const x = A.texture,
      O = n.get(A),
      X = n.get(x);
    A.addEventListener("dispose", w);
    const K = A.textures,
      G = A.isWebGLCubeRenderTarget === !0,
      gt = K.length > 1;
    if (
      (gt ||
        (X.__webglTexture === void 0 && (X.__webglTexture = i.createTexture()),
        (X.__version = x.version),
        a.memory.textures++),
      G)
    ) {
      O.__webglFramebuffer = [];
      for (let ot = 0; ot < 6; ot++)
        if (x.mipmaps && x.mipmaps.length > 0) {
          O.__webglFramebuffer[ot] = [];
          for (let Et = 0; Et < x.mipmaps.length; Et++)
            O.__webglFramebuffer[ot][Et] = i.createFramebuffer();
        } else O.__webglFramebuffer[ot] = i.createFramebuffer();
    } else {
      if (x.mipmaps && x.mipmaps.length > 0) {
        O.__webglFramebuffer = [];
        for (let ot = 0; ot < x.mipmaps.length; ot++)
          O.__webglFramebuffer[ot] = i.createFramebuffer();
      } else O.__webglFramebuffer = i.createFramebuffer();
      if (gt)
        for (let ot = 0, Et = K.length; ot < Et; ot++) {
          const _t = n.get(K[ot]);
          _t.__webglTexture === void 0 &&
            ((_t.__webglTexture = i.createTexture()), a.memory.textures++);
        }
      if (A.samples > 0 && xt(A) === !1) {
        ((O.__webglMultisampledFramebuffer = i.createFramebuffer()),
          (O.__webglColorRenderbuffer = []),
          e.bindFramebuffer(i.FRAMEBUFFER, O.__webglMultisampledFramebuffer));
        for (let ot = 0; ot < K.length; ot++) {
          const Et = K[ot];
          ((O.__webglColorRenderbuffer[ot] = i.createRenderbuffer()),
            i.bindRenderbuffer(i.RENDERBUFFER, O.__webglColorRenderbuffer[ot]));
          const _t = r.convert(Et.format, Et.colorSpace),
            Z = r.convert(Et.type),
            et = b(
              Et.internalFormat,
              _t,
              Z,
              Et.colorSpace,
              A.isXRRenderTarget === !0,
            ),
            wt = ee(A);
          (i.renderbufferStorageMultisample(
            i.RENDERBUFFER,
            wt,
            et,
            A.width,
            A.height,
          ),
            i.framebufferRenderbuffer(
              i.FRAMEBUFFER,
              i.COLOR_ATTACHMENT0 + ot,
              i.RENDERBUFFER,
              O.__webglColorRenderbuffer[ot],
            ));
        }
        (i.bindRenderbuffer(i.RENDERBUFFER, null),
          A.depthBuffer &&
            ((O.__webglDepthRenderbuffer = i.createRenderbuffer()),
            It(O.__webglDepthRenderbuffer, A, !0)),
          e.bindFramebuffer(i.FRAMEBUFFER, null));
      }
    }
    if (G) {
      (e.bindTexture(i.TEXTURE_CUBE_MAP, X.__webglTexture),
        kt(i.TEXTURE_CUBE_MAP, x));
      for (let ot = 0; ot < 6; ot++)
        if (x.mipmaps && x.mipmaps.length > 0)
          for (let Et = 0; Et < x.mipmaps.length; Et++)
            ft(
              O.__webglFramebuffer[ot][Et],
              A,
              x,
              i.COLOR_ATTACHMENT0,
              i.TEXTURE_CUBE_MAP_POSITIVE_X + ot,
              Et,
            );
        else
          ft(
            O.__webglFramebuffer[ot],
            A,
            x,
            i.COLOR_ATTACHMENT0,
            i.TEXTURE_CUBE_MAP_POSITIVE_X + ot,
            0,
          );
      (m(x) && d(i.TEXTURE_CUBE_MAP), e.unbindTexture());
    } else if (gt) {
      for (let ot = 0, Et = K.length; ot < Et; ot++) {
        const _t = K[ot],
          Z = n.get(_t);
        let et = i.TEXTURE_2D;
        ((A.isWebGL3DRenderTarget || A.isWebGLArrayRenderTarget) &&
          (et = A.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY),
          e.bindTexture(et, Z.__webglTexture),
          kt(et, _t),
          ft(O.__webglFramebuffer, A, _t, i.COLOR_ATTACHMENT0 + ot, et, 0),
          m(_t) && d(et));
      }
      e.unbindTexture();
    } else {
      let ot = i.TEXTURE_2D;
      if (
        ((A.isWebGL3DRenderTarget || A.isWebGLArrayRenderTarget) &&
          (ot = A.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY),
        e.bindTexture(ot, X.__webglTexture),
        kt(ot, x),
        x.mipmaps && x.mipmaps.length > 0)
      )
        for (let Et = 0; Et < x.mipmaps.length; Et++)
          ft(O.__webglFramebuffer[Et], A, x, i.COLOR_ATTACHMENT0, ot, Et);
      else ft(O.__webglFramebuffer, A, x, i.COLOR_ATTACHMENT0, ot, 0);
      (m(x) && d(ot), e.unbindTexture());
    }
    A.depthBuffer && zt(A);
  }
  function ie(A) {
    const x = A.textures;
    for (let O = 0, X = x.length; O < X; O++) {
      const K = x[O];
      if (m(K)) {
        const G = E(A),
          gt = n.get(K).__webglTexture;
        (e.bindTexture(G, gt), d(G), e.unbindTexture());
      }
    }
  }
  const C = [],
    Vt = [];
  function Gt(A) {
    if (A.samples > 0) {
      if (xt(A) === !1) {
        const x = A.textures,
          O = A.width,
          X = A.height;
        let K = i.COLOR_BUFFER_BIT;
        const G = A.stencilBuffer
            ? i.DEPTH_STENCIL_ATTACHMENT
            : i.DEPTH_ATTACHMENT,
          gt = n.get(A),
          ot = x.length > 1;
        if (ot)
          for (let _t = 0; _t < x.length; _t++)
            (e.bindFramebuffer(
              i.FRAMEBUFFER,
              gt.__webglMultisampledFramebuffer,
            ),
              i.framebufferRenderbuffer(
                i.FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + _t,
                i.RENDERBUFFER,
                null,
              ),
              e.bindFramebuffer(i.FRAMEBUFFER, gt.__webglFramebuffer),
              i.framebufferTexture2D(
                i.DRAW_FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + _t,
                i.TEXTURE_2D,
                null,
                0,
              ));
        e.bindFramebuffer(
          i.READ_FRAMEBUFFER,
          gt.__webglMultisampledFramebuffer,
        );
        const Et = A.texture.mipmaps;
        Et && Et.length > 0
          ? e.bindFramebuffer(i.DRAW_FRAMEBUFFER, gt.__webglFramebuffer[0])
          : e.bindFramebuffer(i.DRAW_FRAMEBUFFER, gt.__webglFramebuffer);
        for (let _t = 0; _t < x.length; _t++) {
          if (
            (A.resolveDepthBuffer &&
              (A.depthBuffer && (K |= i.DEPTH_BUFFER_BIT),
              A.stencilBuffer &&
                A.resolveStencilBuffer &&
                (K |= i.STENCIL_BUFFER_BIT)),
            ot)
          ) {
            i.framebufferRenderbuffer(
              i.READ_FRAMEBUFFER,
              i.COLOR_ATTACHMENT0,
              i.RENDERBUFFER,
              gt.__webglColorRenderbuffer[_t],
            );
            const Z = n.get(x[_t]).__webglTexture;
            i.framebufferTexture2D(
              i.DRAW_FRAMEBUFFER,
              i.COLOR_ATTACHMENT0,
              i.TEXTURE_2D,
              Z,
              0,
            );
          }
          (i.blitFramebuffer(0, 0, O, X, 0, 0, O, X, K, i.NEAREST),
            l === !0 &&
              ((C.length = 0),
              (Vt.length = 0),
              C.push(i.COLOR_ATTACHMENT0 + _t),
              A.depthBuffer &&
                A.resolveDepthBuffer === !1 &&
                (C.push(G),
                Vt.push(G),
                i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, Vt)),
              i.invalidateFramebuffer(i.READ_FRAMEBUFFER, C)));
        }
        if (
          (e.bindFramebuffer(i.READ_FRAMEBUFFER, null),
          e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null),
          ot)
        )
          for (let _t = 0; _t < x.length; _t++) {
            (e.bindFramebuffer(
              i.FRAMEBUFFER,
              gt.__webglMultisampledFramebuffer,
            ),
              i.framebufferRenderbuffer(
                i.FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + _t,
                i.RENDERBUFFER,
                gt.__webglColorRenderbuffer[_t],
              ));
            const Z = n.get(x[_t]).__webglTexture;
            (e.bindFramebuffer(i.FRAMEBUFFER, gt.__webglFramebuffer),
              i.framebufferTexture2D(
                i.DRAW_FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + _t,
                i.TEXTURE_2D,
                Z,
                0,
              ));
          }
        e.bindFramebuffer(
          i.DRAW_FRAMEBUFFER,
          gt.__webglMultisampledFramebuffer,
        );
      } else if (A.depthBuffer && A.resolveDepthBuffer === !1 && l) {
        const x = A.stencilBuffer
          ? i.DEPTH_STENCIL_ATTACHMENT
          : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [x]);
      }
    }
  }
  function ee(A) {
    return Math.min(s.maxSamples, A.samples);
  }
  function xt(A) {
    const x = n.get(A);
    return (
      A.samples > 0 &&
      t.has("WEBGL_multisampled_render_to_texture") === !0 &&
      x.__useRenderToTexture !== !1
    );
  }
  function se(A) {
    const x = a.render.frame;
    u.get(A) !== x && (u.set(A, x), A.update());
  }
  function St(A, x) {
    const O = A.colorSpace,
      X = A.format,
      K = A.type;
    return (
      A.isCompressedTexture === !0 ||
        A.isVideoTexture === !0 ||
        (O !== mi &&
          O !== An &&
          (Xt.getTransfer(O) === $t
            ? (X !== Ke || K !== sn) &&
              Ut(
                "WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.",
              )
            : he("WebGLTextures: Unsupported texture color space:", O))),
      x
    );
  }
  function Lt(A) {
    return (
      typeof HTMLImageElement < "u" && A instanceof HTMLImageElement
        ? ((c.width = A.naturalWidth || A.width),
          (c.height = A.naturalHeight || A.height))
        : typeof VideoFrame < "u" && A instanceof VideoFrame
          ? ((c.width = A.displayWidth), (c.height = A.displayHeight))
          : ((c.width = A.width), (c.height = A.height)),
      c
    );
  }
  ((this.allocateTextureUnit = V),
    (this.resetTextureUnits = N),
    (this.setTexture2D = k),
    (this.setTexture2DArray = q),
    (this.setTexture3D = J),
    (this.setTextureCube = H),
    (this.rebindTextures = ge),
    (this.setupRenderTarget = Ot),
    (this.updateRenderTargetMipmap = ie),
    (this.updateMultisampleRenderTarget = Gt),
    (this.setupDepthRenderbuffer = zt),
    (this.setupFrameBufferTexture = ft),
    (this.useMultisampledRTT = xt));
}
function Xp(i, t) {
  function e(n, s = An) {
    let r;
    const a = Xt.getTransfer(s);
    if (n === sn) return i.UNSIGNED_BYTE;
    if (n === $r) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === Zr) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === Lo) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === Uo) return i.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === Po) return i.BYTE;
    if (n === Do) return i.SHORT;
    if (n === Li) return i.UNSIGNED_SHORT;
    if (n === Kr) return i.INT;
    if (n === kn) return i.UNSIGNED_INT;
    if (n === pn) return i.FLOAT;
    if (n === _i) return i.HALF_FLOAT;
    if (n === Io) return i.ALPHA;
    if (n === No) return i.RGB;
    if (n === Ke) return i.RGBA;
    if (n === Ii) return i.DEPTH_COMPONENT;
    if (n === Ni) return i.DEPTH_STENCIL;
    if (n === Fo) return i.RED;
    if (n === Jr) return i.RED_INTEGER;
    if (n === Qr) return i.RG;
    if (n === ta) return i.RG_INTEGER;
    if (n === ea) return i.RGBA_INTEGER;
    if (n === cs || n === ls || n === hs || n === us)
      if (a === $t)
        if (((r = t.get("WEBGL_compressed_texture_s3tc_srgb")), r !== null)) {
          if (n === cs) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === ls) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === hs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === us) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else return null;
      else if (((r = t.get("WEBGL_compressed_texture_s3tc")), r !== null)) {
        if (n === cs) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === ls) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === hs) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === us) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else return null;
    if (n === _r || n === gr || n === vr || n === Mr)
      if (((r = t.get("WEBGL_compressed_texture_pvrtc")), r !== null)) {
        if (n === _r) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === gr) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === vr) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === Mr) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else return null;
    if (n === Sr || n === br || n === Er)
      if (((r = t.get("WEBGL_compressed_texture_etc")), r !== null)) {
        if (n === Sr || n === br)
          return a === $t ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === Er)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC
            : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else return null;
    if (
      n === yr ||
      n === Tr ||
      n === Ar ||
      n === wr ||
      n === Rr ||
      n === Cr ||
      n === Pr ||
      n === Dr ||
      n === Lr ||
      n === Ur ||
      n === Ir ||
      n === Nr ||
      n === Fr ||
      n === Or
    )
      if (((r = t.get("WEBGL_compressed_texture_astc")), r !== null)) {
        if (n === yr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR
            : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Tr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR
            : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === Ar)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR
            : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === wr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR
            : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === Rr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR
            : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === Cr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR
            : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === Pr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR
            : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === Dr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR
            : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === Lr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR
            : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === Ur)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR
            : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === Ir)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR
            : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === Nr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR
            : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === Fr)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR
            : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === Or)
          return a === $t
            ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR
            : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else return null;
    if (n === Br || n === zr || n === Vr)
      if (((r = t.get("EXT_texture_compression_bptc")), r !== null)) {
        if (n === Br)
          return a === $t
            ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT
            : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === zr) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === Vr) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else return null;
    if (n === Gr || n === Hr || n === kr || n === Wr)
      if (((r = t.get("EXT_texture_compression_rgtc")), r !== null)) {
        if (n === Gr) return r.COMPRESSED_RED_RGTC1_EXT;
        if (n === Hr) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === kr) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === Wr) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else return null;
    return n === Ui ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: e };
}
const Yp = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`,
  qp = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class jp {
  constructor() {
    ((this.texture = null),
      (this.mesh = null),
      (this.depthNear = 0),
      (this.depthFar = 0));
  }
  init(t, e) {
    if (this.texture === null) {
      const n = new $o(t.texture);
      ((t.depthNear !== e.depthNear || t.depthFar !== e.depthFar) &&
        ((this.depthNear = t.depthNear), (this.depthFar = t.depthFar)),
        (this.texture = n));
    }
  }
  getMesh(t) {
    if (this.texture !== null && this.mesh === null) {
      const e = t.cameras[0].viewport,
        n = new _n({
          vertexShader: Yp,
          fragmentShader: qp,
          uniforms: {
            depthColor: { value: this.texture },
            depthWidth: { value: e.z },
            depthHeight: { value: e.w },
          },
        });
      this.mesh = new Ae(new Mi(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    ((this.texture = null), (this.mesh = null));
  }
  getDepthTexture() {
    return this.texture;
  }
}
class Kp extends Yn {
  constructor(t, e) {
    super();
    const n = this;
    let s = null,
      r = 1,
      a = null,
      o = "local-floor",
      l = 1,
      c = null,
      u = null,
      h = null,
      f = null,
      p = null,
      _ = null;
    const S = typeof XRWebGLBinding < "u",
      m = new jp(),
      d = {},
      E = e.getContextAttributes();
    let b = null,
      y = null;
    const R = [],
      T = [],
      w = new Pt();
    let L = null;
    const M = new Ge();
    M.viewport = new le();
    const g = new Ge();
    g.viewport = new le();
    const D = [M, g],
      N = new dh();
    let V = null,
      W = null;
    ((this.cameraAutoUpdate = !0),
      (this.enabled = !1),
      (this.isPresenting = !1),
      (this.getController = function (Y) {
        let $ = R[Y];
        return (
          $ === void 0 && (($ = new qs()), (R[Y] = $)),
          $.getTargetRaySpace()
        );
      }),
      (this.getControllerGrip = function (Y) {
        let $ = R[Y];
        return ($ === void 0 && (($ = new qs()), (R[Y] = $)), $.getGripSpace());
      }),
      (this.getHand = function (Y) {
        let $ = R[Y];
        return ($ === void 0 && (($ = new qs()), (R[Y] = $)), $.getHandSpace());
      }));
    function k(Y) {
      const $ = T.indexOf(Y.inputSource);
      if ($ === -1) return;
      const ft = R[$];
      ft !== void 0 &&
        (ft.update(Y.inputSource, Y.frame, c || a),
        ft.dispatchEvent({ type: Y.type, data: Y.inputSource }));
    }
    function q() {
      (s.removeEventListener("select", k),
        s.removeEventListener("selectstart", k),
        s.removeEventListener("selectend", k),
        s.removeEventListener("squeeze", k),
        s.removeEventListener("squeezestart", k),
        s.removeEventListener("squeezeend", k),
        s.removeEventListener("end", q),
        s.removeEventListener("inputsourceschange", J));
      for (let Y = 0; Y < R.length; Y++) {
        const $ = T[Y];
        $ !== null && ((T[Y] = null), R[Y].disconnect($));
      }
      ((V = null), (W = null), m.reset());
      for (const Y in d) delete d[Y];
      (t.setRenderTarget(b),
        (p = null),
        (f = null),
        (h = null),
        (s = null),
        (y = null),
        te.stop(),
        (n.isPresenting = !1),
        t.setPixelRatio(L),
        t.setSize(w.width, w.height, !1),
        n.dispatchEvent({ type: "sessionend" }));
    }
    ((this.setFramebufferScaleFactor = function (Y) {
      ((r = Y),
        n.isPresenting === !0 &&
          Ut(
            "WebXRManager: Cannot change framebuffer scale while presenting.",
          ));
    }),
      (this.setReferenceSpaceType = function (Y) {
        ((o = Y),
          n.isPresenting === !0 &&
            Ut(
              "WebXRManager: Cannot change reference space type while presenting.",
            ));
      }),
      (this.getReferenceSpace = function () {
        return c || a;
      }),
      (this.setReferenceSpace = function (Y) {
        c = Y;
      }),
      (this.getBaseLayer = function () {
        return f !== null ? f : p;
      }),
      (this.getBinding = function () {
        return (h === null && S && (h = new XRWebGLBinding(s, e)), h);
      }),
      (this.getFrame = function () {
        return _;
      }),
      (this.getSession = function () {
        return s;
      }),
      (this.setSession = async function (Y) {
        if (((s = Y), s !== null)) {
          if (
            ((b = t.getRenderTarget()),
            s.addEventListener("select", k),
            s.addEventListener("selectstart", k),
            s.addEventListener("selectend", k),
            s.addEventListener("squeeze", k),
            s.addEventListener("squeezestart", k),
            s.addEventListener("squeezeend", k),
            s.addEventListener("end", q),
            s.addEventListener("inputsourceschange", J),
            E.xrCompatible !== !0 && (await e.makeXRCompatible()),
            (L = t.getPixelRatio()),
            t.getSize(w),
            S && "createProjectionLayer" in XRWebGLBinding.prototype)
          ) {
            let ft = null,
              It = null,
              vt = null;
            E.depth &&
              ((vt = E.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24),
              (ft = E.stencil ? Ni : Ii),
              (It = E.stencil ? Ui : kn));
            const zt = {
              colorFormat: e.RGBA8,
              depthFormat: vt,
              scaleFactor: r,
            };
            ((h = this.getBinding()),
              (f = h.createProjectionLayer(zt)),
              s.updateRenderState({ layers: [f] }),
              t.setPixelRatio(1),
              t.setSize(f.textureWidth, f.textureHeight, !1),
              (y = new Xn(f.textureWidth, f.textureHeight, {
                format: Ke,
                type: sn,
                depthTexture: new Ko(
                  f.textureWidth,
                  f.textureHeight,
                  It,
                  void 0,
                  void 0,
                  void 0,
                  void 0,
                  void 0,
                  void 0,
                  ft,
                ),
                stencilBuffer: E.stencil,
                colorSpace: t.outputColorSpace,
                samples: E.antialias ? 4 : 0,
                resolveDepthBuffer: f.ignoreDepthValues === !1,
                resolveStencilBuffer: f.ignoreDepthValues === !1,
              })));
          } else {
            const ft = {
              antialias: E.antialias,
              alpha: !0,
              depth: E.depth,
              stencil: E.stencil,
              framebufferScaleFactor: r,
            };
            ((p = new XRWebGLLayer(s, e, ft)),
              s.updateRenderState({ baseLayer: p }),
              t.setPixelRatio(1),
              t.setSize(p.framebufferWidth, p.framebufferHeight, !1),
              (y = new Xn(p.framebufferWidth, p.framebufferHeight, {
                format: Ke,
                type: sn,
                colorSpace: t.outputColorSpace,
                stencilBuffer: E.stencil,
                resolveDepthBuffer: p.ignoreDepthValues === !1,
                resolveStencilBuffer: p.ignoreDepthValues === !1,
              })));
          }
          ((y.isXRRenderTarget = !0),
            this.setFoveation(l),
            (c = null),
            (a = await s.requestReferenceSpace(o)),
            te.setContext(s),
            te.start(),
            (n.isPresenting = !0),
            n.dispatchEvent({ type: "sessionstart" }));
        }
      }),
      (this.getEnvironmentBlendMode = function () {
        if (s !== null) return s.environmentBlendMode;
      }),
      (this.getDepthTexture = function () {
        return m.getDepthTexture();
      }));
    function J(Y) {
      for (let $ = 0; $ < Y.removed.length; $++) {
        const ft = Y.removed[$],
          It = T.indexOf(ft);
        It >= 0 && ((T[It] = null), R[It].disconnect(ft));
      }
      for (let $ = 0; $ < Y.added.length; $++) {
        const ft = Y.added[$];
        let It = T.indexOf(ft);
        if (It === -1) {
          for (let zt = 0; zt < R.length; zt++)
            if (zt >= T.length) {
              (T.push(ft), (It = zt));
              break;
            } else if (T[zt] === null) {
              ((T[zt] = ft), (It = zt));
              break;
            }
          if (It === -1) break;
        }
        const vt = R[It];
        vt && vt.connect(ft);
      }
    }
    const H = new F(),
      nt = new F();
    function rt(Y, $, ft) {
      (H.setFromMatrixPosition($.matrixWorld),
        nt.setFromMatrixPosition(ft.matrixWorld));
      const It = H.distanceTo(nt),
        vt = $.projectionMatrix.elements,
        zt = ft.projectionMatrix.elements,
        ge = vt[14] / (vt[10] - 1),
        Ot = vt[14] / (vt[10] + 1),
        ie = (vt[9] + 1) / vt[5],
        C = (vt[9] - 1) / vt[5],
        Vt = (vt[8] - 1) / vt[0],
        Gt = (zt[8] + 1) / zt[0],
        ee = ge * Vt,
        xt = ge * Gt,
        se = It / (-Vt + Gt),
        St = se * -Vt;
      if (
        ($.matrixWorld.decompose(Y.position, Y.quaternion, Y.scale),
        Y.translateX(St),
        Y.translateZ(se),
        Y.matrixWorld.compose(Y.position, Y.quaternion, Y.scale),
        Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),
        vt[10] === -1)
      )
        (Y.projectionMatrix.copy($.projectionMatrix),
          Y.projectionMatrixInverse.copy($.projectionMatrixInverse));
      else {
        const Lt = ge + se,
          A = Ot + se,
          x = ee - St,
          O = xt + (It - St),
          X = ((ie * Ot) / A) * Lt,
          K = ((C * Ot) / A) * Lt;
        (Y.projectionMatrix.makePerspective(x, O, X, K, Lt, A),
          Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert());
      }
    }
    function bt(Y, $) {
      ($ === null
        ? Y.matrixWorld.copy(Y.matrix)
        : Y.matrixWorld.multiplyMatrices($.matrixWorld, Y.matrix),
        Y.matrixWorldInverse.copy(Y.matrixWorld).invert());
    }
    this.updateCamera = function (Y) {
      if (s === null) return;
      let $ = Y.near,
        ft = Y.far;
      (m.texture !== null &&
        (m.depthNear > 0 && ($ = m.depthNear),
        m.depthFar > 0 && (ft = m.depthFar)),
        (N.near = g.near = M.near = $),
        (N.far = g.far = M.far = ft),
        (V !== N.near || W !== N.far) &&
          (s.updateRenderState({ depthNear: N.near, depthFar: N.far }),
          (V = N.near),
          (W = N.far)),
        (N.layers.mask = Y.layers.mask | 6),
        (M.layers.mask = N.layers.mask & 3),
        (g.layers.mask = N.layers.mask & 5));
      const It = Y.parent,
        vt = N.cameras;
      bt(N, It);
      for (let zt = 0; zt < vt.length; zt++) bt(vt[zt], It);
      (vt.length === 2
        ? rt(N, M, g)
        : N.projectionMatrix.copy(M.projectionMatrix),
        kt(Y, N, It));
    };
    function kt(Y, $, ft) {
      (ft === null
        ? Y.matrix.copy($.matrixWorld)
        : (Y.matrix.copy(ft.matrixWorld),
          Y.matrix.invert(),
          Y.matrix.multiply($.matrixWorld)),
        Y.matrix.decompose(Y.position, Y.quaternion, Y.scale),
        Y.updateMatrixWorld(!0),
        Y.projectionMatrix.copy($.projectionMatrix),
        Y.projectionMatrixInverse.copy($.projectionMatrixInverse),
        Y.isPerspectiveCamera &&
          ((Y.fov = Xr * 2 * Math.atan(1 / Y.projectionMatrix.elements[5])),
          (Y.zoom = 1)));
    }
    ((this.getCamera = function () {
      return N;
    }),
      (this.getFoveation = function () {
        if (!(f === null && p === null)) return l;
      }),
      (this.setFoveation = function (Y) {
        ((l = Y),
          f !== null && (f.fixedFoveation = Y),
          p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = Y));
      }),
      (this.hasDepthSensing = function () {
        return m.texture !== null;
      }),
      (this.getDepthSensingMesh = function () {
        return m.getMesh(N);
      }),
      (this.getCameraTexture = function (Y) {
        return d[Y];
      }));
    let qt = null;
    function Qt(Y, $) {
      if (((u = $.getViewerPose(c || a)), (_ = $), u !== null)) {
        const ft = u.views;
        p !== null &&
          (t.setRenderTargetFramebuffer(y, p.framebuffer),
          t.setRenderTarget(y));
        let It = !1;
        ft.length !== N.cameras.length && ((N.cameras.length = 0), (It = !0));
        for (let Ot = 0; Ot < ft.length; Ot++) {
          const ie = ft[Ot];
          let C = null;
          if (p !== null) C = p.getViewport(ie);
          else {
            const Gt = h.getViewSubImage(f, ie);
            ((C = Gt.viewport),
              Ot === 0 &&
                (t.setRenderTargetTextures(
                  y,
                  Gt.colorTexture,
                  Gt.depthStencilTexture,
                ),
                t.setRenderTarget(y)));
          }
          let Vt = D[Ot];
          (Vt === void 0 &&
            ((Vt = new Ge()),
            Vt.layers.enable(Ot),
            (Vt.viewport = new le()),
            (D[Ot] = Vt)),
            Vt.matrix.fromArray(ie.transform.matrix),
            Vt.matrix.decompose(Vt.position, Vt.quaternion, Vt.scale),
            Vt.projectionMatrix.fromArray(ie.projectionMatrix),
            Vt.projectionMatrixInverse.copy(Vt.projectionMatrix).invert(),
            Vt.viewport.set(C.x, C.y, C.width, C.height),
            Ot === 0 &&
              (N.matrix.copy(Vt.matrix),
              N.matrix.decompose(N.position, N.quaternion, N.scale)),
            It === !0 && N.cameras.push(Vt));
        }
        const vt = s.enabledFeatures;
        if (
          vt &&
          vt.includes("depth-sensing") &&
          s.depthUsage == "gpu-optimized" &&
          S
        ) {
          h = n.getBinding();
          const Ot = h.getDepthInformation(ft[0]);
          Ot && Ot.isValid && Ot.texture && m.init(Ot, s.renderState);
        }
        if (vt && vt.includes("camera-access") && S) {
          (t.state.unbindTexture(), (h = n.getBinding()));
          for (let Ot = 0; Ot < ft.length; Ot++) {
            const ie = ft[Ot].camera;
            if (ie) {
              let C = d[ie];
              C || ((C = new $o()), (d[ie] = C));
              const Vt = h.getCameraImage(ie);
              C.sourceTexture = Vt;
            }
          }
        }
      }
      for (let ft = 0; ft < R.length; ft++) {
        const It = T[ft],
          vt = R[ft];
        It !== null && vt !== void 0 && vt.update(It, $, c || a);
      }
      (qt && qt(Y, $),
        $.detectedPlanes &&
          n.dispatchEvent({ type: "planesdetected", data: $ }),
        (_ = null));
    }
    const te = new Qo();
    (te.setAnimationLoop(Qt),
      (this.setAnimationLoop = function (Y) {
        qt = Y;
      }),
      (this.dispose = function () {}));
  }
}
const Bn = new rn(),
  $p = new ue();
function Zp(i, t) {
  function e(m, d) {
    (m.matrixAutoUpdate === !0 && m.updateMatrix(), d.value.copy(m.matrix));
  }
  function n(m, d) {
    (d.color.getRGB(m.fogColor.value, Yo(i)),
      d.isFog
        ? ((m.fogNear.value = d.near), (m.fogFar.value = d.far))
        : d.isFogExp2 && (m.fogDensity.value = d.density));
  }
  function s(m, d, E, b, y) {
    d.isMeshBasicMaterial || d.isMeshLambertMaterial
      ? r(m, d)
      : d.isMeshToonMaterial
        ? (r(m, d), h(m, d))
        : d.isMeshPhongMaterial
          ? (r(m, d), u(m, d))
          : d.isMeshStandardMaterial
            ? (r(m, d), f(m, d), d.isMeshPhysicalMaterial && p(m, d, y))
            : d.isMeshMatcapMaterial
              ? (r(m, d), _(m, d))
              : d.isMeshDepthMaterial
                ? r(m, d)
                : d.isMeshDistanceMaterial
                  ? (r(m, d), S(m, d))
                  : d.isMeshNormalMaterial
                    ? r(m, d)
                    : d.isLineBasicMaterial
                      ? (a(m, d), d.isLineDashedMaterial && o(m, d))
                      : d.isPointsMaterial
                        ? l(m, d, E, b)
                        : d.isSpriteMaterial
                          ? c(m, d)
                          : d.isShadowMaterial
                            ? (m.color.value.copy(d.color),
                              (m.opacity.value = d.opacity))
                            : d.isShaderMaterial && (d.uniformsNeedUpdate = !1);
  }
  function r(m, d) {
    ((m.opacity.value = d.opacity),
      d.color && m.diffuse.value.copy(d.color),
      d.emissive &&
        m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),
      d.map && ((m.map.value = d.map), e(d.map, m.mapTransform)),
      d.alphaMap &&
        ((m.alphaMap.value = d.alphaMap), e(d.alphaMap, m.alphaMapTransform)),
      d.bumpMap &&
        ((m.bumpMap.value = d.bumpMap),
        e(d.bumpMap, m.bumpMapTransform),
        (m.bumpScale.value = d.bumpScale),
        d.side === Le && (m.bumpScale.value *= -1)),
      d.normalMap &&
        ((m.normalMap.value = d.normalMap),
        e(d.normalMap, m.normalMapTransform),
        m.normalScale.value.copy(d.normalScale),
        d.side === Le && m.normalScale.value.negate()),
      d.displacementMap &&
        ((m.displacementMap.value = d.displacementMap),
        e(d.displacementMap, m.displacementMapTransform),
        (m.displacementScale.value = d.displacementScale),
        (m.displacementBias.value = d.displacementBias)),
      d.emissiveMap &&
        ((m.emissiveMap.value = d.emissiveMap),
        e(d.emissiveMap, m.emissiveMapTransform)),
      d.specularMap &&
        ((m.specularMap.value = d.specularMap),
        e(d.specularMap, m.specularMapTransform)),
      d.alphaTest > 0 && (m.alphaTest.value = d.alphaTest));
    const E = t.get(d),
      b = E.envMap,
      y = E.envMapRotation;
    (b &&
      ((m.envMap.value = b),
      Bn.copy(y),
      (Bn.x *= -1),
      (Bn.y *= -1),
      (Bn.z *= -1),
      b.isCubeTexture &&
        b.isRenderTargetTexture === !1 &&
        ((Bn.y *= -1), (Bn.z *= -1)),
      m.envMapRotation.value.setFromMatrix4($p.makeRotationFromEuler(Bn)),
      (m.flipEnvMap.value =
        b.isCubeTexture && b.isRenderTargetTexture === !1 ? -1 : 1),
      (m.reflectivity.value = d.reflectivity),
      (m.ior.value = d.ior),
      (m.refractionRatio.value = d.refractionRatio)),
      d.lightMap &&
        ((m.lightMap.value = d.lightMap),
        (m.lightMapIntensity.value = d.lightMapIntensity),
        e(d.lightMap, m.lightMapTransform)),
      d.aoMap &&
        ((m.aoMap.value = d.aoMap),
        (m.aoMapIntensity.value = d.aoMapIntensity),
        e(d.aoMap, m.aoMapTransform)));
  }
  function a(m, d) {
    (m.diffuse.value.copy(d.color),
      (m.opacity.value = d.opacity),
      d.map && ((m.map.value = d.map), e(d.map, m.mapTransform)));
  }
  function o(m, d) {
    ((m.dashSize.value = d.dashSize),
      (m.totalSize.value = d.dashSize + d.gapSize),
      (m.scale.value = d.scale));
  }
  function l(m, d, E, b) {
    (m.diffuse.value.copy(d.color),
      (m.opacity.value = d.opacity),
      (m.size.value = d.size * E),
      (m.scale.value = b * 0.5),
      d.map && ((m.map.value = d.map), e(d.map, m.uvTransform)),
      d.alphaMap &&
        ((m.alphaMap.value = d.alphaMap), e(d.alphaMap, m.alphaMapTransform)),
      d.alphaTest > 0 && (m.alphaTest.value = d.alphaTest));
  }
  function c(m, d) {
    (m.diffuse.value.copy(d.color),
      (m.opacity.value = d.opacity),
      (m.rotation.value = d.rotation),
      d.map && ((m.map.value = d.map), e(d.map, m.mapTransform)),
      d.alphaMap &&
        ((m.alphaMap.value = d.alphaMap), e(d.alphaMap, m.alphaMapTransform)),
      d.alphaTest > 0 && (m.alphaTest.value = d.alphaTest));
  }
  function u(m, d) {
    (m.specular.value.copy(d.specular),
      (m.shininess.value = Math.max(d.shininess, 1e-4)));
  }
  function h(m, d) {
    d.gradientMap && (m.gradientMap.value = d.gradientMap);
  }
  function f(m, d) {
    ((m.metalness.value = d.metalness),
      d.metalnessMap &&
        ((m.metalnessMap.value = d.metalnessMap),
        e(d.metalnessMap, m.metalnessMapTransform)),
      (m.roughness.value = d.roughness),
      d.roughnessMap &&
        ((m.roughnessMap.value = d.roughnessMap),
        e(d.roughnessMap, m.roughnessMapTransform)),
      d.envMap && (m.envMapIntensity.value = d.envMapIntensity));
  }
  function p(m, d, E) {
    ((m.ior.value = d.ior),
      d.sheen > 0 &&
        (m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),
        (m.sheenRoughness.value = d.sheenRoughness),
        d.sheenColorMap &&
          ((m.sheenColorMap.value = d.sheenColorMap),
          e(d.sheenColorMap, m.sheenColorMapTransform)),
        d.sheenRoughnessMap &&
          ((m.sheenRoughnessMap.value = d.sheenRoughnessMap),
          e(d.sheenRoughnessMap, m.sheenRoughnessMapTransform))),
      d.clearcoat > 0 &&
        ((m.clearcoat.value = d.clearcoat),
        (m.clearcoatRoughness.value = d.clearcoatRoughness),
        d.clearcoatMap &&
          ((m.clearcoatMap.value = d.clearcoatMap),
          e(d.clearcoatMap, m.clearcoatMapTransform)),
        d.clearcoatRoughnessMap &&
          ((m.clearcoatRoughnessMap.value = d.clearcoatRoughnessMap),
          e(d.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)),
        d.clearcoatNormalMap &&
          ((m.clearcoatNormalMap.value = d.clearcoatNormalMap),
          e(d.clearcoatNormalMap, m.clearcoatNormalMapTransform),
          m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),
          d.side === Le && m.clearcoatNormalScale.value.negate())),
      d.dispersion > 0 && (m.dispersion.value = d.dispersion),
      d.iridescence > 0 &&
        ((m.iridescence.value = d.iridescence),
        (m.iridescenceIOR.value = d.iridescenceIOR),
        (m.iridescenceThicknessMinimum.value = d.iridescenceThicknessRange[0]),
        (m.iridescenceThicknessMaximum.value = d.iridescenceThicknessRange[1]),
        d.iridescenceMap &&
          ((m.iridescenceMap.value = d.iridescenceMap),
          e(d.iridescenceMap, m.iridescenceMapTransform)),
        d.iridescenceThicknessMap &&
          ((m.iridescenceThicknessMap.value = d.iridescenceThicknessMap),
          e(d.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))),
      d.transmission > 0 &&
        ((m.transmission.value = d.transmission),
        (m.transmissionSamplerMap.value = E.texture),
        m.transmissionSamplerSize.value.set(E.width, E.height),
        d.transmissionMap &&
          ((m.transmissionMap.value = d.transmissionMap),
          e(d.transmissionMap, m.transmissionMapTransform)),
        (m.thickness.value = d.thickness),
        d.thicknessMap &&
          ((m.thicknessMap.value = d.thicknessMap),
          e(d.thicknessMap, m.thicknessMapTransform)),
        (m.attenuationDistance.value = d.attenuationDistance),
        m.attenuationColor.value.copy(d.attenuationColor)),
      d.anisotropy > 0 &&
        (m.anisotropyVector.value.set(
          d.anisotropy * Math.cos(d.anisotropyRotation),
          d.anisotropy * Math.sin(d.anisotropyRotation),
        ),
        d.anisotropyMap &&
          ((m.anisotropyMap.value = d.anisotropyMap),
          e(d.anisotropyMap, m.anisotropyMapTransform))),
      (m.specularIntensity.value = d.specularIntensity),
      m.specularColor.value.copy(d.specularColor),
      d.specularColorMap &&
        ((m.specularColorMap.value = d.specularColorMap),
        e(d.specularColorMap, m.specularColorMapTransform)),
      d.specularIntensityMap &&
        ((m.specularIntensityMap.value = d.specularIntensityMap),
        e(d.specularIntensityMap, m.specularIntensityMapTransform)));
  }
  function _(m, d) {
    d.matcap && (m.matcap.value = d.matcap);
  }
  function S(m, d) {
    const E = t.get(d).light;
    (m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),
      (m.nearDistance.value = E.shadow.camera.near),
      (m.farDistance.value = E.shadow.camera.far));
  }
  return { refreshFogUniforms: n, refreshMaterialUniforms: s };
}
function Jp(i, t, e, n) {
  let s = {},
    r = {},
    a = [];
  const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(E, b) {
    const y = b.program;
    n.uniformBlockBinding(E, y);
  }
  function c(E, b) {
    let y = s[E.id];
    y === void 0 &&
      (_(E), (y = u(E)), (s[E.id] = y), E.addEventListener("dispose", m));
    const R = b.program;
    n.updateUBOMapping(E, R);
    const T = t.render.frame;
    r[E.id] !== T && (f(E), (r[E.id] = T));
  }
  function u(E) {
    const b = h();
    E.__bindingPointIndex = b;
    const y = i.createBuffer(),
      R = E.__size,
      T = E.usage;
    return (
      i.bindBuffer(i.UNIFORM_BUFFER, y),
      i.bufferData(i.UNIFORM_BUFFER, R, T),
      i.bindBuffer(i.UNIFORM_BUFFER, null),
      i.bindBufferBase(i.UNIFORM_BUFFER, b, y),
      y
    );
  }
  function h() {
    for (let E = 0; E < o; E++) if (a.indexOf(E) === -1) return (a.push(E), E);
    return (
      he(
        "WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.",
      ),
      0
    );
  }
  function f(E) {
    const b = s[E.id],
      y = E.uniforms,
      R = E.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, b);
    for (let T = 0, w = y.length; T < w; T++) {
      const L = Array.isArray(y[T]) ? y[T] : [y[T]];
      for (let M = 0, g = L.length; M < g; M++) {
        const D = L[M];
        if (p(D, T, M, R) === !0) {
          const N = D.__offset,
            V = Array.isArray(D.value) ? D.value : [D.value];
          let W = 0;
          for (let k = 0; k < V.length; k++) {
            const q = V[k],
              J = S(q);
            typeof q == "number" || typeof q == "boolean"
              ? ((D.__data[0] = q),
                i.bufferSubData(i.UNIFORM_BUFFER, N + W, D.__data))
              : q.isMatrix3
                ? ((D.__data[0] = q.elements[0]),
                  (D.__data[1] = q.elements[1]),
                  (D.__data[2] = q.elements[2]),
                  (D.__data[3] = 0),
                  (D.__data[4] = q.elements[3]),
                  (D.__data[5] = q.elements[4]),
                  (D.__data[6] = q.elements[5]),
                  (D.__data[7] = 0),
                  (D.__data[8] = q.elements[6]),
                  (D.__data[9] = q.elements[7]),
                  (D.__data[10] = q.elements[8]),
                  (D.__data[11] = 0))
                : (q.toArray(D.__data, W),
                  (W += J.storage / Float32Array.BYTES_PER_ELEMENT));
          }
          i.bufferSubData(i.UNIFORM_BUFFER, N, D.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function p(E, b, y, R) {
    const T = E.value,
      w = b + "_" + y;
    if (R[w] === void 0)
      return (
        typeof T == "number" || typeof T == "boolean"
          ? (R[w] = T)
          : (R[w] = T.clone()),
        !0
      );
    {
      const L = R[w];
      if (typeof T == "number" || typeof T == "boolean") {
        if (L !== T) return ((R[w] = T), !0);
      } else if (L.equals(T) === !1) return (L.copy(T), !0);
    }
    return !1;
  }
  function _(E) {
    const b = E.uniforms;
    let y = 0;
    const R = 16;
    for (let w = 0, L = b.length; w < L; w++) {
      const M = Array.isArray(b[w]) ? b[w] : [b[w]];
      for (let g = 0, D = M.length; g < D; g++) {
        const N = M[g],
          V = Array.isArray(N.value) ? N.value : [N.value];
        for (let W = 0, k = V.length; W < k; W++) {
          const q = V[W],
            J = S(q),
            H = y % R,
            nt = H % J.boundary,
            rt = H + nt;
          ((y += nt),
            rt !== 0 && R - rt < J.storage && (y += R - rt),
            (N.__data = new Float32Array(
              J.storage / Float32Array.BYTES_PER_ELEMENT,
            )),
            (N.__offset = y),
            (y += J.storage));
        }
      }
    }
    const T = y % R;
    return (T > 0 && (y += R - T), (E.__size = y), (E.__cache = {}), this);
  }
  function S(E) {
    const b = { boundary: 0, storage: 0 };
    return (
      typeof E == "number" || typeof E == "boolean"
        ? ((b.boundary = 4), (b.storage = 4))
        : E.isVector2
          ? ((b.boundary = 8), (b.storage = 8))
          : E.isVector3 || E.isColor
            ? ((b.boundary = 16), (b.storage = 12))
            : E.isVector4
              ? ((b.boundary = 16), (b.storage = 16))
              : E.isMatrix3
                ? ((b.boundary = 48), (b.storage = 48))
                : E.isMatrix4
                  ? ((b.boundary = 64), (b.storage = 64))
                  : E.isTexture
                    ? Ut(
                        "WebGLRenderer: Texture samplers can not be part of an uniforms group.",
                      )
                    : Ut("WebGLRenderer: Unsupported uniform value type.", E),
      b
    );
  }
  function m(E) {
    const b = E.target;
    b.removeEventListener("dispose", m);
    const y = a.indexOf(b.__bindingPointIndex);
    (a.splice(y, 1), i.deleteBuffer(s[b.id]), delete s[b.id], delete r[b.id]);
  }
  function d() {
    for (const E in s) i.deleteBuffer(s[E]);
    ((a = []), (s = {}), (r = {}));
  }
  return { bind: l, update: c, dispose: d };
}
const Qp = new Uint16Array([
  11481, 15204, 11534, 15171, 11808, 15015, 12385, 14843, 12894, 14716, 13396,
  14600, 13693, 14483, 13976, 14366, 14237, 14171, 14405, 13961, 14511, 13770,
  14605, 13598, 14687, 13444, 14760, 13305, 14822, 13066, 14876, 12857, 14923,
  12675, 14963, 12517, 14997, 12379, 15025, 12230, 15049, 12023, 15070, 11843,
  15086, 11687, 15100, 11551, 15111, 11433, 15120, 11330, 15127, 11217, 15132,
  11060, 15135, 10922, 15138, 10801, 15139, 10695, 15139, 10600, 13012, 14923,
  13020, 14917, 13064, 14886, 13176, 14800, 13349, 14666, 13513, 14526, 13724,
  14398, 13960, 14230, 14200, 14020, 14383, 13827, 14488, 13651, 14583, 13491,
  14667, 13348, 14740, 13132, 14803, 12908, 14856, 12713, 14901, 12542, 14938,
  12394, 14968, 12241, 14992, 12017, 15010, 11822, 15024, 11654, 15034, 11507,
  15041, 11380, 15044, 11269, 15044, 11081, 15042, 10913, 15037, 10764, 15031,
  10635, 15023, 10520, 15014, 10419, 15003, 10330, 13657, 14676, 13658, 14673,
  13670, 14660, 13698, 14622, 13750, 14547, 13834, 14442, 13956, 14317, 14112,
  14093, 14291, 13889, 14407, 13704, 14499, 13538, 14586, 13389, 14664, 13201,
  14733, 12966, 14792, 12758, 14842, 12577, 14882, 12418, 14915, 12272, 14940,
  12033, 14959, 11826, 14972, 11646, 14980, 11490, 14983, 11355, 14983, 11212,
  14979, 11008, 14971, 10830, 14961, 10675, 14950, 10540, 14936, 10420, 14923,
  10315, 14909, 10204, 14894, 10041, 14089, 14460, 14090, 14459, 14096, 14452,
  14112, 14431, 14141, 14388, 14186, 14305, 14252, 14130, 14341, 13941, 14399,
  13756, 14467, 13585, 14539, 13430, 14610, 13272, 14677, 13026, 14737, 12808,
  14790, 12617, 14833, 12449, 14869, 12303, 14896, 12065, 14916, 11845, 14929,
  11655, 14937, 11490, 14939, 11347, 14936, 11184, 14930, 10970, 14921, 10783,
  14912, 10621, 14900, 10480, 14885, 10356, 14867, 10247, 14848, 10062, 14827,
  9894, 14805, 9745, 14400, 14208, 14400, 14206, 14402, 14198, 14406, 14174,
  14415, 14122, 14427, 14035, 14444, 13913, 14469, 13767, 14504, 13613, 14548,
  13463, 14598, 13324, 14651, 13082, 14704, 12858, 14752, 12658, 14795, 12483,
  14831, 12330, 14860, 12106, 14881, 11875, 14895, 11675, 14903, 11501, 14905,
  11351, 14903, 11178, 14900, 10953, 14892, 10757, 14880, 10589, 14865, 10442,
  14847, 10313, 14827, 10162, 14805, 9965, 14782, 9792, 14757, 9642, 14731,
  9507, 14562, 13883, 14562, 13883, 14563, 13877, 14566, 13862, 14570, 13830,
  14576, 13773, 14584, 13689, 14595, 13582, 14613, 13461, 14637, 13336, 14668,
  13120, 14704, 12897, 14741, 12695, 14776, 12516, 14808, 12358, 14835, 12150,
  14856, 11910, 14870, 11701, 14878, 11519, 14882, 11361, 14884, 11187, 14880,
  10951, 14871, 10748, 14858, 10572, 14842, 10418, 14823, 10286, 14801, 10099,
  14777, 9897, 14751, 9722, 14725, 9567, 14696, 9430, 14666, 9309, 14702, 13604,
  14702, 13604, 14702, 13600, 14703, 13591, 14705, 13570, 14707, 13533, 14709,
  13477, 14712, 13400, 14718, 13305, 14727, 13106, 14743, 12907, 14762, 12716,
  14784, 12539, 14807, 12380, 14827, 12190, 14844, 11943, 14855, 11727, 14863,
  11539, 14870, 11376, 14871, 11204, 14868, 10960, 14858, 10748, 14845, 10565,
  14829, 10406, 14809, 10269, 14786, 10058, 14761, 9852, 14734, 9671, 14705,
  9512, 14674, 9374, 14641, 9253, 14608, 9076, 14821, 13366, 14821, 13365,
  14821, 13364, 14821, 13358, 14821, 13344, 14821, 13320, 14819, 13252, 14817,
  13145, 14815, 13011, 14814, 12858, 14817, 12698, 14823, 12539, 14832, 12389,
  14841, 12214, 14850, 11968, 14856, 11750, 14861, 11558, 14866, 11390, 14867,
  11226, 14862, 10972, 14853, 10754, 14840, 10565, 14823, 10401, 14803, 10259,
  14780, 10032, 14754, 9820, 14725, 9635, 14694, 9473, 14661, 9333, 14627, 9203,
  14593, 8988, 14557, 8798, 14923, 13014, 14922, 13014, 14922, 13012, 14922,
  13004, 14920, 12987, 14919, 12957, 14915, 12907, 14909, 12834, 14902, 12738,
  14894, 12623, 14888, 12498, 14883, 12370, 14880, 12203, 14878, 11970, 14875,
  11759, 14873, 11569, 14874, 11401, 14872, 11243, 14865, 10986, 14855, 10762,
  14842, 10568, 14825, 10401, 14804, 10255, 14781, 10017, 14754, 9799, 14725,
  9611, 14692, 9445, 14658, 9301, 14623, 9139, 14587, 8920, 14548, 8729, 14509,
  8562, 15008, 12672, 15008, 12672, 15008, 12671, 15007, 12667, 15005, 12656,
  15001, 12637, 14997, 12605, 14989, 12556, 14978, 12490, 14966, 12407, 14953,
  12313, 14940, 12136, 14927, 11934, 14914, 11742, 14903, 11563, 14896, 11401,
  14889, 11247, 14879, 10992, 14866, 10767, 14851, 10570, 14833, 10400, 14812,
  10252, 14789, 10007, 14761, 9784, 14731, 9592, 14698, 9424, 14663, 9279,
  14627, 9088, 14588, 8868, 14548, 8676, 14508, 8508, 14467, 8360, 15080, 12386,
  15080, 12386, 15079, 12385, 15078, 12383, 15076, 12378, 15072, 12367, 15066,
  12347, 15057, 12315, 15045, 12253, 15030, 12138, 15012, 11998, 14993, 11845,
  14972, 11685, 14951, 11530, 14935, 11383, 14920, 11228, 14904, 10981, 14887,
  10762, 14870, 10567, 14850, 10397, 14827, 10248, 14803, 9997, 14774, 9771,
  14743, 9578, 14710, 9407, 14674, 9259, 14637, 9048, 14596, 8826, 14555, 8632,
  14514, 8464, 14471, 8317, 14427, 8182, 15139, 12008, 15139, 12008, 15138,
  12008, 15137, 12007, 15135, 12003, 15130, 11990, 15124, 11969, 15115, 11929,
  15102, 11872, 15086, 11794, 15064, 11693, 15041, 11581, 15013, 11459, 14987,
  11336, 14966, 11170, 14944, 10944, 14921, 10738, 14898, 10552, 14875, 10387,
  14850, 10239, 14824, 9983, 14794, 9758, 14762, 9563, 14728, 9392, 14692, 9244,
  14653, 9014, 14611, 8791, 14569, 8597, 14526, 8427, 14481, 8281, 14436, 8110,
  14391, 7885, 15188, 11617, 15188, 11617, 15187, 11617, 15186, 11618, 15183,
  11617, 15179, 11612, 15173, 11601, 15163, 11581, 15150, 11546, 15133, 11495,
  15110, 11427, 15083, 11346, 15051, 11246, 15024, 11057, 14996, 10868, 14967,
  10687, 14938, 10517, 14911, 10362, 14882, 10206, 14853, 9956, 14821, 9737,
  14787, 9543, 14752, 9375, 14715, 9228, 14675, 8980, 14632, 8760, 14589, 8565,
  14544, 8395, 14498, 8248, 14451, 8049, 14404, 7824, 14357, 7630, 15228, 11298,
  15228, 11298, 15227, 11299, 15226, 11301, 15223, 11303, 15219, 11302, 15213,
  11299, 15204, 11290, 15191, 11271, 15174, 11217, 15150, 11129, 15119, 11015,
  15087, 10886, 15057, 10744, 15024, 10599, 14990, 10455, 14957, 10318, 14924,
  10143, 14891, 9911, 14856, 9701, 14820, 9516, 14782, 9352, 14744, 9200, 14703,
  8946, 14659, 8725, 14615, 8533, 14568, 8366, 14521, 8220, 14472, 7992, 14423,
  7770, 14374, 7578, 14315, 7408, 15260, 10819, 15260, 10819, 15259, 10822,
  15258, 10826, 15256, 10832, 15251, 10836, 15246, 10841, 15237, 10838, 15225,
  10821, 15207, 10788, 15183, 10734, 15151, 10660, 15120, 10571, 15087, 10469,
  15049, 10359, 15012, 10249, 14974, 10041, 14937, 9837, 14900, 9647, 14860,
  9475, 14820, 9320, 14779, 9147, 14736, 8902, 14691, 8688, 14646, 8499, 14598,
  8335, 14549, 8189, 14499, 7940, 14448, 7720, 14397, 7529, 14347, 7363, 14256,
  7218, 15285, 10410, 15285, 10411, 15285, 10413, 15284, 10418, 15282, 10425,
  15278, 10434, 15272, 10442, 15264, 10449, 15252, 10445, 15235, 10433, 15210,
  10403, 15179, 10358, 15149, 10301, 15113, 10218, 15073, 10059, 15033, 9894,
  14991, 9726, 14951, 9565, 14909, 9413, 14865, 9273, 14822, 9073, 14777, 8845,
  14730, 8641, 14682, 8459, 14633, 8300, 14583, 8129, 14531, 7883, 14479, 7670,
  14426, 7482, 14373, 7321, 14305, 7176, 14201, 6939, 15305, 9939, 15305, 9940,
  15305, 9945, 15304, 9955, 15302, 9967, 15298, 9989, 15293, 10010, 15286,
  10033, 15274, 10044, 15258, 10045, 15233, 10022, 15205, 9975, 15174, 9903,
  15136, 9808, 15095, 9697, 15053, 9578, 15009, 9451, 14965, 9327, 14918, 9198,
  14871, 8973, 14825, 8766, 14775, 8579, 14725, 8408, 14675, 8259, 14622, 8058,
  14569, 7821, 14515, 7615, 14460, 7435, 14405, 7276, 14350, 7108, 14256, 6866,
  14149, 6653, 15321, 9444, 15321, 9445, 15321, 9448, 15320, 9458, 15317, 9470,
  15314, 9490, 15310, 9515, 15302, 9540, 15292, 9562, 15276, 9579, 15251, 9577,
  15226, 9559, 15195, 9519, 15156, 9463, 15116, 9389, 15071, 9304, 15025, 9208,
  14978, 9023, 14927, 8838, 14878, 8661, 14827, 8496, 14774, 8344, 14722, 8206,
  14667, 7973, 14612, 7749, 14556, 7555, 14499, 7382, 14443, 7229, 14385, 7025,
  14322, 6791, 14210, 6588, 14100, 6409, 15333, 8920, 15333, 8921, 15332, 8927,
  15332, 8943, 15329, 8965, 15326, 9002, 15322, 9048, 15316, 9106, 15307, 9162,
  15291, 9204, 15267, 9221, 15244, 9221, 15212, 9196, 15175, 9134, 15133, 9043,
  15088, 8930, 15040, 8801, 14990, 8665, 14938, 8526, 14886, 8391, 14830, 8261,
  14775, 8087, 14719, 7866, 14661, 7664, 14603, 7482, 14544, 7322, 14485, 7178,
  14426, 6936, 14367, 6713, 14281, 6517, 14166, 6348, 14054, 6198, 15341, 8360,
  15341, 8361, 15341, 8366, 15341, 8379, 15339, 8399, 15336, 8431, 15332, 8473,
  15326, 8527, 15318, 8585, 15302, 8632, 15281, 8670, 15258, 8690, 15227, 8690,
  15191, 8664, 15149, 8612, 15104, 8543, 15055, 8456, 15001, 8360, 14948, 8259,
  14892, 8122, 14834, 7923, 14776, 7734, 14716, 7558, 14656, 7397, 14595, 7250,
  14534, 7070, 14472, 6835, 14410, 6628, 14350, 6443, 14243, 6283, 14125, 6135,
  14010, 5889, 15348, 7715, 15348, 7717, 15348, 7725, 15347, 7745, 15345, 7780,
  15343, 7836, 15339, 7905, 15334, 8e3, 15326, 8103, 15310, 8193, 15293, 8239,
  15270, 8270, 15240, 8287, 15204, 8283, 15163, 8260, 15118, 8223, 15067, 8143,
  15014, 8014, 14958, 7873, 14899, 7723, 14839, 7573, 14778, 7430, 14715, 7293,
  14652, 7164, 14588, 6931, 14524, 6720, 14460, 6531, 14396, 6362, 14330, 6210,
  14207, 6015, 14086, 5781, 13969, 5576, 15352, 7114, 15352, 7116, 15352, 7128,
  15352, 7159, 15350, 7195, 15348, 7237, 15345, 7299, 15340, 7374, 15332, 7457,
  15317, 7544, 15301, 7633, 15280, 7703, 15251, 7754, 15216, 7775, 15176, 7767,
  15131, 7733, 15079, 7670, 15026, 7588, 14967, 7492, 14906, 7387, 14844, 7278,
  14779, 7171, 14714, 6965, 14648, 6770, 14581, 6587, 14515, 6420, 14448, 6269,
  14382, 6123, 14299, 5881, 14172, 5665, 14049, 5477, 13929, 5310, 15355, 6329,
  15355, 6330, 15355, 6339, 15355, 6362, 15353, 6410, 15351, 6472, 15349, 6572,
  15344, 6688, 15337, 6835, 15323, 6985, 15309, 7142, 15287, 7220, 15260, 7277,
  15226, 7310, 15188, 7326, 15142, 7318, 15090, 7285, 15036, 7239, 14976, 7177,
  14914, 7045, 14849, 6892, 14782, 6736, 14714, 6581, 14645, 6433, 14576, 6293,
  14506, 6164, 14438, 5946, 14369, 5733, 14270, 5540, 14140, 5369, 14014, 5216,
  13892, 5043, 15357, 5483, 15357, 5484, 15357, 5496, 15357, 5528, 15356, 5597,
  15354, 5692, 15351, 5835, 15347, 6011, 15339, 6195, 15328, 6317, 15314, 6446,
  15293, 6566, 15268, 6668, 15235, 6746, 15197, 6796, 15152, 6811, 15101, 6790,
  15046, 6748, 14985, 6673, 14921, 6583, 14854, 6479, 14785, 6371, 14714, 6259,
  14643, 6149, 14571, 5946, 14499, 5750, 14428, 5567, 14358, 5401, 14242, 5250,
  14109, 5111, 13980, 4870, 13856, 4657, 15359, 4555, 15359, 4557, 15358, 4573,
  15358, 4633, 15357, 4715, 15355, 4841, 15353, 5061, 15349, 5216, 15342, 5391,
  15331, 5577, 15318, 5770, 15299, 5967, 15274, 6150, 15243, 6223, 15206, 6280,
  15161, 6310, 15111, 6317, 15055, 6300, 14994, 6262, 14928, 6208, 14860, 6141,
  14788, 5994, 14715, 5838, 14641, 5684, 14566, 5529, 14492, 5384, 14418, 5247,
  14346, 5121, 14216, 4892, 14079, 4682, 13948, 4496, 13822, 4330, 15359, 3498,
  15359, 3501, 15359, 3520, 15359, 3598, 15358, 3719, 15356, 3860, 15355, 4137,
  15351, 4305, 15344, 4563, 15334, 4809, 15321, 5116, 15303, 5273, 15280, 5418,
  15250, 5547, 15214, 5653, 15170, 5722, 15120, 5761, 15064, 5763, 15002, 5733,
  14935, 5673, 14865, 5597, 14792, 5504, 14716, 5400, 14640, 5294, 14563, 5185,
  14486, 5041, 14410, 4841, 14335, 4655, 14191, 4482, 14051, 4325, 13918, 4183,
  13790, 4012, 15360, 2282, 15360, 2285, 15360, 2306, 15360, 2401, 15359, 2547,
  15357, 2748, 15355, 3103, 15352, 3349, 15345, 3675, 15336, 4020, 15324, 4272,
  15307, 4496, 15285, 4716, 15255, 4908, 15220, 5086, 15178, 5170, 15128, 5214,
  15072, 5234, 15010, 5231, 14943, 5206, 14871, 5166, 14796, 5102, 14718, 4971,
  14639, 4833, 14559, 4687, 14480, 4541, 14402, 4401, 14315, 4268, 14167, 4142,
  14025, 3958, 13888, 3747, 13759, 3556, 15360, 923, 15360, 925, 15360, 946,
  15360, 1052, 15359, 1214, 15357, 1494, 15356, 1892, 15352, 2274, 15346, 2663,
  15338, 3099, 15326, 3393, 15309, 3679, 15288, 3980, 15260, 4183, 15226, 4325,
  15185, 4437, 15136, 4517, 15080, 4570, 15018, 4591, 14950, 4581, 14877, 4545,
  14800, 4485, 14720, 4411, 14638, 4325, 14556, 4231, 14475, 4136, 14395, 3988,
  14297, 3803, 14145, 3628, 13999, 3465, 13861, 3314, 13729, 3177, 15360, 263,
  15360, 264, 15360, 272, 15360, 325, 15359, 407, 15358, 548, 15356, 780, 15352,
  1144, 15347, 1580, 15339, 2099, 15328, 2425, 15312, 2795, 15292, 3133, 15264,
  3329, 15232, 3517, 15191, 3689, 15143, 3819, 15088, 3923, 15025, 3978, 14956,
  3999, 14882, 3979, 14804, 3931, 14722, 3855, 14639, 3756, 14554, 3645, 14470,
  3529, 14388, 3409, 14279, 3289, 14124, 3173, 13975, 3055, 13834, 2848, 13701,
  2658, 15360, 49, 15360, 49, 15360, 52, 15360, 75, 15359, 111, 15358, 201,
  15356, 283, 15353, 519, 15348, 726, 15340, 1045, 15329, 1415, 15314, 1795,
  15295, 2173, 15269, 2410, 15237, 2649, 15197, 2866, 15150, 3054, 15095, 3140,
  15032, 3196, 14963, 3228, 14888, 3236, 14808, 3224, 14725, 3191, 14639, 3146,
  14553, 3088, 14466, 2976, 14382, 2836, 14262, 2692, 14103, 2549, 13952, 2409,
  13808, 2278, 13674, 2154, 15360, 4, 15360, 4, 15360, 4, 15360, 13, 15359, 33,
  15358, 59, 15357, 112, 15353, 199, 15348, 302, 15341, 456, 15331, 628, 15316,
  827, 15297, 1082, 15272, 1332, 15241, 1601, 15202, 1851, 15156, 2069, 15101,
  2172, 15039, 2256, 14970, 2314, 14894, 2348, 14813, 2358, 14728, 2344, 14640,
  2311, 14551, 2263, 14463, 2203, 14376, 2133, 14247, 2059, 14084, 1915, 13930,
  1761, 13784, 1609, 13648, 1464, 15360, 0, 15360, 0, 15360, 0, 15360, 3, 15359,
  18, 15358, 26, 15357, 53, 15354, 80, 15348, 97, 15341, 165, 15332, 238, 15318,
  326, 15299, 427, 15275, 529, 15245, 654, 15207, 771, 15161, 885, 15108, 994,
  15046, 1089, 14976, 1170, 14900, 1229, 14817, 1266, 14731, 1284, 14641, 1282,
  14550, 1260, 14460, 1223, 14370, 1174, 14232, 1116, 14066, 1050, 13909, 981,
  13761, 910, 13623, 839,
]);
let un = null;
function t0() {
  return (
    un === null &&
      ((un = new nh(Qp, 32, 32, Qr, _i)),
      (un.minFilter = He),
      (un.magFilter = He),
      (un.wrapS = fn),
      (un.wrapT = fn),
      (un.generateMipmaps = !1),
      (un.needsUpdate = !0)),
    un
  );
}
class e0 {
  constructor(t = {}) {
    const {
      canvas: e = wl(),
      context: n = null,
      depth: s = !0,
      stencil: r = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: u = "default",
      failIfMajorPerformanceCaveat: h = !1,
      reversedDepthBuffer: f = !1,
    } = t;
    this.isWebGLRenderer = !0;
    let p;
    if (n !== null) {
      if (
        typeof WebGLRenderingContext < "u" &&
        n instanceof WebGLRenderingContext
      )
        throw new Error(
          "THREE.WebGLRenderer: WebGL 1 is not supported since r163.",
        );
      p = n.getContextAttributes().alpha;
    } else p = a;
    const _ = new Set([ea, ta, Jr]),
      S = new Set([sn, kn, Li, Ui, $r, Zr]),
      m = new Uint32Array(4),
      d = new Int32Array(4);
    let E = null,
      b = null;
    const y = [],
      R = [];
    ((this.domElement = e),
      (this.debug = { checkShaderErrors: !0, onShaderError: null }),
      (this.autoClear = !0),
      (this.autoClearColor = !0),
      (this.autoClearDepth = !0),
      (this.autoClearStencil = !0),
      (this.sortObjects = !0),
      (this.clippingPlanes = []),
      (this.localClippingEnabled = !1),
      (this.toneMapping = Rn),
      (this.toneMappingExposure = 1),
      (this.transmissionResolutionScale = 1));
    const T = this;
    let w = !1;
    this._outputColorSpace = Be;
    let L = 0,
      M = 0,
      g = null,
      D = -1,
      N = null;
    const V = new le(),
      W = new le();
    let k = null;
    const q = new Yt(0);
    let J = 0,
      H = e.width,
      nt = e.height,
      rt = 1,
      bt = null,
      kt = null;
    const qt = new le(0, 0, H, nt),
      Qt = new le(0, 0, H, nt);
    let te = !1;
    const Y = new ra();
    let $ = !1,
      ft = !1;
    const It = new ue(),
      vt = new F(),
      zt = new le(),
      ge = {
        background: null,
        fog: null,
        environment: null,
        overrideMaterial: null,
        isScene: !0,
      };
    let Ot = !1;
    function ie() {
      return g === null ? rt : 1;
    }
    let C = n;
    function Vt(v, U) {
      return e.getContext(v, U);
    }
    try {
      const v = {
        alpha: !0,
        depth: s,
        stencil: r,
        antialias: o,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: u,
        failIfMajorPerformanceCaveat: h,
      };
      if (
        ("setAttribute" in e &&
          e.setAttribute("data-engine", `three.js r${jr}`),
        e.addEventListener("webglcontextlost", Q, !1),
        e.addEventListener("webglcontextrestored", j, !1),
        e.addEventListener("webglcontextcreationerror", pt, !1),
        C === null)
      ) {
        const U = "webgl2";
        if (((C = Vt(U, v)), C === null))
          throw Vt(U)
            ? new Error(
                "Error creating WebGL context with your selected attributes.",
              )
            : new Error("Error creating WebGL context.");
      }
    } catch (v) {
      throw (v("WebGLRenderer: " + v.message), v);
    }
    let Gt,
      ee,
      xt,
      se,
      St,
      Lt,
      A,
      x,
      O,
      X,
      K,
      G,
      gt,
      ot,
      Et,
      _t,
      Z,
      et,
      wt,
      Tt,
      ut,
      Ct,
      P,
      ct;
    function it() {
      ((Gt = new lf(C)),
        Gt.init(),
        (Ct = new Xp(C, Gt)),
        (ee = new Qd(C, Gt, t, Ct)),
        (xt = new kp(C, Gt)),
        ee.reversedDepthBuffer && f && xt.buffers.depth.setReversed(!0),
        (se = new df(C)),
        (St = new Pp()),
        (Lt = new Wp(C, Gt, xt, St, ee, Ct, se)),
        (A = new ef(T)),
        (x = new cf(T)),
        (O = new mh(C)),
        (P = new Zd(C, O)),
        (X = new hf(C, O, se, P)),
        (K = new pf(C, X, O, se)),
        (wt = new ff(C, ee, Lt)),
        (_t = new tf(St)),
        (G = new Cp(T, A, x, Gt, ee, P, _t)),
        (gt = new Zp(T, St)),
        (ot = new Lp()),
        (Et = new Bp(Gt)),
        (et = new $d(T, A, x, xt, K, p, l)),
        (Z = new Gp(T, K, ee)),
        (ct = new Jp(C, se, ee, xt)),
        (Tt = new Jd(C, Gt, se)),
        (ut = new uf(C, Gt, se)),
        (se.programs = G.programs),
        (T.capabilities = ee),
        (T.extensions = Gt),
        (T.properties = St),
        (T.renderLists = ot),
        (T.shadowMap = Z),
        (T.state = xt),
        (T.info = se));
    }
    it();
    const st = new Kp(T, C);
    ((this.xr = st),
      (this.getContext = function () {
        return C;
      }),
      (this.getContextAttributes = function () {
        return C.getContextAttributes();
      }),
      (this.forceContextLoss = function () {
        const v = Gt.get("WEBGL_lose_context");
        v && v.loseContext();
      }),
      (this.forceContextRestore = function () {
        const v = Gt.get("WEBGL_lose_context");
        v && v.restoreContext();
      }),
      (this.getPixelRatio = function () {
        return rt;
      }),
      (this.setPixelRatio = function (v) {
        v !== void 0 && ((rt = v), this.setSize(H, nt, !1));
      }),
      (this.getSize = function (v) {
        return v.set(H, nt);
      }),
      (this.setSize = function (v, U, B = !0) {
        if (st.isPresenting) {
          Ut("WebGLRenderer: Can't change size while VR device is presenting.");
          return;
        }
        ((H = v),
          (nt = U),
          (e.width = Math.floor(v * rt)),
          (e.height = Math.floor(U * rt)),
          B === !0 && ((e.style.width = v + "px"), (e.style.height = U + "px")),
          this.setViewport(0, 0, v, U));
      }),
      (this.getDrawingBufferSize = function (v) {
        return v.set(H * rt, nt * rt).floor();
      }),
      (this.setDrawingBufferSize = function (v, U, B) {
        ((H = v),
          (nt = U),
          (rt = B),
          (e.width = Math.floor(v * B)),
          (e.height = Math.floor(U * B)),
          this.setViewport(0, 0, v, U));
      }),
      (this.getCurrentViewport = function (v) {
        return v.copy(V);
      }),
      (this.getViewport = function (v) {
        return v.copy(qt);
      }),
      (this.setViewport = function (v, U, B, z) {
        (v.isVector4 ? qt.set(v.x, v.y, v.z, v.w) : qt.set(v, U, B, z),
          xt.viewport(V.copy(qt).multiplyScalar(rt).round()));
      }),
      (this.getScissor = function (v) {
        return v.copy(Qt);
      }),
      (this.setScissor = function (v, U, B, z) {
        (v.isVector4 ? Qt.set(v.x, v.y, v.z, v.w) : Qt.set(v, U, B, z),
          xt.scissor(W.copy(Qt).multiplyScalar(rt).round()));
      }),
      (this.getScissorTest = function () {
        return te;
      }),
      (this.setScissorTest = function (v) {
        xt.setScissorTest((te = v));
      }),
      (this.setOpaqueSort = function (v) {
        bt = v;
      }),
      (this.setTransparentSort = function (v) {
        kt = v;
      }),
      (this.getClearColor = function (v) {
        return v.copy(et.getClearColor());
      }),
      (this.setClearColor = function () {
        et.setClearColor(...arguments);
      }),
      (this.getClearAlpha = function () {
        return et.getClearAlpha();
      }),
      (this.setClearAlpha = function () {
        et.setClearAlpha(...arguments);
      }),
      (this.clear = function (v = !0, U = !0, B = !0) {
        let z = 0;
        if (v) {
          let I = !1;
          if (g !== null) {
            const tt = g.texture.format;
            I = _.has(tt);
          }
          if (I) {
            const tt = g.texture.type,
              ht = S.has(tt),
              mt = et.getClearColor(),
              dt = et.getClearAlpha(),
              At = mt.r,
              Rt = mt.g,
              Mt = mt.b;
            ht
              ? ((m[0] = At),
                (m[1] = Rt),
                (m[2] = Mt),
                (m[3] = dt),
                C.clearBufferuiv(C.COLOR, 0, m))
              : ((d[0] = At),
                (d[1] = Rt),
                (d[2] = Mt),
                (d[3] = dt),
                C.clearBufferiv(C.COLOR, 0, d));
          } else z |= C.COLOR_BUFFER_BIT;
        }
        (U && (z |= C.DEPTH_BUFFER_BIT),
          B &&
            ((z |= C.STENCIL_BUFFER_BIT),
            this.state.buffers.stencil.setMask(4294967295)),
          C.clear(z));
      }),
      (this.clearColor = function () {
        this.clear(!0, !1, !1);
      }),
      (this.clearDepth = function () {
        this.clear(!1, !0, !1);
      }),
      (this.clearStencil = function () {
        this.clear(!1, !1, !0);
      }),
      (this.dispose = function () {
        (e.removeEventListener("webglcontextlost", Q, !1),
          e.removeEventListener("webglcontextrestored", j, !1),
          e.removeEventListener("webglcontextcreationerror", pt, !1),
          et.dispose(),
          ot.dispose(),
          Et.dispose(),
          St.dispose(),
          A.dispose(),
          x.dispose(),
          K.dispose(),
          P.dispose(),
          ct.dispose(),
          G.dispose(),
          st.dispose(),
          st.removeEventListener("sessionstart", da),
          st.removeEventListener("sessionend", fa),
          Dn.stop());
      }));
    function Q(v) {
      (v.preventDefault(), Ca("WebGLRenderer: Context Lost."), (w = !0));
    }
    function j() {
      (Ca("WebGLRenderer: Context Restored."), (w = !1));
      const v = se.autoReset,
        U = Z.enabled,
        B = Z.autoUpdate,
        z = Z.needsUpdate,
        I = Z.type;
      (it(),
        (se.autoReset = v),
        (Z.enabled = U),
        (Z.autoUpdate = B),
        (Z.needsUpdate = z),
        (Z.type = I));
    }
    function pt(v) {
      he(
        "WebGLRenderer: A WebGL context could not be created. Reason: ",
        v.statusMessage,
      );
    }
    function Dt(v) {
      const U = v.target;
      (U.removeEventListener("dispose", Dt), ne(U));
    }
    function ne(v) {
      (jt(v), St.remove(v));
    }
    function jt(v) {
      const U = St.get(v).programs;
      U !== void 0 &&
        (U.forEach(function (B) {
          G.releaseProgram(B);
        }),
        v.isShaderMaterial && G.releaseShaderCache(v));
    }
    this.renderBufferDirect = function (v, U, B, z, I, tt) {
      U === null && (U = ge);
      const ht = I.isMesh && I.matrixWorld.determinant() < 0,
        mt = lc(v, U, B, z, I);
      xt.setMaterial(z, ht);
      let dt = B.index,
        At = 1;
      if (z.wireframe === !0) {
        if (((dt = X.getWireframeAttribute(B)), dt === void 0)) return;
        At = 2;
      }
      const Rt = B.drawRange,
        Mt = B.attributes.position;
      let Ht = Rt.start * At,
        Kt = (Rt.start + Rt.count) * At;
      (tt !== null &&
        ((Ht = Math.max(Ht, tt.start * At)),
        (Kt = Math.min(Kt, (tt.start + tt.count) * At))),
        dt !== null
          ? ((Ht = Math.max(Ht, 0)), (Kt = Math.min(Kt, dt.count)))
          : Mt != null &&
            ((Ht = Math.max(Ht, 0)), (Kt = Math.min(Kt, Mt.count))));
      const oe = Kt - Ht;
      if (oe < 0 || oe === 1 / 0) return;
      P.setup(I, z, mt, B, dt);
      let ce,
        Jt = Tt;
      if (
        (dt !== null && ((ce = O.get(dt)), (Jt = ut), Jt.setIndex(ce)),
        I.isMesh)
      )
        z.wireframe === !0
          ? (xt.setLineWidth(z.wireframeLinewidth * ie()), Jt.setMode(C.LINES))
          : Jt.setMode(C.TRIANGLES);
      else if (I.isLine) {
        let yt = z.linewidth;
        (yt === void 0 && (yt = 1),
          xt.setLineWidth(yt * ie()),
          I.isLineSegments
            ? Jt.setMode(C.LINES)
            : I.isLineLoop
              ? Jt.setMode(C.LINE_LOOP)
              : Jt.setMode(C.LINE_STRIP));
      } else
        I.isPoints
          ? Jt.setMode(C.POINTS)
          : I.isSprite && Jt.setMode(C.TRIANGLES);
      if (I.isBatchedMesh)
        if (I._multiDrawInstances !== null)
          (Fi(
            "WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.",
          ),
            Jt.renderMultiDrawInstances(
              I._multiDrawStarts,
              I._multiDrawCounts,
              I._multiDrawCount,
              I._multiDrawInstances,
            ));
        else if (Gt.get("WEBGL_multi_draw"))
          Jt.renderMultiDraw(
            I._multiDrawStarts,
            I._multiDrawCounts,
            I._multiDrawCount,
          );
        else {
          const yt = I._multiDrawStarts,
            re = I._multiDrawCounts,
            Wt = I._multiDrawCount,
            Ue = dt ? O.get(dt).bytesPerElement : 1,
            qn = St.get(z).currentProgram.getUniforms();
          for (let Ie = 0; Ie < Wt; Ie++)
            (qn.setValue(C, "_gl_DrawID", Ie), Jt.render(yt[Ie] / Ue, re[Ie]));
        }
      else if (I.isInstancedMesh) Jt.renderInstances(Ht, oe, I.count);
      else if (B.isInstancedBufferGeometry) {
        const yt = B._maxInstanceCount !== void 0 ? B._maxInstanceCount : 1 / 0,
          re = Math.min(B.instanceCount, yt);
        Jt.renderInstances(Ht, oe, re);
      } else Jt.render(Ht, oe);
    };
    function Ze(v, U, B) {
      v.transparent === !0 && v.side === tn && v.forceSinglePass === !1
        ? ((v.side = Le),
          (v.needsUpdate = !0),
          Vi(v, U, B),
          (v.side = Pn),
          (v.needsUpdate = !0),
          Vi(v, U, B),
          (v.side = tn))
        : Vi(v, U, B);
    }
    ((this.compile = function (v, U, B = null) {
      (B === null && (B = v),
        (b = Et.get(B)),
        b.init(U),
        R.push(b),
        B.traverseVisible(function (I) {
          I.isLight &&
            I.layers.test(U.layers) &&
            (b.pushLight(I), I.castShadow && b.pushShadow(I));
        }),
        v !== B &&
          v.traverseVisible(function (I) {
            I.isLight &&
              I.layers.test(U.layers) &&
              (b.pushLight(I), I.castShadow && b.pushShadow(I));
          }),
        b.setupLights());
      const z = new Set();
      return (
        v.traverse(function (I) {
          if (!(I.isMesh || I.isPoints || I.isLine || I.isSprite)) return;
          const tt = I.material;
          if (tt)
            if (Array.isArray(tt))
              for (let ht = 0; ht < tt.length; ht++) {
                const mt = tt[ht];
                (Ze(mt, B, I), z.add(mt));
              }
            else (Ze(tt, B, I), z.add(tt));
        }),
        (b = R.pop()),
        z
      );
    }),
      (this.compileAsync = function (v, U, B = null) {
        const z = this.compile(v, U, B);
        return new Promise((I) => {
          function tt() {
            if (
              (z.forEach(function (ht) {
                St.get(ht).currentProgram.isReady() && z.delete(ht);
              }),
              z.size === 0)
            ) {
              I(v);
              return;
            }
            setTimeout(tt, 10);
          }
          Gt.get("KHR_parallel_shader_compile") !== null
            ? tt()
            : setTimeout(tt, 10);
        });
      }));
    let We = null;
    function cc(v) {
      We && We(v);
    }
    function da() {
      Dn.stop();
    }
    function fa() {
      Dn.start();
    }
    const Dn = new Qo();
    (Dn.setAnimationLoop(cc),
      typeof self < "u" && Dn.setContext(self),
      (this.setAnimationLoop = function (v) {
        ((We = v), st.setAnimationLoop(v), v === null ? Dn.stop() : Dn.start());
      }),
      st.addEventListener("sessionstart", da),
      st.addEventListener("sessionend", fa),
      (this.render = function (v, U) {
        if (U !== void 0 && U.isCamera !== !0) {
          he(
            "WebGLRenderer.render: camera is not an instance of THREE.Camera.",
          );
          return;
        }
        if (w === !0) return;
        if (
          (v.matrixWorldAutoUpdate === !0 && v.updateMatrixWorld(),
          U.parent === null &&
            U.matrixWorldAutoUpdate === !0 &&
            U.updateMatrixWorld(),
          st.enabled === !0 &&
            st.isPresenting === !0 &&
            (st.cameraAutoUpdate === !0 && st.updateCamera(U),
            (U = st.getCamera())),
          v.isScene === !0 && v.onBeforeRender(T, v, U, g),
          (b = Et.get(v, R.length)),
          b.init(U),
          R.push(b),
          It.multiplyMatrices(U.projectionMatrix, U.matrixWorldInverse),
          Y.setFromProjectionMatrix(It, en, U.reversedDepth),
          (ft = this.localClippingEnabled),
          ($ = _t.init(this.clippingPlanes, ft)),
          (E = ot.get(v, y.length)),
          E.init(),
          y.push(E),
          st.enabled === !0 && st.isPresenting === !0)
        ) {
          const tt = T.xr.getDepthSensingMesh();
          tt !== null && Ms(tt, U, -1 / 0, T.sortObjects);
        }
        (Ms(v, U, 0, T.sortObjects),
          E.finish(),
          T.sortObjects === !0 && E.sort(bt, kt),
          (Ot =
            st.enabled === !1 ||
            st.isPresenting === !1 ||
            st.hasDepthSensing() === !1),
          Ot && et.addToRenderList(E, v),
          this.info.render.frame++,
          $ === !0 && _t.beginShadows());
        const B = b.state.shadowsArray;
        (Z.render(B, v, U),
          $ === !0 && _t.endShadows(),
          this.info.autoReset === !0 && this.info.reset());
        const z = E.opaque,
          I = E.transmissive;
        if ((b.setupLights(), U.isArrayCamera)) {
          const tt = U.cameras;
          if (I.length > 0)
            for (let ht = 0, mt = tt.length; ht < mt; ht++) {
              const dt = tt[ht];
              ma(z, I, v, dt);
            }
          Ot && et.render(v);
          for (let ht = 0, mt = tt.length; ht < mt; ht++) {
            const dt = tt[ht];
            pa(E, v, dt, dt.viewport);
          }
        } else
          (I.length > 0 && ma(z, I, v, U), Ot && et.render(v), pa(E, v, U));
        (g !== null &&
          M === 0 &&
          (Lt.updateMultisampleRenderTarget(g), Lt.updateRenderTargetMipmap(g)),
          v.isScene === !0 && v.onAfterRender(T, v, U),
          P.resetDefaultState(),
          (D = -1),
          (N = null),
          R.pop(),
          R.length > 0
            ? ((b = R[R.length - 1]),
              $ === !0 && _t.setGlobalState(T.clippingPlanes, b.state.camera))
            : (b = null),
          y.pop(),
          y.length > 0 ? (E = y[y.length - 1]) : (E = null));
      }));
    function Ms(v, U, B, z) {
      if (v.visible === !1) return;
      if (v.layers.test(U.layers)) {
        if (v.isGroup) B = v.renderOrder;
        else if (v.isLOD) v.autoUpdate === !0 && v.update(U);
        else if (v.isLight) (b.pushLight(v), v.castShadow && b.pushShadow(v));
        else if (v.isSprite) {
          if (!v.frustumCulled || Y.intersectsSprite(v)) {
            z && zt.setFromMatrixPosition(v.matrixWorld).applyMatrix4(It);
            const ht = K.update(v),
              mt = v.material;
            mt.visible && E.push(v, ht, mt, B, zt.z, null);
          }
        } else if (
          (v.isMesh || v.isLine || v.isPoints) &&
          (!v.frustumCulled || Y.intersectsObject(v))
        ) {
          const ht = K.update(v),
            mt = v.material;
          if (
            (z &&
              (v.boundingSphere !== void 0
                ? (v.boundingSphere === null && v.computeBoundingSphere(),
                  zt.copy(v.boundingSphere.center))
                : (ht.boundingSphere === null && ht.computeBoundingSphere(),
                  zt.copy(ht.boundingSphere.center)),
              zt.applyMatrix4(v.matrixWorld).applyMatrix4(It)),
            Array.isArray(mt))
          ) {
            const dt = ht.groups;
            for (let At = 0, Rt = dt.length; At < Rt; At++) {
              const Mt = dt[At],
                Ht = mt[Mt.materialIndex];
              Ht && Ht.visible && E.push(v, ht, Ht, B, zt.z, Mt);
            }
          } else mt.visible && E.push(v, ht, mt, B, zt.z, null);
        }
      }
      const tt = v.children;
      for (let ht = 0, mt = tt.length; ht < mt; ht++) Ms(tt[ht], U, B, z);
    }
    function pa(v, U, B, z) {
      const { opaque: I, transmissive: tt, transparent: ht } = v;
      (b.setupLightsView(B),
        $ === !0 && _t.setGlobalState(T.clippingPlanes, B),
        z && xt.viewport(V.copy(z)),
        I.length > 0 && zi(I, U, B),
        tt.length > 0 && zi(tt, U, B),
        ht.length > 0 && zi(ht, U, B),
        xt.buffers.depth.setTest(!0),
        xt.buffers.depth.setMask(!0),
        xt.buffers.color.setMask(!0),
        xt.setPolygonOffset(!1));
    }
    function ma(v, U, B, z) {
      if ((B.isScene === !0 ? B.overrideMaterial : null) !== null) return;
      b.state.transmissionRenderTarget[z.id] === void 0 &&
        (b.state.transmissionRenderTarget[z.id] = new Xn(1, 1, {
          generateMipmaps: !0,
          type:
            Gt.has("EXT_color_buffer_half_float") ||
            Gt.has("EXT_color_buffer_float")
              ? _i
              : sn,
          minFilter: Hn,
          samples: 4,
          stencilBuffer: r,
          resolveDepthBuffer: !1,
          resolveStencilBuffer: !1,
          colorSpace: Xt.workingColorSpace,
        }));
      const tt = b.state.transmissionRenderTarget[z.id],
        ht = z.viewport || V;
      tt.setSize(
        ht.z * T.transmissionResolutionScale,
        ht.w * T.transmissionResolutionScale,
      );
      const mt = T.getRenderTarget(),
        dt = T.getActiveCubeFace(),
        At = T.getActiveMipmapLevel();
      (T.setRenderTarget(tt),
        T.getClearColor(q),
        (J = T.getClearAlpha()),
        J < 1 && T.setClearColor(16777215, 0.5),
        T.clear(),
        Ot && et.render(B));
      const Rt = T.toneMapping;
      T.toneMapping = Rn;
      const Mt = z.viewport;
      if (
        (z.viewport !== void 0 && (z.viewport = void 0),
        b.setupLightsView(z),
        $ === !0 && _t.setGlobalState(T.clippingPlanes, z),
        zi(v, B, z),
        Lt.updateMultisampleRenderTarget(tt),
        Lt.updateRenderTargetMipmap(tt),
        Gt.has("WEBGL_multisampled_render_to_texture") === !1)
      ) {
        let Ht = !1;
        for (let Kt = 0, oe = U.length; Kt < oe; Kt++) {
          const ce = U[Kt],
            { object: Jt, geometry: yt, material: re, group: Wt } = ce;
          if (re.side === tn && Jt.layers.test(z.layers)) {
            const Ue = re.side;
            ((re.side = Le),
              (re.needsUpdate = !0),
              xa(Jt, B, z, yt, re, Wt),
              (re.side = Ue),
              (re.needsUpdate = !0),
              (Ht = !0));
          }
        }
        Ht === !0 &&
          (Lt.updateMultisampleRenderTarget(tt),
          Lt.updateRenderTargetMipmap(tt));
      }
      (T.setRenderTarget(mt, dt, At),
        T.setClearColor(q, J),
        Mt !== void 0 && (z.viewport = Mt),
        (T.toneMapping = Rt));
    }
    function zi(v, U, B) {
      const z = U.isScene === !0 ? U.overrideMaterial : null;
      for (let I = 0, tt = v.length; I < tt; I++) {
        const ht = v[I],
          { object: mt, geometry: dt, group: At } = ht;
        let Rt = ht.material;
        (Rt.allowOverride === !0 && z !== null && (Rt = z),
          mt.layers.test(B.layers) && xa(mt, U, B, dt, Rt, At));
      }
    }
    function xa(v, U, B, z, I, tt) {
      (v.onBeforeRender(T, U, B, z, I, tt),
        v.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse, v.matrixWorld),
        v.normalMatrix.getNormalMatrix(v.modelViewMatrix),
        I.onBeforeRender(T, U, B, z, v, tt),
        I.transparent === !0 && I.side === tn && I.forceSinglePass === !1
          ? ((I.side = Le),
            (I.needsUpdate = !0),
            T.renderBufferDirect(B, U, z, I, v, tt),
            (I.side = Pn),
            (I.needsUpdate = !0),
            T.renderBufferDirect(B, U, z, I, v, tt),
            (I.side = tn))
          : T.renderBufferDirect(B, U, z, I, v, tt),
        v.onAfterRender(T, U, B, z, I, tt));
    }
    function Vi(v, U, B) {
      U.isScene !== !0 && (U = ge);
      const z = St.get(v),
        I = b.state.lights,
        tt = b.state.shadowsArray,
        ht = I.state.version,
        mt = G.getParameters(v, I.state, tt, U, B),
        dt = G.getProgramCacheKey(mt);
      let At = z.programs;
      ((z.environment = v.isMeshStandardMaterial ? U.environment : null),
        (z.fog = U.fog),
        (z.envMap = (v.isMeshStandardMaterial ? x : A).get(
          v.envMap || z.environment,
        )),
        (z.envMapRotation =
          z.environment !== null && v.envMap === null
            ? U.environmentRotation
            : v.envMapRotation),
        At === void 0 &&
          (v.addEventListener("dispose", Dt),
          (At = new Map()),
          (z.programs = At)));
      let Rt = At.get(dt);
      if (Rt !== void 0) {
        if (z.currentProgram === Rt && z.lightsStateVersion === ht)
          return (ga(v, mt), Rt);
      } else
        ((mt.uniforms = G.getUniforms(v)),
          v.onBeforeCompile(mt, T),
          (Rt = G.acquireProgram(mt, dt)),
          At.set(dt, Rt),
          (z.uniforms = mt.uniforms));
      const Mt = z.uniforms;
      return (
        ((!v.isShaderMaterial && !v.isRawShaderMaterial) ||
          v.clipping === !0) &&
          (Mt.clippingPlanes = _t.uniform),
        ga(v, mt),
        (z.needsLights = uc(v)),
        (z.lightsStateVersion = ht),
        z.needsLights &&
          ((Mt.ambientLightColor.value = I.state.ambient),
          (Mt.lightProbe.value = I.state.probe),
          (Mt.directionalLights.value = I.state.directional),
          (Mt.directionalLightShadows.value = I.state.directionalShadow),
          (Mt.spotLights.value = I.state.spot),
          (Mt.spotLightShadows.value = I.state.spotShadow),
          (Mt.rectAreaLights.value = I.state.rectArea),
          (Mt.ltc_1.value = I.state.rectAreaLTC1),
          (Mt.ltc_2.value = I.state.rectAreaLTC2),
          (Mt.pointLights.value = I.state.point),
          (Mt.pointLightShadows.value = I.state.pointShadow),
          (Mt.hemisphereLights.value = I.state.hemi),
          (Mt.directionalShadowMap.value = I.state.directionalShadowMap),
          (Mt.directionalShadowMatrix.value = I.state.directionalShadowMatrix),
          (Mt.spotShadowMap.value = I.state.spotShadowMap),
          (Mt.spotLightMatrix.value = I.state.spotLightMatrix),
          (Mt.spotLightMap.value = I.state.spotLightMap),
          (Mt.pointShadowMap.value = I.state.pointShadowMap),
          (Mt.pointShadowMatrix.value = I.state.pointShadowMatrix)),
        (z.currentProgram = Rt),
        (z.uniformsList = null),
        Rt
      );
    }
    function _a(v) {
      if (v.uniformsList === null) {
        const U = v.currentProgram.getUniforms();
        v.uniformsList = fs.seqWithValue(U.seq, v.uniforms);
      }
      return v.uniformsList;
    }
    function ga(v, U) {
      const B = St.get(v);
      ((B.outputColorSpace = U.outputColorSpace),
        (B.batching = U.batching),
        (B.batchingColor = U.batchingColor),
        (B.instancing = U.instancing),
        (B.instancingColor = U.instancingColor),
        (B.instancingMorph = U.instancingMorph),
        (B.skinning = U.skinning),
        (B.morphTargets = U.morphTargets),
        (B.morphNormals = U.morphNormals),
        (B.morphColors = U.morphColors),
        (B.morphTargetsCount = U.morphTargetsCount),
        (B.numClippingPlanes = U.numClippingPlanes),
        (B.numIntersection = U.numClipIntersection),
        (B.vertexAlphas = U.vertexAlphas),
        (B.vertexTangents = U.vertexTangents),
        (B.toneMapping = U.toneMapping));
    }
    function lc(v, U, B, z, I) {
      (U.isScene !== !0 && (U = ge), Lt.resetTextureUnits());
      const tt = U.fog,
        ht = z.isMeshStandardMaterial ? U.environment : null,
        mt =
          g === null
            ? T.outputColorSpace
            : g.isXRRenderTarget === !0
              ? g.texture.colorSpace
              : mi,
        dt = (z.isMeshStandardMaterial ? x : A).get(z.envMap || ht),
        At =
          z.vertexColors === !0 &&
          !!B.attributes.color &&
          B.attributes.color.itemSize === 4,
        Rt = !!B.attributes.tangent && (!!z.normalMap || z.anisotropy > 0),
        Mt = !!B.morphAttributes.position,
        Ht = !!B.morphAttributes.normal,
        Kt = !!B.morphAttributes.color;
      let oe = Rn;
      z.toneMapped &&
        (g === null || g.isXRRenderTarget === !0) &&
        (oe = T.toneMapping);
      const ce =
          B.morphAttributes.position ||
          B.morphAttributes.normal ||
          B.morphAttributes.color,
        Jt = ce !== void 0 ? ce.length : 0,
        yt = St.get(z),
        re = b.state.lights;
      if ($ === !0 && (ft === !0 || v !== N)) {
        const Ee = v === N && z.id === D;
        _t.setState(z, v, Ee);
      }
      let Wt = !1;
      z.version === yt.__version
        ? ((yt.needsLights && yt.lightsStateVersion !== re.state.version) ||
            yt.outputColorSpace !== mt ||
            (I.isBatchedMesh && yt.batching === !1) ||
            (!I.isBatchedMesh && yt.batching === !0) ||
            (I.isBatchedMesh &&
              yt.batchingColor === !0 &&
              I.colorTexture === null) ||
            (I.isBatchedMesh &&
              yt.batchingColor === !1 &&
              I.colorTexture !== null) ||
            (I.isInstancedMesh && yt.instancing === !1) ||
            (!I.isInstancedMesh && yt.instancing === !0) ||
            (I.isSkinnedMesh && yt.skinning === !1) ||
            (!I.isSkinnedMesh && yt.skinning === !0) ||
            (I.isInstancedMesh &&
              yt.instancingColor === !0 &&
              I.instanceColor === null) ||
            (I.isInstancedMesh &&
              yt.instancingColor === !1 &&
              I.instanceColor !== null) ||
            (I.isInstancedMesh &&
              yt.instancingMorph === !0 &&
              I.morphTexture === null) ||
            (I.isInstancedMesh &&
              yt.instancingMorph === !1 &&
              I.morphTexture !== null) ||
            yt.envMap !== dt ||
            (z.fog === !0 && yt.fog !== tt) ||
            (yt.numClippingPlanes !== void 0 &&
              (yt.numClippingPlanes !== _t.numPlanes ||
                yt.numIntersection !== _t.numIntersection)) ||
            yt.vertexAlphas !== At ||
            yt.vertexTangents !== Rt ||
            yt.morphTargets !== Mt ||
            yt.morphNormals !== Ht ||
            yt.morphColors !== Kt ||
            yt.toneMapping !== oe ||
            yt.morphTargetsCount !== Jt) &&
          (Wt = !0)
        : ((Wt = !0), (yt.__version = z.version));
      let Ue = yt.currentProgram;
      Wt === !0 && (Ue = Vi(z, U, I));
      let qn = !1,
        Ie = !1,
        bi = !1;
      const ae = Ue.getUniforms(),
        we = yt.uniforms;
      if (
        (xt.useProgram(Ue.program) && ((qn = !0), (Ie = !0), (bi = !0)),
        z.id !== D && ((D = z.id), (Ie = !0)),
        qn || N !== v)
      ) {
        (xt.buffers.depth.getReversed() &&
          v.reversedDepth !== !0 &&
          ((v._reversedDepth = !0), v.updateProjectionMatrix()),
          ae.setValue(C, "projectionMatrix", v.projectionMatrix),
          ae.setValue(C, "viewMatrix", v.matrixWorldInverse));
        const Re = ae.map.cameraPosition;
        (Re !== void 0 &&
          Re.setValue(C, vt.setFromMatrixPosition(v.matrixWorld)),
          ee.logarithmicDepthBuffer &&
            ae.setValue(
              C,
              "logDepthBufFC",
              2 / (Math.log(v.far + 1) / Math.LN2),
            ),
          (z.isMeshPhongMaterial ||
            z.isMeshToonMaterial ||
            z.isMeshLambertMaterial ||
            z.isMeshBasicMaterial ||
            z.isMeshStandardMaterial ||
            z.isShaderMaterial) &&
            ae.setValue(C, "isOrthographic", v.isOrthographicCamera === !0),
          N !== v && ((N = v), (Ie = !0), (bi = !0)));
      }
      if (I.isSkinnedMesh) {
        (ae.setOptional(C, I, "bindMatrix"),
          ae.setOptional(C, I, "bindMatrixInverse"));
        const Ee = I.skeleton;
        Ee &&
          (Ee.boneTexture === null && Ee.computeBoneTexture(),
          ae.setValue(C, "boneTexture", Ee.boneTexture, Lt));
      }
      I.isBatchedMesh &&
        (ae.setOptional(C, I, "batchingTexture"),
        ae.setValue(C, "batchingTexture", I._matricesTexture, Lt),
        ae.setOptional(C, I, "batchingIdTexture"),
        ae.setValue(C, "batchingIdTexture", I._indirectTexture, Lt),
        ae.setOptional(C, I, "batchingColorTexture"),
        I._colorsTexture !== null &&
          ae.setValue(C, "batchingColorTexture", I._colorsTexture, Lt));
      const ze = B.morphAttributes;
      if (
        ((ze.position !== void 0 ||
          ze.normal !== void 0 ||
          ze.color !== void 0) &&
          wt.update(I, B, Ue),
        (Ie || yt.receiveShadow !== I.receiveShadow) &&
          ((yt.receiveShadow = I.receiveShadow),
          ae.setValue(C, "receiveShadow", I.receiveShadow)),
        z.isMeshGouraudMaterial &&
          z.envMap !== null &&
          ((we.envMap.value = dt),
          (we.flipEnvMap.value =
            dt.isCubeTexture && dt.isRenderTargetTexture === !1 ? -1 : 1)),
        z.isMeshStandardMaterial &&
          z.envMap === null &&
          U.environment !== null &&
          (we.envMapIntensity.value = U.environmentIntensity),
        we.dfgLUT !== void 0 && (we.dfgLUT.value = t0()),
        Ie &&
          (ae.setValue(C, "toneMappingExposure", T.toneMappingExposure),
          yt.needsLights && hc(we, bi),
          tt && z.fog === !0 && gt.refreshFogUniforms(we, tt),
          gt.refreshMaterialUniforms(
            we,
            z,
            rt,
            nt,
            b.state.transmissionRenderTarget[v.id],
          ),
          fs.upload(C, _a(yt), we, Lt)),
        z.isShaderMaterial &&
          z.uniformsNeedUpdate === !0 &&
          (fs.upload(C, _a(yt), we, Lt), (z.uniformsNeedUpdate = !1)),
        z.isSpriteMaterial && ae.setValue(C, "center", I.center),
        ae.setValue(C, "modelViewMatrix", I.modelViewMatrix),
        ae.setValue(C, "normalMatrix", I.normalMatrix),
        ae.setValue(C, "modelMatrix", I.matrixWorld),
        z.isShaderMaterial || z.isRawShaderMaterial)
      ) {
        const Ee = z.uniformsGroups;
        for (let Re = 0, Ss = Ee.length; Re < Ss; Re++) {
          const Ln = Ee[Re];
          (ct.update(Ln, Ue), ct.bind(Ln, Ue));
        }
      }
      return Ue;
    }
    function hc(v, U) {
      ((v.ambientLightColor.needsUpdate = U),
        (v.lightProbe.needsUpdate = U),
        (v.directionalLights.needsUpdate = U),
        (v.directionalLightShadows.needsUpdate = U),
        (v.pointLights.needsUpdate = U),
        (v.pointLightShadows.needsUpdate = U),
        (v.spotLights.needsUpdate = U),
        (v.spotLightShadows.needsUpdate = U),
        (v.rectAreaLights.needsUpdate = U),
        (v.hemisphereLights.needsUpdate = U));
    }
    function uc(v) {
      return (
        v.isMeshLambertMaterial ||
        v.isMeshToonMaterial ||
        v.isMeshPhongMaterial ||
        v.isMeshStandardMaterial ||
        v.isShadowMaterial ||
        (v.isShaderMaterial && v.lights === !0)
      );
    }
    ((this.getActiveCubeFace = function () {
      return L;
    }),
      (this.getActiveMipmapLevel = function () {
        return M;
      }),
      (this.getRenderTarget = function () {
        return g;
      }),
      (this.setRenderTargetTextures = function (v, U, B) {
        const z = St.get(v);
        ((z.__autoAllocateDepthBuffer = v.resolveDepthBuffer === !1),
          z.__autoAllocateDepthBuffer === !1 && (z.__useRenderToTexture = !1),
          (St.get(v.texture).__webglTexture = U),
          (St.get(v.depthTexture).__webglTexture = z.__autoAllocateDepthBuffer
            ? void 0
            : B),
          (z.__hasExternalTextures = !0));
      }),
      (this.setRenderTargetFramebuffer = function (v, U) {
        const B = St.get(v);
        ((B.__webglFramebuffer = U),
          (B.__useDefaultFramebuffer = U === void 0));
      }));
    const dc = C.createFramebuffer();
    ((this.setRenderTarget = function (v, U = 0, B = 0) {
      ((g = v), (L = U), (M = B));
      let z = !0,
        I = null,
        tt = !1,
        ht = !1;
      if (v) {
        const dt = St.get(v);
        if (dt.__useDefaultFramebuffer !== void 0)
          (xt.bindFramebuffer(C.FRAMEBUFFER, null), (z = !1));
        else if (dt.__webglFramebuffer === void 0) Lt.setupRenderTarget(v);
        else if (dt.__hasExternalTextures)
          Lt.rebindTextures(
            v,
            St.get(v.texture).__webglTexture,
            St.get(v.depthTexture).__webglTexture,
          );
        else if (v.depthBuffer) {
          const Mt = v.depthTexture;
          if (dt.__boundDepthTexture !== Mt) {
            if (
              Mt !== null &&
              St.has(Mt) &&
              (v.width !== Mt.image.width || v.height !== Mt.image.height)
            )
              throw new Error(
                "WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.",
              );
            Lt.setupDepthRenderbuffer(v);
          }
        }
        const At = v.texture;
        (At.isData3DTexture ||
          At.isDataArrayTexture ||
          At.isCompressedArrayTexture) &&
          (ht = !0);
        const Rt = St.get(v).__webglFramebuffer;
        (v.isWebGLCubeRenderTarget
          ? (Array.isArray(Rt[U]) ? (I = Rt[U][B]) : (I = Rt[U]), (tt = !0))
          : v.samples > 0 && Lt.useMultisampledRTT(v) === !1
            ? (I = St.get(v).__webglMultisampledFramebuffer)
            : Array.isArray(Rt)
              ? (I = Rt[B])
              : (I = Rt),
          V.copy(v.viewport),
          W.copy(v.scissor),
          (k = v.scissorTest));
      } else
        (V.copy(qt).multiplyScalar(rt).floor(),
          W.copy(Qt).multiplyScalar(rt).floor(),
          (k = te));
      if (
        (B !== 0 && (I = dc),
        xt.bindFramebuffer(C.FRAMEBUFFER, I) && z && xt.drawBuffers(v, I),
        xt.viewport(V),
        xt.scissor(W),
        xt.setScissorTest(k),
        tt)
      ) {
        const dt = St.get(v.texture);
        C.framebufferTexture2D(
          C.FRAMEBUFFER,
          C.COLOR_ATTACHMENT0,
          C.TEXTURE_CUBE_MAP_POSITIVE_X + U,
          dt.__webglTexture,
          B,
        );
      } else if (ht) {
        const dt = U;
        for (let At = 0; At < v.textures.length; At++) {
          const Rt = St.get(v.textures[At]);
          C.framebufferTextureLayer(
            C.FRAMEBUFFER,
            C.COLOR_ATTACHMENT0 + At,
            Rt.__webglTexture,
            B,
            dt,
          );
        }
      } else if (v !== null && B !== 0) {
        const dt = St.get(v.texture);
        C.framebufferTexture2D(
          C.FRAMEBUFFER,
          C.COLOR_ATTACHMENT0,
          C.TEXTURE_2D,
          dt.__webglTexture,
          B,
        );
      }
      D = -1;
    }),
      (this.readRenderTargetPixels = function (v, U, B, z, I, tt, ht, mt = 0) {
        if (!(v && v.isWebGLRenderTarget)) {
          he(
            "WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.",
          );
          return;
        }
        let dt = St.get(v).__webglFramebuffer;
        if ((v.isWebGLCubeRenderTarget && ht !== void 0 && (dt = dt[ht]), dt)) {
          xt.bindFramebuffer(C.FRAMEBUFFER, dt);
          try {
            const At = v.textures[mt],
              Rt = At.format,
              Mt = At.type;
            if (!ee.textureFormatReadable(Rt)) {
              he(
                "WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.",
              );
              return;
            }
            if (!ee.textureTypeReadable(Mt)) {
              he(
                "WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.",
              );
              return;
            }
            U >= 0 &&
              U <= v.width - z &&
              B >= 0 &&
              B <= v.height - I &&
              (v.textures.length > 1 && C.readBuffer(C.COLOR_ATTACHMENT0 + mt),
              C.readPixels(U, B, z, I, Ct.convert(Rt), Ct.convert(Mt), tt));
          } finally {
            const At = g !== null ? St.get(g).__webglFramebuffer : null;
            xt.bindFramebuffer(C.FRAMEBUFFER, At);
          }
        }
      }),
      (this.readRenderTargetPixelsAsync = async function (
        v,
        U,
        B,
        z,
        I,
        tt,
        ht,
        mt = 0,
      ) {
        if (!(v && v.isWebGLRenderTarget))
          throw new Error(
            "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.",
          );
        let dt = St.get(v).__webglFramebuffer;
        if ((v.isWebGLCubeRenderTarget && ht !== void 0 && (dt = dt[ht]), dt))
          if (U >= 0 && U <= v.width - z && B >= 0 && B <= v.height - I) {
            xt.bindFramebuffer(C.FRAMEBUFFER, dt);
            const At = v.textures[mt],
              Rt = At.format,
              Mt = At.type;
            if (!ee.textureFormatReadable(Rt))
              throw new Error(
                "THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.",
              );
            if (!ee.textureTypeReadable(Mt))
              throw new Error(
                "THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.",
              );
            const Ht = C.createBuffer();
            (C.bindBuffer(C.PIXEL_PACK_BUFFER, Ht),
              C.bufferData(C.PIXEL_PACK_BUFFER, tt.byteLength, C.STREAM_READ),
              v.textures.length > 1 && C.readBuffer(C.COLOR_ATTACHMENT0 + mt),
              C.readPixels(U, B, z, I, Ct.convert(Rt), Ct.convert(Mt), 0));
            const Kt = g !== null ? St.get(g).__webglFramebuffer : null;
            xt.bindFramebuffer(C.FRAMEBUFFER, Kt);
            const oe = C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE, 0);
            return (
              C.flush(),
              await Rl(C, oe, 4),
              C.bindBuffer(C.PIXEL_PACK_BUFFER, Ht),
              C.getBufferSubData(C.PIXEL_PACK_BUFFER, 0, tt),
              C.deleteBuffer(Ht),
              C.deleteSync(oe),
              tt
            );
          } else
            throw new Error(
              "THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.",
            );
      }),
      (this.copyFramebufferToTexture = function (v, U = null, B = 0) {
        const z = Math.pow(2, -B),
          I = Math.floor(v.image.width * z),
          tt = Math.floor(v.image.height * z),
          ht = U !== null ? U.x : 0,
          mt = U !== null ? U.y : 0;
        (Lt.setTexture2D(v, 0),
          C.copyTexSubImage2D(C.TEXTURE_2D, B, 0, 0, ht, mt, I, tt),
          xt.unbindTexture());
      }));
    const fc = C.createFramebuffer(),
      pc = C.createFramebuffer();
    ((this.copyTextureToTexture = function (
      v,
      U,
      B = null,
      z = null,
      I = 0,
      tt = null,
    ) {
      tt === null &&
        (I !== 0
          ? (Fi(
              "WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.",
            ),
            (tt = I),
            (I = 0))
          : (tt = 0));
      let ht, mt, dt, At, Rt, Mt, Ht, Kt, oe;
      const ce = v.isCompressedTexture ? v.mipmaps[tt] : v.image;
      if (B !== null)
        ((ht = B.max.x - B.min.x),
          (mt = B.max.y - B.min.y),
          (dt = B.isBox3 ? B.max.z - B.min.z : 1),
          (At = B.min.x),
          (Rt = B.min.y),
          (Mt = B.isBox3 ? B.min.z : 0));
      else {
        const ze = Math.pow(2, -I);
        ((ht = Math.floor(ce.width * ze)),
          (mt = Math.floor(ce.height * ze)),
          v.isDataArrayTexture
            ? (dt = ce.depth)
            : v.isData3DTexture
              ? (dt = Math.floor(ce.depth * ze))
              : (dt = 1),
          (At = 0),
          (Rt = 0),
          (Mt = 0));
      }
      z !== null
        ? ((Ht = z.x), (Kt = z.y), (oe = z.z))
        : ((Ht = 0), (Kt = 0), (oe = 0));
      const Jt = Ct.convert(U.format),
        yt = Ct.convert(U.type);
      let re;
      (U.isData3DTexture
        ? (Lt.setTexture3D(U, 0), (re = C.TEXTURE_3D))
        : U.isDataArrayTexture || U.isCompressedArrayTexture
          ? (Lt.setTexture2DArray(U, 0), (re = C.TEXTURE_2D_ARRAY))
          : (Lt.setTexture2D(U, 0), (re = C.TEXTURE_2D)),
        C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL, U.flipY),
        C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL, U.premultiplyAlpha),
        C.pixelStorei(C.UNPACK_ALIGNMENT, U.unpackAlignment));
      const Wt = C.getParameter(C.UNPACK_ROW_LENGTH),
        Ue = C.getParameter(C.UNPACK_IMAGE_HEIGHT),
        qn = C.getParameter(C.UNPACK_SKIP_PIXELS),
        Ie = C.getParameter(C.UNPACK_SKIP_ROWS),
        bi = C.getParameter(C.UNPACK_SKIP_IMAGES);
      (C.pixelStorei(C.UNPACK_ROW_LENGTH, ce.width),
        C.pixelStorei(C.UNPACK_IMAGE_HEIGHT, ce.height),
        C.pixelStorei(C.UNPACK_SKIP_PIXELS, At),
        C.pixelStorei(C.UNPACK_SKIP_ROWS, Rt),
        C.pixelStorei(C.UNPACK_SKIP_IMAGES, Mt));
      const ae = v.isDataArrayTexture || v.isData3DTexture,
        we = U.isDataArrayTexture || U.isData3DTexture;
      if (v.isDepthTexture) {
        const ze = St.get(v),
          Ee = St.get(U),
          Re = St.get(ze.__renderTarget),
          Ss = St.get(Ee.__renderTarget);
        (xt.bindFramebuffer(C.READ_FRAMEBUFFER, Re.__webglFramebuffer),
          xt.bindFramebuffer(C.DRAW_FRAMEBUFFER, Ss.__webglFramebuffer));
        for (let Ln = 0; Ln < dt; Ln++)
          (ae &&
            (C.framebufferTextureLayer(
              C.READ_FRAMEBUFFER,
              C.COLOR_ATTACHMENT0,
              St.get(v).__webglTexture,
              I,
              Mt + Ln,
            ),
            C.framebufferTextureLayer(
              C.DRAW_FRAMEBUFFER,
              C.COLOR_ATTACHMENT0,
              St.get(U).__webglTexture,
              tt,
              oe + Ln,
            )),
            C.blitFramebuffer(
              At,
              Rt,
              ht,
              mt,
              Ht,
              Kt,
              ht,
              mt,
              C.DEPTH_BUFFER_BIT,
              C.NEAREST,
            ));
        (xt.bindFramebuffer(C.READ_FRAMEBUFFER, null),
          xt.bindFramebuffer(C.DRAW_FRAMEBUFFER, null));
      } else if (I !== 0 || v.isRenderTargetTexture || St.has(v)) {
        const ze = St.get(v),
          Ee = St.get(U);
        (xt.bindFramebuffer(C.READ_FRAMEBUFFER, fc),
          xt.bindFramebuffer(C.DRAW_FRAMEBUFFER, pc));
        for (let Re = 0; Re < dt; Re++)
          (ae
            ? C.framebufferTextureLayer(
                C.READ_FRAMEBUFFER,
                C.COLOR_ATTACHMENT0,
                ze.__webglTexture,
                I,
                Mt + Re,
              )
            : C.framebufferTexture2D(
                C.READ_FRAMEBUFFER,
                C.COLOR_ATTACHMENT0,
                C.TEXTURE_2D,
                ze.__webglTexture,
                I,
              ),
            we
              ? C.framebufferTextureLayer(
                  C.DRAW_FRAMEBUFFER,
                  C.COLOR_ATTACHMENT0,
                  Ee.__webglTexture,
                  tt,
                  oe + Re,
                )
              : C.framebufferTexture2D(
                  C.DRAW_FRAMEBUFFER,
                  C.COLOR_ATTACHMENT0,
                  C.TEXTURE_2D,
                  Ee.__webglTexture,
                  tt,
                ),
            I !== 0
              ? C.blitFramebuffer(
                  At,
                  Rt,
                  ht,
                  mt,
                  Ht,
                  Kt,
                  ht,
                  mt,
                  C.COLOR_BUFFER_BIT,
                  C.NEAREST,
                )
              : we
                ? C.copyTexSubImage3D(re, tt, Ht, Kt, oe + Re, At, Rt, ht, mt)
                : C.copyTexSubImage2D(re, tt, Ht, Kt, At, Rt, ht, mt));
        (xt.bindFramebuffer(C.READ_FRAMEBUFFER, null),
          xt.bindFramebuffer(C.DRAW_FRAMEBUFFER, null));
      } else
        we
          ? v.isDataTexture || v.isData3DTexture
            ? C.texSubImage3D(re, tt, Ht, Kt, oe, ht, mt, dt, Jt, yt, ce.data)
            : U.isCompressedArrayTexture
              ? C.compressedTexSubImage3D(
                  re,
                  tt,
                  Ht,
                  Kt,
                  oe,
                  ht,
                  mt,
                  dt,
                  Jt,
                  ce.data,
                )
              : C.texSubImage3D(re, tt, Ht, Kt, oe, ht, mt, dt, Jt, yt, ce)
          : v.isDataTexture
            ? C.texSubImage2D(C.TEXTURE_2D, tt, Ht, Kt, ht, mt, Jt, yt, ce.data)
            : v.isCompressedTexture
              ? C.compressedTexSubImage2D(
                  C.TEXTURE_2D,
                  tt,
                  Ht,
                  Kt,
                  ce.width,
                  ce.height,
                  Jt,
                  ce.data,
                )
              : C.texSubImage2D(C.TEXTURE_2D, tt, Ht, Kt, ht, mt, Jt, yt, ce);
      (C.pixelStorei(C.UNPACK_ROW_LENGTH, Wt),
        C.pixelStorei(C.UNPACK_IMAGE_HEIGHT, Ue),
        C.pixelStorei(C.UNPACK_SKIP_PIXELS, qn),
        C.pixelStorei(C.UNPACK_SKIP_ROWS, Ie),
        C.pixelStorei(C.UNPACK_SKIP_IMAGES, bi),
        tt === 0 && U.generateMipmaps && C.generateMipmap(re),
        xt.unbindTexture());
    }),
      (this.initRenderTarget = function (v) {
        St.get(v).__webglFramebuffer === void 0 && Lt.setupRenderTarget(v);
      }),
      (this.initTexture = function (v) {
        (v.isCubeTexture
          ? Lt.setTextureCube(v, 0)
          : v.isData3DTexture
            ? Lt.setTexture3D(v, 0)
            : v.isDataArrayTexture || v.isCompressedArrayTexture
              ? Lt.setTexture2DArray(v, 0)
              : Lt.setTexture2D(v, 0),
          xt.unbindTexture());
      }),
      (this.resetState = function () {
        ((L = 0), (M = 0), (g = null), xt.reset(), P.reset());
      }),
      typeof __THREE_DEVTOOLS__ < "u" &&
        __THREE_DEVTOOLS__.dispatchEvent(
          new CustomEvent("observe", { detail: this }),
        ));
  }
  get coordinateSystem() {
    return en;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(t) {
    this._outputColorSpace = t;
    const e = this.getContext();
    ((e.drawingBufferColorSpace = Xt._getDrawingBufferColorSpace(t)),
      (e.unpackColorSpace = Xt._getUnpackColorSpace()));
  }
}
const So = { type: "change" },
  ua = { type: "start" },
  sc = { type: "end" },
  os = new Go(),
  bo = new Tn(),
  n0 = Math.cos(70 * Pl.DEG2RAD),
  fe = new F(),
  Pe = 2 * Math.PI,
  Zt = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6,
  },
  er = 1e-6;
class i0 extends fh {
  constructor(t, e = null) {
    (super(t, e),
      (this.state = Zt.NONE),
      (this.target = new F()),
      (this.cursor = new F()),
      (this.minDistance = 0),
      (this.maxDistance = 1 / 0),
      (this.minZoom = 0),
      (this.maxZoom = 1 / 0),
      (this.minTargetRadius = 0),
      (this.maxTargetRadius = 1 / 0),
      (this.minPolarAngle = 0),
      (this.maxPolarAngle = Math.PI),
      (this.minAzimuthAngle = -1 / 0),
      (this.maxAzimuthAngle = 1 / 0),
      (this.enableDamping = !1),
      (this.dampingFactor = 0.05),
      (this.enableZoom = !0),
      (this.zoomSpeed = 1),
      (this.enableRotate = !0),
      (this.rotateSpeed = 1),
      (this.keyRotateSpeed = 1),
      (this.enablePan = !0),
      (this.panSpeed = 1),
      (this.screenSpacePanning = !0),
      (this.keyPanSpeed = 7),
      (this.zoomToCursor = !1),
      (this.autoRotate = !1),
      (this.autoRotateSpeed = 2),
      (this.keys = {
        LEFT: "ArrowLeft",
        UP: "ArrowUp",
        RIGHT: "ArrowRight",
        BOTTOM: "ArrowDown",
      }),
      (this.mouseButtons = {
        LEFT: li.ROTATE,
        MIDDLE: li.DOLLY,
        RIGHT: li.PAN,
      }),
      (this.touches = { ONE: ci.ROTATE, TWO: ci.DOLLY_PAN }),
      (this.target0 = this.target.clone()),
      (this.position0 = this.object.position.clone()),
      (this.zoom0 = this.object.zoom),
      (this._domElementKeyEvents = null),
      (this._lastPosition = new F()),
      (this._lastQuaternion = new Wn()),
      (this._lastTargetPosition = new F()),
      (this._quat = new Wn().setFromUnitVectors(t.up, new F(0, 1, 0))),
      (this._quatInverse = this._quat.clone().invert()),
      (this._spherical = new Ka()),
      (this._sphericalDelta = new Ka()),
      (this._scale = 1),
      (this._panOffset = new F()),
      (this._rotateStart = new Pt()),
      (this._rotateEnd = new Pt()),
      (this._rotateDelta = new Pt()),
      (this._panStart = new Pt()),
      (this._panEnd = new Pt()),
      (this._panDelta = new Pt()),
      (this._dollyStart = new Pt()),
      (this._dollyEnd = new Pt()),
      (this._dollyDelta = new Pt()),
      (this._dollyDirection = new F()),
      (this._mouse = new Pt()),
      (this._performCursorZoom = !1),
      (this._pointers = []),
      (this._pointerPositions = {}),
      (this._controlActive = !1),
      (this._onPointerMove = r0.bind(this)),
      (this._onPointerDown = s0.bind(this)),
      (this._onPointerUp = a0.bind(this)),
      (this._onContextMenu = f0.bind(this)),
      (this._onMouseWheel = l0.bind(this)),
      (this._onKeyDown = h0.bind(this)),
      (this._onTouchStart = u0.bind(this)),
      (this._onTouchMove = d0.bind(this)),
      (this._onMouseDown = o0.bind(this)),
      (this._onMouseMove = c0.bind(this)),
      (this._interceptControlDown = p0.bind(this)),
      (this._interceptControlUp = m0.bind(this)),
      this.domElement !== null && this.connect(this.domElement),
      this.update());
  }
  connect(t) {
    (super.connect(t),
      this.domElement.addEventListener("pointerdown", this._onPointerDown),
      this.domElement.addEventListener("pointercancel", this._onPointerUp),
      this.domElement.addEventListener("contextmenu", this._onContextMenu),
      this.domElement.addEventListener("wheel", this._onMouseWheel, {
        passive: !1,
      }),
      this.domElement
        .getRootNode()
        .addEventListener("keydown", this._interceptControlDown, {
          passive: !0,
          capture: !0,
        }),
      (this.domElement.style.touchAction = "none"));
  }
  disconnect() {
    (this.domElement.removeEventListener("pointerdown", this._onPointerDown),
      this.domElement.removeEventListener("pointermove", this._onPointerMove),
      this.domElement.removeEventListener("pointerup", this._onPointerUp),
      this.domElement.removeEventListener("pointercancel", this._onPointerUp),
      this.domElement.removeEventListener("wheel", this._onMouseWheel),
      this.domElement.removeEventListener("contextmenu", this._onContextMenu),
      this.stopListenToKeyEvents(),
      this.domElement
        .getRootNode()
        .removeEventListener("keydown", this._interceptControlDown, {
          capture: !0,
        }),
      (this.domElement.style.touchAction = "auto"));
  }
  dispose() {
    this.disconnect();
  }
  getPolarAngle() {
    return this._spherical.phi;
  }
  getAzimuthalAngle() {
    return this._spherical.theta;
  }
  getDistance() {
    return this.object.position.distanceTo(this.target);
  }
  listenToKeyEvents(t) {
    (t.addEventListener("keydown", this._onKeyDown),
      (this._domElementKeyEvents = t));
  }
  stopListenToKeyEvents() {
    this._domElementKeyEvents !== null &&
      (this._domElementKeyEvents.removeEventListener(
        "keydown",
        this._onKeyDown,
      ),
      (this._domElementKeyEvents = null));
  }
  saveState() {
    (this.target0.copy(this.target),
      this.position0.copy(this.object.position),
      (this.zoom0 = this.object.zoom));
  }
  reset() {
    (this.target.copy(this.target0),
      this.object.position.copy(this.position0),
      (this.object.zoom = this.zoom0),
      this.object.updateProjectionMatrix(),
      this.dispatchEvent(So),
      this.update(),
      (this.state = Zt.NONE));
  }
  update(t = null) {
    const e = this.object.position;
    (fe.copy(e).sub(this.target),
      fe.applyQuaternion(this._quat),
      this._spherical.setFromVector3(fe),
      this.autoRotate &&
        this.state === Zt.NONE &&
        this._rotateLeft(this._getAutoRotationAngle(t)),
      this.enableDamping
        ? ((this._spherical.theta +=
            this._sphericalDelta.theta * this.dampingFactor),
          (this._spherical.phi +=
            this._sphericalDelta.phi * this.dampingFactor))
        : ((this._spherical.theta += this._sphericalDelta.theta),
          (this._spherical.phi += this._sphericalDelta.phi)));
    let n = this.minAzimuthAngle,
      s = this.maxAzimuthAngle;
    (isFinite(n) &&
      isFinite(s) &&
      (n < -Math.PI ? (n += Pe) : n > Math.PI && (n -= Pe),
      s < -Math.PI ? (s += Pe) : s > Math.PI && (s -= Pe),
      n <= s
        ? (this._spherical.theta = Math.max(
            n,
            Math.min(s, this._spherical.theta),
          ))
        : (this._spherical.theta =
            this._spherical.theta > (n + s) / 2
              ? Math.max(n, this._spherical.theta)
              : Math.min(s, this._spherical.theta))),
      (this._spherical.phi = Math.max(
        this.minPolarAngle,
        Math.min(this.maxPolarAngle, this._spherical.phi),
      )),
      this._spherical.makeSafe(),
      this.enableDamping === !0
        ? this.target.addScaledVector(this._panOffset, this.dampingFactor)
        : this.target.add(this._panOffset),
      this.target.sub(this.cursor),
      this.target.clampLength(this.minTargetRadius, this.maxTargetRadius),
      this.target.add(this.cursor));
    let r = !1;
    if (
      (this.zoomToCursor && this._performCursorZoom) ||
      this.object.isOrthographicCamera
    )
      this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const a = this._spherical.radius;
      ((this._spherical.radius = this._clampDistance(
        this._spherical.radius * this._scale,
      )),
        (r = a != this._spherical.radius));
    }
    if (
      (fe.setFromSpherical(this._spherical),
      fe.applyQuaternion(this._quatInverse),
      e.copy(this.target).add(fe),
      this.object.lookAt(this.target),
      this.enableDamping === !0
        ? ((this._sphericalDelta.theta *= 1 - this.dampingFactor),
          (this._sphericalDelta.phi *= 1 - this.dampingFactor),
          this._panOffset.multiplyScalar(1 - this.dampingFactor))
        : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)),
      this.zoomToCursor && this._performCursorZoom)
    ) {
      let a = null;
      if (this.object.isPerspectiveCamera) {
        const o = fe.length();
        a = this._clampDistance(o * this._scale);
        const l = o - a;
        (this.object.position.addScaledVector(this._dollyDirection, l),
          this.object.updateMatrixWorld(),
          (r = !!l));
      } else if (this.object.isOrthographicCamera) {
        const o = new F(this._mouse.x, this._mouse.y, 0);
        o.unproject(this.object);
        const l = this.object.zoom;
        ((this.object.zoom = Math.max(
          this.minZoom,
          Math.min(this.maxZoom, this.object.zoom / this._scale),
        )),
          this.object.updateProjectionMatrix(),
          (r = l !== this.object.zoom));
        const c = new F(this._mouse.x, this._mouse.y, 0);
        (c.unproject(this.object),
          this.object.position.sub(c).add(o),
          this.object.updateMatrixWorld(),
          (a = fe.length()));
      } else
        (console.warn(
          "WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.",
        ),
          (this.zoomToCursor = !1));
      a !== null &&
        (this.screenSpacePanning
          ? this.target
              .set(0, 0, -1)
              .transformDirection(this.object.matrix)
              .multiplyScalar(a)
              .add(this.object.position)
          : (os.origin.copy(this.object.position),
            os.direction.set(0, 0, -1).transformDirection(this.object.matrix),
            Math.abs(this.object.up.dot(os.direction)) < n0
              ? this.object.lookAt(this.target)
              : (bo.setFromNormalAndCoplanarPoint(this.object.up, this.target),
                os.intersectPlane(bo, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const a = this.object.zoom;
      ((this.object.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.object.zoom / this._scale),
      )),
        a !== this.object.zoom &&
          (this.object.updateProjectionMatrix(), (r = !0)));
    }
    return (
      (this._scale = 1),
      (this._performCursorZoom = !1),
      r ||
      this._lastPosition.distanceToSquared(this.object.position) > er ||
      8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > er ||
      this._lastTargetPosition.distanceToSquared(this.target) > er
        ? (this.dispatchEvent(So),
          this._lastPosition.copy(this.object.position),
          this._lastQuaternion.copy(this.object.quaternion),
          this._lastTargetPosition.copy(this.target),
          !0)
        : !1
    );
  }
  _getAutoRotationAngle(t) {
    return t !== null
      ? (Pe / 60) * this.autoRotateSpeed * t
      : (Pe / 60 / 60) * this.autoRotateSpeed;
  }
  _getZoomScale(t) {
    const e = Math.abs(t * 0.01);
    return Math.pow(0.95, this.zoomSpeed * e);
  }
  _rotateLeft(t) {
    this._sphericalDelta.theta -= t;
  }
  _rotateUp(t) {
    this._sphericalDelta.phi -= t;
  }
  _panLeft(t, e) {
    (fe.setFromMatrixColumn(e, 0),
      fe.multiplyScalar(-t),
      this._panOffset.add(fe));
  }
  _panUp(t, e) {
    (this.screenSpacePanning === !0
      ? fe.setFromMatrixColumn(e, 1)
      : (fe.setFromMatrixColumn(e, 0), fe.crossVectors(this.object.up, fe)),
      fe.multiplyScalar(t),
      this._panOffset.add(fe));
  }
  _pan(t, e) {
    const n = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const s = this.object.position;
      fe.copy(s).sub(this.target);
      let r = fe.length();
      ((r *= Math.tan(((this.object.fov / 2) * Math.PI) / 180)),
        this._panLeft((2 * t * r) / n.clientHeight, this.object.matrix),
        this._panUp((2 * e * r) / n.clientHeight, this.object.matrix));
    } else
      this.object.isOrthographicCamera
        ? (this._panLeft(
            (t * (this.object.right - this.object.left)) /
              this.object.zoom /
              n.clientWidth,
            this.object.matrix,
          ),
          this._panUp(
            (e * (this.object.top - this.object.bottom)) /
              this.object.zoom /
              n.clientHeight,
            this.object.matrix,
          ))
        : (console.warn(
            "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.",
          ),
          (this.enablePan = !1));
  }
  _dollyOut(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera
      ? (this._scale /= t)
      : (console.warn(
          "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.",
        ),
        (this.enableZoom = !1));
  }
  _dollyIn(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera
      ? (this._scale *= t)
      : (console.warn(
          "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.",
        ),
        (this.enableZoom = !1));
  }
  _updateZoomParameters(t, e) {
    if (!this.zoomToCursor) return;
    this._performCursorZoom = !0;
    const n = this.domElement.getBoundingClientRect(),
      s = t - n.left,
      r = e - n.top,
      a = n.width,
      o = n.height;
    ((this._mouse.x = (s / a) * 2 - 1),
      (this._mouse.y = -(r / o) * 2 + 1),
      this._dollyDirection
        .set(this._mouse.x, this._mouse.y, 1)
        .unproject(this.object)
        .sub(this.object.position)
        .normalize());
  }
  _clampDistance(t) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, t));
  }
  _handleMouseDownRotate(t) {
    this._rotateStart.set(t.clientX, t.clientY);
  }
  _handleMouseDownDolly(t) {
    (this._updateZoomParameters(t.clientX, t.clientX),
      this._dollyStart.set(t.clientX, t.clientY));
  }
  _handleMouseDownPan(t) {
    this._panStart.set(t.clientX, t.clientY);
  }
  _handleMouseMoveRotate(t) {
    (this._rotateEnd.set(t.clientX, t.clientY),
      this._rotateDelta
        .subVectors(this._rotateEnd, this._rotateStart)
        .multiplyScalar(this.rotateSpeed));
    const e = this.domElement;
    (this._rotateLeft((Pe * this._rotateDelta.x) / e.clientHeight),
      this._rotateUp((Pe * this._rotateDelta.y) / e.clientHeight),
      this._rotateStart.copy(this._rotateEnd),
      this.update());
  }
  _handleMouseMoveDolly(t) {
    (this._dollyEnd.set(t.clientX, t.clientY),
      this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart),
      this._dollyDelta.y > 0
        ? this._dollyOut(this._getZoomScale(this._dollyDelta.y))
        : this._dollyDelta.y < 0 &&
          this._dollyIn(this._getZoomScale(this._dollyDelta.y)),
      this._dollyStart.copy(this._dollyEnd),
      this.update());
  }
  _handleMouseMovePan(t) {
    (this._panEnd.set(t.clientX, t.clientY),
      this._panDelta
        .subVectors(this._panEnd, this._panStart)
        .multiplyScalar(this.panSpeed),
      this._pan(this._panDelta.x, this._panDelta.y),
      this._panStart.copy(this._panEnd),
      this.update());
  }
  _handleMouseWheel(t) {
    (this._updateZoomParameters(t.clientX, t.clientY),
      t.deltaY < 0
        ? this._dollyIn(this._getZoomScale(t.deltaY))
        : t.deltaY > 0 && this._dollyOut(this._getZoomScale(t.deltaY)),
      this.update());
  }
  _handleKeyDown(t) {
    let e = !1;
    switch (t.code) {
      case this.keys.UP:
        (t.ctrlKey || t.metaKey || t.shiftKey
          ? this.enableRotate &&
            this._rotateUp(
              (Pe * this.keyRotateSpeed) / this.domElement.clientHeight,
            )
          : this.enablePan && this._pan(0, this.keyPanSpeed),
          (e = !0));
        break;
      case this.keys.BOTTOM:
        (t.ctrlKey || t.metaKey || t.shiftKey
          ? this.enableRotate &&
            this._rotateUp(
              (-Pe * this.keyRotateSpeed) / this.domElement.clientHeight,
            )
          : this.enablePan && this._pan(0, -this.keyPanSpeed),
          (e = !0));
        break;
      case this.keys.LEFT:
        (t.ctrlKey || t.metaKey || t.shiftKey
          ? this.enableRotate &&
            this._rotateLeft(
              (Pe * this.keyRotateSpeed) / this.domElement.clientHeight,
            )
          : this.enablePan && this._pan(this.keyPanSpeed, 0),
          (e = !0));
        break;
      case this.keys.RIGHT:
        (t.ctrlKey || t.metaKey || t.shiftKey
          ? this.enableRotate &&
            this._rotateLeft(
              (-Pe * this.keyRotateSpeed) / this.domElement.clientHeight,
            )
          : this.enablePan && this._pan(-this.keyPanSpeed, 0),
          (e = !0));
        break;
    }
    e && (t.preventDefault(), this.update());
  }
  _handleTouchStartRotate(t) {
    if (this._pointers.length === 1) this._rotateStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t),
        n = 0.5 * (t.pageX + e.x),
        s = 0.5 * (t.pageY + e.y);
      this._rotateStart.set(n, s);
    }
  }
  _handleTouchStartPan(t) {
    if (this._pointers.length === 1) this._panStart.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t),
        n = 0.5 * (t.pageX + e.x),
        s = 0.5 * (t.pageY + e.y);
      this._panStart.set(n, s);
    }
  }
  _handleTouchStartDolly(t) {
    const e = this._getSecondPointerPosition(t),
      n = t.pageX - e.x,
      s = t.pageY - e.y,
      r = Math.sqrt(n * n + s * s);
    this._dollyStart.set(0, r);
  }
  _handleTouchStartDollyPan(t) {
    (this.enableZoom && this._handleTouchStartDolly(t),
      this.enablePan && this._handleTouchStartPan(t));
  }
  _handleTouchStartDollyRotate(t) {
    (this.enableZoom && this._handleTouchStartDolly(t),
      this.enableRotate && this._handleTouchStartRotate(t));
  }
  _handleTouchMoveRotate(t) {
    if (this._pointers.length == 1) this._rotateEnd.set(t.pageX, t.pageY);
    else {
      const n = this._getSecondPointerPosition(t),
        s = 0.5 * (t.pageX + n.x),
        r = 0.5 * (t.pageY + n.y);
      this._rotateEnd.set(s, r);
    }
    this._rotateDelta
      .subVectors(this._rotateEnd, this._rotateStart)
      .multiplyScalar(this.rotateSpeed);
    const e = this.domElement;
    (this._rotateLeft((Pe * this._rotateDelta.x) / e.clientHeight),
      this._rotateUp((Pe * this._rotateDelta.y) / e.clientHeight),
      this._rotateStart.copy(this._rotateEnd));
  }
  _handleTouchMovePan(t) {
    if (this._pointers.length === 1) this._panEnd.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t),
        n = 0.5 * (t.pageX + e.x),
        s = 0.5 * (t.pageY + e.y);
      this._panEnd.set(n, s);
    }
    (this._panDelta
      .subVectors(this._panEnd, this._panStart)
      .multiplyScalar(this.panSpeed),
      this._pan(this._panDelta.x, this._panDelta.y),
      this._panStart.copy(this._panEnd));
  }
  _handleTouchMoveDolly(t) {
    const e = this._getSecondPointerPosition(t),
      n = t.pageX - e.x,
      s = t.pageY - e.y,
      r = Math.sqrt(n * n + s * s);
    (this._dollyEnd.set(0, r),
      this._dollyDelta.set(
        0,
        Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed),
      ),
      this._dollyOut(this._dollyDelta.y),
      this._dollyStart.copy(this._dollyEnd));
    const a = (t.pageX + e.x) * 0.5,
      o = (t.pageY + e.y) * 0.5;
    this._updateZoomParameters(a, o);
  }
  _handleTouchMoveDollyPan(t) {
    (this.enableZoom && this._handleTouchMoveDolly(t),
      this.enablePan && this._handleTouchMovePan(t));
  }
  _handleTouchMoveDollyRotate(t) {
    (this.enableZoom && this._handleTouchMoveDolly(t),
      this.enableRotate && this._handleTouchMoveRotate(t));
  }
  _addPointer(t) {
    this._pointers.push(t.pointerId);
  }
  _removePointer(t) {
    delete this._pointerPositions[t.pointerId];
    for (let e = 0; e < this._pointers.length; e++)
      if (this._pointers[e] == t.pointerId) {
        this._pointers.splice(e, 1);
        return;
      }
  }
  _isTrackingPointer(t) {
    for (let e = 0; e < this._pointers.length; e++)
      if (this._pointers[e] == t.pointerId) return !0;
    return !1;
  }
  _trackPointer(t) {
    let e = this._pointerPositions[t.pointerId];
    (e === void 0 &&
      ((e = new Pt()), (this._pointerPositions[t.pointerId] = e)),
      e.set(t.pageX, t.pageY));
  }
  _getSecondPointerPosition(t) {
    const e =
      t.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[e];
  }
  _customWheelEvent(t) {
    const e = t.deltaMode,
      n = { clientX: t.clientX, clientY: t.clientY, deltaY: t.deltaY };
    switch (e) {
      case 1:
        n.deltaY *= 16;
        break;
      case 2:
        n.deltaY *= 100;
        break;
    }
    return (t.ctrlKey && !this._controlActive && (n.deltaY *= 10), n);
  }
}
function s0(i) {
  this.enabled !== !1 &&
    (this._pointers.length === 0 &&
      (this.domElement.setPointerCapture(i.pointerId),
      this.domElement.addEventListener("pointermove", this._onPointerMove),
      this.domElement.addEventListener("pointerup", this._onPointerUp)),
    !this._isTrackingPointer(i) &&
      (this._addPointer(i),
      i.pointerType === "touch"
        ? this._onTouchStart(i)
        : this._onMouseDown(i)));
}
function r0(i) {
  this.enabled !== !1 &&
    (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i));
}
function a0(i) {
  switch ((this._removePointer(i), this._pointers.length)) {
    case 0:
      (this.domElement.releasePointerCapture(i.pointerId),
        this.domElement.removeEventListener("pointermove", this._onPointerMove),
        this.domElement.removeEventListener("pointerup", this._onPointerUp),
        this.dispatchEvent(sc),
        (this.state = Zt.NONE));
      break;
    case 1:
      const t = this._pointers[0],
        e = this._pointerPositions[t];
      this._onTouchStart({ pointerId: t, pageX: e.x, pageY: e.y });
      break;
  }
}
function o0(i) {
  let t;
  switch (i.button) {
    case 0:
      t = this.mouseButtons.LEFT;
      break;
    case 1:
      t = this.mouseButtons.MIDDLE;
      break;
    case 2:
      t = this.mouseButtons.RIGHT;
      break;
    default:
      t = -1;
  }
  switch (t) {
    case li.DOLLY:
      if (this.enableZoom === !1) return;
      (this._handleMouseDownDolly(i), (this.state = Zt.DOLLY));
      break;
    case li.ROTATE:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enablePan === !1) return;
        (this._handleMouseDownPan(i), (this.state = Zt.PAN));
      } else {
        if (this.enableRotate === !1) return;
        (this._handleMouseDownRotate(i), (this.state = Zt.ROTATE));
      }
      break;
    case li.PAN:
      if (i.ctrlKey || i.metaKey || i.shiftKey) {
        if (this.enableRotate === !1) return;
        (this._handleMouseDownRotate(i), (this.state = Zt.ROTATE));
      } else {
        if (this.enablePan === !1) return;
        (this._handleMouseDownPan(i), (this.state = Zt.PAN));
      }
      break;
    default:
      this.state = Zt.NONE;
  }
  this.state !== Zt.NONE && this.dispatchEvent(ua);
}
function c0(i) {
  switch (this.state) {
    case Zt.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(i);
      break;
    case Zt.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(i);
      break;
    case Zt.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(i);
      break;
  }
}
function l0(i) {
  this.enabled === !1 ||
    this.enableZoom === !1 ||
    this.state !== Zt.NONE ||
    (i.preventDefault(),
    this.dispatchEvent(ua),
    this._handleMouseWheel(this._customWheelEvent(i)),
    this.dispatchEvent(sc));
}
function h0(i) {
  this.enabled !== !1 && this._handleKeyDown(i);
}
function u0(i) {
  switch ((this._trackPointer(i), this._pointers.length)) {
    case 1:
      switch (this.touches.ONE) {
        case ci.ROTATE:
          if (this.enableRotate === !1) return;
          (this._handleTouchStartRotate(i), (this.state = Zt.TOUCH_ROTATE));
          break;
        case ci.PAN:
          if (this.enablePan === !1) return;
          (this._handleTouchStartPan(i), (this.state = Zt.TOUCH_PAN));
          break;
        default:
          this.state = Zt.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case ci.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          (this._handleTouchStartDollyPan(i),
            (this.state = Zt.TOUCH_DOLLY_PAN));
          break;
        case ci.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          (this._handleTouchStartDollyRotate(i),
            (this.state = Zt.TOUCH_DOLLY_ROTATE));
          break;
        default:
          this.state = Zt.NONE;
      }
      break;
    default:
      this.state = Zt.NONE;
  }
  this.state !== Zt.NONE && this.dispatchEvent(ua);
}
function d0(i) {
  switch ((this._trackPointer(i), this.state)) {
    case Zt.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      (this._handleTouchMoveRotate(i), this.update());
      break;
    case Zt.TOUCH_PAN:
      if (this.enablePan === !1) return;
      (this._handleTouchMovePan(i), this.update());
      break;
    case Zt.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      (this._handleTouchMoveDollyPan(i), this.update());
      break;
    case Zt.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      (this._handleTouchMoveDollyRotate(i), this.update());
      break;
    default:
      this.state = Zt.NONE;
  }
}
function f0(i) {
  this.enabled !== !1 && i.preventDefault();
}
function p0(i) {
  i.key === "Control" &&
    ((this._controlActive = !0),
    this.domElement
      .getRootNode()
      .addEventListener("keyup", this._interceptControlUp, {
        passive: !0,
        capture: !0,
      }));
}
function m0(i) {
  i.key === "Control" &&
    ((this._controlActive = !1),
    this.domElement
      .getRootNode()
      .removeEventListener("keyup", this._interceptControlUp, {
        passive: !0,
        capture: !0,
      }));
}
const rc = 2897216,
  ac = 1448996,
  qr = 5990003,
  x0 = 9315382,
  _0 = 11452364;
function Oe(i, t = {}) {
  return new ha({
    color: i,
    roughness: 0.55,
    metalness: 0.25,
    flatShading: !0,
    ...t,
  });
}
function zn(i, t, e, n, s = 1) {
  const r = new Ae(new ca(1, s), n);
  return (
    r.scale.set(...t),
    r.position.set(...e),
    (r.castShadow = !0),
    i.add(r),
    r
  );
}
function Cn(i, t, e, n, s, r = 5) {
  const a = new F(...t),
    o = new F(...e),
    l = o.clone().sub(a),
    c = new Ae(new aa(n * 0.8, n, l.length(), r), s);
  return (
    c.position.copy(a).add(o).multiplyScalar(0.5),
    c.quaternion.setFromUnitVectors(new F(0, 1, 0), l.clone().normalize()),
    (c.castShadow = !0),
    i.add(c),
    c
  );
}
function Eo(i, t) {
  const e = new $e();
  (e.position.set(-0.16, 0.34, 0.2 * t), i.add(e));
  const n = [
      [0.08, 0, 0.04 * t],
      [-0.35, 0.03, 0.34 * t],
      [-0.95, 0.05, 0.52 * t],
      [-1.5, 0.04, 0.46 * t],
      [-1.74, 0.01, 0.24 * t],
      [-1.5, -0.01, 0.06 * t],
      [-0.7, 0, 0.02 * t],
    ],
    s = [];
  for (let c = 1; c < n.length - 1; c++) s.push(...n[0], ...n[c], ...n[c + 1]);
  const r = new ke();
  (r.setAttribute("position", new ve(s, 3)), r.computeVertexNormals());
  const a = new Ae(
    r,
    Oe(_0, {
      transparent: !0,
      opacity: 0.42,
      side: tn,
      roughness: 0.2,
      metalness: 0.4,
    }),
  );
  ((a.castShadow = !1), e.add(a));
  const o = Oe(9413556, { roughness: 0.35 }),
    l = [...n, n[0]];
  for (let c = 0; c < l.length - 1; c++) Cn(e, l[c], l[c + 1], 0.008, o, 4);
  for (let c = 2; c < 5; c++) Cn(e, [-0.1, 0, 0.02 * t], n[c], 0.005, o, 3);
  return e;
}
function g0(i, t, e) {
  const n = new $e();
  (n.position.set(0.3 - t * 0.34, -0.05, 0.22 * e), i.add(n));
  const s = Oe(qr, { roughness: 0.4, metalness: 0.5 }),
    r = Oe(ac),
    a = new $e();
  n.add(a);
  const o = [0.1 * e, -0.42, 0.42 * e];
  (Cn(a, [0, 0, 0], o, 0.032, s), zn(a, [0.05, 0.05, 0.05], o, Oe(rc), 0));
  const l = new $e();
  (l.position.set(...o), a.add(l));
  const c = [0.12 * e, -0.46, 0.2 * e];
  Cn(l, [0, 0, 0], c, 0.02, s);
  const u = new _e();
  (u.position.set(c[0] * 1.25, c[1] * 1.3, c[2] * 1.4),
    l.add(u),
    Cn(l, c, u.position.toArray(), 0.011, r));
  const h = e * (0.1 + t * 0.16);
  return (
    t === 0
      ? (a.rotation.set(-0.55, 0, h * 0.6), l.rotation.set(0.75, 0, -h * 0.4))
      : (a.rotation.set(0.28 + t * 0.22, 0, h),
        l.rotation.set(-0.12, 0, -h * 0.5)),
    {
      root: n,
      coxa: a,
      femur: l,
      tip: u,
      restCoxa: a.rotation.clone(),
      restFemur: l.rotation.clone(),
    }
  );
}
function v0() {
  const i = new $e(),
    t = Oe(rc),
    e = Oe(ac, { metalness: 0.2 }),
    n = zn(i, [0.82, 0.36, 0.4], [-0.78, -0.02, 0], e);
  for (let h = 0; h < 5; h++) {
    const f = new Ae(
      new la(0.33 - h * 0.045, 0.03, 4, 12),
      Oe(2173492 + h * 263172),
    );
    (f.position.set(-0.6 - h * 0.16, -0.01, 0),
      (f.rotation.y = Math.PI / 2),
      (f.scale.z = 0.92),
      i.add(f));
  }
  const s = zn(i, [0.6, 0.48, 0.45], [-0.04, 0.06, 0], t),
    r = Oe(922392);
  for (let h = 0; h < 6; h++) {
    const f = (h / 6) * Math.PI * 2;
    Cn(
      i,
      [-0.04 + Math.cos(f) * 0.18, 0.4, Math.sin(f) * 0.2],
      [-0.04 + Math.cos(f) * 0.26, 0.62, Math.sin(f) * 0.3],
      0.009,
      r,
      3,
    );
  }
  const a = new $e();
  (a.position.set(0.58, 0.16, 0),
    i.add(a),
    zn(a, [0.37, 0.36, 0.36], [0, 0, 0], Oe(3687247)));
  const o = Oe(x0, { roughness: 0.25, metalness: 0.15, emissive: 3804438 });
  for (const h of [1, -1])
    (zn(a, [0.26, 0.34, 0.23], [0.1, 0.03, 0.26 * h], o, 2),
      Cn(a, [0.22, 0.26, 0.13 * h], [0.44, 0.44, 0.2 * h], 0.011, Oe(qr), 4),
      zn(a, [0.035, 0.025, 0.025], [0.44, 0.44, 0.2 * h], e, 0));
  (Cn(a, [0.25, -0.16, 0], [0.46, -0.32, 0], 0.04, Oe(qr), 5),
    zn(a, [0.055, 0.07, 0.1], [0.46, -0.32, 0], e, 0));
  const l = [Eo(i, 1), Eo(i, -1)],
    c = [];
  for (const h of [1, -1]) for (let f = 0; f < 3; f++) c.push(g0(i, f, h));
  const u = c[0];
  return {
    group: i,
    head: a,
    thorax: s,
    abdomen: n,
    wings: l,
    legs: c,
    pointer: u,
  };
}
const yn = 260,
  Pi = 460;
function M0() {
  const i = new $e(),
    t = new Ae(
      new vi(1.5, 0.08, 2.65),
      new ha({ color: 1777446, roughness: 0.45, metalness: 0.6 }),
    );
  ((t.receiveShadow = !0), (t.castShadow = !0), i.add(t));
  const e = document.createElement("canvas");
  ((e.width = yn), (e.height = Pi));
  const n = e.getContext("2d");
  n.imageSmoothingEnabled = !1;
  const s = new ah(e);
  ((s.magFilter = Te),
    (s.minFilter = Te),
    (s.generateMipmaps = !1),
    (s.colorSpace = Be));
  const r = new Ae(new Mi(1.38, 2.5), new sa({ map: s, toneMapped: !1 }));
  (r.rotation.set(-Math.PI / 2, 0, Math.PI), (r.position.y = 0.041), i.add(r));
  let a = !1;
  const o = new _e();
  (o.position.set(0, 0.06, 0), i.add(o));
  const imageCache = new Map();
  let latest = null;
  function imageFor(url) {
    if (!url) return null;
    if (!imageCache.has(url)) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => l(latest);
      img.onerror = () => { imageCache.set(url, false); l(latest); };
      imageCache.set(url, img);
      img.src = url;
    }
    const img = imageCache.get(url);
    return img && img.complete && img.naturalWidth ? img : null;
  }
  function l(c) {
    latest = c;
    n.imageSmoothingEnabled = true;
    n.fillStyle = "#ffffff";
    n.fillRect(0, 0, yn, Pi);
    n.fillStyle = "#7c3aed";
    n.fillRect(0, 0, yn, 75);
    n.textAlign = "left";
    n.fillStyle = "#ffffff";
    n.font = "bold 19px Arial, sans-serif";
    n.fillText("uzum", 13, 29);
    n.fillStyle = "#efe7ff";
    n.fillRect(12, 40, 236, 24);
    n.fillStyle = "#7d699c";
    n.font = "11px Arial, sans-serif";
    n.fillText("⌕   Поиск товаров", 21, 56);
    n.fillStyle = "#241a39";
    n.font = "bold 13px Arial, sans-serif";
    n.fillText("Муха рекомендует", 12, 95);
    if (c) {
      const selected = new Set(c.selection.selected);
      const current = c.presenting?.id;
      const focusIndex = Math.max(0, c.offers.findIndex((item) => item.id === current));
      const pageStart = Math.floor(focusIndex / 6) * 6;
      c.offers.slice(pageStart, pageStart + 6).forEach((item, index) => {
        const col = index % 2, row = Math.floor(index / 2);
        const x = 12 + col * 121, y = 105 + row * 105;
        n.fillStyle = item.id === current ? "#f3ebff" : "#f7f7fa";
        n.fillRect(x, y, 114, 98);
        n.strokeStyle = selected.has(item.id) ? "#7c3aed" : "#ebe8f1";
        n.lineWidth = selected.has(item.id) ? 3 : 1;
        n.strokeRect(x + 1, y + 1, 112, 96);
        const img = imageFor(item.image);
        if (img) {
          const size = Math.min(62 / img.width, 61 / img.height);
          const w = img.width * size, h = img.height * size;
          try { n.drawImage(img, x + (114 - w) / 2, y + 3 + (61 - h) / 2, w, h); } catch (_) {}
        } else {
          n.fillStyle = "#e9ddff";
          n.fillRect(x + 27, y + 7, 60, 56);
        }
        n.fillStyle = "#342e40";
        n.font = "bold 9px Arial, sans-serif";
        const short = item.title.length > 20 ? item.title.slice(0, 19) + "…" : item.title;
        n.fillText(short, x + 6, y + 77);
        n.fillStyle = selected.has(item.id) ? "#7c3aed" : "#a39baa";
        n.font = "8px Arial, sans-serif";
        n.fillText(selected.has(item.id) ? "Ням  ✓" : item.category || "Uzum Market", x + 6, y + 90);
      });
    }
    n.fillStyle = "#ffffff";
    n.fillRect(0, 426, yn, 34);
    n.strokeStyle = "#eee9f3";
    n.beginPath(); n.moveTo(0, 426); n.lineTo(yn, 426); n.stroke();
    n.fillStyle = "#7c3aed";
    n.font = "bold 10px Arial, sans-serif";
    n.fillText("⌂  Главная", 12, 447);
    n.fillStyle = "#968ca3";
    n.fillText("♡  Избранное", 90, 447);
    n.fillText("▣  Корзина", 186, 447);
    s.needsUpdate = true;
  }
  return (
    l(null),
    {
      group: i,
      screen: r,
      target: o,
      draw: l,
      setPressed(c) {
        a = c;
      },
    }
  );
}
const S0 = 4,
  b0 = 10,
  E0 = 100,
  y0 = 700,
  T0 = 200;
function yo(i, t) {
  const e = Math.max(0, i);
  return e / (e + t);
}
function nr(i, t, e, n) {
  return e <= 0 ? t : i + (t - i) * (1 - Math.exp(-n / e));
}
function A0() {
  return { drive: 0, turn: 0, wingPhase: 0, reach: 0 };
}
function w0(i, t, e) {
  const n = yo(t.motorHz, S0),
    s = n > i.drive ? E0 : y0;
  i.drive = nr(i.drive, n, s, e);
  const r = Math.sign(t.turnHz) * yo(Math.abs(t.turnHz), b0);
  i.turn = nr(i.turn, r, T0, e);
  const a = 6 + i.drive * 22;
  return (
    (i.wingPhase =
      (i.wingPhase + ((a * e) / 1e3) * Math.PI * 2) % (Math.PI * 2)),
    (i.reach = nr(i.reach, t.reaching ? 1 : 0, t.reaching ? 180 : 420, e)),
    i
  );
}
function R0() {
  const i = new eh();
  i.background = new Yt(723987);
  const t = new Ge(38, 1, 0.1, 100);
  t.position.set(-2.6, 2.3, 5.5);
  const e = new e0({ antialias: !0 });
  (e.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)),
    (e.shadowMap.enabled = !0),
    (e.shadowMap.type = wo));
  let n = null,
    s = null;
  i.add(new uh(4870752, 1.1));
  const r = new ja(16777215, 2.2);
  (r.position.set(4, 6, 3),
    (r.castShadow = !0),
    r.shadow.mapSize.set(1024, 1024),
    i.add(r));
  const a = new ja(7567103, 1.4);
  (a.position.set(-4, 2, -3), i.add(a));
  const o = M0(),
    l = 0.78;
  (o.group.scale.setScalar(l),
    (o.group.rotation.x = -Math.PI / 2),
    (o.group.rotation.z = Math.PI / 2),
    o.group.position.set(0.85, 1.325 * l - 0.05, 0.05),
    i.add(o.group));
  const c = v0();
  (c.group.scale.setScalar(0.66),
    c.group.position.set(-0.7, 0.76, 0),
    (c.group.rotation.y = 0.1),
    i.add(c.group));
  const u = new Ae(new Mi(24, 24), new ha({ color: 921621, roughness: 0.95 }));
  ((u.rotation.x = -Math.PI / 2),
    (u.position.y = -0.05),
    (u.receiveShadow = !0),
    i.add(u));
  const h = A0();
  let f = null,
    p = 0,
    _ = 0,
    S = performance.now(),
    m = 0,
    mobile = zc(),
    lastMobileFrame = 0;
  const d = c.group.position.y;
  function E() {
    m = requestAnimationFrame(E);
    const b = performance.now();
    if (document.hidden) { S = b; return; }
    if (mobile && b - lastMobileFrame < 32) return;
    lastMobileFrame = b;
    const y = Math.min(b - S, 100);
    S = b;
    const R = f?.activity;
    w0(
      h,
      { motorHz: R?.motor_hz ?? 0, turnHz: R?.turn_hz ?? 0, reaching: b < _ },
      y,
    );
    const T = 0.25 + h.drive * 0.95;
    (c.wings.forEach((M, g) => {
      const D = g === 0 ? 1 : -1;
      ((M.rotation.x = Math.sin(h.wingPhase) * T * D),
        (M.rotation.z = D * (0.12 + h.drive * 0.2)));
    }),
      (c.head.rotation.y = h.turn * 0.45),
      (c.group.rotation.z = -h.turn * 0.08));
    const w = b / 1e3;
    c.group.position.y = d + Math.sin(w * 2.1) * (0.008 + h.drive * 0.022);
    const { pointer: L } = c;
    ((L.coxa.rotation.x = L.restCoxa.x - h.reach * 0.75),
      (L.coxa.rotation.z = L.restCoxa.z + h.reach * 0.18),
      (L.femur.rotation.x = L.restFemur.x + h.reach * 0.5),
      c.legs.forEach((M, g) => {
        if (M === L) return;
        const D = g % 3 !== 0,
          N = Math.sin(w * 3 + g) * h.drive * (D ? 0.025 : 0.1);
        M.coxa.rotation.x = M.restCoxa.x + N;
      }),
      n?.update(),
      e.render(i, t));
  }
  return {
    mount(b) {
      ((s = b),
        b.appendChild(e.domElement),
        (n = new i0(t, e.domElement)),
        (n.enableDamping = !0),
        (n.dampingFactor = 0.08),
        (n.enablePan = !1),
        (n.minDistance = 2.2),
        (n.maxDistance = 10),
        (n.maxPolarAngle = Math.PI * 0.49),
        n.target.set(0.25, 0.32, 0),
        this.resize(),
        (m = requestAnimationFrame(E)));
    },
    update(b) {
      if (((f = b), o.draw(b), !b)) return;
      const y = b.selection.selected.length;
      (y > p && (_ = performance.now() + 900), (p = y));
    },
    reach(b = 1200) {
      ((_ = performance.now() + b),
        o.setPressed(!0),
        o.draw(f),
        window.setTimeout(() => {
          (o.setPressed(!1), o.draw(f));
        }, 320));
    },
    resize() {
      if (!s) return;
      const { clientWidth: b, clientHeight: y } = s;
      !b ||
        !y ||
        (e.setSize(b, y, !1), (t.aspect = b / y), (t.fov = Math.max(38, Math.min(52, 41.8 / (b / y)))), t.updateProjectionMatrix());
    },
    measure() {
      const b = (T) => new gi().setFromObject(T),
        y = b(c.group),
        R = b(o.group);
      return {
        fly: { min: y.min.toArray(), max: y.max.toArray() },
        phone: { min: R.min.toArray(), max: R.max.toArray() },
        floorY: u.position.y,
        flyLowestY: y.min.y,
      };
    },
    dispose() {
      (cancelAnimationFrame(m),
        n?.dispose(),
        e.dispose(),
        e.domElement.remove());
    },
  };
}
const C0 = document.getElementById("app");
function De(i, t, e) {
  const n = document.createElement(i);
  return (t && (n.className = t), e !== void 0 && (n.textContent = e), n);
}
class P0 {
  stage = De("div", "zone zone--stage");
  switcher = De("nav", "rooms");
  footer;
  confirmAt = 0;
  confirmDone = !1;
  categories = new Rc();
  cns = new Lc();
  room = new Fc();
  scene = R0();
  stopPolling = null;
  index = null;
  async mount() {
    const t = await mc();
    this.footer = new Vc(t);
    const e = De("header", "top"),
      n = De("div", "top__left"),
      s = De("div", "brand"),
      r = De("img", "brand__icon");
    ((r.src = "/icons/fly-pixel.svg"),
      (r.alt = ""),
      s.append(
        r,
        De("span", "brand__cashback", "UZUM"),
        De("span", "brand__fly", "FLY"),
      ),
      n.append(s));
    const a = De("div", "top__partner"),
      o = De("a", "partner__link");
    ((o.href = t.payUrl),
      (o.target = "_blank"),
      (o.rel = "noopener noreferrer"));
    const l = De("img", "partner__logo");
    ((l.src = "/icons/uzum-market.svg"),
      (l.alt = "Uzum Market"),
      o.append(l),
      a.append(o),
      e.append(n, a));
    const c = De("p", "stage-caption");
    c.append(
      document.createTextNode(D0),
      document.createElement("br"),
      document.createTextNode(L0),
    );
    const u = De("main", "grid");
    (u.append(
      c,
      this.stage,
      this.categories.root,
      this.room.root,
      this.cns.root,
    ),
      C0.append(e, this.switcher, u, this.footer.root),
      this.scene.mount(this.stage),
      this.setupStageInteraction(),
      new ResizeObserver(() => this.scene.resize()).observe(this.stage),
      window.addEventListener("resize", () => this.scene.resize()),
      this.start());
  }
  setupStageInteraction() {
    const hint = De("div", "stage-hint", "ТЯНИ, ЧТОБЫ ВРАЩАТЬ · КОЛЕСО — МАСШТАБ");
    const toggle = De("button", "stage-touch-toggle", "Вращать муху");
    toggle.type = "button";
    toggle.setAttribute("aria-pressed", "false");
    toggle.addEventListener("click", () => {
      const enabled = this.stage.toggleAttribute("data-interactive");
      toggle.setAttribute("aria-pressed", String(enabled));
      toggle.textContent = enabled ? "Готово" : "Вращать муху";
    });
    this.stage.append(hint, toggle);
  }
  async start() {
    try {
      this.index = await xc();
    } catch (s) {
      console.error("воркер не отвечает", s);
      return;
    }
    const t = Number(this.index.provenance.decision_pool_size ?? 0);
    this.room.setPoolSize(t);
    try {
      this.cns.setMap(await _c());
    } catch (s) {
      console.error("карта ЦНС не загрузилась", s);
    }
    this.renderSwitcher();
    const e = vc(),
      n = this.index.rooms.some((s) => s.id === e);
    this.select(n ? e : this.index.rooms[0]?.id, n);
  }
  renderSwitcher() {
    const t = this.index?.rooms ?? [];
    ((this.switcher.hidden = t.length < 2),
      this.switcher.replaceChildren(
        ...t.map((e) => {
          const n = De("button", "rooms__item", e.title);
          return (
            (n.type = "button"),
            (n.dataset.id = e.id),
            n.addEventListener("click", () => this.select(e.id)),
            n
          );
        }),
      ));
  }
  select(t, e = !0) {
    if (!t) {
      console.error("в индексе нет ни одной комнаты");
      return;
    }
    (this.stopPolling?.(), e && Mc(t));
    for (const n of this.switcher.querySelectorAll("button"))
      n.toggleAttribute("data-current", n.dataset.id === t);
    this.stopPolling = gc(t, {
      onSnapshot: (n) => this.render(n),
      onError: (n) => console.error("снимок недоступен", n),
    });
  }
  render(t) {
    this.categories.render(t);
    const visible = { ...t, selection: { ...t.selection, selected: this.categories.shown } };
    this.cns.update(t);
    this.room.render(visible);
    this.scene.update(visible);
    this.scheduleConfirm(t);
  }
  scheduleConfirm(t) {
    if (!this.categories.allShown(t)) {
      ((this.confirmAt = 0), (this.confirmDone = !1));
      return;
    }
    const e = performance.now();
    if (!this.confirmAt) {
      this.confirmAt = e + U0;
      return;
    }
    !this.confirmDone &&
      e >= this.confirmAt &&
      ((this.confirmDone = !0), this.scene.reach(), this.categories.press());
  }
}
const D0 = "МУХА НЮХАЕТ 24 252 ТОВАРА UZUM MARKET И ВЫБИРАЕТ ДЛЯ ВАС",
  L0 = "51 ГЛОМЕРУЛА → 4 678 КЛЕТОК КЕНЬОНА → 234 ПОБЕДИТЕЛЯ → MBON «НЯМ / ФУ» → 12 ТОВАРОВ · 0 GPU",
  U0 = 5e3,
  oc = new P0();
oc.mount();
window.__fly = oc;
