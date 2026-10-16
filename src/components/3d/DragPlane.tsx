'use client';

import { useEffect, type MutableRefObject } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { clampToStage } from '@/domain/editor';

export type FloorProjector = (clientX: number, clientY: number) => [number, number] | null;
export type BeginDrag = (uid: string, e: ThreeEvent<PointerEvent>) => void;

const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const TOUCH_HOLD_MS = 250;
const TOUCH_SLOP_PX = 8;

interface DragControllerProps {
  projectorRef: MutableRefObject<FloorProjector | null>;
  beginDragRef: MutableRefObject<BeginDrag | null>;
  onMoveItem(uid: string, pos: [number, number]): void;
  onDragStateChange?(dragging: boolean): void;
}

/**
 * Lives inside the Canvas: exposes a screen->floor projector (for HTML5 drops) and
 * pointer-dragging of items along the floor. Touch drags need a short press so one-finger orbit still works.
 */
export function DragController({ projectorRef, beginDragRef, onMoveItem, onDragStateChange }: DragControllerProps) {
  const { camera, gl, controls } = useThree();

  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const project: FloorProjector = (clientX, clientY) => {
      const rect = gl.domElement.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.ray.intersectPlane(FLOOR, hit) ? clampToStage([hit.x, hit.z]) : null;
    };
    projectorRef.current = project;

    const orbit = controls as unknown as { enabled: boolean } | null;
    beginDragRef.current = (uid, e) => {
      const start = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
      // Offset keeps the item from jumping so its centre sits under the pointer.
      const origin = project(start.x, start.y);
      const itemPos = (e.eventObject.position as THREE.Vector3).clone();
      const offset: [number, number] = origin ? [itemPos.x - origin[0], itemPos.z - origin[1]] : [0, 0];
      const touch = e.nativeEvent.pointerType === 'touch';
      let active = !touch;
      let frame = 0;
      let pending: [number, number] | null = null;

      const activate = () => {
        active = true;
        if (orbit) orbit.enabled = false;
        onDragStateChange?.(true);
      };
      const timer = touch ? window.setTimeout(activate, TOUCH_HOLD_MS) : 0;
      if (!touch) activate();

      const move = (ev: PointerEvent) => {
        if (!active) {
          if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > TOUCH_SLOP_PX) cleanup();
          return;
        }
        const p = project(ev.clientX, ev.clientY);
        if (!p) return;
        pending = clampToStage([p[0] + offset[0], p[1] + offset[1]]);
        if (!frame) {
          frame = requestAnimationFrame(() => {
            frame = 0;
            if (pending) onMoveItem(uid, pending);
          });
        }
      };
      const cleanup = () => {
        window.clearTimeout(timer);
        cancelAnimationFrame(frame);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', cleanup);
        window.removeEventListener('pointercancel', cleanup);
        if (active) {
          if (pending) onMoveItem(uid, pending);
          if (orbit) orbit.enabled = true;
          onDragStateChange?.(false);
        }
        active = false;
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', cleanup);
      window.addEventListener('pointercancel', cleanup);
    };
    return () => {
      projectorRef.current = null;
      beginDragRef.current = null;
    };
  }, [camera, gl, controls, projectorRef, beginDragRef, onMoveItem, onDragStateChange]);

  return null;
}
