'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle2, X } from 'lucide-react';
import { formatIDR } from '@/domain/pricing';
import { dur } from '@/components/3d/motion';
import { useConfigurator } from './context';
import { PriceLines } from './PriceDrawer';

type Errors = Partial<Record<'name' | 'wa' | 'eventDate' | 'location' | 'notes' | 'form', string>>;

const todayJakarta = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

export const SubmitModal: React.FC<{ canvas: HTMLCanvasElement | null; onClose(): void }> = ({ canvas, onClose }) => {
  const { design, pricing } = useConfigurator();
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ code: string; token: string } | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLInputElement>(null);
  const screenshot = useMemo(() => {
    try { return canvas?.toDataURL('image/png') ?? null; } catch { return null; }
  }, [canvas]);

  useEffect(() => {
    first.current?.focus();
    const t = gsap.fromTo(card.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: dur(0.35), ease: 'power3.out' });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { t.kill(); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setErrors({});
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(form), design, screenshot }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDone(data);
      else setErrors(data.field && data.field !== 'body' && !String(data.field).includes('.') && data.field !== 'design'
        ? { [data.field]: data.error } : { form: data.error ?? 'Gagal mengirim. Coba lagi.' });
    } catch {
      setErrors({ form: 'Tidak dapat terhubung. Periksa koneksi lalu coba lagi.' });
    } finally {
      setSending(false);
    }
  };

  const field = (name: keyof Errors, label: string, input: React.ReactElement) => (
    <div className="field">
      <label htmlFor={`s-${name}`}>{label}</label>
      {React.cloneElement(input, {
        id: `s-${name}`, name, className: 'text-input', 'aria-invalid': !!errors[name],
        'aria-describedby': errors[name] ? `s-${name}-err` : undefined,
      })}
      {errors[name] && <p className="field-error" id={`s-${name}-err`} role="alert">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" ref={card} role="dialog" aria-modal="true" aria-labelledby="submit-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="vp-icon modal-close" aria-label="Tutup" onClick={onClose}><X size={18} /></button>
        {done ? (
          <div className="modal-done">
            <CheckCircle2 size={48} strokeWidth={1.5} aria-hidden="true" />
            <h2 id="submit-title">Desainmu sudah terkirim.</h2>
            <p>Kode pengajuan</p>
            <strong className="code">{done.code}</strong>
            <p>Admin akan memeriksa harga final dan menghubungi kamu via WhatsApp.</p>
            <div className="modal-actions">
              <a className="btn-primary" href={`/d/${done.code}?t=${done.token}`}>Lihat desain tersimpan</a>
              <button type="button" className="btn-ghost" onClick={onClose}>Kembali ke editor</button>
            </div>
          </div>
        ) : (
          <div className="modal-grid">
            <div className="modal-summary">
              <h2 id="submit-title">Ajukan desain</h2>
              {screenshot && <img src={screenshot} alt="Pratinjau desain dekorasi" className="modal-shot" />}
              <div className="modal-lines"><PriceLines pricing={pricing} /></div>
              <div className="modal-total"><span>Total estimasi</span><strong>{formatIDR(pricing.total)}</strong></div>
            </div>
            <form className="modal-form" onSubmit={submit} noValidate>
              <p className="modal-lead">Isi data berikut. Admin akan memeriksa harga final dan mengirimkannya ke WhatsApp kamu.</p>
              {field('name', 'Nama', <input ref={first} autoComplete="name" maxLength={60} required />)}
              {field('wa', 'Nomor WhatsApp', <input type="tel" inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" required />)}
              {field('eventDate', 'Tanggal acara', <input type="date" min={todayJakarta()} required />)}
              {field('location', 'Lokasi / kota', <input autoComplete="address-level2" maxLength={80} required />)}
              {field('notes', 'Catatan (opsional)', <textarea rows={3} maxLength={500} />)}
              {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
              <button type="submit" className="btn-primary modal-submit" disabled={sending}>{sending ? 'Mengirim…' : 'Kirim pengajuan'}</button>
              <small className="modal-note">Harga di atas estimasi. Harga final dikonfirmasi admin.</small>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
