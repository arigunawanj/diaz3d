'use client';

import React from 'react';
import { ArrowRight, ChevronUp, ShoppingBag } from 'lucide-react';
import { useConfigurator } from './context';
import { RollingNumber } from './RollingNumber';

export const BottomBar: React.FC<{ onOpenPrice(): void; onSubmit(): void }> = ({ onOpenPrice, onSubmit }) => {
  const { design, pricing } = useConfigurator();
  const pieces = design.items.length + 2;
  return (
    <div className="cfg-bar bar">
      <div className="bar-left">
        <span className="bar-icon" aria-hidden="true"><ShoppingBag size={22} strokeWidth={1.6} /></span>
        <div>
          <strong>Dekorasimu, tersusun.</strong>
          <small>{pieces} elemen · Estimasi biaya</small>
        </div>
      </div>
      <div className="bar-right">
        <button type="button" className="bar-total" onClick={onOpenPrice} aria-label="Lihat rincian harga">
          <small>Total estimasi <ChevronUp size={13} aria-hidden="true" /></small>
          <strong><RollingNumber value={pricing.total} /></strong><em>/ acara</em>
        </button>
        <button type="button" className="btn-primary" onClick={onSubmit}>Ajukan Desain <ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </div>
  );
};
