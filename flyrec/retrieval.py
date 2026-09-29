"""Retrieval по KC-кодам и метрики.

Близость двух товаров для мухи — сколько клеток Кеньона у них загорелось
одновременно (overlap двух разреженных кодов). Индекс — инвертированный:
для каждой KC список товаров, где она активна.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

import numpy as np
from scipy import sparse

from .mushroom import MushroomBody
from .odor import OdorEncoder, antennal_lobe


@dataclass
class FlyIndex:
    body: MushroomBody
    encoder: OdorEncoder
    orn: np.ndarray            # [N, G] ORN каталога
    codes: np.ndarray          # [N, k]
    matrix: sparse.csr_matrix  # [N, K] бинарный

    @classmethod
    def build(cls, body: MushroomBody, encoder: OdorEncoder, emb: np.ndarray) -> "FlyIndex":
        orn = encoder.orn(emb)
        pn = antennal_lobe(orn)
        codes = body.fit_homeostasis(pn).codes(pn)
        return cls(body, encoder, orn, codes, body.code_matrix(codes))

    def session_code(self, item_idx: list[int], weights: list[float] | None = None) -> np.ndarray:
        """Сессия = смесь запахов просмотренных товаров (ORN складываются)."""
        w = np.ones(len(item_idx)) if weights is None else np.asarray(weights, dtype=np.float32)
        mix = (self.orn[item_idx] * w[:, None]).sum(0) / w.sum()
        return self.body.codes(antennal_lobe(mix[None]))[0]

    def overlap(self, query_codes: np.ndarray) -> np.ndarray:
        """[q, N] число общих активных KC."""
        q = self.body.code_matrix(np.atleast_2d(query_codes))
        return (q @ self.matrix.T).toarray()

    def retrieve(self, query_code: np.ndarray, k: int = 200, exclude: list[int] | None = None) -> tuple[np.ndarray, np.ndarray]:
        s = self.overlap(query_code)[0].astype(np.float32)
        if exclude:
            s[exclude] = -1
        top = np.argpartition(-s, k)[:k]
        top = top[np.argsort(-s[top], kind="stable")]
        return top, s[top] / self.body.k


# ---------- метрики ----------

def topk_from_scores(scores: np.ndarray, k: int, exclude_self: np.ndarray | None = None,
                     seed: int = 0, tie_jitter: bool = False) -> np.ndarray:
    """top-k по строкам; шум допустим только для дискретных оценок с ничьими."""
    s = scores.astype(np.float64)
    if tie_jitter:
        s = s + np.random.default_rng(seed).random(scores.shape) * 1e-3
    if exclude_self is not None:
        s[np.arange(len(s)), exclude_self] = -np.inf
    top = np.argpartition(-s, k - 1, axis=1)[:, :k]
    order = np.take_along_axis(s, top, 1).argsort(1)[:, ::-1]
    return np.take_along_axis(top, order, 1)


def exact_neighbors(emb: np.ndarray, queries: np.ndarray, k: int = 100) -> np.ndarray:
    sims = emb[queries].astype(np.float32) @ emb.astype(np.float32).T
    return topk_from_scores(sims, k, exclude_self=queries)


def mean_average_precision(ranked: np.ndarray, truth: np.ndarray) -> float:
    """mAP ранжированного списка относительно множества истинных соседей (как в Dasgupta 2017)."""
    aps = []
    for r, t in zip(ranked, truth):
        hit = np.isin(r, t)
        if not hit.any():
            aps.append(0.0)
            continue
        prec = np.cumsum(hit) / np.arange(1, len(r) + 1)
        aps.append(float((prec * hit).sum() / len(t)))
    return float(np.mean(aps))


def recall_at(ranked: np.ndarray, truth: np.ndarray) -> float:
    return float(np.mean([np.isin(t, r).mean() for r, t in zip(ranked, truth)]))


def category_precision(ranked: np.ndarray, labels: np.ndarray, queries: np.ndarray) -> float:
    return float((labels[ranked] == labels[queries][:, None]).mean())


def kc_health(codes: np.ndarray, n_kc: int) -> dict:
    """Проверки из boltzmann-fly: не умерли ли KC и не схлопнулся ли код."""
    counts = np.bincount(codes.ravel(), minlength=n_kc)
    active_share = counts / len(codes)
    return {
        "dead_kc_share": float((counts == 0).mean()),
        "max_kc_activity": float(active_share.max()),
        "p99_kc_activity": float(np.quantile(active_share, 0.99)),
    }


def glomerulus_coverage(body: MushroomBody, orn: np.ndarray, sample: int = 300, delta: float = 1.0, seed: int = 0) -> np.ndarray:
    """Доля KC-кода, меняющаяся при усилении одной гломерулы. Ноль = вход не доходит до KC."""
    rng = np.random.default_rng(seed)
    x = orn[rng.choice(len(orn), size=min(sample, len(orn)), replace=False)]
    base = body.codes(antennal_lobe(x))
    base_m = body.code_matrix(base)
    out = np.zeros(orn.shape[1], dtype=np.float32)
    for g in range(orn.shape[1]):
        y = x.copy()
        y[:, g] += delta
        new = body.code_matrix(body.codes(antennal_lobe(y)))
        out[g] = 1 - float(np.asarray(base_m.multiply(new).sum(1)).mean()) / body.k
    return out


def title_key(title: str) -> str:
    """Ключ дедупликации, как titleKey в server.mjs."""
    return re.sub(r"[^\w]+", " ", title.lower()).replace("_", " ")[:42]


def mbon_rank(index: FlyIndex, mbon, query_code: np.ndarray, likes=(), dislikes=(), retrieve: int = 200, show: int = 12,
              exclude=(), boost: float = 2.5, titles=None) -> tuple[np.ndarray, np.ndarray]:
    """Полный «муховый комбайн», как в lib/fly.mjs: retrieval по overlap → MBON-ранкер.

    Лайки/дизлайки применяются как дофаминовое LTD синапсов KC → MBON, затем
    score = overlap/k + boost · (выученная валентность). Возвращает (индексы, score).
    """
    mbon.reset()
    for i in likes:
        mbon.feedback(index.codes[i], +1)
    for i in dislikes:
        mbon.feedback(index.codes[i], -1)
    cand, fly = index.retrieve(query_code, k=retrieve, exclude=list(exclude) + list(dislikes))
    score = fly + boost * mbon.valence(index.codes[cand], learned_only=True)
    order = np.argsort(-score, kind="stable")
    if titles is not None:  # одинаковые карточки разных продавцов показываем один раз
        seen, keep = set(), []
        for o in order:
            key = title_key(titles[cand[o]])
            if key not in seen:
                seen.add(key)
                keep.append(o)
        order = np.array(keep, dtype=int)
    order = order[:show]
    return cand[order], score[order]
