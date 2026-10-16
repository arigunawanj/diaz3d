'use client';

import React from 'react';
import { Camera, RotateCw, Sparkles, Download, MessageSquareText } from 'lucide-react';
import { CameraView } from '@/types/decoration';

interface TopNavProps {
  cameraView: CameraView;
  setCameraView: (view: CameraView) => void;
  autoRotate: boolean;
  setAutoRotate: (fn: (prev: boolean) => boolean) => void;
  onOpenPriceModal: () => void;
  onTakeScreenshot: () => void;
  totalPriceFormatted: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  cameraView,
  setCameraView,
  autoRotate,
  setAutoRotate,
  onOpenPriceModal,
  onTakeScreenshot,
  totalPriceFormatted,
}) => {
  const cameraPresets: { id: CameraView; label: string }[] = [
    { id: 'front', label: 'Front' },
    { id: 'angle', label: '3D Angle' },
    { id: 'closeup', label: 'Close-Up' },
    { id: 'top', label: 'Overview' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-neutral-900/80 backdrop-blur-md border-b border-white/10 text-white">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
            Diaz3D <span className="text-amber-400 font-semibold text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">Deco Studio</span>
          </h1>
          <p className="text-[11px] text-neutral-400 hidden sm:block">
            Interactive 3D Party & Birthday Decoration Customizer
          </p>
        </div>
      </div>

      {/* Camera Presets & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Camera angle pills */}
        <div className="hidden xl:flex items-center bg-neutral-800/80 p-1 rounded-xl border border-white/10 text-xs">
          <Camera className="w-3.5 h-3.5 text-neutral-400 ml-2 mr-1" />
          {cameraPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setCameraView(preset.id)}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                cameraView === preset.id
                  ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Auto Rotate Toggle */}
        <button
          onClick={() => setAutoRotate((prev) => !prev)}
          title="Toggle Auto Rotate"
          className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
            autoRotate
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-neutral-800/80 border-white/10 text-neutral-300 hover:bg-neutral-700/80'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline text-xs">Putar</span>
        </button>

        {/* Screenshot Button */}
        <button
          onClick={onTakeScreenshot}
          title="Download Snapshot Desain"
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-800/80 border border-white/10 text-neutral-300 hover:text-white hover:bg-neutral-700/80 transition-all flex items-center gap-1.5 text-xs font-medium"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Foto 3D</span>
        </button>

        {/* Price & Order Action */}
        <button
          onClick={onOpenPriceModal}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Order / {totalPriceFormatted}</span>
        </button>
      </div>
    </header>
  );
};
