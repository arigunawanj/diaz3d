'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import fontData from '../../../public/fonts/helvetiker_bold.typeface.json';

const font = new FontLoader().parse(fontData);

export const MarqueeNumber: React.FC<{ number: number; lit: boolean }> = ({ number, lit }) => {
  const { geometry, bulbs } = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(font.generateShapes(String(number), 1.1), {
      depth: 0.14, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.012, bevelThickness: 0.012, curveSegments: 16,
    });
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    geometry.translate(-(box.max.x + box.min.x) / 2, -box.min.y, 0);
    geometry.computeBoundingBox();
    // Place bulbs only on the actual digit face, including counters in 0/6/8/9.
    const face = new THREE.Mesh(geometry);
    const ray = new THREE.Raycaster();
    const bulbs: [number, number, number][] = [];
    const bounds = geometry.boundingBox!;
    for (let y = 0.07; y < bounds.max.y - 0.025; y += 0.14) {
      for (let x = bounds.min.x + 0.06; x < bounds.max.x - 0.025; x += 0.13) {
        const fits = [[0, 0], [-0.028, 0], [0.028, 0], [0, -0.028], [0, 0.028]].every(([dx, dy]) => {
          ray.set(new THREE.Vector3(x + dx, y + dy, 1), new THREE.Vector3(0, 0, -1));
          return ray.intersectObject(face).length > 0;
        });
        if (fits) bulbs.push([x, y, 0.17]);
      }
    }
    (face.material as THREE.Material).dispose();
    return { geometry, bulbs };
  }, [number]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group position={[1.3, 0.015, 0.8]} rotation={[0, -0.15, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#fff8e9" roughness={0.42} metalness={0.15} />
      </mesh>
      {bulbs.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.026, 12, 10]} />
          <meshStandardMaterial color={lit ? '#fff1cb' : '#d7d2c8'} emissive="#ffc56e" emissiveIntensity={lit ? 2.5 : 0} toneMapped={false} roughness={0.24} />
        </mesh>
      ))}
      {lit && <pointLight position={[0, 0.5, 0.3]} color="#ffd294" intensity={0.45} distance={2} />}
    </group>
  );
};
