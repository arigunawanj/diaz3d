'use client';

import React, { useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { DEFAULT_DECORATION, PRICING_CONFIG } from '@/lib/constants';
import { DecorationState, CameraView } from '@/types/decoration';
import { TopNav } from '@/components/ui/TopNav';
import { CustomizerPanel } from '@/components/ui/CustomizerPanel';
import { PriceModal } from '@/components/ui/PriceModal';
import { FloatingTools } from '@/components/ui/FloatingTools';

// Dynamically load 3D Scene on client side only
const Scene = dynamic(() => import('@/components/3d/Scene').then((mod) => mod.Scene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 text-white gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
      <div className="text-center">
        <h2 className="text-lg font-bold">Memuat Diaz3D Studio...</h2>
        <p className="text-xs text-neutral-400">Menyiapkan panggung 3D & dekorasi</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [decoration, setDecoration] = useState<DecorationState>(DEFAULT_DECORATION);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [cameraView, setCameraView] = useState<CameraView>('front');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Partial update helper
  const handleUpdate = (updates: Partial<DecorationState>) => {
    setDecoration((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Price estimation calculation
  const totalPriceFormatted = useMemo(() => {
    let total = PRICING_CONFIG.basePackage;
    total += PRICING_CONFIG.balloonPerMeter * 4.5;
    total += PRICING_CONFIG.marqueeNumber;

    let characterCount = 0;
    if (decoration.leftCharacter !== 'none') characterCount++;
    if (decoration.centerLeftCharacter !== 'none') characterCount++;
    if (decoration.centerRightCharacter !== 'none') characterCount++;
    total += PRICING_CONFIG.characterCutout * characterCount;

    if (decoration.showPedestal) total += PRICING_CONFIG.cakePedestal;
    if (decoration.backdropLedGlow) total += PRICING_CONFIG.ledNeonOutline;

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(total);
  }, [decoration]);

  // Take snapshot from WebGL Canvas
  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `diaz3d-dekorasi-${decoration.titleText.toLowerCase().replace(/\s+/g, '-') || 'custom'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Failed to capture snapshot', e);
    }
  };

  return (
    <main className={`studio-shell relative w-screen h-dvh overflow-hidden bg-neutral-950 select-none ${panelCollapsed ? 'panel-collapsed' : ''}`}>
      {/* Top Navbar */}
      <TopNav
        cameraView={cameraView}
        setCameraView={setCameraView}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        onOpenPriceModal={() => setIsPriceModalOpen(true)}
        onTakeScreenshot={handleTakeSnapshot}
        totalPriceFormatted={totalPriceFormatted}
      />

      {/* Fullscreen 3D Scene */}
      <div className="studio-viewport">
        <Scene
          state={decoration}
          cameraView={cameraView}
          autoRotate={autoRotate}
          canvasRef={canvasRef}
        />
      </div>

      {/* On-Canvas Floating Helpers */}
      <FloatingTools
        cameraView={cameraView}
        setCameraView={setCameraView}
      />

      {/* Interactive Customization Drawer / Sidebar */}
      <CustomizerPanel
        state={decoration}
        onChange={handleUpdate}
        onCollapsedChange={setPanelCollapsed}
      />

      {/* Quotation & Order Modal */}
      <PriceModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        state={decoration}
        onDownloadSnapshot={handleTakeSnapshot}
      />
    </main>
  );
}
