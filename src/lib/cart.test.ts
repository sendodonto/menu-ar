import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceLines, totalOf, clampQty } from './cart.ts';
import { parsePrice, formatDimensions } from './format.ts';

const dish = (id: string, price: number, active = true) => ({ id, name: id, price, active }) as never;

test('prices come from the menu and inactive dishes drop out', () => {
  const items = priceLines(
    [{ dishId: 'a', qty: 2, note: '' }, { dishId: 'b', qty: 1, note: 'sem sal' }, { dishId: 'gone', qty: 3, note: '' }],
    [dish('a', 6200), dish('b', 900), dish('c', 100, false)],
  );
  assert.equal(items.length, 2);
  assert.equal(items[1].note, 'sem sal');
  assert.equal(totalOf(items), 6200 * 2 + 900);
});

test('quantities are clamped to 1..20', () => {
  assert.equal(clampQty(0), 1);
  assert.equal(clampQty(99), 20);
  assert.equal(clampQty(3.4), 3);
});

test('parsePrice accepts BR formats and rejects junk', () => {
  assert.equal(parsePrice('62,00'), 6200);
  assert.equal(parsePrice('R$ 1.240,50'), 124050);
  assert.equal(parsePrice('62'), 6200);
  assert.equal(parsePrice('6,2,0'), null);
  assert.equal(parsePrice('abc'), null);
});

test('dimensions read as diameter for round plates', () => {
  assert.equal(formatDimensions({ w: 34, d: 34, h: 2.8 }), 'Ø 34 cm');
  assert.equal(formatDimensions({ w: 8.1, d: 8.1, h: 31.6 }), '31,6 cm de altura');
});
