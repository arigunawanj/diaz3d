'use client';

import React from 'react';
import { type ItemProps, str } from './types';

const Balloon: React.FC<{ color: string; radius: number; position: [number, number, number]; string?: number }> = ({ color, radius, position, string = 0 }) => (
  <group position={position}>
    <mesh scale={[radius, radius * 1.12, radius]} castShadow>
      <sphereGeometry args={[1, 32, 24]} />
      <meshStandardMaterial color={color} roughness={0.3} />
    </mesh>
    {string > 0 && (
      <mesh position={[0, -radius * 1.12 - string / 2, 0]}>
        <cylinderGeometry args={[0.004, 0.004, string, 4]} />
        <meshStandardMaterial color="#d9d2c4" />
      </mesh>
    )}
  </group>
);

/** Stacked balloon column on a weighted base. */
export const BalloonColumn: React.FC<ItemProps> = ({ item, palette }) => {
  const color = str(item.params.color, palette[0]);
  const alt = palette[1] ?? color;
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.1, 32]} />
        <meshStandardMaterial color="#e9e1d5" roughness={0.5} />
      </mesh>
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 4 }, (_, k) => {
          const a = (k * Math.PI) / 2 + row * 0.4;
          return <Balloon key={`${row}-${k}`} color={(row + k) % 2 ? alt : color} radius={0.13} position={[Math.cos(a) * 0.13, 0.25 + row * 0.2, Math.sin(a) * 0.13]} />;
        }),
      )}
      <Balloon color={color} radius={0.22} position={[0, 2.15, 0]} />
    </group>
  );
};

export const JumboBalloon: React.FC<ItemProps> = ({ item, palette }) => (
  <group>
    <mesh position={[0, 0.06, 0]} castShadow>
      <boxGeometry args={[0.14, 0.12, 0.14]} />
      <meshStandardMaterial color="#c9a54c" metalness={0.7} roughness={0.3} />
    </mesh>
    <Balloon color={str(item.params.color, palette[0])} radius={0.42} position={[0, 1.75, 0]} string={1.2} />
  </group>
);

/** A floating bunch of helium balloons tied to a small weight. */
export const HangingBalloons: React.FC<ItemProps> = ({ item, palette }) => {
  const base = str(item.params.color, palette[0]);
  const spots: [number, number, number][] = [[0, 2.4, 0], [0.22, 2.55, 0.08], [-0.2, 2.6, -0.05], [0.05, 2.78, -0.12], [-0.05, 2.25, 0.15]];
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <sphereGeometry args={[0.06, 16, 12]} />
        <meshStandardMaterial color="#c9a54c" metalness={0.7} roughness={0.3} />
      </mesh>
      {spots.map((p, i) => (
        <group key={i}>
          <Balloon color={i % 2 ? palette[(i % palette.length)] ?? base : base} radius={0.16} position={p} />
          <mesh position={[p[0] / 2, (p[1] - 0.18) / 2, p[2] / 2]} rotation={[p[2] * 0.4, 0, -p[0] * 0.4]}>
            <cylinderGeometry args={[0.003, 0.003, p[1] - 0.18, 4]} />
            <meshStandardMaterial color="#d9d2c4" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
