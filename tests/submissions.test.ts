import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPreset } from '../src/domain/presets.ts';
import { DEFAULT_CATALOG } from '../src/domain/catalog.ts';
import { ValidationError } from '../src/domain/validate.ts';
import { buildSubmissionRecord, makeCode, makeToken } from '../src/server/submissionRecord.ts';

const ctx = { catalog: DEFAULT_CATALOG, basePrice: 2500000 };
const TODAY = '2026-10-16';
const design = () => {
  const d = structuredClone(getPreset('safari')!.design);
  d.backdrop.panelCount = 2;
  return d;
};
const input = (over: Record<string, unknown> = {}) => ({
  name: 'Sinta', wa: '0812-3456-7890', eventDate: '2026-11-20', location: 'Bandung', notes: '', design: design(), ...over,
});
const throwsField = (fn: () => unknown, field: string) =>
  assert.throws(fn, (e: unknown) => e instanceof ValidationError && e.field === field);

test('valid input recomputes total server-side', () => {
  const r = buildSubmissionRecord(input({ estimate: 1 }), ctx, TODAY);
  assert.equal(r.breakdown.total, 2900000);
  assert.equal(r.wa, '6281234567890');
  assert.equal(r.name, 'Sinta');
});

test('rejects bad fields', () => {
  throwsField(() => buildSubmissionRecord(input({ wa: '123' }), ctx, TODAY), 'wa');
  throwsField(() => buildSubmissionRecord(input({ eventDate: '2026-10-15' }), ctx, TODAY), 'eventDate');
  throwsField(() => buildSubmissionRecord(input({ eventDate: '20-11-2026' }), ctx, TODAY), 'eventDate');
  throwsField(() => buildSubmissionRecord(input({ name: '' }), ctx, TODAY), 'name');
  throwsField(() => buildSubmissionRecord(input({ location: 'x'.repeat(81) }), ctx, TODAY), 'location');
  throwsField(() => buildSubmissionRecord(input({ notes: 'x'.repeat(501) }), ctx, TODAY), 'notes');
  assert.throws(() => buildSubmissionRecord(input({ design: { version: 1 } }), ctx, TODAY), ValidationError);
  throwsField(() => buildSubmissionRecord(null, ctx, TODAY), 'body');
});

test('breakdown is a snapshot, unaffected by later catalog changes', () => {
  const catalog = structuredClone(DEFAULT_CATALOG);
  const first = buildSubmissionRecord(input(), { catalog, basePrice: 2500000 }, TODAY);
  catalog.find((c) => c.id === 'panel')!.price = 500000;
  const second = buildSubmissionRecord(input(), { catalog, basePrice: 2500000 }, TODAY);
  assert.equal(first.breakdown.total, 2900000);
  assert.equal(first.breakdown.lines.find((l) => l.catalogId === 'panel')!.unitPrice, 400000);
  assert.equal(second.breakdown.total, 3000000);
});

test('code and token formats', () => {
  assert.match(makeCode(), /^DZ-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
  assert.match(makeToken(), /^[a-f0-9]{24}$/);
});

test('rejects inactive catalog items used beyond the package', () => {
  const catalog = structuredClone(DEFAULT_CATALOG);
  catalog.find((c) => c.id === 'led-backdrop')!.active = false;
  const d = design();
  d.backdrop.led = true; // safari preset has LED off, so this is an extra
  assert.throws(() => buildSubmissionRecord(input({ design: d }), { catalog, basePrice: 2500000 }, TODAY),
    (e: unknown) => e instanceof ValidationError && e.field === 'design' && /tidak tersedia/.test(e.message));
  catalog.find((c) => c.id === 'karakter')!.active = false; // included in safari: still fine
  d.backdrop.led = false;
  assert.equal(buildSubmissionRecord(input({ design: d }), { catalog, basePrice: 2500000 }, TODAY).breakdown.total, 2900000);
});

test('rejects impossible calendar dates', () => {
  throwsField(() => buildSubmissionRecord(input({ eventDate: '2026-02-31' }), ctx, TODAY), 'eventDate');
});

test('rate limiter allows a burst then blocks per key', async () => {
  const { createRateLimiter } = await import('../src/server/rateLimit.ts');
  const allow = createRateLimiter(3, 60_000);
  assert.deepEqual([allow('a', 0), allow('a', 1), allow('a', 2), allow('a', 3)], [true, true, true, false]);
  assert.equal(allow('b', 3), true);
  assert.equal(allow('a', 60_001), true);
});
