"""Проверка статического хэша спайковой моделью всего мозга (Shiu et al.).

Для каждой синтетической сессии даём мухе «понюхать» смесь запахов через ORN
в полной LIF-модели FlyWire (vendor/drosophila_brain_model, без изменений)
и сравниваем, какие клетки Кеньона реально спайкуют, со статическим кодом.

Метрики на стимул:
- доли активных PN и KC (у живой мухи KC разрежены: ~5–10%);
- Spearman между частотой KC и статическим входом KC (без гомеостаза и с ним);
- overlap: сколько из top-k спайкующих KC попало в статический код vs случайно;
- частоты APL и MBON (холинергические «подойти» vs глутаматергические «уйти»).

Спайки нейронов карты сохраняются для визуализации (реальная активность).
Запуск: PYTHONPATH=. .venv/bin/python experiments/lif_validation.py [--personas gamer,cat] [--levels weak,strong]
Результаты дописываются в data/fly/lif_results.json (пары персона × интенсивность не повторяются).
"""

from __future__ import annotations

import json
import time

import numpy as np
from scipy.stats import spearmanr

from flyrec import DATA, ROOT, connectome, lif, mushroom
from flyrec.odor import OdorEncoder, antennal_lobe

T_RUN_MS = 300
INTENSITIES = {
    "trace": dict(n_strong=1, n_weak=0, r_strong=20, r_weak=0),
    "faint": dict(n_strong=1, n_weak=2, r_strong=60, r_weak=20),
    "weak": dict(n_strong=3, n_weak=3, r_strong=60, r_weak=20),
    "strong": dict(n_strong=8, n_weak=8, r_strong=150, r_weak=50),
}


def main(personas: set[str] | None = None, levels: list[str] | None = None):
    circuit = connectome.load()
    catalog = json.loads((ROOT / "data/catalog.json").read_text())
    by_id = {p["id"]: i for i, p in enumerate(catalog)}
    model = json.loads((DATA / "model.json").read_text())
    emb = np.load(DATA / "item_emb.npy").astype(np.float32)
    enc = OdorEncoder.fit(emb, circuit["W"].sum(1))
    orn = enc.orn(emb)
    body = mushroom.flywire(circuit).fit_homeostasis(antennal_lobe(orn))
    cns = json.loads((ROOT / "public/api/cns.json").read_text())
    map_ids = circuit["map_ids"]  # тот же порядок, что слоты карты (export_fly_index)
    kc_ids = circuit["kc_ids"]
    rng = np.random.default_rng(0)

    path = DATA / "lif_results.json"
    out = json.loads(path.read_text()) if path.exists() else {"t_run_ms": T_RUN_MS, "stimuli": []}
    done = {(s["persona"], s["intensity"]) for s in out["stimuli"]}
    for persona in model["personas"]:
        if personas and persona["id"] not in personas:
            continue
        idx = [by_id[i] for i in persona["items"]]
        mix = orn[idx].mean(0)
        pn = antennal_lobe(mix[None])[0]
        raw_drive = pn @ body._Wn
        drive = body.drive(pn[None])[0]
        code = set(body.codes(pn[None])[0].tolist())
        for level in levels or ["weak", "strong"]:
            cfg = INTENSITIES[level]
            if (persona["id"], level) in done:
                continue
            exc, exc2, strong, weak = lif.odor_to_orn_inputs(pn, circuit["glomeruli"], circuit["orn_ids"], circuit["orn_glom"], cfg["n_strong"], cfg["n_weak"])
            t = time.time()
            spikes = lif.simulate(exc, exc2, T_RUN_MS, cfg["r_strong"], cfg["r_weak"])
            sim_s = time.time() - t
            kc_rate = lif.rates(spikes, kc_ids, T_RUN_MS)
            pn_rate = lif.rates(spikes, circuit["pn_ids"], T_RUN_MS)
            mbon_rate = lif.rates(spikes, circuit["mbon_ids"], T_RUN_MS)
            apl_rate = lif.rates(spikes, circuit["apl_ids"], T_RUN_MS)
            top = set(np.argsort(-kc_rate)[: body.k].tolist()) if (kc_rate > 0).any() else set()
            chance = np.mean([len(set(rng.choice(body.n_kc, body.k, replace=False)) & code) for _ in range(200)])
            nt = circuit["mbon_nt"]
            counts = spikes.flywire_id.value_counts()
            map_spikes = counts.reindex(map_ids, fill_value=0).to_numpy()
            row = {
                "persona": persona["id"], "title": persona["title"], "intensity": level, **cfg,
                "strong_glomeruli": strong, "weak_glomeruli": weak,
                "sim_seconds": round(sim_s, 1),
                "neurons_spiking": int(spikes.flywire_id.nunique()),
                "pn_active": float((pn_rate > 0).mean()),
                "kc_active": float((kc_rate > 0).mean()),
                "apl_hz": float(apl_rate.mean()),
                "mbon_approach_hz": float(mbon_rate[nt == "acetylcholine"].mean()),
                "mbon_avoid_hz": float(mbon_rate[nt == "glutamate"].mean()),
                "spearman_raw_drive": float(spearmanr(kc_rate, raw_drive).statistic),
                "spearman_homeostatic_drive": float(spearmanr(kc_rate, drive).statistic),
                "topk_overlap_with_static_code": len(top & code),
                "topk_overlap_chance": float(chance),
                "k": body.k,
                "map_spikes_sparse": [[int(s), int(c)] for s, c in enumerate(map_spikes) if c],
            }
            print(f"{persona['id']:8s} {level:6s} {sim_s:6.0f}s KC active={row['kc_active']:.2f} ρ_raw={row['spearman_raw_drive']:.2f} ρ_homeo={row['spearman_homeostatic_drive']:.2f} overlap={row['topk_overlap_with_static_code']}/{body.k} (chance {chance:.0f})", flush=True)
            out["stimuli"].append(row)
            path.write_text(json.dumps(out, ensure_ascii=False))
    assert cns["neurons"] == len(map_ids)


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--personas")
    ap.add_argument("--levels")
    a = ap.parse_args()
    main(set(a.personas.split(",")) if a.personas else None, a.levels.split(",") if a.levels else None)
