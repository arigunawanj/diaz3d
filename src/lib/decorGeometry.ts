import * as THREE from 'three';
import type { BackdropShape } from '@/types/decoration';

// One outline drives both the solid panel and its fitted LED trim.
export function createBackdropShape(kind: BackdropShape, secondary = false) {
  const shape = new THREE.Shape();
  const r = secondary ? 1 : 1.2;
  const h = secondary ? 3.1 : 3.6;
  if (kind === 'round') {
    shape.absarc(0, 1.8, 1.65, 0, Math.PI * 2, false);
  } else if (kind === 'wavy') {
    shape.moveTo(-1.25, 0);
    shape.lineTo(-1.25, 2.4);
    shape.bezierCurveTo(-1.25, 3.8, -0.55, 3.8, 0, 3.4);
    shape.bezierCurveTo(0.65, 3.05, 1.25, 3.8, 1.25, 2.4);
    shape.lineTo(1.25, 0);
  } else if (kind === 'half-arch') {
    shape.moveTo(-r, 0);
    shape.lineTo(-r, h);
    shape.bezierCurveTo(r * 0.3, h, r, h - 0.8, r, h - 1.8);
    shape.lineTo(r, 0);
  } else {
    shape.moveTo(-r, 0);
    shape.lineTo(-r, h - r);
    shape.absarc(0, h - r, r, Math.PI, 0, true);
    shape.lineTo(r, 0);
  }
  shape.closePath();
  return shape;
}

export function buildBalloonLayout() {
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.7, 0.34, 0.22),
    new THREE.Vector3(-1.7, 1.45, 0.12),
    new THREE.Vector3(-1.55, 2.75, 0.02),
    new THREE.Vector3(-0.7, 3.35, 0.02),
    new THREE.Vector3(0.55, 3.65, 0.04),
    new THREE.Vector3(1.55, 3.1, 0.12),
    new THREE.Vector3(1.85, 1.8, 0.18),
    new THREE.Vector3(1.85, 0.38, 0.28),
  ]);
  return Array.from({ length: 34 }, (_, i) => {
    const p = path.getPointAt(i / 33);
    // Golden-angle clusters: stable while colors change, without a repeated grid.
    return Array.from({ length: 3 }, (_, j) => {
      const angle = i * 2.39996 + j * Math.PI * 2 / 3;
      const radius = j === 0 ? 0.23 + (Math.sin(i * 7.3) + 1) * 0.045 :
        j === 1 ? 0.16 + (Math.cos(i * 4.7) + 1) * 0.025 : 0.085 + (i % 3) * 0.014;
      return {
        pos: [p.x + Math.cos(angle) * 0.23, Math.max(radius * 1.14, p.y + Math.sin(angle) * 0.19), p.z + j * 0.16] as [number, number, number],
        radius,
        scaleY: 1.05 + (Math.sin(i * 3.8 + j) + 1) * 0.045,
        rotation: [0.12 * Math.sin(i), 0, Math.cos(angle) * 0.25] as [number, number, number],
        colorType: (i + j * 3) % 11 === 0 ? 'pattern' : (['primary', 'primary', 'secondary', 'accent'] as const)[(Math.floor(i / 3) + j) % 4],
        castShadow: j === 0,
      };
    });
  }).flat();
}
