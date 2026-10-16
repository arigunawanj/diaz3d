'use client';

import React from 'react';
import { MousePointerClick, Sparkles } from 'lucide-react';
import { CameraView } from '@/types/decoration';

interface FloatingToolsProps {
  cameraView: CameraView;
  setCameraView: (view: CameraView) => void;
}

export const FloatingTools: React.FC<FloatingToolsProps> = ({
  cameraView,
  setCameraView,
}) => {
  return (
    <div className="studio-tools fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-20 flex flex-col gap-2 pointer-events-none">
      {/* 3D Interaction Hint Badge */}
      <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl bg-neutral-900/80 backdrop-blur-md border border-white/10 text-neutral-300 text-xs shadow-lg max-w-fit">
        <MousePointerClick className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="hidden sm:inline">Klik & geser untuk putar sudut 3D • Scroll untuk zoom</span>
        <span className="sm:hidden">Geser untuk putar 3D</span>
      </div>

      {/* Quick Camera Views for mobile/tablet */}
      <div className="pointer-events-auto flex xl:hidden items-center gap-1 bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 text-xs text-white max-w-fit">
        {(['front', 'angle', 'closeup', 'top'] as CameraView[]).map((v) => (
          <button
            key={v}
            onClick={() => setCameraView(v)}
            className={`px-2.5 py-1 rounded-xl font-medium capitalize text-[11px] transition-all ${
              cameraView === v
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {v === 'angle' ? '3D' : v}
          </button>
        ))}
      </div>
    </div>
  );
};
