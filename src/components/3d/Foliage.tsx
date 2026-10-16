'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { backdropHalfWidth } from '@/lib/decorGeometry';

export function useFoliageGeometry() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-0.42, -0.04, -0.53, 0.26, -0.43, 0.42);
    shape.lineTo(-0.12, 0.36);
    shape.bezierCurveTo(-0.42, 0.5, -0.46, 0.6, -0.32, 0.68);
    shape.lineTo(-0.09, 0.56);
    shape.bezierCurveTo(-0.27, 0.76, -0.2, 0.89, 0, 1);
    shape.bezierCurveTo(0.2, 0.89, 0.27, 0.76, 0.09, 0.56);
    shape.lineTo(0.32, 0.68);
    shape.bezierCurveTo(0.46, 0.6, 0.42, 0.5, 0.12, 0.36);
    shape.lineTo(0.43, 0.42);
    shape.bezierCurveTo(0.53, 0.26, 0.42, -0.04, 0, 0);
    const leaf = new THREE.ShapeGeometry(shape, 16);
    const positions = leaf.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i);
      positions.setZ(i, 0.13 * Math.sin(y * Math.PI) - Math.abs(x) * 0.22);
    }
    leaf.computeVertexNormals();
    const leaflet = new THREE.Shape();
    leaflet.moveTo(0, 0);
    leaflet.bezierCurveTo(0.12, 0.12, 0.18, 0.35, 0, 0.62);
    leaflet.bezierCurveTo(-0.04, 0.34, -0.07, 0.13, 0, 0);
    const palm = new THREE.ShapeGeometry(leaflet, 12);
    const stem = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.18, 0), new THREE.Vector3(0, 0.6, 0.2), new THREE.Vector3(0, 1, 0),
    ), 16, 0.008, 5, false);
    return { leaf, palm, stem };
  }, []);
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry]);
  return geometry;
}

type FoliageGeometry = ReturnType<typeof useFoliageGeometry>;

export const MonsteraLeaf: React.FC<{ geometry: FoliageGeometry; tone?: number } & JSX.IntrinsicElements['group']> = ({ geometry, tone = 0, ...props }) => (
  <group {...props}>
    <mesh geometry={geometry.leaf} castShadow receiveShadow>
      <meshStandardMaterial color={tone % 2 ? '#476238' : '#587645'} roughness={0.53} side={THREE.DoubleSide} />
    </mesh>
    <mesh geometry={geometry.stem}>
      <meshStandardMaterial color="#81915b" roughness={0.7} />
    </mesh>
  </group>
);

export const PalmFrond: React.FC<{ geometry: FoliageGeometry } & JSX.IntrinsicElements['group']> = ({ geometry, ...props }) => (
  <group {...props}>
    <mesh geometry={geometry.stem}><meshStandardMaterial color="#7c8b54" /></mesh>
    {Array.from({ length: 9 }, (_, j) => [-1, 1].map((side) => (
      <mesh key={`${j}-${side}`} geometry={geometry.palm} position={[0, j * 0.105, 0.025]} rotation={[0.2 * side, 0.3 * side, side * (0.85 - j * 0.045)]} scale={1 - j * 0.075} castShadow>
        <meshStandardMaterial color={j % 2 ? '#6c804e' : '#526d3d'} roughness={0.65} side={THREE.DoubleSide} />
      </mesh>
    )))}
  </group>
);

/** Leaf accents tucked into the garland; x follows the backdrop width. */
export const LeafAccents: React.FC<{ panelCount: number }> = ({ panelCount }) => {
  const geometry = useFoliageGeometry();
  const sx = (backdropHalfWidth(panelCount) + 0.6) / 1.85;
  const monstera = [
    { p: [1.88, 2.45, 0.5], r: -0.65, s: 0.65 },
    { p: [1.98, 1.3, 0.58], r: -0.9, s: 0.7 },
    { p: [-1.85, 0.55, 0.5], r: 0.85, s: 0.6 },
    { p: [-1.2, 3.25, 0.35], r: 0.4, s: 0.55 },
  ];
  const palms = [
    { p: [-1.55, 2.65, -0.05], r: 0.65, s: 0.85 },
    { p: [1.8, 0.38, 0.1], r: -0.75, s: 0.9 },
  ];
  return (
    <group>
      {monstera.map((l, i) => (
        <MonsteraLeaf key={i} geometry={geometry} tone={i} position={[l.p[0] * sx, l.p[1], l.p[2]]} rotation={[0.2, -0.2, l.r]} scale={l.s} />
      ))}
      {palms.map((f, i) => (
        <PalmFrond key={i} geometry={geometry} position={[f.p[0] * sx, f.p[1], f.p[2]]} rotation={[0.15, 0.2, f.r]} scale={f.s} />
      ))}
    </group>
  );
};
