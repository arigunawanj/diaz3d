'use client';

import React from 'react';
import { ArrowLeft, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { CHARACTER_IDS, LIMITS, type PlacedItem } from '@/domain/design';
import { itemIsIncluded } from '@/domain/pricing';
import { useConfigurator } from './context';
import { PriceTag } from './CatalogCard';
import { ColorPicker, Field, Section, Seg, Toggle } from './ui';

const CHARACTER_LABEL: Record<string, string> = { giraffe: 'Jerapah', lion: 'Singa', elephant: 'Gajah', dino: 'Dino', bear: 'Beruang', astronaut: 'Astronot' };

const Params: React.FC<{ item: PlacedItem; set(params: PlacedItem['params']): void; palette: string[] }> = ({ item, set, palette }) => {
  const p = item.params;
  const color = (fallback: string) => (typeof p.color === 'string' ? p.color : fallback);
  switch (item.catalogId) {
    case 'karakter':
      return (
        <Field label="Karakter">
          <div className="choice-grid" role="group" aria-label="Pilih karakter">
            {CHARACTER_IDS.map((c) => (
              <button key={c} type="button" className="choice" aria-pressed={p.character === c} onClick={() => set({ character: c })}>{CHARACTER_LABEL[c]}</button>
            ))}
          </div>
        </Field>
      );
    case 'angka-lampu':
      return (
        <>
          <Field label="Angka">
            <div className="digit-grid" role="group" aria-label="Pilih angka">
              {Array.from({ length: 10 }, (_, d) => (
                <button key={d} type="button" aria-pressed={p.digit === d} onClick={() => set({ digit: d })}>{d}</button>
              ))}
            </div>
          </Field>
          <Toggle label="Lampu menyala" checked={p.lit !== false} onChange={(lit) => set({ lit })} />
        </>
      );
    case 'meja-kue':
      return (
        <>
          <Field label="Gaya meja">
            <Seg label="Gaya meja" value={p.style === 'ribbed' ? 'ribbed' : 'smooth'} onChange={(style) => set({ style })}
              options={[{ value: 'smooth', label: 'Polos' }, { value: 'ribbed', label: 'Bergaris' }]} />
          </Field>
          <Field label="Warna meja"><ColorPicker label="Warna meja" value={color('#F2E8DC')} onChange={(c) => set({ color: c })} /></Field>
          <Toggle label="Tampilkan kue" checked={p.cake !== false} onChange={(cake) => set({ cake })} />
        </>
      );
    case 'neon-nama':
      return (
        <>
          <Field label="Tulisan neon" htmlFor="neon-text">
            <input id="neon-text" className="text-input" maxLength={LIMITS.maxText} value={typeof p.text === 'string' ? p.text : ''} onChange={(e) => set({ text: e.target.value })} />
          </Field>
          <Field label="Warna neon"><ColorPicker label="Warna neon" value={color('#FF7AB6')} onChange={(c) => set({ color: c })}
            swatches={['#FF7AB6', '#B57BFF', '#7FD1FF', '#FFE16B', '#FFFFFF', '#FF6B4A']} /></Field>
        </>
      );
    case 'tiang-balon': case 'balon-jumbo': case 'balon-gantung':
      return <Field label="Warna balon"><ColorPicker label="Warna balon" value={color(palette[0])} onChange={(c) => set({ color: c })} swatches={[...palette, '#FFFFFF', '#F2C14E', '#C9A54C']} /></Field>;
    case 'standing-flower': case 'meja-formal': case 'karpet':
      return <Field label="Warna"><ColorPicker label="Warna" value={color('#FFFFFF')} onChange={(c) => set({ color: c })} /></Field>;
    default:
      return null;
  }
};

export const Inspector: React.FC<{ item: PlacedItem }> = ({ item }) => {
  const { design, dispatch, catalog, select, removeItem } = useConfigurator();
  const entry = catalog.find((c) => c.id === item.catalogId);
  const included = itemIsIncluded(design, item.uid);
  const rotate = (deltaY: number) => dispatch({ type: 'rotateItem', uid: item.uid, deltaY });

  return (
    <div>
      <button type="button" className="inspector-back" onClick={() => select(null)}><ArrowLeft size={15} /> Katalog</button>
      <div className="inspector-title">
        <div>
          <h3>{entry?.name ?? item.catalogId}</h3>
          <PriceTag cost={included ? 0 : entry?.price ?? 0} />
        </div>
      </div>
      <Section title="Pengaturan">
        <Params item={item} palette={design.garland.palette} set={(params) => dispatch({ type: 'updateItemParams', uid: item.uid, params })} />
      </Section>
      <Section title="Posisi" aside="Seret item di panggung untuk memindahkan">
        <div className="seg">
          <button type="button" onClick={() => rotate(-Math.PI / 8)}><RotateCcw size={15} aria-hidden="true" /> Putar kiri</button>
          <button type="button" onClick={() => rotate(Math.PI / 8)}><RotateCw size={15} aria-hidden="true" /> Putar kanan</button>
        </div>
      </Section>
      <button type="button" className="btn-danger" onClick={() => removeItem(item.uid)}><Trash2 size={16} /> Hapus dari panggung</button>
      {included && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Item ini termasuk paket. Menghapusnya tidak mengurangi harga.</p>}
    </div>
  );
};
