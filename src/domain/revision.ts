import { ValidationError } from './validate.ts';
import { CATALOG_IDS, type CatalogId } from './design.ts';
import type { PriceBreakdown } from './pricing.ts';

export interface FinalLine {
  label: string;
  amount: number;
}

export const totalOf = (lines: FinalLine[]): number => lines.reduce((s, l) => s + l.amount, 0);

export function parseFinalLines(input: unknown): FinalLine[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 40) {
    throw new ValidationError('Rincian harga wajib diisi', 'lines');
  }
  const lines = input.map((raw, i) => {
    const l = (raw ?? {}) as Record<string, unknown>;
    const label = typeof l.label === 'string' ? l.label.trim() : '';
    if (label.length < 1 || label.length > 80) throw new ValidationError('Nama baris tidak valid', `lines.${i}.label`);
    if (!Number.isSafeInteger(l.amount)) throw new ValidationError('Nominal harus bilangan bulat', `lines.${i}.amount`);
    return { label, amount: l.amount as number };
  });
  if (totalOf(lines) <= 0) throw new ValidationError('Total harus lebih dari 0', 'lines');
  return lines;
}

/** Approval keeps the estimate: the base package plus every add-on that was actually charged. */
export function approvalLines(b: PriceBreakdown): FinalLine[] {
  return [
    { label: 'Paket dasar', amount: b.base },
    ...b.lines.filter((l) => l.subtotal > 0).map((l) => ({ label: `${l.name} ×${l.extraQty.toLocaleString('id-ID')}`, amount: l.subtotal })),
  ];
}

export interface CatalogUpdate {
  basePrice: number;
  items: { id: CatalogId; price: number; active: boolean }[];
}

const priceOk = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;

export function parseCatalogUpdate(input: unknown): CatalogUpdate {
  const b = (input ?? {}) as Record<string, unknown>;
  if (!priceOk(b.basePrice)) throw new ValidationError('Harga paket tidak valid', 'basePrice');
  if (!Array.isArray(b.items)) throw new ValidationError('Daftar item tidak valid', 'items');
  const items = b.items.map((raw, i) => {
    const it = (raw ?? {}) as Record<string, unknown>;
    if (!CATALOG_IDS.includes(it.id as CatalogId)) throw new ValidationError('Item tidak dikenal', `items.${i}.id`);
    if (!priceOk(it.price)) throw new ValidationError('Harga harus bilangan bulat ≥ 0', `items.${i}.price`);
    if (typeof it.active !== 'boolean') throw new ValidationError('Status aktif tidak valid', `items.${i}.active`);
    return { id: it.id as CatalogId, price: it.price, active: it.active };
  });
  return { basePrice: b.basePrice, items };
}
