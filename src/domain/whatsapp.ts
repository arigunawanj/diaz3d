import { formatIDR } from './pricing.ts';
import type { FinalLine } from './revision.ts';

export interface WaMessageInput {
  code: string;
  name: string;
  status: 'DISETUJUI' | 'DIREVISI';
  lines: FinalLine[];
  finalPrice: number;
  adminNote: string;
  viewUrl: string;
}

export function buildWaMessage(i: WaMessageInput): string {
  const intro = i.status === 'DISETUJUI'
    ? 'desain dekorasi kamu sudah kami periksa dan harganya *disetujui*.'
    : 'desain dekorasi kamu sudah kami periksa. Ada *penyesuaian harga* berikut.';
  return [
    `Halo ${i.name}, ${intro}`,
    '',
    `Kode pengajuan: *${i.code}*`,
    '',
    ...i.lines.map((l) => `• ${l.label}: ${formatIDR(l.amount)}`),
    '',
    `*Harga final: ${formatIDR(i.finalPrice)}*`,
    ...(i.adminNote ? ['', `Catatan: ${i.adminNote}`] : []),
    '',
    `Lihat desainmu: ${i.viewUrl}`,
    '',
    'Balas pesan ini untuk konfirmasi pemesanan. Terima kasih!',
  ].join('\n');
}

export const waLink = (phone62: string, text: string): string =>
  `https://wa.me/${phone62}?text=${encodeURIComponent(text)}`;
