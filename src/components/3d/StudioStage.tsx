'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Environment, Lightformer } from '@react-three/drei';
import { FloorType } from '@/types/decoration';
import { createWoodFloorTexture } from '@/lib/textures';

interface StudioStageProps {
  floorType: FloorType;
  ambientLightColor: string;
  spotlightIntensity: number;
}

export const StudioStage: React.FC<StudioStageProps> = ({ floorType, ambientLightColor, spotlightIntensity }) => {
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

  return (
    <group>
      <color attach="background" args={['#343d35']} />
      <ambientLight color={ambientLightColor} intensity={0.35} />
      <hemisphereLight args={['#fff8ec', '#645845', 0.45]} />
      {/* Local softboxes give latex and chrome readable reflections without an HDR download. */}
      <Environment resolution={128} frames={1}>
        <Lightformer position={[-4, 4, 4]} rotation={[0, Math.PI / 4, 0]} scale={[3, 5, 1]} intensity={2.2} color="#fff7e8" />
        <Lightformer position={[4, 3, 2]} rotation={[0, -Math.PI / 3, 0]} scale={[2, 4, 1]} intensity={1.4} color="#e9f0ff" />
        <Lightformer position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[5, 3, 1]} intensity={1.3} />
      </Environment>
      <directionalLight position={[-3.5, 6, 4]} intensity={spotlightIntensity} color="#fff5e4" castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.00015} shadow-normalBias={0.025}
        shadow-camera-near={0.5} shadow-camera-far={18} shadow-camera-left={-5} shadow-camera-right={5}
        shadow-camera-top={5} shadow-camera-bottom={-5} />
      <directionalLight position={[4, 3, 3]} intensity={0.4} color="#e4edff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 1.5]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial key={floorType} map={floorType === 'wood' ? woodMap : floorType === 'checkered' ? tileMap : null}
          roughnessMap={floorType === 'wood' ? woodRoughness : null} color={floorType === 'marble' ? '#e6ded1' : '#ffffff'}
          roughness={floorType === 'marble' ? 0.24 : 0.65} metalness={0} />
      </mesh>
      <mesh position={[0, 4, -1.8]} receiveShadow>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#657365" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.08, -1.76]} receiveShadow>
        <boxGeometry args={[30, 0.16, 0.05]} />
        <meshStandardMaterial color="#7b8674" roughness={0.85} />
      </mesh>
    </group>
  );
};
