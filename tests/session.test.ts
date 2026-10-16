import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signSession, verifySession } from '../src/domain/session.ts';

const NOW = 1_800_000_000_000;

test('signed token verifies before expiry', async () => {
  const t = await signSession('s3cret', NOW + 60_000);
  assert.equal(await verifySession('s3cret', t, NOW), true);
});

test('fails after expiry, other secret, tampering, garbage', async () => {
  const t = await signSession('s3cret', NOW + 60_000);
  assert.equal(await verifySession('s3cret', t, NOW + 60_001), false);
  assert.equal(await verifySession('other', t, NOW), false);
  const i = t.indexOf('.') + 5; // a middle signature char (the last one carries padding bits)
  const tampered = t.slice(0, i) + (t[i] === 'A' ? 'B' : 'A') + t.slice(i + 1);
  assert.equal(await verifySession('s3cret', tampered, NOW), false);
  const [exp, sig] = t.split('.');
  assert.equal(await verifySession('s3cret', `${Number(exp) + 999999}.${sig}`, NOW), false);
  assert.equal(await verifySession('s3cret', undefined, NOW), false);
  assert.equal(await verifySession('s3cret', 'garbage', NOW), false);
  assert.equal(await verifySession('', t, NOW), false);
});
