import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Design } from '../src/domain/design.ts';
import { DEFAULT_CATALOG } from '../src/domain/catalog.ts';
import { PRESETS, getPreset } from '../src/domain/presets.ts';
import { priceDesign, formatIDR, countUsage } from '../src/domain/pricing.ts';

const BASE = 2500000;
const clone = (id: string): Design => structuredClone(getPreset(id)!.design);
const total = (d: Design) => priceDesign(d, DEFAULT_CATALOG, BASE).total;

test('default preset costs base', () => {
  for (const p of PRESETS) assert.equal(total(p.design), BASE, p.id);
});

test('second panel adds 400000', () => {
  const d = clone('safari');
  d.backdrop.panelCount = 2;
  assert.equal(total(d), 2900000);
});

test('garland 6m adds 375000', () => {
  const d = clone('safari');
  d.garland.lengthM = 6;
  const r = priceDesign(d, DEFAULT_CATALOG, BASE);
  assert.equal(r.total, 2875000);
  assert.equal(r.lines.find((l) => l.catalogId === 'garland-meter')?.extraQty, 1.5);
});

test('removing an included item does not lower total', () => {
  const d = clone('safari');
  d.items = d.items.filter((i) => i.uid !== 'safari-k1');
  assert.equal(total(d), BASE);
});

test('extra characters charged per unit', () => {
  const d = clone('safari');
  const k = d.items.find((i) => i.catalogId === 'karakter')!;
  d.items.push({ ...k, uid: 'x1' }, { ...k, uid: 'x2' });
  assert.equal(total(d), BASE + 200000);
});

test('variant swap is free', () => {
  const d = clone('safari');
  d.items.find((i) => i.catalogId === 'karakter')!.params.character = 'dino';
  assert.equal(total(d), BASE);
});

test('led and accent toggles', () => {
  const safari = clone('safari'); // led off by default
  safari.backdrop.led = true;
  assert.equal(total(safari), BASE + 150000);
  const rose = clone('rose-gold'); // accent off by default
  rose.garland.leafAccent = true;
  assert.equal(total(rose), BASE + 150000);
});

test('included lines reported with zero extra', () => {
  const r = priceDesign(clone('safari'), DEFAULT_CATALOG, BASE);
  const k = r.lines.find((l) => l.catalogId === 'karakter')!;
  assert.deepEqual([k.included, k.used, k.extraQty, k.subtotal], [3, 3, 0, 0]);
  assert.equal(countUsage(clone('safari'))['neon-nama'], 0);
});

test('formatIDR', () => {
  assert.equal(formatIDR(2900000), 'Rp2.900.000');
  assert.equal(formatIDR(-100000), '-Rp100.000');
});

test('nextUnitCost: free while under included count, price after', async () => {
  const { nextUnitCost } = await import('../src/domain/pricing.ts');
  const d = clone('safari');
  assert.equal(nextUnitCost(d, DEFAULT_CATALOG, 'karakter'), 100000);
  d.items = d.items.filter((i) => i.uid !== 'safari-k1');
  assert.equal(nextUnitCost(d, DEFAULT_CATALOG, 'karakter'), 0);
  assert.equal(nextUnitCost(d, DEFAULT_CATALOG, 'neon-nama'), 350000);
});

test('itemIsIncluded: first N of a kind are included', async () => {
  const { itemIsIncluded } = await import('../src/domain/pricing.ts');
  const d = clone('safari');
  const k = d.items.find((i) => i.catalogId === 'karakter')!;
  d.items.push({ ...k, uid: 'extra' });
  assert.equal(itemIsIncluded(d, 'safari-k1'), true);
  assert.equal(itemIsIncluded(d, 'extra'), false);
});
