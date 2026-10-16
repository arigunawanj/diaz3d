'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import { DecorationState, CameraView } from '@/types/decoration';
import { Backdrop } from './Backdrop';
import { BalloonGarland } from './BalloonGarland';
import { CharacterCutouts } from './CharacterCutouts';
import { MarqueeNumber } from './MarqueeNumber';
import { PedestalAndCake } from './PedestalAndCake';
import { Foliage } from './Foliage';
import { StudioStage } from './StudioStage';

interface CameraRigProps {
  currentView: CameraView;
  autoRotate: boolean;
}

const CAMERA_POSITIONS: Record<CameraView, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  front: {
    pos: [0, 2.3, 6.6],
    target: [0, 1.9, 0],
    fov: 45,
  },
  angle: {
    pos: [4.4, 3, 5.8],
    target: [0, 1.8, 0],
    fov: 46,
  },
  closeup: {
    pos: [-0.15, 1.1, 2.2],
    target: [-0.15, 0.75, 0.95],
    fov: 40,
  },
  top: {
    pos: [1, 6.2, 6.4],
    target: [0, 1.2, 0.2],
    fov: 50,
  },
};

const CameraController: React.FC<CameraRigProps> = ({ currentView, autoRotate }) => {
  const { camera, size } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    const config = CAMERA_POSITIONS[currentView];
    if (!config) return;

    const target = new THREE.Vector3(...config.target);
    const position = new THREE.Vector3(...config.pos);
    const aspect = size.width / size.height;
    if (currentView !== 'closeup') position.sub(target).multiplyScalar(Math.max(1, 1.12 / aspect)).add(target);
    (camera as THREE.PerspectiveCamera).fov = config.fov;
    camera.updateProjectionMatrix();
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.8;
    gsap.killTweensOf(camera.position);
    gsap.to(camera.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration,
      ease: 'power2.inOut',
    });

    if (controlsRef.current) {
      gsap.killTweensOf(controlsRef.current.target);
      gsap.to(controlsRef.current.target, {
        x: config.target[0],
        y: config.target[1],
        z: config.target[2],
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          controlsRef.current?.update();
        },
      });
    }
    const controls = controlsRef.current;
    return () => {
      gsap.killTweensOf(camera.position);
      if (controls) gsap.killTweensOf(controls.target);
    };
  }, [currentView, camera, size.width, size.height]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minDistance={1.5}
      maxDistance={16}
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
      target={[0, 1.9, 0]}
    />
  );
};

interface SceneProps {
  state: DecorationState;
  cameraView: CameraView;
  autoRotate: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export const Scene: React.FC<SceneProps> = ({
  state,
  cameraView,
  autoRotate,
  canvasRef,
}) => {
  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 1.5]} // Cap DPR to prevent extreme GPU overhead on Retina screens
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 2.3, 6.6]} fov={45} />
        <CameraController currentView={cameraView} autoRotate={autoRotate} />

        <Suspense fallback={null}>
          {/* Studio Background & Lighting */}
          <StudioStage
            floorType={state.floorType}
            ambientLightColor={state.ambientLightColor}
            spotlightIntensity={state.spotlightIntensity}
          />

          {/* 3D Decor Elements */}
          <Backdrop
            shape={state.backdropShape}
            mainColor={state.backdropMainColor}
            secondaryColor={state.backdropSecondaryColor}
            ledGlow={state.backdropLedGlow}
            ledColor={state.backdropLedColor}
            titleText={state.titleText}
            subtitleText={state.subtitleText}
            textColor={state.textColor}
          />

          <BalloonGarland
            primaryColor={state.balloonPrimary}
            patternColor={state.balloonPattern}
            secondaryColor={state.balloonSecondary}
            accentColor={state.balloonAccent}
            patternType={state.balloonPatternType}
            finish={state.balloonFinish}
            showPattern={state.showPatternBalloons}
          />

          <CharacterCutouts
            leftCharacter={state.leftCharacter}
            centerLeftCharacter={state.centerLeftCharacter}
            centerRightCharacter={state.centerRightCharacter}
          />

          <MarqueeNumber
            number={state.marqueeNumber}
            lit={state.marqueeLit}
          />

          <PedestalAndCake
            showPedestal={state.showPedestal}
            pedestalColor={state.pedestalColor}
            pedestalStyle={state.pedestalStyle}
            showCake={state.showCake}
          />

          <Foliage
            showMonstera={state.showMonstera}
            showPalms={state.showPalms}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
