import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, getPreset } from '../src/domain/presets.ts';
import { parseDesign, normalizeWa, ValidationError } from '../src/domain/validate.ts';

const base = () => structuredClone(getPreset('safari')!.design) as any;
const throwsField = (fn: () => unknown, field: string | RegExp) =>
  assert.throws(fn, (e: unknown) => e instanceof ValidationError && (typeof field === 'string' ? e.field === field : field.test(e.field)));

test('every preset round-trips', () => {
  for (const p of PRESETS) assert.deepEqual(parseDesign(structuredClone(p.design)), p.design);
});

test('rejects invalid designs with field', () => {
  let d = base(); d.backdrop.panelCount = 99; throwsField(() => parseDesign(d), 'backdrop.panelCount');
  d = base(); d.garland.lengthM = -1; throwsField(() => parseDesign(d), 'garland.lengthM');
  d = base(); d.garland.lengthM = 5.3; throwsField(() => parseDesign(d), 'garland.lengthM');
  d = base(); d.items[0].catalogId = 'hack'; throwsField(() => parseDesign(d), /^items\.0/);
  d = base(); d.items[0].catalogId = 'panel'; throwsField(() => parseDesign(d), /^items\.0/);
  d = base(); d.items[0].position = [10, 0]; throwsField(() => parseDesign(d), /^items\.0\.position/);
  d = base(); d.items = Array.from({ length: 41 }, (_, i) => ({ ...d.items[0], uid: 'u' + i })); throwsField(() => parseDesign(d), 'items');
  d = base(); d.backdrop.mainColor = 'red'; throwsField(() => parseDesign(d), 'backdrop.mainColor');
  d = base(); d.presetId = 'nope'; throwsField(() => parseDesign(d), 'presetId');
  d = base(); d.backdrop.title = 'x'.repeat(41); throwsField(() => parseDesign(d), 'backdrop.title');
  throwsField(() => parseDesign(null), 'design');
});

test('drops unknown keys', () => {
  const d = base(); d.hack = 1; d.items[0].evil = true; d.items[0].params.__proto__x = 'y';
  const out = parseDesign(d) as any;
  assert.equal(out.hack, undefined);
  assert.equal(out.items[0].evil, undefined);
});

test('rejects non-primitive params', () => {
  const d = base(); d.items[0].params = { a: { nested: 1 } };
  throwsField(() => parseDesign(d), /^items\.0\.params/);
});

test('normalizeWa', () => {
  assert.equal(normalizeWa('0812-3456-7890'), '6281234567890');
  assert.equal(normalizeWa('+62 812 3456 7890'), '6281234567890');
  assert.equal(normalizeWa('812345678'), '62812345678');
  assert.equal(normalizeWa('(0812) 3456.7890'), '6281234567890');
  throwsField(() => normalizeWa('123'), 'wa');
  throwsField(() => normalizeWa(''), 'wa');
});
