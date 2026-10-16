import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWaMessage, waLink } from '../src/domain/whatsapp.ts';

test('message contains key facts', () => {
  const msg = buildWaMessage({
    code: 'DZ-7K3F', name: 'Sinta', status: 'DIREVISI',
    lines: [{ label: 'Paket dasar', amount: 2500000 }, { label: 'Panel backdrop ×1', amount: 400000 }],
    finalPrice: 2900000, adminNote: 'Harga termasuk biaya luar kota', viewUrl: 'http://x.test/d/DZ-7K3F?t=abc',
  });
  for (const s of ['DZ-7K3F', 'Sinta', 'Rp2.900.000', 'Rp400.000', 'Harga termasuk biaya luar kota', 'http://x.test/d/DZ-7K3F?t=abc']) {
    assert.ok(msg.includes(s), s);
  }
});

test('waLink encodes text', () => {
  assert.equal(waLink('6281234567890', 'a b&c'), 'https://wa.me/6281234567890?text=a%20b%26c');
});
