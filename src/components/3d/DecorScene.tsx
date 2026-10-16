'use client';

import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import type { CatalogId, Design, PlacedItem } from '@/domain/design';
import { backdropHalfWidth } from '@/lib/decorGeometry';
import { StudioStage } from './StudioStage';
import { Backdrop } from './Backdrop';
import { BalloonGarland } from './BalloonGarland';
import { ITEM_BOUNDS, ITEM_RENDERERS, type PlacedCatalogId } from './items/registry';
import { dur } from './motion';

export type CameraView = 'front' | 'angle' | 'top' | 'closeup';
export const SURFACE_BACKDROP = '__backdrop';
export const SURFACE_GARLAND = '__garland';

export interface DecorSceneProps {
  design: Design;
  selectedUid: string | null;
  onSelect(uid: string | null): void;
  onMoveItem(uid: string, pos: [number, number]): void;
  onDropCatalog(catalogId: CatalogId, pos: [number, number]): void;
  cameraView: CameraView;
  focusUid: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  readOnly?: boolean;
  /** Rendered inside the Canvas for the selected item (toolbar, drag plane). */
  children?: React.ReactNode;
}

const VIEWS: Record<CameraView, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  front: { pos: [0, 2.3, 6.6], target: [0, 1.9, 0], fov: 45 },
  angle: { pos: [4.4, 3, 5.8], target: [0, 1.8, 0], fov: 46 },
  closeup: { pos: [-0.15, 1.4, 3.4], target: [0, 1.0, 0.9], fov: 40 },
  top: { pos: [1, 6.2, 6.4], target: [0, 1.2, 0.2], fov: 50 },
};

const CLICK_SLOP = 5;

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

const CameraRig: React.FC<{ view: CameraView; panelCount: number; focus: PlacedItem | null; enabled: boolean }> = ({ view, panelCount, focus, enabled }) => {
  const { camera, size } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const fx = focus?.position[0];
  const fz = focus?.position[1];

  useEffect(() => {
    const cfg = VIEWS[view];
    let target = new THREE.Vector3(...cfg.target);
    let position = new THREE.Vector3(...cfg.pos);
    if (fx !== undefined && fz !== undefined) {
      target = new THREE.Vector3(fx, 0.9, fz);
      position = new THREE.Vector3(fx * 0.7, 2.0, fz + 3.4);
    } else if (view !== 'closeup') {
      const width = Math.max(1, (backdropHalfWidth(panelCount) + 1) / 3);
      const aspect = size.width / size.height;
      position.sub(target).multiplyScalar(width * Math.max(1, 1.12 / aspect)).add(target);
    }
    const cam = camera as THREE.PerspectiveCamera;
    const d = dur(0.9);
    const tweens = [
      gsap.to(cam, { fov: cfg.fov, duration: d, ease: 'power2.inOut', onUpdate: () => cam.updateProjectionMatrix() }),
      gsap.to(camera.position, { x: position.x, y: position.y, z: position.z, duration: d, ease: 'power3.inOut' }),
    ];
    if (controls.current) {
      tweens.push(gsap.to(controls.current.target, {
        x: target.x, y: target.y, z: target.z, duration: d, ease: 'power3.inOut',
        onUpdate: () => controls.current?.update(),
      }));
    }
    return () => tweens.forEach((t) => t.kill());
  }, [view, panelCount, fx, fz, camera, size.width, size.height]);

  return (
    <OrbitControls ref={controls} makeDefault enabled={enabled} enableDamping dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.04} minDistance={1.5} maxDistance={18} target={[0, 1.9, 0]} />
  );
};

const SelectionRing: React.FC<{ radius: number }> = ({ radius }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(clock.elapsedTime * 4) * 0.25;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
      <ringGeometry args={[radius, radius + 0.045, 64]} />
      <meshBasicMaterial color="#C2552B" transparent opacity={0.7} toneMapped={false} />
    </mesh>
  );
};

interface AnimatedItemProps {
  item: PlacedItem;
  palette: string[];
  selected: boolean;
  leaving: boolean;
  delay: number;
  onGone(uid: string): void;
  onClick?(e: ThreeEvent<MouseEvent>): void;
  onPointerDown?(e: ThreeEvent<PointerEvent>): void;
}

/** Drops in with a bounce on mount; shrinks away before unmount. */
const AnimatedItem: React.FC<AnimatedItemProps> = ({ item, palette, selected, leaving, delay, onGone, onClick, onPointerDown }) => {
  const inner = useRef<THREE.Group>(null);
  const Renderer = ITEM_RENDERERS[item.catalogId as PlacedCatalogId];
  const bounds = ITEM_BOUNDS[item.catalogId as PlacedCatalogId];

  useLayoutEffect(() => {
    const g = inner.current;
    if (!g || leaving) return;
    const tl = gsap.timeline({ delay: dur(delay) });
    tl.fromTo(g.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: dur(0.6), ease: 'back.out(1.7)' }, 0)
      .fromTo(g.position, { y: 0.6 }, { y: 0, duration: dur(0.55), ease: 'bounce.out' }, 0);
    return () => { tl.kill(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!leaving || !inner.current) return;
    const t = gsap.to(inner.current.scale, { x: 0.001, y: 0.001, z: 0.001, duration: dur(0.25), ease: 'power2.in', onComplete: () => onGone(item.uid) });
    if (dur(1) === 0) onGone(item.uid);
    return () => { t.kill(); };
  }, [leaving, item.uid, onGone]);

  if (!Renderer) return null;
  return (
    <group position={[item.position[0], 0, item.position[1]]} rotation={[0, item.rotationY, 0]}
      onClick={leaving ? undefined : onClick} onPointerDown={leaving ? undefined : onPointerDown}>
      <group ref={inner}>
        <Renderer item={item} palette={palette} />
      </group>
      {selected && !leaving && <SelectionRing radius={bounds.radius} />}
    </group>
  );
};

/** Keeps removed items mounted long enough to animate out; staggers batches of new items. */
function usePresence(items: PlacedItem[]) {
  const prev = useRef<PlacedItem[]>([]);
  const [leaving, setLeaving] = useState<PlacedItem[]>([]);
  const delays = useRef(new Map<string, number>());
  const known = new Set(prev.current.map((i) => i.uid));
  const fresh = items.filter((i) => !known.has(i.uid));
  fresh.forEach((i, k) => { if (!delays.current.has(i.uid)) delays.current.set(i.uid, fresh.length > 1 ? 0.25 + k * 0.07 : 0); });

  useEffect(() => {
    const now = new Set(items.map((i) => i.uid));
    const removed = prev.current.filter((i) => !now.has(i.uid));
    if (removed.length) setLeaving((l) => [...l.filter((x) => !now.has(x.uid)), ...removed]);
    prev.current = items;
  }, [items]);

  const onGone = React.useCallback((uid: string) => setLeaving((l) => l.filter((x) => x.uid !== uid)), []);
  return { leaving, onGone, delayOf: (uid: string) => delays.current.get(uid) ?? 0 };
}

export const DecorScene: React.FC<DecorSceneProps> = ({
  design, selectedUid, onSelect, onDropCatalog, cameraView, focusUid, canvasRef, readOnly, children,
}) => {
  const mobile = useIsMobile();
  const { leaving, onGone, delayOf } = usePresence(design.items);
  const focus = useMemo(() => design.items.find((i) => i.uid === focusUid) ?? null, [design.items, focusUid]);

  const select = (uid: string | null) => (e: ThreeEvent<MouseEvent>) => {
    if (readOnly || e.delta > CLICK_SLOP) return;
    e.stopPropagation();
    onSelect(uid);
  };

  void onDropCatalog; // wired in by the drop target (Task 6)

  return (
    <Canvas
      ref={canvasRef}
      shadows={!mobile}
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      onPointerMissed={() => !readOnly && onSelect(null)}
    >
      <PerspectiveCamera makeDefault position={[0, 2.3, 6.6]} fov={45} />
      <CameraRig view={cameraView} panelCount={design.backdrop.panelCount} focus={focus} enabled />
      <Suspense fallback={null}>
        <StudioStage environment={design.environment} shadows={!mobile} onFloorClick={select(null)} />
        <Backdrop backdrop={design.backdrop} onClick={select(SURFACE_BACKDROP)} />
        <BalloonGarland garland={design.garland} panelCount={design.backdrop.panelCount} shadows={!mobile} onClick={select(SURFACE_GARLAND)} />
        {design.items.map((item) => (
          <AnimatedItem key={item.uid} item={item} palette={design.garland.palette} selected={item.uid === selectedUid}
            leaving={false} delay={delayOf(item.uid)} onGone={onGone} onClick={select(item.uid)} />
        ))}
        {leaving.map((item) => (
          <AnimatedItem key={`gone-${item.uid}`} item={item} palette={design.garland.palette} selected={false} leaving delay={0} onGone={onGone} />
        ))}
        {children}
      </Suspense>
    </Canvas>
  );
};
