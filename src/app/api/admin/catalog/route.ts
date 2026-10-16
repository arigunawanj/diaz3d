import { NextResponse } from 'next/server';
import { parseCatalogUpdate } from '@/domain/revision';
import { ValidationError } from '@/domain/validate';
import { DEFAULT_CATALOG } from '@/domain/catalog';
import { db } from '@/server/db';

export const runtime = 'nodejs';

export async function PUT(req: Request) {
  try {
    const update = parseCatalogUpdate(await req.json().catch(() => null));
    await db.$transaction([
      db.setting.upsert({ where: { key: 'basePackagePrice' }, update: { value: String(update.basePrice) }, create: { key: 'basePackagePrice', value: String(update.basePrice) } }),
      ...update.items.map((it) => {
        const seed = DEFAULT_CATALOG.find((c) => c.id === it.id)!;
        return db.catalogItem.upsert({ where: { id: it.id }, update: { price: it.price, active: it.active }, create: { ...seed, price: it.price, active: it.active } });
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message, field: e.field }, { status: 400 });
    throw e;
  }
}
