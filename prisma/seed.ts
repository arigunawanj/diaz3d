// Run: npm run db:seed — upserts catalog prices and the base package price.
import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATALOG, BASE_PACKAGE_PRICE } from '../src/domain/catalog.ts';

const db = new PrismaClient();

for (const item of DEFAULT_CATALOG) {
  // Keep prices the admin already changed; only create missing rows.
  await db.catalogItem.upsert({ where: { id: item.id }, update: {}, create: item });
}
await db.setting.upsert({
  where: { key: 'basePackagePrice' },
  update: {},
  create: { key: 'basePackagePrice', value: String(BASE_PACKAGE_PRICE) },
});
console.log(`Seeded ${await db.catalogItem.count()} catalog items.`);
await db.$disconnect();
