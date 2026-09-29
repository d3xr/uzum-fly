# Происхождение сторонних материалов

Этот репозиторий доступен для просмотра и проверки. Единой открытой лицензии на
проект нет: лицензии и права на сторонние материалы остаются у их авторов.
Публикация кода не даёт права повторно использовать материалы CashbackFly или Uzum.

## CashbackFly

[CashbackFly](https://cashbackfly.bz/bzzzz) — источник исходного клиентского
bundle и производных `public/assets/app.js`, `app.css`,
`public/api/cns.json`. Пользователь сообщил, что получил согласие и лицензию
на переработку проекта. Текст этого разрешения не входит в репозиторий;
настоящий файл не выдаёт сторонним лицам самостоятельную лицензию на
дальнейшее распространение этих материалов.

## Шрифты

- [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) — SIL Open Font
  License 1.1; текст: [JetBrainsMono-OFL.txt](docs/licenses/JetBrainsMono-OFL.txt).
- [Press Start 2P](https://github.com/google/fonts/tree/main/ofl/pressstart2p)
  — SIL Open Font License 1.1; текст:
  [PressStart2P-OFL.txt](docs/licenses/PressStart2P-OFL.txt).

## Uzum Market

`data/catalog.json` содержит историческую выборку ID, названий, категорий и
ссылок на публичные фото товаров из локального исследования Uzum, а
локальные миниатюры в публичный репозиторий не включены. Это не лицензия на товарные данные или бренд.
Сырой файл исследования, действия пользователей, цены и коммерческие метрики
в этот репозиторий не включены.

## FlyWire и модель мозга

- Коннектом **FlyWire v783** (Dorkenwald et al., *Nature* 2024) — CC BY 4.0. Связность берётся из
  `Connectivity_783.parquet` репозитория Shiu et al.; типы клеток — из
  [flyconnectome/flywire_annotations](https://github.com/flyconnectome/flywire_annotations)
  (Schlegel et al., *Nature* 2024). Сырые файлы скачиваются в `~/.cache/uzumfly` и в репозиторий не
  кладутся; производные `data/fly/mb_circuit.npz`, `data/fly/model.json` и `public/api/cns.json`
  содержат выборку связей и координат нейронов и распространяются с этой атрибуцией.
- [philshiu/Drosophila_brain_model](https://github.com/philshiu/Drosophila_brain_model)
  (Shiu, Spiller et al., *Nature* 2024) — MIT. Файлы `model.py`, `utils.py`, `LICENSE`, `Readme.md`
  скопированы без изменений в `vendor/drosophila_brain_model/`.
- Модель текстовых эмбеддингов `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` —
  Apache 2.0; веса не входят в репозиторий.

## Исследовательские источники

Алгоритм FlyHash (Dasgupta, Stevens, Navlakha, *Science* 2017) реализован заново в `flyrec/`.
Код проектов из [awesome-fly](https://github.com/cobanov/awesome-fly) не копировался; из
[boltzmann-fly](https://github.com/jniimi/boltzmann-fly) взята идея проверки покрытия входа.
Полный список источников — в [ноутбуке](notebooks/uzum_fly.ipynb).
