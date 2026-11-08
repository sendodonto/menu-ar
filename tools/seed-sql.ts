// Generates supabase/seed.sql from src/data/seed.ts: node --experimental-strip-types tools/seed-sql.ts
import { writeFileSync } from 'node:fs';
import { SEED_CATEGORIES, SEED_DISHES } from '../src/data/seed.ts';

const q = (s: string | null | undefined) => (s == null ? 'null' : `'${s.replace(/'/g, "''")}'`);
const arr = (a: string[]) => `array[${a.map(q).join(',')}]::text[]`;
const lines = [
  ...SEED_CATEGORIES.map((c) => `insert into categories values (${q(c.id)}, ${q(c.name)}, ${c.position}, ${c.active}) on conflict (id) do nothing;`),
  ...SEED_DISHES.map((d) =>
    `insert into dishes values (${q(d.id)}, ${q(d.name)}, ${q(d.description)}, ${d.price}, ${q(d.categoryId)}, ${q(d.photo)}, ${q(d.photoCredit)}, ${d.prepMinutes}, ${d.serves}, ${arr(d.ingredients)}, ${arr(d.allergens)}, ${d.featured}, ${d.active}, ${d.model ? q(JSON.stringify(d.model)) + '::jsonb' : 'null'}) on conflict (id) do nothing;`),
];
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), lines.join('\n') + '\n', 'utf8');
console.log(`supabase/seed.sql: ${lines.length} rows`);
