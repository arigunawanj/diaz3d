'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface PedestalAndCakeProps {
  showPedestal: boolean;
  pedestalColor: string;
  pedestalStyle: 'smooth' | 'ribbed';
  showCake: boolean;
}

export const PedestalAndCake: React.FC<PedestalAndCakeProps> = ({
  showPedestal,
  pedestalColor,
  pedestalStyle,
  showCake,
}) => {
  const flameRef = useRef<THREE.PointLight>(null);

  // Subtle flame flicker
  useFrame(({ clock }) => {
    if (flameRef.current) {
      const t = clock.getElapsedTime();
      flameRef.current.intensity = 0.8 + Math.sin(t * 15) * 0.15 + Math.cos(t * 23) * 0.1;
    }
  });

  if (!showPedestal) return null;

  return (
    <group position={[-0.15, 0, 0.95]}>
      {/* Pedestal Plinth Body */}
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[0.26, 0.26, 0.76, pedestalStyle === 'ribbed' ? 36 : 48]}
        />
        <meshStandardMaterial
          color={pedestalColor}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {pedestalStyle === 'ribbed' && Array.from({ length: 40 }, (_, i) => {
        const angle = i * Math.PI * 2 / 40;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.257, 0.38, Math.sin(angle) * 0.257]} castShadow receiveShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.74, 8]} />
            <meshStandardMaterial color={pedestalColor} roughness={0.6} />
          </mesh>
        );
      })}
      {/* Gold Trim Base and Top Rim */}
      <mesh position={[0, 0.76, 0]} receiveShadow>
        <cylinderGeometry args={[0.268, 0.268, 0.015, 36]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Birthday Cake */}
      {showCake && (
        <group position={[0, 0.78, 0]}>
          {/* Cake Stand (Ceramic or Acrylic) */}
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.08, 0.08, 32]} />
            <meshStandardMaterial color="#FAF9F6" roughness={0.3} metalness={0.1} />
          </mesh>

          {/* Bottom Cake Tier */}
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.16, 32]} />
            <meshStandardMaterial color="#FFF1E6" roughness={0.8} />
          </mesh>

          {/* Cake Cream Drippings / Trim */}
          <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.015, 12, 32]} />
            <meshStandardMaterial color="#E8D5B5" roughness={0.5} />
          </mesh>

          {/* Top Cake Tier */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.12, 32]} />
            <meshStandardMaterial color="#FAF9F6" roughness={0.7} />
          </mesh>

          {/* Birthday Candle */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 12]} />
            <meshStandardMaterial color="#F4A261" roughness={0.4} />
          </mesh>

          {/* Candle Flame */}
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshBasicMaterial color="#FFD166" />
          </mesh>

          {/* Flame Light Glow */}
          <pointLight
            ref={flameRef}
            position={[0, 0.46, 0]}
            color="#FFAA33"
            intensity={0.8}
            distance={0.8}
            decay={2}
          />
        </group>
      )}
    </group>
  );
};
