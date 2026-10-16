// Pure submission validation + pricing; imports only domain code so it is testable without Prisma.
import { randomBytes, randomInt } from 'node:crypto';
import type { Design } from '../domain/design.ts';
import type { CatalogItem } from '../domain/catalog.ts';
import { priceDesign, type PriceBreakdown } from '../domain/pricing.ts';
import { ValidationError, normalizeWa, parseDesign } from '../domain/validate.ts';

export interface PricingContext {
  catalog: CatalogItem[];
  basePrice: number;
}

export interface SubmissionRecord {
  name: string;
  wa: string;
  eventDate: string;
  location: string;
  notes: string;
  design: Design;
  breakdown: PriceBreakdown;
}

const text = (v: unknown, field: string, min: number, max: number, message: string): string => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (s.length < min || s.length > max) throw new ValidationError(message, field);
  return s;
};

/** Validates customer input and recomputes the price on the server; any client `estimate` is ignored. */
export function buildSubmissionRecord(input: unknown, ctx: PricingContext, today: string): SubmissionRecord {
  if (!input || typeof input !== 'object') throw new ValidationError('Data pengajuan tidak valid', 'body');
  const b = input as Record<string, unknown>;
  const eventDate = typeof b.eventDate === 'string' ? b.eventDate : '';
  const parsed = Date.parse(eventDate);
  // Round-trip rejects dates V8 silently rolls over (e.g. 2026-02-31).
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || Number.isNaN(parsed) || new Date(parsed).toISOString().slice(0, 10) !== eventDate) {
    throw new ValidationError('Tanggal acara tidak valid', 'eventDate');
  }
  if (eventDate < today) throw new ValidationError('Tanggal acara sudah lewat', 'eventDate');
  const design = parseDesign(b.design);
  const breakdown = structuredClone(priceDesign(design, ctx.catalog, ctx.basePrice));
  // Items the admin switched off may still come from old drafts or crafted requests.
  const unavailable = breakdown.lines.find((l) => l.extraQty > 0 && !ctx.catalog.find((c) => c.id === l.catalogId)?.active);
  if (unavailable) throw new ValidationError(`${unavailable.name} sedang tidak tersedia. Hapus dari desain lalu ajukan lagi.`, 'design');
  return {
    name: text(b.name, 'name', 1, 60, 'Nama wajib diisi (maks. 60 karakter)'),
    wa: normalizeWa(typeof b.wa === 'string' ? b.wa : ''),
    eventDate,
    location: text(b.location, 'location', 1, 80, 'Lokasi wajib diisi (maks. 80 karakter)'),
    notes: text(b.notes ?? '', 'notes', 0, 500, 'Catatan maksimal 500 karakter'),
    design,
    // Deep copy so the stored snapshot never shares objects with the live catalog.
    breakdown,
  };
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const makeCode = (): string =>
  'DZ-' + Array.from({ length: 4 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');

export const makeToken = (): string => randomBytes(12).toString('hex');
