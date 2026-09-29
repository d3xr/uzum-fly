"""Офлайн-эксперимент: помогает ли настоящая проводка мухи искать похожие товары?

Задача как в Dasgupta et al. 2017: для товара-запроса найти его 100 ближайших
соседей по исходному эмбеддингу (384 измерения), имея только разреженный
KC-код. Дополнительно — доля выдачи из той же категории.

Сравниваем при одинаковом входе, одинаковом APL (5% KC) и гомеостазе:
- FlyWire: синапсы PN → KC из коннектома;
- перемешанная проводка: те же степени у KC и гломерул, рёбра случайны;
- случайный FlyHash: входы KC из равномерно случайных гломерул;
- SimHash (LSH) с 234 битами против 4 678-битного KC-кода, по 51-мерному PN-входу;
- плотный косинус по 51 PN (потолок при узком горле из 51 гломерулы).

Отдельная абляция — как главные компоненты разложены по гломерулам:
по силе гломерулы (по умолчанию) или случайно.

Запуск: PYTHONPATH=. .venv/bin/python experiments/offline_eval.py
Результат: data/fly/eval_results.json (агрегаты, без пользовательских данных).
"""

from __future__ import annotations

import json
import time

import numpy as np

from flyrec import DATA, connectome, mushroom, retrieval as R
from flyrec.odor import OdorEncoder, antennal_lobe

N_QUERIES = 1000
SEEDS = [0, 1, 2, 3, 4]
TRUTH_K = 100


def simhash_scores(pn: np.ndarray, q: np.ndarray, bits: int, seed: int) -> np.ndarray:
    proj = np.random.default_rng(seed).normal(size=(pn.shape[1], bits)).astype(np.float32)
    b = (pn @ proj > 0).astype(np.float32) * 2 - 1
    return b[q] @ b.T  # = bits − 2·Hamming


def main() -> dict:
    t0 = time.time()
    circuit = connectome.load()
    emb = np.load(DATA / "item_emb.npy").astype(np.float32)
    catalog = json.loads((DATA.parent / "catalog.json").read_text())
    leaf = np.array([i["leaf"] for i in catalog])
    l2 = np.array([i["category"] for i in catalog])
    strength = circuit["W"].sum(1)
    G = len(strength)

    q = np.random.default_rng(2026).choice(len(emb), N_QUERIES, replace=False)
    truth = R.exact_neighbors(emb, q, TRUTH_K)

    def score(ranked_scores: np.ndarray, discrete: bool = False) -> dict:
        r = R.topk_from_scores(ranked_scores, TRUTH_K, exclude_self=q, tie_jitter=discrete)
        return {
            "map": R.mean_average_precision(r, truth),
            "recall100": R.recall_at(r, truth),
            "leaf_p20": R.category_precision(r[:, :20], leaf, q),
            "l2_p20": R.category_precision(r[:, :20], l2, q),
        }

    rows = []

    def add(variant: str, mapping: str, seed: int | None, metrics: dict, extra: dict | None = None):
        rows.append({"variant": variant, "mapping": mapping, "seed": seed, **metrics, **(extra or {})})
        print(f"{variant:18s} {mapping:8s} seed={seed!s:4s} mAP={metrics['map']:.3f} leafP@20={metrics['leaf_p20']:.3f}")

    add("dense_384", "-", None, score(emb[q] @ emb.T))

    mappings = {"strength": None, **{f"random{s}": np.random.default_rng(100 + s).permutation(G) for s in SEEDS}}
    for mname, perm in mappings.items():
        enc = OdorEncoder.fit(emb, strength, perm)
        pn = antennal_lobe(enc.orn(emb))
        pnn = pn / np.linalg.norm(pn, axis=1, keepdims=True)
        if mname == "strength":
            add("dense_pn51", mname, None, score(pnn[q] @ pnn.T))
        bodies = [("flywire", None, mushroom.flywire(circuit))]
        bodies += [("shuffled", s, mushroom.shuffled(circuit, s)) for s in SEEDS]
        bodies += [("random_flyhash", s, mushroom.random_flyhash(circuit, s)) for s in SEEDS]
        for variant, seed, body in bodies:
            idx = R.FlyIndex.build(body, enc, emb)
            health = R.kc_health(idx.codes, body.n_kc)
            add(variant, mname, seed, score(idx.overlap(idx.codes[q]), discrete=True), health)
        if mname == "strength":
            k = mushroom.flywire(circuit).k
            for s in SEEDS:
                add("simhash_pn51", mname, s, score(simhash_scores(pn, q, k, s), discrete=True))

    # Покрытие входа (урок boltzmann-fly): доходит ли каждая гломерула до KC.
    enc = OdorEncoder.fit(emb, strength)
    body = mushroom.flywire(circuit)
    idx = R.FlyIndex.build(body, enc, emb)
    coverage = R.glomerulus_coverage(body, idx.orn)

    # Скорость: построение индекса и запрос сессии на всём каталоге.
    t = time.time()
    R.FlyIndex.build(mushroom.flywire(circuit), enc, emb)
    build_s = time.time() - t
    t = time.time()
    for i in range(200):
        idx.retrieve(idx.session_code([i, i + 1, i + 2]), k=200)
    query_ms = (time.time() - t) / 200 * 1000

    result = {
        "catalog_size": int(len(emb)),
        "n_queries": N_QUERIES,
        "truth_k": TRUTH_K,
        "n_glomeruli": int(G),
        "n_kc": int(body.n_kc),
        "active_kc": int(body.k),
        "rows": rows,
        "glomerulus_coverage": {str(g): float(v) for g, v in zip(circuit["glomeruli"], coverage)},
        "timing": {"index_build_s": round(build_s, 2), "session_query_ms": round(query_ms, 2)},
        "runtime_s": round(time.time() - t0, 1),
    }
    (DATA / "eval_results.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))
    return result


if __name__ == "__main__":
    main()
