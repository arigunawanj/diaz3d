'use client';

import React, { useState } from 'react';
import type { CatalogItem } from '@/domain/catalog';

export const CatalogForm: React.FC<{ catalog: CatalogItem[]; basePrice: number }> = ({ catalog, basePrice }) => {
  const [base, setBase] = useState(basePrice);
  const [items, setItems] = useState(catalog);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (id: string, patch: Partial<CatalogItem>) => setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/admin/catalog', {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ basePrice: base, items: items.map(({ id, price, active }) => ({ id, price, active })) }),
    });
    setMsg(res.ok ? 'Tersimpan. Berlaku untuk pengajuan baru.' : (await res.json().catch(() => ({}))).error ?? 'Gagal menyimpan');
    setBusy(false);
  };
  const num = (v: string) => Number(v.replace(/\D/g, '')) || 0;

  return (
    <form onSubmit={save} className="admin-card">
      <div className="field">
        <label htmlFor="base">Harga paket dasar (Rp)</label>
        <input id="base" className="text-input num" inputMode="numeric" value={String(base)} onChange={(e) => setBase(num(e.target.value))} />
      </div>
      <table className="rev-table">
        <thead><tr><th scope="col">Item</th><th scope="col">Harga (Rp)</th><th scope="col">Satuan</th><th scope="col">Aktif</th></tr></thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.name}</td>
              <td><input className="text-input num" aria-label={`Harga ${it.name}`} inputMode="numeric" value={String(it.price)} onChange={(e) => set(it.id, { price: num(e.target.value) })} /></td>
              <td className="muted">{it.unit}</td>
              <td><input type="checkbox" aria-label={`${it.name} aktif`} checked={it.active} onChange={(e) => set(it.id, { active: e.target.checked })} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="catalog-save">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan harga'}</button>
        {msg && <span role="status">{msg}</span>}
      </div>
    </form>
  );
};
