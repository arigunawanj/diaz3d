import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Design } from '../src/domain/design.ts';
import { getPreset, DEFAULT_PRESET_ID } from '../src/domain/presets.ts';
import { designReducer, clampToStage, loadDraft, saveDraft, DRAFT_KEY } from '../src/domain/editor.ts';

const fresh = (): Design => structuredClone(getPreset('safari')!.design);
const deepFreeze = <T>(o: T): T => {
  Object.values(o as object).forEach((v) => v && typeof v === 'object' && deepFreeze(v));
  return Object.freeze(o);
};

test('moveItem clamps to stage', () => {
  const d = designReducer(fresh(), { type: 'moveItem', uid: 'safari-k1', position: [9, -5] });
  assert.deepEqual(d.items.find((i) => i.uid === 'safari-k1')!.position, [3.2, 0.4]);
  assert.deepEqual(clampToStage([-9, 9]), [-3.2, 3.0]);
});

test('panelCount clamps 1..4', () => {
  assert.equal(designReducer(fresh(), { type: 'setBackdrop', patch: { panelCount: 7 } }).backdrop.panelCount, 4);
  assert.equal(designReducer(fresh(), { type: 'setBackdrop', patch: { panelCount: 0 } }).backdrop.panelCount, 1);
});

test('garland length snaps and clamps', () => {
  assert.equal(designReducer(fresh(), { type: 'setGarland', patch: { lengthM: 6.3 } }).garland.lengthM, 6.5);
  assert.equal(designReducer(fresh(), { type: 'setGarland', patch: { lengthM: 2 } }).garland.lengthM, 4.5);
});

test('palette stays 2..5', () => {
  assert.equal(designReducer(fresh(), { type: 'setGarland', patch: { palette: ['#000000'] } }).garland.palette.length, 3);
  const six = ['#000001', '#000002', '#000003', '#000004', '#000005', '#000006'];
  assert.equal(designReducer(fresh(), { type: 'setGarland', patch: { palette: six } }).garland.palette.length, 5);
});

test('addItem caps at 40 and ignores non-placeable', () => {
  let d = fresh();
  for (let i = 0; i < 41; i++) d = designReducer(d, { type: 'addItem', uid: 'n' + i, catalogId: 'balon-jumbo' });
  assert.equal(d.items.length, 40);
  const before = fresh();
  assert.equal(designReducer(before, { type: 'addItem', uid: 'p', catalogId: 'panel' }), before);
});

test('addItem default spot is inside stage', () => {
  const d = designReducer(fresh(), { type: 'addItem', uid: 'z', catalogId: 'karakter', params: { character: 'dino' } });
  const it = d.items.at(-1)!;
  assert.deepEqual(it.position, clampToStage(it.position));
  assert.equal(it.params.character, 'dino');
});

test('duplicate offsets and remove deletes', () => {
  let d = designReducer(fresh(), { type: 'duplicateItem', uid: 'safari-m1', newUid: 'copy' });
  const copy = d.items.find((i) => i.uid === 'copy')!;
  assert.equal(copy.position[0], 0.4);
  d = designReducer(d, { type: 'removeItem', uid: 'copy' });
  assert.equal(d.items.some((i) => i.uid === 'copy'), false);
});

test('reducer does not mutate input', () => {
  const frozen = deepFreeze(fresh());
  designReducer(frozen, { type: 'moveItem', uid: 'safari-k1', position: [1, 1] });
  designReducer(frozen, { type: 'updateItemParams', uid: 'safari-k1', params: { character: 'dino' } });
  designReducer(frozen, { type: 'rotateItem', uid: 'safari-k1', deltaY: 1 });
  designReducer(frozen, { type: 'setGarland', patch: { lengthM: 8 } });
});

test('applyPreset resets; unknown is no-op', () => {
  const d = designReducer(fresh(), { type: 'applyPreset', presetId: 'ivory-elegance' });
  assert.deepEqual(d, getPreset('ivory-elegance')!.design);
  assert.notEqual(d, getPreset('ivory-elegance')!.design);
  const before = fresh();
  assert.equal(designReducer(before, { type: 'applyPreset', presetId: 'nope' }), before);
});

test('loadDraft falls back to default preset', () => {
  const def = getPreset(DEFAULT_PRESET_ID)!.design;
  assert.deepEqual(loadDraft(null), def);
  assert.deepEqual(loadDraft({ getItem: () => '{broken' }), def);
  assert.deepEqual(loadDraft({ getItem: () => JSON.stringify({ version: 1 }) }), def);
  assert.deepEqual(loadDraft({ getItem: () => { throw new Error('denied'); } }), def);
  assert.deepEqual(loadDraft({ getItem: () => null }), def);
});

test('saveDraft then loadDraft restores', () => {
  const store = new Map<string, string>();
  const d = designReducer(fresh(), { type: 'setBackdrop', patch: { panelCount: 3 } });
  saveDraft({ setItem: (k, v) => store.set(k, v) }, d);
  assert.deepEqual(loadDraft({ getItem: (k) => store.get(k) ?? null }), d);
  assert.ok(store.has(DRAFT_KEY));
  saveDraft({ setItem: () => { throw new Error('quota'); } }, d);
});
