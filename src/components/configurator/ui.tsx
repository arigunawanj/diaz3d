'use client';

import React from 'react';
import {
  CakeSlice, Flower2, Frame, Hash, Leaf, Minus, PartyPopper, Plus, RectangleHorizontal,
  Smile, Sparkles, Spotlight, Sprout, Table2, Type, Zap, type LucideIcon,
} from 'lucide-react';
import type { CatalogId } from '@/domain/design';
import type { CatalogItem } from '@/domain/catalog';

export const isActive = (catalog: CatalogItem[], id: CatalogId) => catalog.find((c) => c.id === id)?.active !== false;

export const ITEM_ICONS: Record<CatalogId, LucideIcon> = {
  panel: Frame,
  'led-backdrop': Zap,
  'neon-nama': Type,
  'garland-meter': Sparkles,
  'aksen-balon': Leaf,
  'tiang-balon': PartyPopper,
  'balon-jumbo': Sparkles,
  'balon-gantung': PartyPopper,
  karakter: Smile,
  'angka-lampu': Hash,
  'meja-kue': CakeSlice,
  'meja-formal': Table2,
  'standing-flower': Flower2,
  tanaman: Sprout,
  karpet: RectangleHorizontal,
  'lampu-sorot': Spotlight,
};

export const COLOR_SWATCHES = [
  '#FFFFFF', '#EFE7DB', '#F7CAD0', '#D8A39D', '#CDB4DB', '#B5E2FA', '#B7E4C7', '#5C7A58',
  '#1F5C4A', '#F2C14E', '#C9A54C', '#C2552B', '#7F5234', '#1E2A5A', '#7B4DFF', '#111111',
];

export const Section: React.FC<{ title: string; aside?: string; children: React.ReactNode }> = ({ title, aside, children }) => (
  <section className="section">
    <div className="section-head"><h3>{title}</h3>{aside && <span>{aside}</span>}</div>
    {children}
  </section>
);

export const Field: React.FC<{ label: string; children: React.ReactNode; htmlFor?: string }> = ({ label, children, htmlFor }) => (
  <div className="field">
    {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span className="field-label">{label}</span>}
    {children}
  </div>
);

export const Stepper: React.FC<{
  value: number; min: number; max: number; step?: number; label: string; format?: (v: number) => string; onChange(v: number): void;
}> = ({ value, min, max, step = 1, label, format = String, onChange }) => (
  <div className="stepper" role="group" aria-label={label}>
    <button type="button" aria-label={`Kurangi ${label}`} disabled={value <= min} onClick={() => onChange(value - step)}><Minus size={16} /></button>
    <output aria-live="polite">{format(value)}</output>
    <button type="button" aria-label={`Tambah ${label}`} disabled={value >= max} onClick={() => onChange(value + step)}><Plus size={16} /></button>
  </div>
);

export function Seg<T extends string>({ value, options, label, onChange }: {
  value: T; options: { value: T; label: string }[]; label: string; onChange(v: T): void;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export const Toggle: React.FC<{ checked: boolean; label: string; hint?: string; onChange(v: boolean): void }> = ({ checked, label, hint, onChange }) => (
  <button type="button" role="switch" aria-checked={checked} className="toggle" onClick={() => onChange(!checked)}>
    <span>{label}{hint && <small>{hint}</small>}</span>
    <span className="switch" aria-hidden="true" />
  </button>
);

export const ColorPicker: React.FC<{ value: string; label: string; onChange(hex: string): void; swatches?: string[] }> = ({
  value, label, onChange, swatches = COLOR_SWATCHES,
}) => (
  <div className="swatches" role="group" aria-label={label}>
    {swatches.map((c) => (
      <button key={c} type="button" className="swatch" style={{ background: c }} aria-label={`${label} ${c}`}
        aria-pressed={c.toLowerCase() === value.toLowerCase()} onClick={() => onChange(c)} />
    ))}
    <label className="swatch-custom" title="Warna lain">
      <Plus size={14} aria-hidden="true" />
      <span className="sr-only">{label}: warna lain</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} />
    </label>
  </div>
);
