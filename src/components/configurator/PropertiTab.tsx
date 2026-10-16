'use client';

import React from 'react';
import { useConfigurator } from './context';
import { CatalogCard } from './CatalogCard';
import { Field, Section, Seg } from './ui';

export const PropertiTab: React.FC = () => {
  const { design, dispatch } = useConfigurator();
  const env = design.environment;
  const set = (patch: Partial<typeof env>) => dispatch({ type: 'setEnvironment', patch });
  return (
    <>
      <Section title="Properti panggung" aside="Klik atau seret">
        <div className="card-list">
          <CatalogCard id="karakter" hint="Cutout karakter setinggi 100 cm" />
          <CatalogCard id="angka-lampu" hint="Angka marquee dengan lampu bohlam" />
          <CatalogCard id="meja-kue" hint="Meja silinder dengan kue" />
          <CatalogCard id="meja-formal" hint="Meja panjang dengan taplak & bunga" />
          <CatalogCard id="standing-flower" hint="Rangkaian bunga berdiri" />
          <CatalogCard id="tanaman" hint="Tanaman monstera dalam pot" />
          <CatalogCard id="karpet" hint="Alas panggung 2,4 × 1,4 m" />
          <CatalogCard id="lampu-sorot" hint="Lampu sorot ke backdrop" />
        </div>
      </Section>
      <Section title="Suasana" aside="Gratis">
        <Field label="Lantai">
          <Seg label="Lantai" value={env.floor} onChange={(floor) => set({ floor })}
            options={[{ value: 'wood', label: 'Kayu' }, { value: 'marble', label: 'Marmer' }, { value: 'checkered', label: 'Kotak-kotak' }]} />
        </Field>
        <Field label="Cahaya">
          <Seg label="Cahaya" value={env.light} onChange={(light) => set({ light })}
            options={[{ value: 'hangat', label: 'Hangat' }, { value: 'netral', label: 'Netral' }, { value: 'dramatis', label: 'Dramatis' }]} />
        </Field>
      </Section>
    </>
  );
};
