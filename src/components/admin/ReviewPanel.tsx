'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, MessageCircle } from 'lucide-react';
import { formatIDR } from '@/domain/pricing';
import type { FinalLine } from '@/domain/revision';
import { RevisionEditor } from './RevisionEditor';

interface Props {
  code: string;
  status: 'MENUNGGU' | 'DISETUJUI' | 'DIREVISI';
  estimate: number;
  draftLines: FinalLine[];
  adminNote: string;
  waSentAt: string | null;
}

export const ReviewPanel: React.FC<Props> = ({ code, status, estimate, draftLines, adminNote, waSentAt }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const patch = async (body: object) => {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/admin/submissions/${code}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? 'Gagal menyimpan');
    setBusy(false);
    router.refresh();
  };
  const sendWa = async () => {
    // Open the tab synchronously so pop-up blockers allow it, then point it at wa.me.
    const tab = window.open('', '_blank');
    const res = await fetch(`/api/admin/submissions/${code}/wa`, { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      if (tab) tab.location.href = data.url; else window.location.href = data.url;
      router.refresh();
    } else {
      tab?.close();
      setError(data.error ?? 'Gagal membuat pesan WhatsApp');
    }
  };

  return (
    <div className="review">
      <section className="admin-card">
        <h2>Setujui estimasi</h2>
        <p className="muted">Harga final = estimasi {formatIDR(estimate)}.</p>
        <button type="button" className="btn-primary" disabled={busy} onClick={() => patch({ action: 'approve' })}><Check size={16} /> Setujui</button>
      </section>
      <section className="admin-card">
        <h2>Revisi harga</h2>
        <RevisionEditor key={JSON.stringify(draftLines)} initial={draftLines} initialNote={adminNote} busy={busy} error={error}
          onSubmit={(lines, note) => patch({ action: 'revise', lines, adminNote: note })} />
      </section>
      <section className="admin-card">
        <h2>Kirim ke WhatsApp</h2>
        <p className="muted">{status === 'MENUNGGU' ? 'Setujui atau revisi harga dulu.' : waSentAt ? `Terakhir dibuka ${new Date(waSentAt).toLocaleString('id-ID')}.` : 'Belum dikirim.'}</p>
        <button type="button" className="btn-primary wa" disabled={status === 'MENUNGGU'} onClick={sendWa}><MessageCircle size={16} /> Kirim ke WA</button>
      </section>
    </div>
  );
};
