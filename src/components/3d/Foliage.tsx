'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface FoliageProps { showMonstera: boolean; showPalms: boolean; }

export const Foliage: React.FC<FoliageProps> = ({ showMonstera, showPalms }) => {
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
  useEffect(() => () => Object.values(geometry).forEach(g => g.dispose()), [geometry]);

  return (
    <group>
      {showMonstera && [
        { p: [1.88, 2.45, 0.5], r: -0.65, s: 0.65 },
        { p: [1.98, 1.3, 0.58], r: -0.9, s: 0.7 },
        { p: [-1.85, 0.55, 0.5], r: 0.85, s: 0.6 },
      ].map((leaf, i) => (
        <group key={i} position={leaf.p as [number, number, number]} rotation={[0.2, -0.2, leaf.r]} scale={leaf.s}>
          <mesh geometry={geometry.leaf} castShadow receiveShadow>
            <meshStandardMaterial color={i % 2 ? '#476238' : '#587645'} roughness={0.53} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={geometry.stem}>
            <meshStandardMaterial color="#81915b" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {showPalms && [
        { p: [-1.55, 2.65, -0.05], r: 0.65, s: 0.85 },
        { p: [1.8, 0.38, 0.1], r: -0.75, s: 0.9 },
      ].map((frond, i) => (
        <group key={i} position={frond.p as [number, number, number]} rotation={[0.15, 0.2, frond.r]} scale={frond.s}>
          <mesh geometry={geometry.stem}><meshStandardMaterial color="#7c8b54" /></mesh>
          {Array.from({ length: 9 }, (_, j) => [-1, 1].map(side => (
            <mesh key={`${j}-${side}`} geometry={geometry.palm} position={[0, j * 0.105, 0.025]} rotation={[0.2 * side, 0.3 * side, side * (0.85 - j * 0.045)]} scale={1 - j * 0.075} castShadow>
              <meshStandardMaterial color={j % 2 ? '#6c804e' : '#526d3d'} roughness={0.65} side={THREE.DoubleSide} />
            </mesh>
          )))}
        </group>
      ))}
    </group>
  );
};
