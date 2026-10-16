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
