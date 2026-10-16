import { getPricingContext } from '@/server/pricingContext';
import { CatalogForm } from '@/components/admin/CatalogForm';

export const dynamic = 'force-dynamic';

export default async function AdminCatalog() {
  const { catalog, basePrice } = await getPricingContext();
  return (
    <main className="admin-main">
      <h1>Katalog & harga</h1>
      <p className="muted">Perubahan hanya berlaku untuk pengajuan baru. Pengajuan lama tetap memakai rincian saat diajukan.</p>
      <CatalogForm catalog={catalog} basePrice={basePrice} />
    </main>
  );
}
