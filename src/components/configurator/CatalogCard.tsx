'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { CatalogId } from '@/domain/design';
import { formatIDR, nextUnitCost } from '@/domain/pricing';
import { CATALOG_DRAG_TYPE } from '@/components/3d/constants';
import { useConfigurator } from './context';
import { ITEM_ICONS } from './ui';

export const PriceTag: React.FC<{ cost: number; unit?: string }> = ({ cost, unit }) =>
  cost === 0
    ? <span className="price-tag is-included">Termasuk paket</span>
    : <span className="price-tag">+{formatIDR(cost)}{unit && <em> / {unit}</em>}</span>;

/** Placeable catalog item: click to drop at the default spot, or drag onto the 3D stage. */
export const CatalogCard: React.FC<{ id: CatalogId; hint: string }> = ({ id, hint }) => {
  const { design, catalog, addItem } = useConfigurator();
  const item = catalog.find((c) => c.id === id);
  if (!item || !item.active) return null;
  const Icon = ITEM_ICONS[id];
  const count = design.items.filter((i) => i.catalogId === id).length;
  const cost = nextUnitCost(design, catalog, id);

  return (
    <button type="button" className={`item-card${count ? ' is-active' : ''}`} draggable
      onDragStart={(e) => { e.dataTransfer.setData(CATALOG_DRAG_TYPE, id); e.dataTransfer.effectAllowed = 'copy'; }}
      onClick={() => addItem(id)}
      aria-label={`Tambah ${item.name}. ${cost ? `Tambahan ${formatIDR(cost)}` : 'Termasuk paket'}. Seret ke panggung untuk menaruh di posisi tertentu.`}>
      <span className="item-thumb" aria-hidden="true"><Icon size={26} strokeWidth={1.6} /></span>
      <span className="item-meta">
        <strong>{item.name}</strong>
        <small>{hint}</small>
        <PriceTag cost={cost} unit={item.unit} />
      </span>
      <span className="item-add" aria-hidden="true"><Plus size={17} /></span>
      {count > 0 && <span className="count-badge" aria-hidden="true">×{count}</span>}
    </button>
  );
};
