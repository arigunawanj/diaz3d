import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { dur } from './motion';

type Colored = THREE.Material & { color: THREE.Color };

/** Tweens a material's colour toward `hex` so changes read as transitions, not jumps. */
export function useTweenedColor(material: Colored, hex: string) {
  const first = useRef(true);
  useEffect(() => {
    const target = new THREE.Color(hex);
    if (first.current) {
      first.current = false;
      material.color.copy(target);
      return;
    }
    const tween = gsap.to(material.color, { r: target.r, g: target.g, b: target.b, duration: dur(0.45), ease: 'power2.out' });
    return () => { tween.kill(); };
  }, [material, hex]);
}
