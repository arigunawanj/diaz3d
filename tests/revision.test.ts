import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFinalLines, totalOf } from '../src/domain/revision.ts';

test('totalOf sums including discounts', () => {
  assert.equal(totalOf([{ label: 'Paket', amount: 2500000 }, { label: 'Diskon', amount: -100000 }]), 2400000);
});

test('parseFinalLines rejects bad input', () => {
  assert.throws(() => parseFinalLines([]));
  assert.throws(() => parseFinalLines('x'));
  assert.throws(() => parseFinalLines([{ label: 'Diskon', amount: -1 }]));
  assert.throws(() => parseFinalLines([{ label: 'A', amount: 1.5 }]));
  assert.throws(() => parseFinalLines([{ label: '', amount: 10 }]));
  assert.deepEqual(parseFinalLines([{ label: ' Paket ', amount: 10, x: 1 }]), [{ label: 'Paket', amount: 10 }]);
});
