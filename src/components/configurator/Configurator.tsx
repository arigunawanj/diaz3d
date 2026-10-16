'use client';

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import type { CatalogId } from '@/domain/design';
import type { CatalogItem } from '@/domain/catalog';
import { DEFAULT_PRESET_ID, getPreset } from '@/domain/presets';
import { designReducer, loadDraft, saveDraft } from '@/domain/editor';
import { priceDesign } from '@/domain/pricing';
import { SURFACE_BACKDROP, SURFACE_GARLAND, type CameraView } from '@/components/3d/constants';
import { dur } from '@/components/3d/motion';
import { ConfiguratorContext, type ConfiguratorApi, type PanelTab } from './context';
import { LeftPanel } from './LeftPanel';
import { ViewportOverlay } from './ViewportOverlay';
import { BottomBar } from './BottomBar';
import { PriceDrawer } from './PriceDrawer';
import { isDirty } from './TemplateTab';

const DecorScene = dynamic(() => import('@/components/3d/DecorScene').then((m) => m.DecorScene), {
  ssr: false,
  loading: () => <div className="scene-loading"><span>Menyiapkan panggung 3D…</span></div>,
});

const SHEET = { half: 45, full: 88 };

/** Mobile bottom sheet: drag the handle; it snaps to half or full height. */
function useSheet(root: React.RefObject<HTMLDivElement>) {
  const state = useRef({ h: SHEET.half });
  const apply = () => root.current?.style.setProperty('--sheet-h', `${state.current.h}%`);
  const snap = (to: number) => gsap.to(state.current, { h: to, duration: dur(0.35), ease: 'power3.out', onUpdate: apply });
  const onPointerDown = (e: React.PointerEvent) => {
    const el = root.current;
    if (!el) return;
    const startY = e.clientY;
    const startH = state.current.h;
    const height = el.getBoundingClientRect().height;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      state.current.h = Math.min(SHEET.full, Math.max(25, startH + ((startY - ev.clientY) / height) * 100));
      apply();
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      snap(state.current.h > (SHEET.half + SHEET.full) / 2 ? SHEET.full : SHEET.half);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const toggle = () => snap(state.current.h > SHEET.half + 1 ? SHEET.half : SHEET.full);
  return { onPointerDown, toggle };
}

export const Configurator: React.FC<{ catalog: CatalogItem[]; basePrice: number; renderSubmit?: (api: ConfiguratorApi & { close(): void; canvas: HTMLCanvasElement | null }) => React.ReactNode }> = ({
  catalog, basePrice, renderSubmit,
}) => {
  const [design, dispatch] = useReducer(designReducer, undefined, () => structuredClone(getPreset(DEFAULT_PRESET_ID)!.design));
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [focusUid, setFocusUid] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>('template');
  const [view, setView] = useState<CameraView>('front');
  const [priceOpen, setPriceOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const sheet = useSheet(root);

  // Draft: restore after mount (avoids hydration mismatch), then save debounced.
  useEffect(() => {
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* blocked */ }
    dispatch({ type: 'load', design: loadDraft(storage) });
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const t = window.setTimeout(() => {
      try { saveDraft(window.localStorage, design); } catch { /* blocked */ }
    }, 400);
    return () => window.clearTimeout(t);
  }, [design, loaded]);

  const pricing = useMemo(() => priceDesign(design, catalog, basePrice), [design, catalog, basePrice]);

  const select = useCallback((uid: string | null) => {
    if (uid === SURFACE_BACKDROP || uid === SURFACE_GARLAND) {
      setSelectedUid(null);
      setTab(uid === SURFACE_BACKDROP ? 'backdrop' : 'balon');
      return;
    }
    setSelectedUid(uid);
    if (uid === null) setFocusUid(null);
  }, []);
  const addItem = useCallback((catalogId: CatalogId, position?: [number, number]) => {
    const uid = crypto.randomUUID();
    dispatch({ type: 'addItem', uid, catalogId, position });
    setSelectedUid(uid);
  }, []);
  const removeItem = useCallback((uid: string) => {
    dispatch({ type: 'removeItem', uid });
    setSelectedUid(null);
    setFocusUid(null);
  }, []);
  const moveItem = useCallback((uid: string, position: [number, number]) => dispatch({ type: 'moveItem', uid, position }), []);

  const api: ConfiguratorApi = { design, dispatch, catalog, pricing, selectedUid, select, addItem, removeItem };
  const reset = () => {
    if (isDirty(design) && !window.confirm('Kembalikan desain ke tema awal? Perubahanmu akan hilang.')) return;
    select(null);
    dispatch({ type: 'applyPreset', presetId: design.presetId });
  };

  return (
    <ConfiguratorContext.Provider value={api}>
      <div className="cfg" ref={root}>
        <LeftPanel tab={tab} onTab={setTab}
          handle={<div className="sheet-handle" onPointerDown={sheet.onPointerDown} onDoubleClick={sheet.toggle} role="button" tabIndex={0}
            aria-label="Geser panel naik atau turun" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && sheet.toggle()}><span /></div>} />
        <div className="cfg-viewport">
          <DecorScene design={design} selectedUid={selectedUid} onSelect={select} onMoveItem={moveItem}
            onDropCatalog={(id, pos) => addItem(id, pos)} cameraView={view} focusUid={focusUid} canvasRef={canvasRef}
            toolbar={{
              onFocus: (uid) => setFocusUid((f) => (f === uid ? null : uid)),
              onRotate: (uid) => dispatch({ type: 'rotateItem', uid, deltaY: Math.PI / 4 }),
              onDuplicate: (uid) => { const newUid = crypto.randomUUID(); dispatch({ type: 'duplicateItem', uid, newUid }); setSelectedUid(newUid); },
              onDelete: removeItem,
            }} />
          <ViewportOverlay view={view} onView={(v) => { setFocusUid(null); setView(v); }} onReset={reset} />
        </div>
        <BottomBar onOpenPrice={() => setPriceOpen(true)} onSubmit={() => setSubmitOpen(true)} />
      </div>
      {priceOpen && <PriceDrawer pricing={pricing} onClose={() => setPriceOpen(false)} />}
      {submitOpen && renderSubmit?.({ ...api, close: () => setSubmitOpen(false), canvas: canvasRef.current })}
    </ConfiguratorContext.Provider>
  );
};
