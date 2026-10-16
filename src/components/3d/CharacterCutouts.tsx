'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getCharacterTexture } from '@/lib/characterSVGs';

interface CharacterCutoutsProps {
  leftCharacter: 'giraffe' | 'dino' | 'bear' | 'astronaut' | 'none';
  centerLeftCharacter: 'lion' | 'tiger' | 'rabbit' | 'none';
  centerRightCharacter: 'elephant' | 'koala' | 'fox' | 'none';
}

interface CutoutItemProps {
  type: string;
  position: [number, number, number];
  size: [number, number];
  rotationY?: number;
}

const SingleCutout: React.FC<CutoutItemProps> = ({
  type,
  position,
  size,
  rotationY = 0,
}) => {
  const texture = useMemo(() => {
    return getCharacterTexture(type);
  }, [type]);

  if (!texture) return null;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Front Illustration Plane */}
      <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial
          map={texture}
          transparent={false}
          alphaTest={0.5}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
        <meshDepthMaterial attach="customDepthMaterial" map={texture} alphaTest={0.5} depthPacking={THREE.RGBADepthPacking} />
      </mesh>

      {/* Alpha-tested reverse follows the printed silhouette. */}
      <mesh position={[0, size[1] / 2, -0.016]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial map={texture} color="#d8cbb7" alphaTest={0.5} side={THREE.BackSide} roughness={0.9} />
      </mesh>

      {/* Back Prop Stand Leg (Easel standee) */}
      <mesh
        position={[0, size[1] * 0.35, -0.15]}
        rotation={[-0.28, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.08, size[1] * 0.7, 0.02]} />
        <meshStandardMaterial color="#D4A373" roughness={0.8} />
      </mesh>
    </group>
  );
};

export const CharacterCutouts: React.FC<CharacterCutoutsProps> = ({
  leftCharacter,
  centerLeftCharacter,
  centerRightCharacter,
}) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Left Character (e.g. Giraffe, Dino, Bear) */}
      {leftCharacter !== 'none' && (
        <SingleCutout
          type={leftCharacter}
          position={[-1.75, 0, 0.45]}
          size={leftCharacter === 'giraffe' ? [1.1, 1.85] : [1.1, 1.4]}
          rotationY={0.15}
        />
      )}

      {/* Center-Left Character (e.g. Sitting Lion) */}
      {centerLeftCharacter !== 'none' && (
        <SingleCutout
          type={centerLeftCharacter}
          position={[-0.85, 0, 0.95]}
          size={[0.9, 0.9]}
          rotationY={0.05}
        />
      )}

      {/* Center-Right Character (e.g. Baby Elephant) */}
      {centerRightCharacter !== 'none' && (
        <SingleCutout
          type={centerRightCharacter}
          position={[0.55, 0, 0.9]}
          size={[0.95, 0.95]}
          rotationY={-0.08}
        />
      )}
    </group>
  );
};
