'use client';

import React, { useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import type { ThreeEvent } from '@react-three/fiber';
import type { Design } from '@/domain/design';
import { buildBalloonLayout, type BalloonSpec } from '@/lib/decorGeometry';
import { createDalmatianTexture, createPolkaTexture } from '@/lib/textures';
import { dur } from './motion';
import { LeafAccents } from './Foliage';

interface BalloonGarlandProps {
  garland: Design['garland'];
  panelCount: number;
  shadows: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

export const FINISH: Record<Design['garland']['finish'], { roughness: number; metalness: number; envMapIntensity: number }> = {
  glossy: { roughness: 0.3, metalness: 0, envMapIntensity: 1 },
  doff: { roughness: 0.72, metalness: 0, envMapIntensity: 1 },
  metalik: { roughness: 0.28, metalness: 0.45, envMapIntensity: 2 },
  // Fully metallic spheres go black with only softbox reflections; keep some diffuse colour.
  chrome: { roughness: 0.14, metalness: 0.6, envMapIntensity: 2.4 },
};

const tmp = new THREE.Object3D();
const KNOT_OFFSET = new THREE.Vector3(0, -0.96, 0);

/** Writes balloon + knot matrices; `revealed` drives the balloon-by-balloon grow animation. */
function writeMatrices(mesh: THREE.InstancedMesh, knots: THREE.InstancedMesh, list: BalloonSpec[], revealed: number, offset: number) {
  list.forEach((b, i) => {
    const grow = Math.min(1, Math.max(0, (revealed - (offset + i)) / 6));
    const s = grow === 0 ? 0.0001 : grow * (1 + 0.12 * Math.sin(grow * Math.PI));
    tmp.position.set(...b.pos);
    tmp.rotation.set(...b.rotation);
    tmp.scale.set(b.radius * s, b.radius * b.scaleY * s, b.radius * s);
    tmp.updateMatrix();
    mesh.setMatrixAt(i, tmp.matrix);
    tmp.position.add(KNOT_OFFSET.clone().multiply(tmp.scale).applyEuler(tmp.rotation));
    tmp.scale.multiplyScalar(0.28);
    tmp.rotation.x += Math.PI;
    tmp.updateMatrix();
    knots.setMatrixAt(offset + i, tmp.matrix);
  });
  mesh.count = list.length;
  mesh.instanceMatrix.needsUpdate = true;
}

export const BalloonGarland: React.FC<BalloonGarlandProps> = ({ garland, panelCount, shadows, onClick }) => {
  const { lengthM, density, sizes, palette, pattern, finish } = garland;
  const layout = useMemo(
    () => buildBalloonLayout({ panelCount, lengthM, density, sizes }),
    [panelCount, lengthM, density, sizes.s5, sizes.s12, sizes.s18], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const plain = useMemo(() => layout.filter((b) => pattern === 'polos' || !b.pattern), [layout, pattern]);
  const patterned = useMemo(() => (pattern === 'polos' ? [] : layout.filter((b) => b.pattern)), [layout, pattern]);
  const capacity = Math.ceil(layout.length / 256) * 256;

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 32, 24), []);
  const knotGeo = useMemo(() => new THREE.ConeGeometry(0.2, 0.22, 8), []);
  const plainMat = useMemo(() => new THREE.MeshStandardMaterial(), []);
  const patternMat = useMemo(() => new THREE.MeshStandardMaterial(), []);
  useEffect(() => {
    Object.assign(plainMat, FINISH[finish]);
    Object.assign(patternMat, FINISH[finish]);
    patternMat.map = pattern === 'dalmatian' ? createDalmatianTexture() : pattern === 'polka' ? createPolkaTexture() : null;
    plainMat.needsUpdate = patternMat.needsUpdate = true;
  }, [finish, pattern, plainMat, patternMat]);
  useEffect(() => () => [sphereGeo, knotGeo, plainMat, patternMat].forEach((d) => d.dispose()), [sphereGeo, knotGeo, plainMat, patternMat]);

  const plainRef = useRef<THREE.InstancedMesh>(null);
  const patternRef = useRef<THREE.InstancedMesh>(null);
  const knotRef = useRef<THREE.InstancedMesh>(null);
  const revealed = useRef({ value: 0 });

  // Grow: tween the reveal cursor toward the new balloon count.
  useLayoutEffect(() => {
    const apply = () => {
      if (!plainRef.current || !patternRef.current || !knotRef.current) return;
      writeMatrices(plainRef.current, knotRef.current, plain, revealed.current.value, 0);
      writeMatrices(patternRef.current, knotRef.current, patterned, revealed.current.value, plain.length);
      knotRef.current.count = layout.length;
      knotRef.current.instanceMatrix.needsUpdate = true;
    };
    const target = layout.length + 6;
    const from = Math.min(revealed.current.value, target);
    revealed.current.value = from;
    const tween = gsap.to(revealed.current, {
      value: target,
      duration: dur(Math.min(1.4, 0.25 + (target - from) * 0.006)),
      ease: 'power1.out',
      onUpdate: apply,
      onComplete: apply,
    });
    apply();
    return () => { tween.kill(); };
  }, [layout, plain, patterned, capacity]);

  // Colour: cross-fade every instance from its current colour to the new palette assignment.
  useLayoutEffect(() => {
    const knots = knotRef.current;
    const meshes: [THREE.InstancedMesh | null, BalloonSpec[], boolean, number][] = [
      [plainRef.current, plain, false, 0],
      [patternRef.current, patterned, true, plain.length],
    ];
    const tweens = meshes.map(([mesh, list, isPattern, offset]) => {
      if (!mesh || !knots) return null;
      const colors = palette.map((c) => new THREE.Color(c));
      const white = new THREE.Color('#FFFFFF');
      const from = list.map((_, i) => (mesh.instanceColor && i < mesh.count ? mesh.getColorAt(i, new THREE.Color()) : null));
      const to = list.map((b) => (isPattern ? white : colors[b.colorSlot % colors.length]));
      const state = { p: 0 };
      const c = new THREE.Color();
      const paint = () => {
        to.forEach((t, i) => {
          c.copy(from[i] ?? t).lerp(t, state.p);
          mesh.setColorAt(i, c);
          knots.setColorAt(offset + i, c);
        });
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        if (knots.instanceColor) knots.instanceColor.needsUpdate = true;
      };
      return gsap.to(state, { p: 1, duration: dur(0.5), ease: 'power2.out', onUpdate: paint, onStart: paint, onComplete: paint });
    });
    return () => tweens.forEach((t) => t?.kill());
  }, [palette, plain, patterned, capacity]);

  return (
    <group visible={garland.visible} onClick={onClick}>
      <instancedMesh key={`p${capacity}`} ref={plainRef} args={[sphereGeo, plainMat, capacity]} castShadow={shadows} receiveShadow />
      <instancedMesh key={`d${capacity}`} ref={patternRef} args={[sphereGeo, patternMat, capacity]} castShadow={shadows} receiveShadow />
      <instancedMesh key={`k${capacity}`} ref={knotRef} args={[knotGeo, plainMat, capacity]} />
      {garland.leafAccent && <LeafAccents panelCount={panelCount} />}
    </group>
  );
};
