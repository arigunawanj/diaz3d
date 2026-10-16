'use client';

import React from 'react';
import { Box, Check, Leaf, Move3d, Plus, RotateCcw, Zap } from 'lucide-react';
import { getPreset } from '@/domain/presets';
import { formatIDR, nextUnitCost } from '@/domain/pricing';
import type { CameraView } from '@/components/3d/constants';
import { useConfigurator } from './context';

const VIEWS: { id: CameraView; label: string }[] = [
  { id: 'front', label: 'Depan' },
  { id: 'angle', label: 'Samping' },
  { id: 'top', label: 'Atas' },
  { id: 'closeup', label: 'Dekat' },
];

export const ViewportOverlay: React.FC<{ view: CameraView; onView(v: CameraView): void; onReset(): void }> = ({ view, onView, onReset }) => {
  const { design, dispatch, catalog } = useConfigurator();
  const preset = getPreset(design.presetId);
  const dark = design.environment.light === 'dramatis';
  const chips = [
    { key: 'led', label: 'LED backdrop', Icon: Zap, on: design.backdrop.led, id: 'led-backdrop' as const, toggle: () => dispatch({ type: 'setBackdrop', patch: { led: !design.backdrop.led } }) },
    { key: 'leaf', label: 'Daun aksen', Icon: Leaf, on: design.garland.leafAccent, id: 'aksen-balon' as const, toggle: () => dispatch({ type: 'setGarland', patch: { leafAccent: !design.garland.leafAccent } }) },
  ];

  return (
    <>
      <div className="vp-top">
        <div className={`vp-title${dark ? ' is-dark' : ''}`}>
          <small>LIVE DECOR</small>
          <h2>{preset?.name ?? 'Dekorasi custom'}</h2>
          <p>{preset?.description}</p>
        </div>
        <div className="vp-actions">
          <div className="vp-pill" role="group" aria-label="Sudut kamera">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => onView(v.id)}>
                {v.id === 'front' && <Box size={15} aria-hidden="true" />}<span className="lbl">{v.label}</span>
              </button>
            ))}
          </div>
          <button type="button" className="vp-icon" aria-label="Reset ke tema awal" title="Reset ke tema awal" onClick={onReset}><RotateCcw size={18} /></button>
        </div>
      </div>
      <div className="vp-bottom">
        <span className="vp-hint"><Move3d size={16} aria-hidden="true" /> Seret untuk melihat sekeliling</span>
        <div className="vp-chips">
          {chips.map(({ key, label, Icon, on, id, toggle }) => {
            const cost = nextUnitCost(design, catalog, id);
            return (
              <button key={key} type="button" className="vp-chip" aria-pressed={on} onClick={toggle}>
                <Icon size={16} aria-hidden="true" /> {label}
                {on ? <Check size={15} aria-hidden="true" /> : <><Plus size={15} aria-hidden="true" />{cost > 0 && <small>{formatIDR(cost)}</small>}</>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="vp-strip">
        <span>Ukuran item mendekati skala asli. Tampilan ruangan ilustratif.</span>
        <span>3D / INTERAKTIF</span>
      </div>
    </>
  );
};
