'use client';

import React from 'react';
import { X, Check, MessageCircle, Sparkles, FileText, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DecorationState } from '@/types/decoration';
import { PRICING_CONFIG } from '@/lib/constants';

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: DecorationState;
  onDownloadSnapshot: () => void;
}

export const PriceModal: React.FC<PriceModalProps> = ({
  isOpen,
  onClose,
  state,
  onDownloadSnapshot,
}) => {
  if (!isOpen) return null;

  // Calculate items
  const items: { label: string; qty: string; price: number }[] = [
    {
      label: `Backdrop Panel (${state.backdropShape.toUpperCase()}) + Board Nama "${state.titleText} ${state.subtitleText}"`,
      qty: '1 Set',
      price: PRICING_CONFIG.basePackage,
    },
    {
      label: `Organic Balloon Garland (${state.balloonFinish.toUpperCase()}) + Motif`,
      qty: '4.5 Meter',
      price: PRICING_CONFIG.balloonPerMeter * 4.5,
    },
  ];

  // Character cutouts
  let characterCount = 0;
  if (state.leftCharacter !== 'none') characterCount++;
  if (state.centerLeftCharacter !== 'none') characterCount++;
  if (state.centerRightCharacter !== 'none') characterCount++;

  if (characterCount > 0) {
    items.push({
      label: `Karakter Standee 2.5D Custom (${characterCount} karakter)`,
      qty: `${characterCount} Pcs`,
      price: PRICING_CONFIG.characterCutout * characterCount,
    });
  }

  // Marquee
  items.push({
    label: `Lampu Marquee Angka 3D (Angka ${state.marqueeNumber})`,
    qty: '1 Unit',
    price: PRICING_CONFIG.marqueeNumber,
  });

  // Pedestal & Cake
  if (state.showPedestal) {
    items.push({
      label: 'Meja Silinder Plinth Pedestal + Stand Kue',
      qty: '1 Set',
      price: PRICING_CONFIG.cakePedestal,
    });
  }

  // Neon
  if (state.backdropLedGlow) {
    items.push({
      label: 'LED Neon Light Perimeter Glow',
      qty: '1 Pcs',
      price: PRICING_CONFIG.ledNeonOutline,
    });
  }

  const grandTotal = items.reduce((acc, curr) => acc + curr.price, 0);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleWhatsAppOrder = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const charactersSelected = [
      state.leftCharacter !== 'none' ? state.leftCharacter : null,
      state.centerLeftCharacter !== 'none' ? state.centerLeftCharacter : null,
      state.centerRightCharacter !== 'none' ? state.centerRightCharacter : null,
    ]
      .filter(Boolean)
      .join(', ');

    const message = `Halo Admin Diaz3D Decoration! 👋%0A%0ASaya ingin memesan dekorasi pesta dengan rincian kustom berikut:%0A%0A` +
      `🎉 *Nama Acara:* ${state.titleText} ${state.subtitleText}%0A` +
      `🎪 *Model Backdrop:* ${state.backdropShape}%0A` +
      `🎨 *Warna Backdrop:* ${state.backdropMainColor} / ${state.backdropSecondaryColor}%0A` +
      `💡 *LED Neon Glow:* ${state.backdropLedGlow ? 'Ya' : 'Tidak'}%0A` +
      `🎈 *Warna Balon:* Primary (${state.balloonPrimary}), Secondary (${state.balloonSecondary}), Accent (${state.balloonAccent})%0A` +
      `✨ *Finishing Balon:* ${state.balloonFinish}%0A` +
      `🦁 *Karakter Cutout:* ${charactersSelected || 'Tanpa karakter'}%0A` +
      `🔢 *Lampu Marquee Angka:* ${state.marqueeNumber}%0A` +
      `🎂 *Meja Pedestal & Cake:* ${state.showPedestal ? 'Ya' : 'Tidak'}%0A%0A` +
      `💰 *Estimasi Total:* ${formatIDR(grandTotal)}%0A%0A` +
      `Mohon info ketersediaan tanggal dan jadwal bookingnya. Terima kasih!`;

    window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Rincian Estimasi Biaya</h2>
            <p className="text-xs text-neutral-400">Kalkulasi paket dekorasi berdasarkan desain 3D Anda</p>
          </div>
        </div>

        {/* Itemized List */}
        <div className="divide-y divide-white/5 border-y border-white/10 py-2">
          {items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs sm:text-sm">
              <div className="space-y-0.5">
                <span className="font-medium text-neutral-200 block">{item.label}</span>
                <span className="text-[11px] text-neutral-400">Kuantitas: {item.qty}</span>
              </div>
              <span className="font-semibold text-neutral-100 whitespace-nowrap">
                {formatIDR(item.price)}
              </span>
            </div>
          ))}
        </div>

        {/* Total Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-800/80 to-neutral-800/40 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block font-medium">Total Estimasi Paket</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {formatIDR(grandTotal)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 font-semibold">
              Include Bongkar Pasang
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleWhatsAppOrder}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Kirim Desain & Pesan via WhatsApp</span>
          </button>

          <button
            onClick={() => {
              onDownloadSnapshot();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Simpan Gambar Desain (Snapshot PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
