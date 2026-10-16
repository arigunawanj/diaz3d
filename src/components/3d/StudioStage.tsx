'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Environment, Lightformer } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { Design } from '@/domain/design';
import { createWoodFloorTexture } from '@/lib/textures';

const LIGHTS = {
  hangat: { ambient: '#FFF4E6', key: 1.25, keyColor: '#FFF1DC' },
  netral: { ambient: '#FFFFFF', key: 1.15, keyColor: '#FFFFFF' },
  dramatis: { ambient: '#C9CCE0', key: 1.6, keyColor: '#FFE7C4' },
} as const;

interface StudioStageProps {
  environment: Design['environment'];
  shadows: boolean;
  onFloorClick?: (e: ThreeEvent<MouseEvent>) => void;
}

export const StudioStage: React.FC<StudioStageProps> = ({ environment, shadows, onFloorClick }) => {
  const { map: woodMap, roughness: woodRoughness } = useMemo(() => createWoodFloorTexture(), []);
  const tileMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#eae2d7';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#625f55';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillRect(128, 128, 128, 128);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(7, 7);
    return map;
  }, []);
  useEffect(() => () => tileMap.dispose(), [tileMap]);
  const { floor } = environment;
  const light = LIGHTS[environment.light];
  const dark = environment.light === 'dramatis';

  return (
    <group>
      <color attach="background" args={[dark ? '#2B2C33' : '#E4DED4']} />
      <ambientLight color={light.ambient} intensity={dark ? 0.22 : 0.38} />
      <hemisphereLight args={['#fff8ec', '#8a7c68', dark ? 0.25 : 0.45]} />
      {/* Local softboxes give latex and chrome readable reflections without an HDR download. */}
      <Environment resolution={128} frames={1}>
        <Lightformer position={[-4, 4, 4]} rotation={[0, Math.PI / 4, 0]} scale={[3, 5, 1]} intensity={2.2} color="#fff7e8" />
        <Lightformer position={[4, 3, 2]} rotation={[0, -Math.PI / 3, 0]} scale={[2, 4, 1]} intensity={1.4} color="#e9f0ff" />
        <Lightformer position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[5, 3, 1]} intensity={1.3} />
      </Environment>
      <directionalLight position={[-3.5, 6, 4]} intensity={light.key} color={light.keyColor} castShadow={shadows}
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.00015} shadow-normalBias={0.025}
        shadow-camera-near={0.5} shadow-camera-far={18} shadow-camera-left={-6} shadow-camera-right={6}
        shadow-camera-top={6} shadow-camera-bottom={-6} />
      <directionalLight position={[4, 3, 3]} intensity={0.4} color="#e4edff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 1.5]} receiveShadow onClick={onFloorClick}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial key={floor} map={floor === 'wood' ? woodMap : floor === 'checkered' ? tileMap : null}
          roughnessMap={floor === 'wood' ? woodRoughness : null} color={floor === 'marble' ? '#e6ded1' : '#ffffff'}
          roughness={floor === 'marble' ? 0.24 : 0.65} metalness={0} />
      </mesh>
      <mesh position={[0, 4, -1.8]} receiveShadow>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color={dark ? '#3A3B45' : '#D9D2C6'} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.08, -1.76]} receiveShadow>
        <boxGeometry args={[30, 0.16, 0.05]} />
        <meshStandardMaterial color={dark ? '#4A4B55' : '#CBC2B4'} roughness={0.85} />
      </mesh>
    </group>
  );
};
