'use client';

// Temporary dev harness for the 3D scene (replaced by the configurator in Task 7).
import React, { useReducer, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { PRESETS, DEFAULT_PRESET_ID, getPreset } from '@/domain/presets';
import { designReducer } from '@/domain/editor';
import type { CameraView } from '@/components/3d/DecorScene';

const DecorScene = dynamic(() => import('@/components/3d/DecorScene').then((m) => m.DecorScene), { ssr: false });

export default function Home() {
  const [design, dispatch] = useReducer(designReducer, structuredClone(getPreset(DEFAULT_PRESET_ID)!.design));
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<CameraView>('front');
  const [focus, setFocus] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
        <select value={design.presetId} onChange={(e) => dispatch({ type: 'applyPreset', presetId: e.target.value })}>
          {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={() => dispatch({ type: 'setBackdrop', patch: { panelCount: design.backdrop.panelCount + 1 } })}>panel+ ({design.backdrop.panelCount})</button>
        <button onClick={() => dispatch({ type: 'setBackdrop', patch: { panelCount: design.backdrop.panelCount - 1 } })}>panel-</button>
        <button onClick={() => dispatch({ type: 'setGarland', patch: { lengthM: design.garland.lengthM + 1.5 } })}>garland+ ({design.garland.lengthM})</button>
        <button onClick={() => dispatch({ type: 'setGarland', patch: { palette: ['#C2552B', '#F2C14E', '#FFFFFF'] } })}>palette</button>
        <button onClick={() => dispatch({ type: 'addItem', uid: crypto.randomUUID(), catalogId: 'balon-jumbo' })}>+jumbo</button>
        <button onClick={() => selected && dispatch({ type: 'removeItem', uid: selected })}>hapus</button>
        {(['front', 'angle', 'top', 'closeup'] as const).map((v) => <button key={v} onClick={() => setView(v)}>{v}</button>)}
        <span>selected: {selected ?? '-'}</span>
      </div>
      <div style={{ flex: 1 }}>
        <DecorScene design={design} selectedUid={selected} onSelect={setSelected} onMoveItem={(uid, position) => dispatch({ type: 'moveItem', uid, position })}
          onDropCatalog={(catalogId, position) => dispatch({ type: 'addItem', uid: crypto.randomUUID(), catalogId, position })}
          cameraView={view} focusUid={focus} canvasRef={canvasRef}
          toolbar={{
            onFocus: (uid) => setFocus((f) => (f === uid ? null : uid)),
            onRotate: (uid) => dispatch({ type: 'rotateItem', uid, deltaY: Math.PI / 4 }),
            onDuplicate: (uid) => dispatch({ type: 'duplicateItem', uid, newUid: crypto.randomUUID() }),
            onDelete: (uid) => { dispatch({ type: 'removeItem', uid }); setSelected(null); },
          }} />
      </div>
    </main>
  );
}
