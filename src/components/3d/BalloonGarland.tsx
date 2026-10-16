'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { buildBalloonLayout } from '@/lib/decorGeometry';
import { BalloonFinish } from '@/types/decoration';
import { createDalmatianTexture, createPolkaTexture } from '@/lib/textures';

interface BalloonGarlandProps {
  primaryColor: string;
  patternColor: string;
  secondaryColor: string;
  accentColor: string;
  patternType: 'dalmatian' | 'polka' | 'none';
  finish: BalloonFinish;
  showPattern: boolean;
}

export const BalloonGarland: React.FC<BalloonGarlandProps> = ({
  primaryColor,
  patternColor,
  secondaryColor,
  accentColor,
  patternType,
  finish,
  showPattern,
}) => {
  // Shared smooth geometry keeps small latex highlights continuous.
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 32, 24), []);
  const knotGeo = useMemo(() => new THREE.ConeGeometry(0.2, 0.22, 8), []);

  // Textures (cached)
  const dalmatianTex = useMemo(() => (showPattern && patternType === 'dalmatian' ? createDalmatianTexture() : null), [showPattern, patternType]);
  const polkaTex = useMemo(() => (showPattern && patternType === 'polka' ? createPolkaTexture() : null), [showPattern, patternType]);

  // Material finish settings (MeshStandardMaterial for fast 60fps rendering)
  const materialProps = useMemo(() => {
    switch (finish) {
      case 'metallic':
        return { roughness: 0.2, metalness: 0.85 };
      case 'matte':
        return { roughness: 0.72, metalness: 0 };
      case 'glossy':
      default:
        return { roughness: 0.3, metalness: 0 };
    }
  }, [finish]);

  // MeshStandardMaterials (Fast compile, excellent GPU performance)
  const primaryMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: primaryColor, ...materialProps }),
    [primaryColor, materialProps]
  );
  const secondaryMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: secondaryColor, ...materialProps }),
    [secondaryColor, materialProps]
  );
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: accentColor, ...materialProps }),
    [accentColor, materialProps]
  );
  const patternMat = useMemo(() => {
    if (dalmatianTex) {
      return new THREE.MeshStandardMaterial({
        map: dalmatianTex,
        color: patternColor,
        ...materialProps,
      });
    }
    if (polkaTex) {
      return new THREE.MeshStandardMaterial({
        map: polkaTex,
        color: patternColor,
        ...materialProps,
      });
    }
    return primaryMat;
  }, [dalmatianTex, polkaTex, primaryMat, materialProps, patternColor]);

  const balloons = useMemo(() => buildBalloonLayout(), []);

  useEffect(() => () => {
    sphereGeo.dispose();
    knotGeo.dispose();
  }, [sphereGeo, knotGeo]);
  useEffect(() => () => { primaryMat.dispose(); }, [primaryMat]);
  useEffect(() => () => { secondaryMat.dispose(); }, [secondaryMat]);
  useEffect(() => () => { accentMat.dispose(); }, [accentMat]);
  useEffect(() => () => {
    if (patternMat !== primaryMat) patternMat.dispose();
  }, [patternMat, primaryMat]);

  return (
    <group position={[0, 0, 0]}>
      {balloons.map((b, i) => {
        let mat = primaryMat;
        if (b.colorType === 'secondary') mat = secondaryMat;
        else if (b.colorType === 'accent') mat = accentMat;
        else if (b.colorType === 'pattern' && showPattern) mat = patternMat;

        return (
          <group
            key={i}
            position={b.pos}
            rotation={b.rotation}
            scale={[b.radius, b.radius * b.scaleY, b.radius]}
          >
            {/* Balloon Body */}
            <mesh
              geometry={sphereGeo}
              material={mat}
              castShadow={b.castShadow}
              receiveShadow
            />

            {/* Balloon Knot (doesn't need shadow) */}
            <mesh
              geometry={knotGeo}
              material={mat}
              position={[0, -0.96, 0]}
              rotation={[Math.PI, 0, 0]}
              scale={[0.28, 0.28, 0.28]}
            />
          </group>
        );
      })}
    </group>
  );
};
