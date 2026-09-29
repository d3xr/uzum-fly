"""Спайковая симуляция всего мозга мухи кодом Shiu et al. (vendor/drosophila_brain_model).

Модель: ~139 тыс. leaky integrate-and-fire нейронов, ~15 млн связей FlyWire v783,
вес связи = число синапсов × знак медиатора (Shiu et al., Nature 2024).
Мы не меняем их модель; добавляем только «нос» — какие ORN и с какой частотой
возбуждать, чтобы муха понюхала товар:

- гломерулы ранжируются по ответу PN на запах товара/сессии;
- ORN из top-N гломерул получают Poisson-вход r_poi (сильный запах),
  следующих N — r_poi2 (слабый). Так устроен API исходной модели: два класса входа.

Выход: спайки всех нейронов. Из них берём частоты PN, KC, APL и MBON.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

from . import ROOT
from .connectome import fetch

sys.path.insert(0, str(ROOT / "vendor" / "drosophila_brain_model"))


def odor_to_orn_inputs(pn: np.ndarray, glomeruli: np.ndarray, orn_ids: np.ndarray, orn_glom: np.ndarray, n_strong: int = 8, n_weak: int = 8):
    order = [g for g in np.argsort(-pn) if pn[g] > 0]
    strong = set(glomeruli[order[:n_strong]])
    weak = set(glomeruli[order[n_strong:n_strong + n_weak]])
    exc = [int(i) for i, g in zip(orn_ids, orn_glom) if g in strong]
    exc2 = [int(i) for i, g in zip(orn_ids, orn_glom) if g in weak]
    return exc, exc2, sorted(strong), sorted(weak)


def simulate(exc_ids: list[int], exc2_ids: list[int], t_run_ms: float = 300, r_strong: float = 150, r_weak: float = 50, seed: int = 0) -> pd.DataFrame:
    """Один прогон модели Shiu et al. Возвращает спайки: flywire_id, t (с)."""
    from brian2 import Hz, ms, seed as brian_seed, prefs
    import model as shiu

    prefs.codegen.target = "numpy" if not _cython_ok() else "cython"
    brian_seed(seed)
    comp = pd.read_csv(fetch("Completeness_783.csv"), index_col=0)
    flyid2i = {f: i for i, f in enumerate(comp.index)}
    params = dict(shiu.default_params)
    params.update(t_run=t_run_ms * ms, r_poi=r_strong * Hz, r_poi2=r_weak * Hz)
    exc = [flyid2i[i] for i in exc_ids if i in flyid2i]
    exc2 = [flyid2i[i] for i in exc2_ids if i in flyid2i]
    spk = shiu.run_trial(exc, exc2, [], fetch("Completeness_783.csv"), fetch("Connectivity_783.parquet"), params)
    i2flyid = {i: f for f, i in flyid2i.items()}
    return pd.DataFrame(
        [(i2flyid[i], float(t)) for i, ts in spk.items() for t in ts],
        columns=["flywire_id", "t"],
    )


def rates(spikes: pd.DataFrame, ids: np.ndarray, t_run_ms: float) -> np.ndarray:
    counts = spikes.flywire_id.value_counts()
    return counts.reindex(ids, fill_value=0).to_numpy(np.float32) / (t_run_ms / 1000)


def _cython_ok() -> bool:
    try:
        import Cython  # noqa: F401
        return True
    except ImportError:
        return False
