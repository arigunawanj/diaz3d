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

test('approvalLines: base plus charged extras only', async () => {
  const { approvalLines } = await import('../src/domain/revision.ts');
  const lines = approvalLines({
    base: 2500000, total: 2900000,
    lines: [
      { catalogId: 'panel', name: 'Panel backdrop', unit: 'panel', included: 1, used: 2, extraQty: 1, unitPrice: 400000, subtotal: 400000 },
      { catalogId: 'karakter', name: 'Karakter', unit: 'karakter', included: 3, used: 3, extraQty: 0, unitPrice: 100000, subtotal: 0 },
    ],
  });
  assert.deepEqual(lines, [{ label: 'Paket dasar', amount: 2500000 }, { label: 'Panel backdrop ×1', amount: 400000 }]);
});

test('parseCatalogUpdate validates prices and ids', async () => {
  const { parseCatalogUpdate } = await import('../src/domain/revision.ts');
  const ok = parseCatalogUpdate({ basePrice: 2600000, items: [{ id: 'panel', price: 450000, active: true }] });
  assert.deepEqual(ok, { basePrice: 2600000, items: [{ id: 'panel', price: 450000, active: true }] });
  assert.throws(() => parseCatalogUpdate({ basePrice: -1, items: [] }));
  assert.throws(() => parseCatalogUpdate({ basePrice: 1, items: [{ id: 'hack', price: 1, active: true }] }));
  assert.throws(() => parseCatalogUpdate({ basePrice: 1, items: [{ id: 'panel', price: 1.5, active: true }] }));
  assert.throws(() => parseCatalogUpdate({ basePrice: 1, items: [{ id: 'panel', price: 1, active: 'yes' }] }));
});
