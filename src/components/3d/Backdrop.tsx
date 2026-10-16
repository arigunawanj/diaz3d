'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { BackdropShape } from '@/types/decoration';
import { createBackdropShape } from '@/lib/decorGeometry';

interface BackdropProps {
  shape: BackdropShape;
  mainColor: string;
  secondaryColor: string;
  ledGlow: boolean;
  ledColor: string;
  titleText: string;
  subtitleText: string;
  textColor: string;
}

export const Backdrop: React.FC<BackdropProps> = ({
  shape, mainColor, secondaryColor, ledGlow, ledColor, titleText, subtitleText, textColor,
}) => {
  const geometry = useMemo(() => {
    const outline = createBackdropShape(shape);
    const settings = { depth: 0.08, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.012, bevelThickness: 0.012, curveSegments: 32 };
    const points = outline.getPoints(80).map(p => new THREE.Vector3(p.x, p.y, 0.11));
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < points.length; i++) path.add(new THREE.LineCurve3(points[i - 1], points[i]));
    return {
      main: new THREE.ExtrudeGeometry(outline, settings),
      secondary: new THREE.ExtrudeGeometry(createBackdropShape('single-arch', true), settings),
      trim: new THREE.TubeGeometry(path, 256, 0.012, 6, true),
    };
  }, [shape]);
  useEffect(() => () => Object.values(geometry).forEach(g => g.dispose()), [geometry]);
  const offsetX = shape === 'double-arch' ? 0.55 : 0;

  return (
    <group position={[0, 0.025, -0.2]}>
      {shape === 'double-arch' && (
        <mesh geometry={geometry.secondary} position={[-1.2, 0, -0.12]} castShadow receiveShadow>
          <meshStandardMaterial color={secondaryColor} roughness={0.84} />
        </mesh>
      )}
      <group position={[offsetX, 0, 0]}>
        <mesh geometry={geometry.main} castShadow receiveShadow>
          <meshStandardMaterial color={mainColor} roughness={0.82} />
        </mesh>
        {ledGlow && (
          <mesh geometry={geometry.trim}>
            <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={2} toneMapped={false} />
          </mesh>
        )}
        <group position={[0, shape === 'round' ? 2.05 : 2.45, 0.13]}>
          <Text position={[0, 0.16, 0]} fontSize={0.27} maxWidth={1.8} textAlign="center" color={textColor} anchorX="center" anchorY="middle">
            {titleText}
          </Text>
          <Text position={[0, -0.19, 0]} fontSize={0.12} maxWidth={1.8} textAlign="center" letterSpacing={0.13} color={textColor} anchorX="center" anchorY="middle">
            {subtitleText}
          </Text>
        </group>
        {[-0.7, 0.7].map(x => (
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
    </group>
  );
};
