"""Извлечение обонятельного контура из публичного коннектома FlyWire v783.

Источники (скачиваются в кеш, в репозиторий не кладутся):
- Connectivity_783.parquet и Completeness_783.csv из репозитория Shiu et al.
  (https://github.com/philshiu/Drosophila_brain_model, MIT) — рёбра всего мозга
  с числом синапсов и знаком по медиатору;
- Supplemental_file1_neuron_annotations.tsv (Schlegel et al. 2024,
  https://github.com/flyconnectome/flywire_annotations) — типы клеток.

Результат — компактный data/fly/mb_circuit.npz (FlyWire, CC BY 4.0):
матрица «гломерула → клетка Кеньона», веса KC → MBON и координаты нейронов.
"""

from __future__ import annotations

import os
import urllib.request
from pathlib import Path

import numpy as np
import pandas as pd

from . import DATA

CACHE = Path(os.environ.get("FLYWIRE_CACHE", Path.home() / ".cache" / "uzumfly"))
SOURCES = {
    "Connectivity_783.parquet": "https://raw.githubusercontent.com/philshiu/Drosophila_brain_model/main/Connectivity_783.parquet",
    "Completeness_783.csv": "https://raw.githubusercontent.com/philshiu/Drosophila_brain_model/main/Completeness_783.csv",
    "annotations.tsv": "https://raw.githubusercontent.com/flyconnectome/flywire_annotations/main/supplemental_files/Supplemental_file1_neuron_annotations.tsv",
}
# Порог отсечения шума автоматической разметки синапсов, стандартный для FlyWire.
MIN_SYNAPSES = 5
CIRCUIT = DATA / "mb_circuit.npz"


def fetch(name: str) -> Path:
    path = CACHE / name
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        print(f"download {name} …")
        urllib.request.urlretrieve(SOURCES[name], path)
    return path


def glomerulus(cell_type: str) -> str:
    """'DA1_lPN' → 'DA1', 'ORN_VM6l' → 'VM6' (у PN VM6 не делится на l/m/v)."""
    name = str(cell_type).removeprefix("ORN_").split("_")[0]
    return "VM6" if name.startswith("VM6") else name


def load_annotations() -> pd.DataFrame:
    cols = ["root_id", "super_class", "cell_class", "cell_sub_class", "cell_type", "side", "top_nt", "pos_x", "pos_y", "pos_z"]
    return pd.read_csv(fetch("annotations.tsv"), sep="\t", usecols=cols, low_memory=False)


def build(out: Path = CIRCUIT) -> dict:
    ann = load_annotations()
    con = pd.read_parquet(fetch("Connectivity_783.parquet"))
    con = con[con.Connectivity >= MIN_SYNAPSES]

    orn = ann[ann.cell_class == "olfactory"].copy()
    orn["glom"] = orn.cell_type.fillna("").map(glomerulus)
    pn = ann[(ann.cell_class == "ALPN") & (ann.cell_sub_class == "uniglomerular")].copy()
    pn["glom"] = pn.cell_type.fillna("").map(glomerulus)
    kc = ann[ann.cell_class == "Kenyon_Cell"]
    mbon = ann[ann.cell_class == "MBON"]
    dan = ann[ann.cell_class == "DAN"]
    apl = ann[ann.cell_type == "APL"]
    ln = ann[ann.cell_class == "ALLN"]

    # PN → KC, агрегировано по гломерулам: W[g, k] = синапсы от всех PN гломерулы g на KC k.
    pk = con[con.Presynaptic_ID.isin(pn.root_id) & con.Postsynaptic_ID.isin(kc.root_id)]
    pk = pk.assign(glom=pk.Presynaptic_ID.map(pn.set_index("root_id").glom))
    gloms = sorted(set(pk.glom) & set(orn.glom))
    kc_ids = np.array(sorted(pk.Postsynaptic_ID.unique()), dtype=np.int64)
    g_index = {g: i for i, g in enumerate(gloms)}
    k_index = {k: i for i, k in enumerate(kc_ids)}
    agg = pk[pk.glom.isin(g_index)].groupby(["glom", "Postsynaptic_ID"]).Connectivity.sum().reset_index()
    W = np.zeros((len(gloms), len(kc_ids)), dtype=np.float32)
    W[agg.glom.map(g_index).to_numpy(), agg.Postsynaptic_ID.map(k_index).to_numpy()] = agg.Connectivity.to_numpy()

    # KC → MBON. Грубое правило Aso et al. 2014: глутаматергические MBON
    # толкают к избеганию, холинергические — к приближению. ГАМК-ергические
    # MBON в ранкер не берём (их знак зависит от компартмента).
    km = con[con.Presynaptic_ID.isin(kc_ids) & con.Postsynaptic_ID.isin(mbon.root_id)]
    nt = km.Postsynaptic_ID.map(mbon.set_index("root_id").top_nt)
    approach = km[nt == "acetylcholine"].groupby("Presynaptic_ID").Connectivity.sum()
    avoid = km[nt == "glutamate"].groupby("Presynaptic_ID").Connectivity.sum()
    w_app = approach.reindex(kc_ids, fill_value=0).to_numpy(np.float32)
    w_avoid = avoid.reindex(kc_ids, fill_value=0).to_numpy(np.float32)

    # ORN → PN (контроль того, что гломерулы связаны 1:1 и вход доходит до PN).
    op = con[con.Presynaptic_ID.isin(orn.root_id) & con.Postsynaptic_ID.isin(pn.root_id)]
    op = op.assign(src=op.Presynaptic_ID.map(orn.set_index("root_id").glom), dst=op.Postsynaptic_ID.map(pn.set_index("root_id").glom))
    orn_pn_same = float(op[op.src == op.dst].Connectivity.sum() / max(1, op.Connectivity.sum()))

    orn_by_glom = orn[orn.glom.isin(g_index)]
    kc_type = kc.set_index("root_id").cell_type.reindex(kc_ids).fillna("").to_numpy(dtype=str)

    # Нейроны для карты активности: весь обонятельный путь, фронтальная проекция.
    groups = {"ORN": orn_by_glom, "PN": pn[pn.glom.isin(g_index)], "LN": ln, "KC": kc[kc.root_id.isin(kc_ids)], "APL": apl, "MBON": mbon, "DAN": dan}
    map_ids, map_group, map_xy = [], [], []
    for name, frame in groups.items():
        frame = frame.dropna(subset=["pos_x", "pos_y"])
        map_ids.append(frame.root_id.to_numpy(np.int64))
        map_group += [name] * len(frame)
        map_xy.append(frame[["pos_x", "pos_y"]].to_numpy(np.float32))

    circuit = dict(
        glomeruli=np.array(gloms, dtype=str),
        kc_ids=kc_ids,
        kc_type=kc_type,
        W=W,
        w_app=w_app,
        w_avoid=w_avoid,
        orn_ids=orn_by_glom.root_id.to_numpy(np.int64),
        orn_glom=orn_by_glom.glom.to_numpy(dtype=str),
        pn_ids=pn[pn.glom.isin(g_index)].root_id.to_numpy(np.int64),
        pn_glom=pn[pn.glom.isin(g_index)].glom.to_numpy(dtype=str),
        mbon_ids=mbon.root_id.to_numpy(np.int64),
        mbon_nt=mbon.top_nt.fillna("").to_numpy(dtype=str),
        apl_ids=apl.root_id.to_numpy(np.int64),
        map_ids=np.concatenate(map_ids),
        map_group=np.array(map_group, dtype=str),
        map_xy=np.concatenate(map_xy),
        orn_pn_same_glomerulus=np.float32(orn_pn_same),
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(out, **circuit)
    return circuit


def load(path: Path = CIRCUIT) -> dict:
    if not path.exists():
        return build(path)
    with np.load(path, allow_pickle=False) as data:
        return {key: data[key] for key in data.files}


if __name__ == "__main__":
    c = build()
    W = c["W"]
    print(f"glomeruli={len(c['glomeruli'])} KC={W.shape[1]} PN→KC synapses={int(W.sum())}")
    print(f"KC glomerular in-degree median={np.median((W > 0).sum(0)):.0f}, ORN→PN same-glomerulus share={float(c['orn_pn_same_glomerulus']):.3f}")
    print(f"KC→MBON approach>0: {(c['w_app'] > 0).mean():.2f}, avoid>0: {(c['w_avoid'] > 0).mean():.2f}; map neurons={len(c['map_ids'])}")
