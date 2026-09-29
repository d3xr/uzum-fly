"""Uzum Fly: товарный retrieval и ранкер на обонятельном контуре коннектома FlyWire.

Модули:
- connectome: извлечение ORN → PN → KC → MBON из публичного FlyWire v783;
- odor: товарный эмбеддинг → «запах» (ответ 51 гломерулы);
- mushroom: грибовидное тело — нормализация PN, экспансия в KC, APL/WTA, MBON;
- retrieval: индекс по разреженным KC-кодам, сессии, метрики;
- lif: спайковая симуляция всего мозга кодом Shiu et al. (vendor/).
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "fly"
