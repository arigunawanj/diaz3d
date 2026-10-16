'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getCharacterTexture } from '@/lib/characterSVGs';
import { type ItemProps, str } from './types';

const SIZE: Record<string, [number, number]> = { giraffe: [1.1, 1.6], dino: [1.15, 1.25] };

export const Character: React.FC<ItemProps> = ({ item }) => {
  const type = str(item.params.character, 'lion');
  const texture = useMemo(() => getCharacterTexture(type), [type]);
  const [w, h] = SIZE[type] ?? [1, 1.05];
  if (!texture) return null;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} alphaTest={0.5} roughness={0.6} side={THREE.DoubleSide} />
        <meshDepthMaterial attach="customDepthMaterial" map={texture} alphaTest={0.5} depthPacking={THREE.RGBADepthPacking} />
      </mesh>
      {/* Alpha-tested reverse follows the printed silhouette. */}
      <mesh position={[0, h / 2, -0.016]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} color="#d8cbb7" alphaTest={0.5} side={THREE.BackSide} roughness={0.9} />
      </mesh>
      <mesh position={[0, h * 0.35, -0.15]} rotation={[-0.28, 0, 0]} castShadow>
        <boxGeometry args={[0.08, h * 0.7, 0.02]} />
        <meshStandardMaterial color="#D4A373" roughness={0.8} />
      </mesh>
    </group>
  );
};
