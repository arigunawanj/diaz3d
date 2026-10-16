import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { approvalLines } from '@/domain/revision';
import { formatIDR } from '@/domain/pricing';
import { db } from '@/server/db';
import { toView, viewUrl } from '@/server/adminSubmissions';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ReviewPanel } from '@/components/admin/ReviewPanel';
import { ReadOnlyViewer } from '@/components/configurator/ReadOnlyViewer';
import { PriceLines } from '@/components/configurator/PriceDrawer';

export const dynamic = 'force-dynamic';

export default async function AdminDetail({ params }: { params: { code: string } }) {
  const row = await db.submission.findUnique({ where: { code: params.code } });
  if (!row) notFound();
  const s = toView(row);

  return (
    <main className="admin-main">
      <Link href="/admin" className="inspector-back"><ArrowLeft size={15} /> Semua pengajuan</Link>
      <div className="admin-title">
        <h1>{s.code}</h1>
        <StatusBadge status={s.status} />
      </div>
      <div className="admin-detail">
        <div>
          <section className="admin-card">
            <ReadOnlyViewer design={s.design} />
            {s.screenshot && <a href={`/api/uploads/${s.screenshot}`} target="_blank" rel="noreferrer" className="muted">Buka screenshot pengajuan ↗</a>}
          </section>
          <section className="admin-card">
            <h2>Pelanggan</h2>
            <dl className="admin-dl">
              <dt>Nama</dt><dd>{s.name}</dd>
              <dt>WhatsApp</dt><dd>+{s.wa}</dd>
              <dt>Tanggal acara</dt><dd>{new Date(s.eventDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</dd>
              <dt>Lokasi</dt><dd>{s.location}</dd>
              {s.notes && <><dt>Catatan</dt><dd>{s.notes}</dd></>}
              <dt>Link pelanggan</dt><dd><a href={viewUrl(s)} target="_blank" rel="noreferrer">{viewUrl(s)}</a></dd>
            </dl>
          </section>
          <section className="admin-card">
            <h2>Rincian estimasi (saat diajukan)</h2>
            <PriceLines pricing={s.breakdown} />
            <div className="rev-total"><span>Estimasi</span><strong>{formatIDR(s.estimate)}</strong></div>
            {s.finalPrice !== null && <div className="rev-total"><span>Harga final</span><strong>{formatIDR(s.finalPrice)}</strong></div>}
          </section>
        </div>
        <ReviewPanel code={s.code} status={s.status} estimate={s.estimate} adminNote={s.adminNote}
          draftLines={s.finalLines ?? approvalLines(s.breakdown)} waSentAt={s.waSentAt?.toISOString() ?? null} />
      </div>
    </main>
  );
}
