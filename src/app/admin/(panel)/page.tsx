import Link from 'next/link';
import { formatIDR } from '@/domain/pricing';
import { db } from '@/server/db';
import { STATUSES, type Status } from '@/server/adminSubmissions';
import { StatusBadge } from '@/components/admin/StatusBadge';

export const dynamic = 'force-dynamic';

const TABS: { id: Status | 'SEMUA'; label: string }[] = [
  { id: 'SEMUA', label: 'Semua' }, { id: 'MENUNGGU', label: 'Menunggu' }, { id: 'DISETUJUI', label: 'Disetujui' }, { id: 'DIREVISI', label: 'Direvisi' },
];

export default async function AdminList({ searchParams }: { searchParams: { status?: string } }) {
  const status = STATUSES.includes(searchParams.status as Status) ? (searchParams.status as Status) : undefined;
  const rows = await db.submission.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: 'desc' }, take: 200 });

  return (
    <main className="admin-main">
      <h1>Pengajuan desain</h1>
      <div className="seg admin-filter" role="group" aria-label="Filter status">
        {TABS.map((t) => (
          <Link key={t.id} href={t.id === 'SEMUA' ? '/admin' : `/admin?status=${t.id}`} aria-current={(status ?? 'SEMUA') === t.id ? 'page' : undefined}>{t.label}</Link>
        ))}
      </div>
      {rows.length === 0 ? <p className="muted">Belum ada pengajuan.</p> : (
        <div className="admin-card table-wrap">
          <table className="admin-table">
            <thead><tr><th scope="col">Kode</th><th scope="col">Nama</th><th scope="col">Tanggal acara</th><th scope="col">Estimasi</th><th scope="col">Harga final</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/admin/${r.code}`} className="code-link">{r.code}</Link></td>
                  <td>{r.name}<small className="muted block">{r.location}</small></td>
                  <td>{new Date(r.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>{formatIDR(r.estimate)}</td>
                  <td>{r.finalPrice === null ? '—' : formatIDR(r.finalPrice)}</td>
                  <td><StatusBadge status={r.status as Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
