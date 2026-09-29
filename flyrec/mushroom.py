"""Грибовидное тело: PN → KC → APL (winner-take-all) → MBON.

Главный объект — матрица W [гломерулы × клетки Кеньона]. В варианте
`flywire` это настоящие синапсы из коннектома; в контролях — та же форма,
но другая проводка. Всё остальное (вход, APL, k) у вариантов одинаковое,
поэтому разница в метриках относится именно к проводке.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from scipy import sparse

SPARSITY = 0.05  # APL оставляет ~5% клеток Кеньона (Lin et al. 2014; FlyHash)


@dataclass
class MushroomBody:
    W: np.ndarray               # [G, K]
    name: str
    sparsity: float = SPARSITY

    @property
    def n_kc(self) -> int:
        return self.W.shape[1]

    @property
    def k(self) -> int:
        return max(1, int(round(self.sparsity * self.n_kc)))

    def drive(self, pn: np.ndarray) -> np.ndarray:
        """Вход каждой KC [n, K]: взвешенное среднее её PN, затем гомеостаз.

        Гомеостаз (Apostolopoulou & Lin 2020): каждая KC подстраивает
        возбудимость под свою типичную нагрузку, иначе клетки с 1–2 входами
        горят на четверти каталога и код вырождается.
        """
        d = pn @ self._Wn
        if self.mu is not None:
            d = (d - self.mu) / self.sd
        return d

    def fit_homeostasis(self, pn: np.ndarray) -> "MushroomBody":
        d = pn @ self._Wn
        self.mu = d.mean(0).astype(np.float32)
        self.sd = (d.std(0) + 1e-6).astype(np.float32)
        return self

    def codes(self, pn: np.ndarray, batch: int = 4096) -> np.ndarray:
        """Индексы k самых возбуждённых KC [n, k] — работа APL-нейрона."""
        out = np.empty((len(pn), self.k), dtype=np.int32)
        for start in range(0, len(pn), batch):
            d = self.drive(pn[start:start + batch])
            out[start:start + batch] = np.argpartition(-d, self.k - 1, axis=1)[:, :self.k]
        return out

    def code_matrix(self, codes: np.ndarray) -> sparse.csr_matrix:
        n, k = codes.shape
        data = np.ones(n * k, dtype=np.float32)
        return sparse.csr_matrix((data, (np.repeat(np.arange(n), k), codes.ravel())), shape=(n, self.n_kc))

    def __post_init__(self):
        self.mu = self.sd = None
        norm = self.W.sum(0, keepdims=True)
        self._Wn = (self.W / np.where(norm > 0, norm, 1)).astype(np.float32)


def flywire(circuit: dict) -> MushroomBody:
    return MushroomBody(circuit["W"].astype(np.float32), "FlyWire (настоящая муха)")


def flywire_binary(circuit: dict) -> MushroomBody:
    return MushroomBody((circuit["W"] > 0).astype(np.float32), "FlyWire без весов")


def shuffled(circuit: dict, seed: int = 0) -> MushroomBody:
    """Перемешанная простая двудольная сеть с теми же степенями и весами KC.

    Переключаем пары рёбер (g1, k1), (g2, k2) на (g2, k1), (g1, k2)
    только если обе новые пары свободны. Вес остаётся у своей KC: так
    сохраняются не только степени обеих сторон, но и набор входных весов
    каждой KC. Фиксированное число попыток не зацикливается на плотных
    или структурно неперемешиваемых графах.
    """
    W = circuit["W"]
    g, k = np.nonzero(W)
    g = g.copy()
    k = k.copy()
    w = W[g, k].copy()
    rng = np.random.default_rng(seed)
    occupied = W != 0
    n_edges = len(g)
    if n_edges >= 2:
        pairs = rng.integers(n_edges, size=(10 * n_edges, 2))
        for i, j in pairs:
            g1, g2 = g[i], g[j]
            k1, k2 = k[i], k[j]
            if g1 == g2 or k1 == k2 or occupied[g2, k1] or occupied[g1, k2]:
                continue
            occupied[g1, k1] = occupied[g2, k2] = False
            occupied[g2, k1] = occupied[g1, k2] = True
            g[i], g[j] = g2, g1
    out = np.zeros_like(W, dtype=np.float32)
    out[g, k] = w
    return MushroomBody(out, f"Перемешанная проводка (seed {seed})")


def random_flyhash(circuit: dict, seed: int = 0) -> MushroomBody:
    """FlyHash (Dasgupta et al. 2017): бинарные входы из равномерно случайных
    гломерул. Число входов у KC берём как у настоящей, чтобы сравнение было честным."""
    W = circuit["W"]
    indeg = (W > 0).sum(0)
    rng = np.random.default_rng(seed)
    out = np.zeros_like(W, dtype=np.float32)
    for j, d in enumerate(indeg):
        out[rng.choice(W.shape[0], size=max(1, d), replace=False), j] = 1
    return MushroomBody(out, f"Случайный FlyHash (seed {seed})")


@dataclass
class MBONValence:
    """Выходные нейроны грибовидного тела и дофаминовое обучение.

    Начальные веса KC → MBON — синапсы FlyWire: к холинергическим MBON
    («подойти») и глутаматергическим («уйти»). Лайк = награда: PAM-дофамин
    ослабляет синапсы активных KC на MBON избегания. Дизлайк = наказание:
    PPL1 ослабляет синапсы на MBON приближения (LTD, Hige et al. 2015).
    """

    w_app: np.ndarray
    w_avoid: np.ndarray
    lr: float = 0.35
    app: np.ndarray = field(init=False)
    avoid: np.ndarray = field(init=False)

    def __post_init__(self):
        scale = max(self.w_app.mean(), self.w_avoid.mean(), 1e-6)
        self.app0 = (self.w_app / scale).astype(np.float32)
        self.avoid0 = (self.w_avoid / scale).astype(np.float32)
        self.reset()

    def reset(self):
        self.app = self.app0.copy()
        self.avoid = self.avoid0.copy()

    def valence(self, codes: np.ndarray, learned_only: bool = False) -> np.ndarray:
        v = self.app[codes].mean(1) - self.avoid[codes].mean(1)
        if learned_only:
            v -= self.app0[codes].mean(1) - self.avoid0[codes].mean(1)
        return v

    def feedback(self, code: np.ndarray, reward: int):
        if reward > 0:
            self.avoid[code] *= 1 - self.lr
        elif reward < 0:
            self.app[code] *= 1 - self.lr
