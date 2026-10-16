'use client';

import React from 'react';
import { BACKDROP_SHAPES, LIMITS, type BackdropShape } from '@/domain/design';
import { nextUnitCost } from '@/domain/pricing';
import { useConfigurator } from './context';
import { CatalogCard, PriceTag } from './CatalogCard';
import { ColorPicker, Field, Section, Seg, Stepper, Toggle, isActive } from './ui';

const SHAPE_LABEL: Record<BackdropShape, string> = {
  'double-arch': 'Lengkung ganda', 'single-arch': 'Lengkung', wavy: 'Gelombang', round: 'Bulat', 'half-arch': 'Setengah',
};

export const BackdropTab: React.FC = () => {
  const { design, dispatch, catalog } = useConfigurator();
  const b = design.backdrop;
  const set = (patch: Partial<typeof b>) => dispatch({ type: 'setBackdrop', patch });

  return (
    <>
      <Section title="Panel backdrop" aside="1 panel termasuk paket">
        <div className="field-row">
          <div><PriceTag cost={nextUnitCost(design, catalog, 'panel')} unit="panel berikutnya" /></div>
          <Stepper label="jumlah panel" value={b.panelCount} min={LIMITS.panelMin} max={isActive(catalog, 'panel') ? LIMITS.panelMax : Math.max(1, b.panelCount)} onChange={(panelCount) => set({ panelCount })} />
        </div>
      </Section>
      <Section title="Bentuk">
        <Seg label="Bentuk backdrop" value={b.shape} options={BACKDROP_SHAPES.map((s) => ({ value: s, label: SHAPE_LABEL[s] }))} onChange={(shape) => set({ shape })} />
      </Section>
      <Section title="Warna">
        <Field label="Warna utama"><ColorPicker label="Warna utama" value={b.mainColor} onChange={(mainColor) => set({ mainColor })} /></Field>
        <Field label="Warna panel samping"><ColorPicker label="Warna panel samping" value={b.secondaryColor} onChange={(secondaryColor) => set({ secondaryColor })} /></Field>
      </Section>
      <Section title="Tulisan">
        <Field label="Judul" htmlFor="bd-title">
          <input id="bd-title" className="text-input" maxLength={LIMITS.maxText} value={b.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Subjudul" htmlFor="bd-sub">
          <input id="bd-sub" className="text-input" maxLength={LIMITS.maxText} value={b.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
        </Field>
        <Field label="Warna tulisan"><ColorPicker label="Warna tulisan" value={b.textColor} onChange={(textColor) => set({ textColor })} /></Field>
      </Section>
      {(isActive(catalog, 'led-backdrop') || b.led) && <Section title="Lampu">
        <Toggle label="LED lampu backdrop" hint="Garis lampu mengikuti bentuk panel" checked={b.led} onChange={(led) => set({ led })} />
        {!b.led && <PriceTag cost={nextUnitCost(design, catalog, 'led-backdrop')} />}
        {b.led && <Field label="Warna LED"><ColorPicker label="Warna LED" value={b.ledColor} onChange={(ledColor) => set({ ledColor })} swatches={['#FFEAA7', '#FFD6C2', '#FFB7B2', '#B57BFF', '#7FD1FF', '#FFFFFF']} /></Field>}
      </Section>}
      <Section title="Tambahan backdrop" aside="Seret ke panggung">
        <div className="card-list"><CatalogCard id="neon-nama" hint="Tulisan neon menyala di stand akrilik" /></div>
      </Section>
    </>
  );
};
