'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';
import { LIMITS } from '@/domain/design';
import { nextUnitCost } from '@/domain/pricing';
import { useConfigurator } from './context';
import { CatalogCard, PriceTag } from './CatalogCard';
import { Field, Section, Seg, Stepper, Toggle } from './ui';

export const BalloonTab: React.FC = () => {
  const { design, dispatch, catalog } = useConfigurator();
  const g = design.garland;
  const set = (patch: Partial<typeof g>) => dispatch({ type: 'setGarland', patch });
  const setColor = (i: number, hex: string) => set({ palette: g.palette.map((c, k) => (k === i ? hex : c)) });

  return (
    <>
      <Section title="Balon garland" aside="4,5 m termasuk paket">
        <div className="field-row">
          <PriceTag cost={nextUnitCost(design, catalog, 'garland-meter')} unit="meter tambahan" />
          <Stepper label="panjang garland" value={g.lengthM} min={LIMITS.garlandMin} max={LIMITS.garlandMax} step={LIMITS.garlandStep}
            format={(v) => `${v.toLocaleString('id-ID')} m`} onChange={(lengthM) => set({ lengthM })} />
        </div>
        <Toggle label="Tampilkan garland" checked={g.visible} onChange={(visible) => set({ visible })} hint="Disembunyikan tidak mengurangi harga paket" />
      </Section>
      <Section title="Palet warna" aside={`${g.palette.length} dari ${LIMITS.paletteMax} warna`}>
        <div className="swatches">
          {g.palette.map((c, i) => (
            <span key={i} className="palette-chip">
              <label className="swatch" style={{ background: c, display: 'block', cursor: 'pointer' }} title={`Ubah warna ${i + 1}`}>
                <span className="sr-only">Ubah warna balon {i + 1}</span>
                <input type="color" value={c} onChange={(e) => setColor(i, e.target.value.toUpperCase())} style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
              </label>
              {g.palette.length > LIMITS.paletteMin && (
                <button type="button" className="remove" aria-label={`Hapus warna ${i + 1}`} onClick={() => set({ palette: g.palette.filter((_, k) => k !== i) })}><X size={11} /></button>
              )}
            </span>
          ))}
          {g.palette.length < LIMITS.paletteMax && (
            <button type="button" className="swatch-custom" aria-label="Tambah warna balon" onClick={() => set({ palette: [...g.palette, '#FFFFFF'] })}><Plus size={14} /></button>
          )}
        </div>
      </Section>
      <Section title="Gaya balon">
        <Field label="Campuran ukuran">
          <div className="seg" role="group" aria-label="Campuran ukuran">
            {(['s5', 's12', 's18'] as const).map((k) => (
              <button key={k} type="button" aria-pressed={g.sizes[k]}
                onClick={() => set({ sizes: { ...g.sizes, [k]: !g.sizes[k] } })}
                disabled={g.sizes[k] && Object.values(g.sizes).filter(Boolean).length === 1}>
                {k.slice(1)}&quot;
              </button>
            ))}
          </div>
        </Field>
        <Field label="Kepadatan">
          <Seg label="Kepadatan" value={g.density} onChange={(density) => set({ density })}
            options={[{ value: 'jarang', label: 'Jarang' }, { value: 'sedang', label: 'Sedang' }, { value: 'padat', label: 'Padat' }]} />
        </Field>
        <Field label="Finishing">
          <Seg label="Finishing" value={g.finish} onChange={(finish) => set({ finish })}
            options={[{ value: 'glossy', label: 'Glossy' }, { value: 'doff', label: 'Doff' }, { value: 'metalik', label: 'Metalik' }, { value: 'chrome', label: 'Chrome' }]} />
        </Field>
        <Field label="Motif">
          <Seg label="Motif" value={g.pattern} onChange={(pattern) => set({ pattern })}
            options={[{ value: 'polos', label: 'Polos' }, { value: 'dalmatian', label: 'Dalmatian' }, { value: 'polka', label: 'Polkadot' }]} />
        </Field>
        <Toggle label="Aksen daun" hint="Monstera & palem di sela balon" checked={g.leafAccent} onChange={(leafAccent) => set({ leafAccent })} />
        {!g.leafAccent && <PriceTag cost={nextUnitCost(design, catalog, 'aksen-balon')} />}
      </Section>
      <Section title="Balon tambahan" aside="Seret ke panggung">
        <div className="card-list">
          <CatalogCard id="tiang-balon" hint="Tiang balon setinggi 2 m" />
          <CatalogCard id="balon-jumbo" hint="Balon 36 inci dengan pemberat" />
          <CatalogCard id="balon-gantung" hint="Rangkaian balon helium" />
        </div>
      </Section>
    </>
  );
};
