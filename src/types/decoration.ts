export type BackdropShape = 'double-arch' | 'single-arch' | 'wavy' | 'round' | 'half-arch';
export type BalloonFinish = 'glossy' | 'matte' | 'metallic';
export type FloorType = 'wood' | 'marble' | 'checkered';
export type CameraView = 'front' | 'angle' | 'closeup' | 'top';

export interface ThemePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  thumbnail: string;
  config: Partial<DecorationState>;
}

export interface DecorationState {
  // Backdrop
  backdropShape: BackdropShape;
  backdropMainColor: string;
  backdropSecondaryColor: string;
  backdropLedGlow: boolean;
  backdropLedColor: string;
  titleText: string;
  subtitleText: string;
  textColor: string;
  textFont: 'serif' | 'script' | 'modern';

  // Balloons
  balloonPrimary: string;
  balloonSecondary: string;
  balloonAccent: string;
  balloonPattern: string;
  balloonPatternType: 'dalmatian' | 'polka' | 'none';
  balloonFinish: BalloonFinish;
  showPatternBalloons: boolean;

  // Characters (2.5D cutouts on stage)
  leftCharacter: 'giraffe' | 'dino' | 'bear' | 'astronaut' | 'none';
  centerLeftCharacter: 'lion' | 'tiger' | 'rabbit' | 'none';
  centerRightCharacter: 'elephant' | 'koala' | 'fox' | 'none';

  // Foliage
  showMonstera: boolean;
  showPalms: boolean;

  // Props & Centerpiece
  marqueeNumber: number; // 0 - 9
  marqueeLit: boolean;
  showPedestal: boolean;
  pedestalColor: string;
  pedestalStyle: 'smooth' | 'ribbed';
  showCake: boolean;

  // Environment & Lights
  floorType: FloorType;
  ambientLightColor: string;
  spotlightIntensity: number;
}
