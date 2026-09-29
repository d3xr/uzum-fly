"""Разово скачать и уменьшить фото товаров из image-manifest.json.

Запускать там, где доступен images.uzum.uz, например на сервере. Зависимость
build-time: python3-pil. Результат хранить между релизами в CacheDirectory.
"""

from __future__ import annotations

import io
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/image-manifest.json"
CATALOG = ROOT / "data/catalog.json"
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "/var/cache/recsysfly/thumbs")
SIZE = (192, 192)
MAX_INPUT = 1_000_000


def fetch_one(item: dict) -> str:
    target = OUT / f"{item['id']}.jpg"
    if target.exists() and target.stat().st_size:
        return "cached"
    source = item.get("cdn", "")
    parsed = urlparse(source)
    if parsed.scheme != "https" or parsed.hostname != "images.uzum.uz" or not parsed.path.endswith("/original.jpg"):
        return "invalid"
    url = source.removesuffix("original.jpg") + "t_product_240_high.jpg"
    try:
        with urlopen(Request(url, headers={"User-Agent": "UzumFlyThumbnailCache/1.0"}), timeout=8) as response:
            if not response.headers.get("content-type", "").startswith("image/"):
                return "invalid"
            raw = response.read(MAX_INPUT + 1)
        if len(raw) > MAX_INPUT:
            return "oversize"
        with Image.open(io.BytesIO(raw)) as source_image:
            image = ImageOps.exif_transpose(source_image).convert("RGB")
            image.thumbnail(SIZE, Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", SIZE, "white")
            canvas.paste(image, ((SIZE[0] - image.width) // 2, (SIZE[1] - image.height) // 2))
            buf = io.BytesIO()
            canvas.save(buf, format="JPEG", quality=72, optimize=True, progressive=True)
        if len(buf.getvalue()) > 50_000:
            return "oversize"
        temp = target.with_suffix(".tmp")
        temp.write_bytes(buf.getvalue())
        temp.replace(target)
        return "downloaded"
    except Exception:
        return "failed"


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    ids = set(manifest["ids"])
    catalog = json.loads(CATALOG.read_text())
    items = [item for item in catalog if item["id"] in ids and item.get("cdn")]
    OUT.mkdir(parents=True, exist_ok=True)
    totals: dict[str, int] = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(fetch_one, item) for item in items]
        for n, future in enumerate(as_completed(futures), 1):
            result = future.result()
            totals[result] = totals.get(result, 0) + 1
            if n % 200 == 0 or n == len(items):
                print(f"{n}/{len(items)} {totals}", flush=True)
    if totals.get("failed") or totals.get("invalid") or totals.get("oversize"):
        print("Некоторые фото недоступны; повторный запуск дозагрузит пропущенные.", file=sys.stderr)


if __name__ == "__main__":
    main()
