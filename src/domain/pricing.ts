import { CATALOG_IDS, type CatalogId, type Design } from './design.ts';
import type { CatalogItem } from './catalog.ts';
import { getPreset } from './presets.ts';

export interface PriceLine {
  catalogId: CatalogId;
  name: string;
  unit: string;
  included: number;
  used: number;
  extraQty: number;
  unitPrice: number;
  subtotal: number;
}

export interface PriceBreakdown {
  base: number;
  lines: PriceLine[];
  total: number;
}

export function countUsage(d: Design): Record<CatalogId, number> {
  const usage = Object.fromEntries(CATALOG_IDS.map((id) => [id, 0])) as Record<CatalogId, number>;
  for (const item of d.items) usage[item.catalogId] += 1;
  usage.panel = d.backdrop.panelCount;
  usage['garland-meter'] = d.garland.lengthM;
  usage['led-backdrop'] = d.backdrop.led ? 1 : 0;
  usage['aksen-balon'] = d.garland.leafAccent ? 1 : 0;
  return usage;
}

/** Base package + add-ons beyond what the design's preset already includes. */
export function priceDesign(d: Design, catalog: CatalogItem[], basePrice: number): PriceBreakdown {
  const preset = getPreset(d.presetId);
  const included = preset ? countUsage(preset.design) : null;
  const used = countUsage(d);
  const lines: PriceLine[] = [];
  for (const c of catalog) {
    const u = used[c.id] ?? 0;
    if (u <= 0) continue;
    const inc = included?.[c.id] ?? 0;
    const extraQty = Math.max(0, u - inc);
    lines.push({
      catalogId: c.id, name: c.name, unit: c.unit, included: inc, used: u, extraQty,
      unitPrice: c.price, subtotal: Math.round(extraQty * c.price),
    });
  }
  return { base: basePrice, lines, total: basePrice + lines.reduce((s, l) => s + l.subtotal, 0) };
}

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

export const formatIDR = (n: number): string => idr.format(n).replace(/Rp\s+/, 'Rp');
