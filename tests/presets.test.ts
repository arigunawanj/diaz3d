import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITS, PLACEABLE_IDS, STAGE_BOUNDS } from '../src/domain/design.ts';
import { DEFAULT_CATALOG } from '../src/domain/catalog.ts';
import { PRESETS, getPreset, DEFAULT_PRESET_ID } from '../src/domain/presets.ts';

test('six presets, two per template', () => {
  const counts: Record<string, number> = {};
  for (const p of PRESETS) counts[p.templateType] = (counts[p.templateType] ?? 0) + 1;
  assert.deepEqual(counts, { anak: 2, sweet17: 2, formal: 2 });
  assert.ok(getPreset(DEFAULT_PRESET_ID));
});

test('every preset obeys base package shape', () => {
  for (const p of PRESETS) {
    const d = p.design;
    assert.equal(d.presetId, p.id);
    assert.equal(d.templateType, p.templateType);
    assert.equal(d.backdrop.panelCount, 1, p.id);
    assert.equal(d.garland.lengthM, 4.5, p.id);
    assert.ok(d.items.length <= LIMITS.maxItems);
    const uids = new Set(d.items.map((i) => i.uid));
    assert.equal(uids.size, d.items.length, `${p.id}: unique uids`);
    for (const item of d.items) {
      assert.ok(PLACEABLE_IDS.includes(item.catalogId), `${p.id}: ${item.catalogId}`);
      const [x, z] = item.position;
      assert.ok(x >= STAGE_BOUNDS.minX && x <= STAGE_BOUNDS.maxX, `${p.id}: x ${x}`);
      assert.ok(z >= STAGE_BOUNDS.minZ && z <= STAGE_BOUNDS.maxZ, `${p.id}: z ${z}`);
    }
  }
});

test('catalog covers every CatalogId once', () => {
  const ids = DEFAULT_CATALOG.map((c) => c.id);
  assert.equal(new Set(ids).size, 16);
  assert.equal(ids.length, 16);
  assert.equal(DEFAULT_CATALOG.find((c) => c.id === 'panel')?.price, 400000);
  assert.equal(DEFAULT_CATALOG.find((c) => c.id === 'garland-meter')?.price, 250000);
});
