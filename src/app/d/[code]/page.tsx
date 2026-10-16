import { timingSafeEqual } from 'node:crypto';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { formatIDR } from '@/domain/pricing';
import { db } from '@/server/db';
import { toView } from '@/server/adminSubmissions';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ReadOnlyViewer } from '@/components/configurator/ReadOnlyViewer';
import { PriceLines } from '@/components/configurator/PriceDrawer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Desain tersimpan — diaz3d.', robots: { index: false, follow: false } };

const sameToken = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

const STATUS_TEXT = {
  MENUNGGU: 'Desainmu sedang diperiksa admin. Harga final akan dikirim via WhatsApp.',
  DISETUJUI: 'Harga desainmu sudah disetujui.',
  DIREVISI: 'Admin menyesuaikan harga desainmu. Lihat rincian dan catatan di bawah.',
} as const;

export default async function SavedDesign({ params, searchParams }: { params: { code: string }; searchParams: { t?: string } }) {
  const row = await db.submission.findUnique({ where: { code: params.code } });
  if (!row || !searchParams.t || !sameToken(row.token, searchParams.t)) notFound();
  const s = toView(row);
  const final = s.finalLines && s.finalPrice !== null;

  return (
    <main className="site">
      <Header />
      <section className="saved">
        <div className="saved-head">
          <div>
            <small className="saved-code">{s.code}</small>
            <h1>Desain untuk {s.name}</h1>
            <p className="muted">{new Date(s.eventDate).toLocaleDateString('id-ID', { dateStyle: 'full' })} · {s.location}</p>
          </div>
          <StatusBadge status={s.status} />
        </div>
        <div className="saved-grid">
          <div className="saved-view"><ReadOnlyViewer design={s.design} /></div>
          <aside className="admin-card">
            <p>{STATUS_TEXT[s.status]}</p>
            <h2>{final ? 'Rincian harga final' : 'Rincian estimasi'}</h2>
            {final ? (
              s.finalLines!.map((l, i) => <div className="line" key={i}><span>{l.label}</span><b>{formatIDR(l.amount)}</b></div>)
            ) : <PriceLines pricing={s.breakdown} />}
            <div className="rev-total">
              <span>{final ? 'Harga final' : 'Estimasi'}</span>
              <strong>{formatIDR(final ? s.finalPrice! : s.estimate)}</strong>
            </div>
            {s.adminNote && <div className="saved-note"><b>Catatan admin</b><p>{s.adminNote}</p></div>}
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
