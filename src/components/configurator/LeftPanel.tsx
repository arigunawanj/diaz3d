'use client';

import React from 'react';
import { LayoutTemplate, PanelsTopLeft, PartyPopper, Shapes } from 'lucide-react';
import { useConfigurator, type PanelTab } from './context';
import { TemplateTab } from './TemplateTab';
import { BackdropTab } from './BackdropTab';
import { BalloonTab } from './BalloonTab';
import { PropertiTab } from './PropertiTab';
import { Inspector } from './Inspector';

const TABS: { id: PanelTab; label: string; Icon: typeof Shapes }[] = [
  { id: 'template', label: 'Template', Icon: LayoutTemplate },
  { id: 'backdrop', label: 'Backdrop', Icon: PanelsTopLeft },
  { id: 'balon', label: 'Balon', Icon: PartyPopper },
  { id: 'properti', label: 'Properti', Icon: Shapes },
];

export const LeftPanel: React.FC<{ tab: PanelTab; onTab(t: PanelTab): void; handle?: React.ReactNode }> = ({ tab, onTab, handle }) => {
  const { design, selectedUid, select } = useConfigurator();
  const item = design.items.find((i) => i.uid === selectedUid) ?? null;

  return (
    <aside className="cfg-panel" aria-label="Pengaturan dekorasi">
      {handle}
      <div className="panel-head">
        <h2>Buat sesukamu.</h2>
        <p>Beberapa sentuhan. Banyak kemungkinan.</p>
      </div>
      {!item && (
        <div className="tabs" role="tablist" aria-label="Kategori">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls="panel-body" className="tab"
              onClick={() => { select(null); onTab(id); }}>
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      )}
      <div className="panel-body" id="panel-body" role={item ? undefined : 'tabpanel'} aria-labelledby={item ? undefined : `tab-${tab}`}>
        {item ? <Inspector item={item} /> : (
          <>
            {tab === 'template' && <TemplateTab />}
            {tab === 'backdrop' && <BackdropTab />}
            {tab === 'balon' && <BalloonTab />}
            {tab === 'properti' && <PropertiTab />}
          </>
        )}
      </div>
      <div className="panel-foot">
        <p>Satu paket, terpasang lengkap di lokasimu.</p>
        <small>Sudah termasuk pemasangan & transport · Harga estimasi</small>
      </div>
    </aside>
  );
};
