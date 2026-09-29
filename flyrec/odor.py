"""Товар → «запах»: ответ 51 обонятельной гломерулы.

У мухи 51 тип обонятельных рецепторных нейронов (ORN) на уровне гломерул
в этой выборке FlyWire. Любой запах для неё — вектор из 51 числа. Мы делаем то же
с товаром: берём текстовый эмбеддинг (384 измерения), проецируем на 51 главную
компоненту каталога и превращаем в неотрицательную «частоту разрядов» ORN.

Какая компонента попадает в какую гломерулу — выбор модели, а не биологии.
По умолчанию самая «объёмная» компонента идёт в гломерулу с наибольшим выходом
на клетки Кеньона; ноутбук проверяет, насколько результат зависит от этого.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


def softplus(x: np.ndarray) -> np.ndarray:
    return np.logaddexp(0.0, x)


@dataclass
class OdorEncoder:
    mean: np.ndarray        # [D]
    components: np.ndarray  # [G, D], строки упорядочены по гломерулам
    scale: np.ndarray       # [G]

    @classmethod
    def fit(cls, emb: np.ndarray, glom_strength: np.ndarray, permutation: np.ndarray | None = None) -> "OdorEncoder":
        """PCA каталога → G компонент; i-я по дисперсии → i-я по силе гломерула."""
        x = emb.astype(np.float32)
        mean = x.mean(0)
        _, s, vt = np.linalg.svd(x - mean, full_matrices=False)
        g = len(glom_strength)
        comps = vt[:g]
        scale = s[:g] / np.sqrt(len(x) - 1)
        order = np.argsort(-glom_strength, kind="stable") if permutation is None else permutation
        rows = np.empty_like(comps)
        scales = np.empty_like(scale)
        rows[order] = comps
        scales[order] = scale
        return cls(mean, rows, scales)

    def orn(self, emb: np.ndarray) -> np.ndarray:
        """ORN-ответ [n, G] ≥ 0: softplus от стандартизованной проекции."""
        z = (emb.astype(np.float32) - self.mean) @ self.components.T / self.scale
        return softplus(z).astype(np.float32)


def antennal_lobe(orn: np.ndarray, sigma: float = 0.3, m: float = 0.6) -> np.ndarray:
    """ORN → PN: divisive normalization (Olsen, Bhandawat, Wilson 2010) и центрирование.

    PN = r^1.5 / (r^1.5 + σ^1.5 + (m·mean r)^1.5); затем вычитаем среднее по
    гломерулам — роль латеральных ГАМК-интернейронов (и шаг «centering»
    в FlyHash, Dasgupta et al. 2017).
    """
    r = np.power(np.maximum(orn, 0), 1.5)
    inhib = np.power(m * orn.mean(-1, keepdims=True), 1.5)
    pn = r / (r + sigma ** 1.5 + inhib)
    return (pn - pn.mean(-1, keepdims=True)).astype(np.float32)
