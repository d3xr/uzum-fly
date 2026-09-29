"""Пересчитать item_emb.npy из закоммиченного каталога без приватного CSV.

Порядок товаров и строка входа совпадают с build_catalog_embeddings.py.
Требуется скачать публичный sentence-transformers checkpoint, указанный ниже.
"""

import json

import numpy as np
from sentence_transformers import SentenceTransformer

from flyrec import DATA, ROOT

MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
catalog = json.loads((ROOT / "data/catalog.json").read_text())
texts = [f"{item['title']} | {item['category']} | {item['leaf']}" for item in catalog]
model = SentenceTransformer(MODEL, device="cpu")
emb = model.encode(texts, batch_size=256, normalize_embeddings=True,
                   show_progress_bar=True, convert_to_numpy=True)
DATA.mkdir(parents=True, exist_ok=True)
np.save(DATA / "item_emb.npy", emb.astype(np.float16))
print(f"embeddings: {emb.shape} → {DATA / 'item_emb.npy'}")
