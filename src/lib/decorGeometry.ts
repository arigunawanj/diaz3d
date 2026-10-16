import * as THREE from 'three';
import type { BackdropShape, Design } from '../domain/design';

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

export const PANEL_SPACING = 2.3;

export interface PanelSlot {
  x: number;
  z: number;
  scale: number;
  isCenter: boolean;
}

/** Side-by-side panel placement: centre panel(s) full size, outer ones slightly smaller and set back. */
export function layoutPanels(panelCount: number): PanelSlot[] {
  const mid = (panelCount - 1) / 2;
  const center = Math.floor(mid);
  return Array.from({ length: panelCount }, (_, i) => {
    const offset = Math.abs(i - mid);
    const outer = offset > 0.5;
    return { x: (i - mid) * PANEL_SPACING, z: outer ? -0.18 : 0, scale: outer ? 0.88 : 1, isCenter: i === center };
  });
}

/** Half the backdrop width in world units. */
export const backdropHalfWidth = (panelCount: number) => ((panelCount - 1) / 2) * PANEL_SPACING + 1.25;

export interface BalloonSpec {
  pos: [number, number, number];
  radius: number;
  scaleY: number;
  rotation: [number, number, number];
  /** Index into the garland palette (mod palette length). */
  colorSlot: number;
  pattern: boolean;
  castShadow: boolean;
}

type LayoutOpts = Pick<Design['garland'], 'lengthM' | 'density' | 'sizes'> & { panelCount: number };

const BASE_LENGTH_M = 4.5;
const SPACING = { jarang: 0.17, sedang: 0.13, padat: 0.1 } as const;

// Organic arch for a single panel, right floor -> over the top -> left floor.
const ARCH = [
  [1.85, 0.38, 0.28], [1.85, 1.8, 0.18], [1.55, 3.1, 0.12], [0.55, 3.65, 0.04],
  [-0.7, 3.35, 0.02], [-1.55, 2.75, 0.02], [-1.7, 1.45, 0.12], [-1.7, 0.34, 0.22],
] as const;

function sizeRadius(j: number, i: number, sizes: LayoutOpts['sizes']) {
  const big = 0.23 + (Math.sin(i * 7.3) + 1) * 0.045;
  const mid = 0.16 + (Math.cos(i * 4.7) + 1) * 0.025;
  const small = 0.085 + (i % 3) * 0.014;
  const enabled = [sizes.s18 && big, sizes.s12 && mid, sizes.s5 && small].filter(Boolean) as number[];
  const pool = enabled.length ? enabled : [big, mid, small];
  const wanted = [big, mid, small][j];
  return pool.includes(wanted) ? wanted : pool[Math.min(j, pool.length - 1)];
}

function clusterAt(p: THREE.Vector3, i: number, opts: LayoutOpts): BalloonSpec[] {
  return Array.from({ length: 3 }, (_, j) => {
    // Golden-angle clusters: stable while colors change, without a repeated grid.
    const angle = i * 2.39996 + (j * Math.PI * 2) / 3;
    const radius = sizeRadius(j, i, opts.sizes);
    const scaleY = 1.05 + (Math.sin(i * 3.8 + j) + 1) * 0.045;
    return {
      pos: [p.x + Math.cos(angle) * 0.23, Math.max(radius * scaleY, p.y + Math.sin(angle) * 0.19), p.z + j * 0.16],
      radius,
      scaleY,
      rotation: [0.12 * Math.sin(i), 0, Math.cos(angle) * 0.25],
      colorSlot: Math.floor(i / 3) + j,
      pattern: (i + j * 3) % 11 === 0,
      castShadow: j === 0,
    };
  });
}

/**
 * Deterministic garland: the included 4.5 m always covers the whole arch (any panel count);
 * extra metres run along the floor, alternating right and left trails toward the front.
 */
export function buildBalloonLayout(opts: LayoutOpts): BalloonSpec[] {
  const sx = (backdropHalfWidth(opts.panelCount) + 0.6) / 1.85;
  const arch = new THREE.CatmullRomCurve3(ARCH.map(([x, y, z]) => new THREE.Vector3(x * sx, y, z)));
  const spacing = SPACING[opts.density];
  const archCount = Math.round(arch.getLength() / spacing);
  const out: BalloonSpec[] = [];
  for (let i = 0; i < archCount; i++) out.push(...clusterAt(arch.getPointAt(i / (archCount - 1)), i, opts));

  const worldPerMeter = arch.getLength() / BASE_LENGTH_M;
  const extra = Math.max(0, opts.lengthM - BASE_LENGTH_M) * worldPerMeter;
  const trailCount = Math.round(extra / spacing);
  const ends = [ARCH[0], ARCH[ARCH.length - 1]];
  const maxTrailSteps = Math.floor(2.4 / spacing);
  for (let k = 0; k < trailCount; k++) {
    const side = k % 2;
    const step = Math.floor(k / 2) + 1;
    let p: THREE.Vector3;
    if (step <= maxTrailSteps) {
      const [ex, , ez] = ends[side];
      const dir = side === 0 ? 1 : -1;
      const t = step * spacing;
      // Curve outward then forward so trails stay near the stage.
      p = new THREE.Vector3(ex * sx + dir * Math.min(t, 0.9), 0.3, ez + Math.max(0, t - 0.9));
    } else {
      // Beyond the floor trails, thicken the arch with an outer layer.
      const n = k - maxTrailSteps * 2;
      p = arch.getPointAt(((n * 0.618) % 1 + 1) % 1).add(new THREE.Vector3(0, 0, 0.34));
    }
    out.push(...clusterAt(p, archCount + k, opts));
  }
  return out;
}
