'use client';

import React, { useEffect, useState } from 'react';
import type { TemplateType } from '@/domain/design';
import { PRESETS } from '@/domain/presets';
import { isDirty } from '@/domain/editor';
import { useConfigurator } from './context';
import { Section, Seg } from './ui';

const TYPES: { value: TemplateType; label: string }[] = [
  { value: 'anak', label: 'Ulang Tahun Anak' },
  { value: 'sweet17', label: 'Sweet 17' },
  { value: 'formal', label: 'Formal' },
];

export const TemplateTab: React.FC = () => {
  const { design, dispatch, select } = useConfigurator();
  const [type, setType] = useState<TemplateType>(design.templateType);
  const [pending, setPending] = useState<string | null>(null);
  // Follow the design when a saved draft (or another template) is loaded.
  useEffect(() => setType(design.templateType), [design.templateType]);

  const apply = (presetId: string) => {
    select(null);
    dispatch({ type: 'applyPreset', presetId });
    setPending(null);
  };
  const choose = (presetId: string) => (isDirty(design) && presetId !== design.presetId ? setPending(presetId) : apply(presetId));

  return (
    <>
      <Section title="Jenis acara" aside="Pilih satu">
        <Seg<TemplateType> label="Jenis acara" value={type} options={TYPES} onChange={setType} />
      </Section>
      <Section title="Tema siap pakai" aside="Termasuk paket">
        <div className="card-list">
          {PRESETS.filter((p) => p.templateType === type).map((p) => (
            <div key={p.id}>
              <button type="button" className="preset-card" aria-pressed={design.presetId === p.id} onClick={() => choose(p.id)}>
                <span className="preset-dots" aria-hidden="true">
                  {[p.design.backdrop.mainColor, ...p.design.garland.palette].slice(0, 4).map((c, i) => <i key={i} style={{ background: c }} />)}
                </span>
                <span>
                  <strong>{p.name} <em>{p.badge}</em></strong>
                  <small>{p.description}</small>
                </span>
              </button>
              {pending === p.id && (
                <div className="confirm" role="alertdialog" aria-label="Ganti tema">
                  <p>Ganti ke <b>{p.name}</b>? Perubahan desainmu saat ini akan diganti dengan isi tema ini.</p>
                  <div>
                    <button type="button" className="btn-primary" onClick={() => apply(p.id)}>Ganti tema</button>
                    <button type="button" className="btn-ghost" onClick={() => setPending(null)}>Batal</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};
