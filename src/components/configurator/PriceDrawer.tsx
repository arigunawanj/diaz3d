'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { formatIDR, type PriceBreakdown } from '@/domain/pricing';
import { dur } from '@/components/3d/motion';

const qty = (n: number, unit: string) => `${n.toLocaleString('id-ID')} ${unit}`;

export const PriceLines: React.FC<{ pricing: PriceBreakdown }> = ({ pricing }) => (
  <>
    <div className="line">
      <span>Paket dasar<small>Pemasangan, transport, 1 panel, garland 4,5 m & item bawaan tema</small></span>
      <b>{formatIDR(pricing.base)}</b>
    </div>
    {pricing.lines.map((l) => (
      <div className="line" key={l.catalogId}>
        <span>{l.name}<small>{l.extraQty > 0 ? `+${qty(l.extraQty, l.unit)} × ${formatIDR(l.unitPrice)}` : `${qty(l.used, l.unit)} · termasuk paket`}</small></span>
        {l.extraQty > 0 ? <b>{formatIDR(l.subtotal)}</b> : <span className="incl">Termasuk</span>}
      </div>
    ))}
  </>
);

export const PriceDrawer: React.FC<{ pricing: PriceBreakdown; onClose(): void }> = ({ pricing, onClose }) => {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeBtn.current?.focus();
    const t = gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: dur(0.35), ease: 'power3.out' });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { t.kill(); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" ref={panel} role="dialog" aria-modal="true" aria-labelledby="drawer-title" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2 id="drawer-title">Rincian estimasi</h2>
          <button ref={closeBtn} type="button" className="vp-icon" aria-label="Tutup rincian" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="drawer-body"><PriceLines pricing={pricing} /></div>
        <footer>
          <span>Total estimasi<small>Harga final dikonfirmasi admin</small></span>
          <strong>{formatIDR(pricing.total)}</strong>
        </footer>
      </div>
    </div>
  );
};
