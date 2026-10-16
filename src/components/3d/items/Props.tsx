'use client';

import React from 'react';
import * as THREE from 'three';
import { RoundedBox, Text } from '@react-three/drei';
import { type ItemProps, str } from './types';
import { MonsteraLeaf, useFoliageGeometry } from '../Foliage';

export const NeonSign: React.FC<ItemProps> = ({ item }) => {
  const color = str(item.params.color, '#FF7AB6');
  return (
    <group>
      <mesh position={[0, 0.6, -0.04]} castShadow>
        <boxGeometry args={[0.04, 1.2, 0.04]} />
        <meshStandardMaterial color="#2b2b2b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[1.3, 0.5, 0.02]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} thickness={0.02} transparent opacity={0.35} />
      </mesh>
      <Text position={[0, 1.35, 0.02]} fontSize={0.22} maxWidth={1.2} anchorX="center" anchorY="middle" color={color}>
        {str(item.params.text, 'Happy Day')}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} />
      </Text>
      <pointLight position={[0, 1.35, 0.3]} color={color} intensity={0.35} distance={1.6} />
    </group>
  );
};

export const Carpet: React.FC<ItemProps> = ({ item }) => (
  <RoundedBox args={[2.4, 0.02, 1.4]} radius={0.01} position={[0, 0.005, 0]} receiveShadow>
    <meshStandardMaterial color={str(item.params.color, '#B8A48A')} roughness={0.95} />
  </RoundedBox>
);

export const StandingFlower: React.FC<ItemProps> = ({ item }) => {
  const color = str(item.params.color, '#F3D5CF');
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.04, 32]} />
        <meshStandardMaterial color="#c9a54c" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.3, 12]} />
        <meshStandardMaterial color="#c9a54c" metalness={0.75} roughness={0.3} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const a = i * 2.39996;
        const r = 0.12 + (i % 3) * 0.06;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 1.42 + Math.sin(i * 1.7) * 0.1, Math.sin(a) * r]} castShadow>
            <sphereGeometry args={[0.09 + (i % 2) * 0.03, 16, 12]} />
            <meshStandardMaterial color={i % 4 === 0 ? '#FFFFFF' : color} roughness={0.75} />
          </mesh>
        );
      })}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`l${i}`} position={[Math.cos(i) * 0.3, 1.32, Math.sin(i) * 0.3]} rotation={[0.6, i, 0.3]}>
          <planeGeometry args={[0.14, 0.3]} />
          <meshStandardMaterial color="#5f7a4a" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

export const Plant: React.FC<ItemProps> = () => {
  const geometry = useFoliageGeometry();
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.18, 0.44, 32]} />
        <meshStandardMaterial color="#b9714e" roughness={0.8} />
      </mesh>
      {[0, 1.3, 2.6, 3.9, 5.2].map((a, i) => (
        <MonsteraLeaf key={i} geometry={geometry} tone={i} position={[Math.cos(a) * 0.1, 0.55 + (i % 2) * 0.2, Math.sin(a) * 0.1]} rotation={[0.35, a, 0]} scale={0.55 + (i % 3) * 0.08} />
      ))}
    </group>
  );
};

export const Spotlight: React.FC<ItemProps> = () => (
  <group>
    {[0, 2.1, 4.2].map((a) => (
      <mesh key={a} position={[Math.cos(a) * 0.15, 0.55, Math.sin(a) * 0.15]} rotation={[Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.15, 6]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
      </mesh>
    ))}
    <mesh position={[0, 1.2, 0]} rotation={[-0.5, 0, 0]} castShadow>
      <cylinderGeometry args={[0.09, 0.13, 0.26, 24]} />
      <meshStandardMaterial color="#1c1c1c" metalness={0.5} roughness={0.35} />
    </mesh>
    <spotLight position={[0, 1.25, -0.1]} angle={0.5} penumbra={0.6} intensity={6} distance={7} color="#FFE7C4" target-position={[0, 1.5, -3]} />
  </group>
);

export const FormalTable: React.FC<ItemProps> = ({ item }) => {
  const cloth = str(item.params.color, '#FFFFFF');
  return (
    <group>
      <RoundedBox args={[1.6, 0.74, 0.7]} radius={0.03} position={[0, 0.37, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={cloth} roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.745, 0]}>
        <boxGeometry args={[1.64, 0.01, 0.74]} />
        <meshStandardMaterial color="#c9a54c" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.88, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.04, 0.26, 16]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.8} roughness={0.05} thickness={0.05} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[Math.cos(i * 2.4) * 0.07, 1.05 + (i % 3) * 0.04, Math.sin(i * 2.4) * 0.07]} castShadow>
          <sphereGeometry args={[0.055, 12, 10]} />
          <meshStandardMaterial color={i % 2 ? '#F3D5CF' : '#FFFFFF'} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
};
