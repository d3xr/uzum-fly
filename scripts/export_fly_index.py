"""Экспорт модели мухи для Node-сервера демо.

Сервер сам считает всё грибовидное тело на JS: смесь запахов сессии →
антеннальная доля → клетки Кеньона → APL → MBON. Сюда выгружаются только
входы модели и контрольные коды для проверки паритета Python ↔ JS.

Выход (data/fly/, читается server.mjs, не раздаётся статикой):
- orn.f32            ORN-ответы каталога [N, G] float32;
- model.json         гломерулы, варианты проводки (разреженно), гомеостаз,
                     KC → MBON, синтетические персоны, контрольные коды;
- public/api/cns.json карта реальных нейронов FlyWire для визуализации.
"""

import json
import re
from pathlib import Path

import numpy as np

from flyrec import DATA, connectome, mushroom
from flyrec.odor import OdorEncoder, antennal_lobe
from flyrec.retrieval import FlyIndex

ROOT = Path(__file__).resolve().parents[1]
MAP_PARTS = [
    ("nose", "Нос: антеннальная доля", ("ORN", "PN", "LN")),
    ("mb", "Грибовидное тело", ("KC", "APL", "MBON", "DAN")),
]
# Синтетические сессии: регулярка по названию/категории, первые подходящие товары с фото.
PERSONAS = [
    ("gamer", "Геймер в 3 часа ночи", r"игров|клавиатур|мыш", "Товары для геймеров"),
    ("fisher", "Рыбак на выходных", r"рыбал|катушк|блесн|приманк|удочк", "Рыбалка"),
    ("cat", "Кошатница", r"кош|когтеточ|наполнител", "Для кошек"),
    ("car", "Автолюбитель", r"авто|машин", "Уход за автомобилем"),
    ("beauty", "Бьюти-блогерка", r"помад|тушь|тени|кист|консилер", "Макияж"),
    ("student", "Студент перед сессией", r"тетрад|блокнот|ручк|учебн|рюкзак", "Бумажная продукция"),
]
VARIANTS = {
    "flywire": lambda c: mushroom.flywire(c),
    "shuffled": lambda c: mushroom.shuffled(c, 0),
    "random": lambda c: mushroom.random_flyhash(c, 0),
}


def sparse_columns(W: np.ndarray) -> dict:
    """W нормирован по столбцам (как в MushroomBody) → списки входов каждой KC."""
    norm = W.sum(0)
    ptr, gl, wt = [0], [], []
    for j in range(W.shape[1]):
        g = np.nonzero(W[:, j])[0]
        gl += g.tolist()
        wt += (W[g, j] / (norm[j] or 1)).round(6).tolist()
        ptr.append(len(gl))
    return {"ptr": ptr, "glom": gl, "w": wt}


def main():
    circuit = connectome.load()
    catalog = json.loads((ROOT / "data/catalog.json").read_text())
    emb = np.load(DATA / "item_emb.npy").astype(np.float32)
    enc = OdorEncoder.fit(emb, circuit["W"].sum(1))
    orn = enc.orn(emb)
    orn.astype("<f4").tofile(DATA / "orn.f32")

    variants, check_items = {}, [0, 1, 2, 777, 5000, 12345, len(catalog) - 1]
    for name, make in VARIANTS.items():
        body = make(circuit)
        idx = FlyIndex.build(body, enc, emb)
        variants[name] = {
            "title": body.name,
            **sparse_columns(body.W),
            "mu": body.mu.round(6).tolist(),
            "sd": body.sd.round(6).tolist(),
            "check_codes": {str(i): sorted(idx.codes[i].tolist()) for i in check_items},
        }

    personas = []
    for pid, title, pattern, category in PERSONAS:
        rx = re.compile(pattern, re.I)
        picks = [i for i, p in enumerate(catalog) if p["category"] == category and rx.search(p["title"]) and "image" in p]
        picks += [i for i, p in enumerate(catalog) if p["category"] == category and rx.search(p["title"]) and i not in picks]
        personas.append({"id": pid, "title": title, "items": [catalog[i]["id"] for i in picks[:4]]})

    ids, groups, xy = circuit["map_ids"], circuit["map_group"], circuit["map_xy"]
    parts, slot = [], 0
    for part_id, title, members in MAP_PARTS:
        m = np.isin(groups, members)
        p = xy[m]
        lo, hi = p.min(0), p.max(0)
        norm = (p - lo) / np.where(hi - lo > 0, hi - lo, 1)
        n = int(m.sum())
        parts.append({"id": part_id, "title": title, "slots": list(range(slot, slot + n)),
                      "x": norm[:, 0].round(4).tolist(), "y": norm[:, 1].round(4).tolist(),
                      "groups": groups[m].tolist(), "flywire_ids": [str(v) for v in ids[m]]})
        slot += n
    (ROOT / "public/api/cns.json").write_text(json.dumps(
        {"schema": 1, "neurons": slot, "total_with_soma": 139255, "source": "FlyWire v783 (Dorkenwald et al. 2024; Schlegel et al. 2024), CC BY 4.0",
         "parts": [{k: v for k, v in p.items() if k != "flywire_ids"} for p in parts]}, separators=(",", ":")))

    kc_ids = circuit["kc_ids"].astype(str).tolist()
    map_index = {}
    for p in parts:
        for s, g, f in zip(p["slots"], p["groups"], p["flywire_ids"]):
            map_index.setdefault(g, []).append([s, f])
    kc_slot = {f: s for s, f in map_index.get("KC", [])}
    pn_glom = dict(zip(circuit["pn_ids"].astype(str), circuit["pn_glom"]))
    orn_glom = dict(zip(circuit["orn_ids"].astype(str), circuit["orn_glom"]))
    g_index = {g: i for i, g in enumerate(circuit["glomeruli"])}
    mbon_nt = dict(zip(circuit["mbon_ids"].astype(str), circuit["mbon_nt"]))

    model = {
        "schema": 1,
        "source": "FlyWire v783 connectome; Shiu et al. connectivity; flyrec (this repo)",
        "catalog_size": len(catalog),
        "glomeruli": circuit["glomeruli"].tolist(),
        "n_kc": int(circuit["W"].shape[1]),
        "sparsity": mushroom.SPARSITY,
        "al": {"sigma": 0.3, "m": 0.6},
        "variants": variants,
        "w_app": circuit["w_app"].round(3).tolist(),
        "w_avoid": circuit["w_avoid"].round(3).tolist(),
        "personas": personas,
        "map": {
            "kc_slot": [kc_slot.get(k, -1) for k in kc_ids],
            "orn": [[s, g_index[orn_glom[f]]] for s, f in map_index.get("ORN", []) if orn_glom.get(f) in g_index],
            "pn": [[s, g_index[pn_glom[f]]] for s, f in map_index.get("PN", []) if pn_glom.get(f) in g_index],
            "ln": [s for s, _ in map_index.get("LN", [])],
            "apl": [s for s, _ in map_index.get("APL", [])],
            "dan": [s for s, _ in map_index.get("DAN", [])],
            "mbon": [[s, 1 if mbon_nt.get(f) == "acetylcholine" else -1 if mbon_nt.get(f) == "glutamate" else 0] for s, f in map_index.get("MBON", [])],
        },
    }
    (DATA / "model.json").write_text(json.dumps(model, ensure_ascii=False, separators=(",", ":")))
    print(f"orn.f32 {orn.shape}, map neurons {slot}, personas {[len(p['items']) for p in personas]}")


if __name__ == "__main__":
    main()
