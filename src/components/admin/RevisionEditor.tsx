'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatIDR } from '@/domain/pricing';
import { totalOf, type FinalLine } from '@/domain/revision';

interface Props {
  initial: FinalLine[];
  initialNote: string;
  busy: boolean;
  error: string;
  onSubmit(lines: FinalLine[], note: string): void;
}

export const RevisionEditor: React.FC<Props> = ({ initial, initialNote, busy, error, onSubmit }) => {
  const [lines, setLines] = useState(initial);
  const [note, setNote] = useState(initialNote);
  const set = (i: number, patch: Partial<FinalLine>) => setLines((ls) => ls.map((l, k) => (k === i ? { ...l, ...patch } : l)));

  return (
    <form className="rev" onSubmit={(e) => { e.preventDefault(); onSubmit(lines, note); }}>
      <table className="rev-table">
        <thead><tr><th scope="col">Keterangan</th><th scope="col">Nominal (Rp)</th><th><span className="sr-only">Hapus</span></th></tr></thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td><input className="text-input" aria-label={`Keterangan baris ${i + 1}`} value={l.label} maxLength={80} onChange={(e) => set(i, { label: e.target.value })} /></td>
              <td><input className="text-input num" aria-label={`Nominal baris ${i + 1}`} inputMode="numeric" value={String(l.amount)}
                onChange={(e) => set(i, { amount: Number(e.target.value.replace(/[^\d-]/g, '')) || 0 })} /></td>
              <td><button type="button" className="vp-icon" aria-label={`Hapus baris ${i + 1}`} disabled={lines.length === 1}
                onClick={() => setLines((ls) => ls.filter((_, k) => k !== i))}><Trash2 size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn-ghost" onClick={() => setLines((ls) => [...ls, { label: '', amount: 0 }])}><Plus size={16} /> Tambah baris</button>
      <div className="rev-total"><span>Total final</span><strong>{formatIDR(totalOf(lines))}</strong></div>
      <div className="field">
        <label htmlFor="rev-note">Catatan untuk pelanggan (wajib)</label>
        <textarea id="rev-note" className="text-input" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} required />
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan revisi harga'}</button>
    </form>
  );
};
