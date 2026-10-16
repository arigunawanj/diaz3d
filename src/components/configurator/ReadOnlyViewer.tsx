'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Design } from '@/domain/design';
import type { CameraView } from '@/components/3d/constants';

const DecorScene = dynamic(() => import('@/components/3d/DecorScene').then((m) => m.DecorScene), {
  ssr: false,
  loading: () => <div className="scene-loading"><span>Menyiapkan panggung 3D…</span></div>,
});

const VIEWS: { id: CameraView; label: string }[] = [
  { id: 'front', label: 'Depan' }, { id: 'angle', label: 'Samping' }, { id: 'top', label: 'Atas' }, { id: 'closeup', label: 'Dekat' },
];
const noop = () => {};

/** Orbit-only 3D view of a saved design. */
export const ReadOnlyViewer: React.FC<{ design: Design }> = ({ design }) => {
  const [view, setView] = useState<CameraView>('front');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <div className="ro-viewer">
      <DecorScene design={design} selectedUid={null} onSelect={noop} onMoveItem={noop} onDropCatalog={noop}
        cameraView={view} focusUid={null} canvasRef={canvasRef} readOnly />
      <div className="vp-pill ro-views" role="group" aria-label="Sudut kamera">
        {VIEWS.map((v) => <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>)}
      </div>
    </div>
  );
};
