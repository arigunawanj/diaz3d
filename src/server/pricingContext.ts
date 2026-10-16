import { BASE_PACKAGE_PRICE, DEFAULT_CATALOG, type CatalogItem } from '@/domain/catalog';
import type { CatalogId } from '@/domain/design';
import { db } from './db';
import type { PricingContext } from './submissionRecord';

/** Catalog prices from the DB; falls back to the seed values when the DB is empty. */
export async function getPricingContext(): Promise<PricingContext> {
  const [rows, base] = await Promise.all([
    db.catalogItem.findMany(),
    db.setting.findUnique({ where: { key: 'basePackagePrice' } }),
  ]);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const catalog: CatalogItem[] = DEFAULT_CATALOG.map((d) => {
    const r = byId.get(d.id);
    return r ? { ...d, name: r.name, price: r.price, unit: r.unit, active: r.active, id: r.id as CatalogId } : d;
  });
  const basePrice = base ? Number(base.value) : BASE_PACKAGE_PRICE;
  return { catalog, basePrice: Number.isFinite(basePrice) ? basePrice : BASE_PACKAGE_PRICE };
}
