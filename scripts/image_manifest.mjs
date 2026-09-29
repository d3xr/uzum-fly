// Список товаров для прогрева миниатюр: все кандидаты шести встроенных
// сценариев во всех трёх вариантах проводки, плюс товары исходных сессий.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadFly } from '../lib/fly.mjs';

const root = resolve(import.meta.dirname, '..');
const catalog = JSON.parse(readFileSync(resolve(root, 'data/catalog.json'), 'utf8'));
const byId = new Map(catalog.map((product, index) => [product.id, index]));
const fly = loadFly(new URL('../data/fly/', import.meta.url));
const selected = new Set();

for (const persona of fly.model.personas) {
  const session = persona.items.map((id) => byId.get(id)).filter((i) => i !== undefined);
  session.forEach((i) => selected.add(catalog[i].id));
  for (const variant of Object.keys(fly.variants)) {
    const result = fly.sniff({ session, variant });
    result.candidates.forEach((i) => selected.add(catalog[i].id));
  }
}

const manifest = { schema: 1, source: '6 personas × 3 variants × top-200 candidates', ids: [...selected].sort((a, b) => Number(a) - Number(b)) };
const output = process.argv[2] || resolve(root, 'data/image-manifest.json');
writeFileSync(output, JSON.stringify(manifest) + '\n');
console.log(`${manifest.ids.length} товаров → ${output}`);
