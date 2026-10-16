'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { Design } from '@/domain/design';
import { createBackdropShape, layoutPanels } from '@/lib/decorGeometry';
import { useTweenedColor } from './useTweenedColor';

interface BackdropProps {
  backdrop: Design['backdrop'];
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

const EXTRUDE = { depth: 0.08, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.012, bevelThickness: 0.012, curveSegments: 32 };

const Panel: React.FC<{ shape: Design['backdrop']['shape']; material: THREE.Material; ledColor: string | null }> = ({ shape, material, ledColor }) => {
  const geometry = useMemo(() => {
    // Double-arch alternates single arches across panels; the outline itself is a single arch.
    const outline = createBackdropShape(shape === 'double-arch' ? 'single-arch' : shape);
    const points = outline.getPoints(80).map((p) => new THREE.Vector3(p.x, p.y, 0.11));
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < points.length; i++) path.add(new THREE.LineCurve3(points[i - 1], points[i]));
    return { main: new THREE.ExtrudeGeometry(outline, EXTRUDE), trim: new THREE.TubeGeometry(path, 256, 0.012, 6, true) };
  }, [shape]);
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry]);

  return (
    <group>
      <mesh geometry={geometry.main} material={material} castShadow receiveShadow />
      {ledColor && (
        <mesh geometry={geometry.trim}>
          <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      )}
      {[-0.7, 0.7].map((x) => (
        <group key={x} position={[x, 0, -0.1]}>
          <mesh position={[0, 0.15, -0.05]} castShadow>
            <boxGeometry args={[0.04, 0.3, 0.04]} />
            <meshStandardMaterial color="#97866a" metalness={0.65} roughness={0.38} />
          </mesh>
          <mesh position={[0, 0, -0.18]} castShadow>
            <boxGeometry args={[0.32, 0.025, 0.55]} />
            <meshStandardMaterial color="#97866a" metalness={0.65} roughness={0.38} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const Backdrop: React.FC<BackdropProps> = ({ backdrop, onClick }) => {
  const mainMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.82 }), []);
  const secondaryMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.84 }), []);
  useTweenedColor(mainMat, backdrop.mainColor);
  useTweenedColor(secondaryMat, backdrop.secondaryColor);
  useEffect(() => () => { mainMat.dispose(); secondaryMat.dispose(); }, [mainMat, secondaryMat]);

  const slots = layoutPanels(backdrop.panelCount);
  const textY = backdrop.shape === 'round' ? 2.05 : 2.45;

  return (
    <group position={[0, 0.025, -0.2]} onClick={onClick}>
      {slots.map((slot, i) => {
        const alt = backdrop.shape === 'double-arch' ? i % 2 === 1 : !slot.isCenter && backdrop.panelCount > 1;
        return (
          <group key={i} position={[slot.x, 0, slot.z]} scale={slot.scale}>
            <Panel shape={backdrop.shape} material={alt ? secondaryMat : mainMat} ledColor={backdrop.led ? backdrop.ledColor : null} />
            {slot.isCenter && (
              <group position={[0, textY, 0.13]}>
                <Text position={[0, 0.16, 0]} fontSize={0.27} maxWidth={1.8} textAlign="center" color={backdrop.textColor} anchorX="center" anchorY="middle">
                  {backdrop.title}
                </Text>
                <Text position={[0, -0.19, 0]} fontSize={0.12} maxWidth={1.8} textAlign="center" letterSpacing={0.13} color={backdrop.textColor} anchorX="center" anchorY="middle">
                  {backdrop.subtitle}
                </Text>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
