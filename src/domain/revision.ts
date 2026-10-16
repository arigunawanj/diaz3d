import { ValidationError } from './validate.ts';

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
