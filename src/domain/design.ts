export type TemplateType = 'anak' | 'sweet17' | 'formal';

export type CatalogId =
  | 'panel'
  | 'karakter'
  | 'angka-lampu'
  | 'meja-kue'
  | 'aksen-balon'
  | 'garland-meter'
  | 'led-backdrop'
  | 'tiang-balon'
  | 'balon-jumbo'
  | 'balon-gantung'
  | 'neon-nama'
  | 'karpet'
  | 'standing-flower'
  | 'tanaman'
  | 'lampu-sorot'
  | 'meja-formal';

export const CATALOG_IDS: CatalogId[] = [
  'panel', 'karakter', 'angka-lampu', 'meja-kue', 'aksen-balon', 'garland-meter', 'led-backdrop', 'tiang-balon',
  'balon-jumbo', 'balon-gantung', 'neon-nama', 'karpet', 'standing-flower', 'tanaman', 'lampu-sorot', 'meja-formal',
];

// Items not placed on the stage; they are driven by backdrop/garland settings.
const SETTING_IDS: CatalogId[] = ['panel', 'garland-meter', 'led-backdrop', 'aksen-balon'];
export const PLACEABLE_IDS: CatalogId[] = CATALOG_IDS.filter((id) => !SETTING_IDS.includes(id));

export type BackdropShape = 'double-arch' | 'single-arch' | 'wavy' | 'round' | 'half-arch';
export const BACKDROP_SHAPES: BackdropShape[] = ['double-arch', 'single-arch', 'wavy', 'round', 'half-arch'];

export const CHARACTER_IDS = ['giraffe', 'lion', 'elephant', 'dino', 'bear', 'astronaut'] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export interface PlacedItem {
  uid: string;
  catalogId: CatalogId;
  /** [x, z] on the stage floor */
  position: [number, number];
  rotationY: number;
  params: Record<string, string | number | boolean>;
}

export interface Design {
  version: 1;
  templateType: TemplateType;
  presetId: string;
  backdrop: {
    panelCount: number;
    shape: BackdropShape;
    mainColor: string;
    secondaryColor: string;
    title: string;
    subtitle: string;
    textColor: string;
    font: 'serif' | 'script' | 'modern';
    led: boolean;
    ledColor: string;
  };
  garland: {
    visible: boolean;
    palette: string[];
    lengthM: number;
    sizes: { s5: boolean; s12: boolean; s18: boolean };
    density: 'jarang' | 'sedang' | 'padat';
    finish: 'glossy' | 'doff' | 'metalik' | 'chrome';
    pattern: 'polos' | 'dalmatian' | 'polka';
    leafAccent: boolean;
  };
  items: PlacedItem[];
  environment: { floor: 'wood' | 'marble' | 'checkered'; light: 'hangat' | 'netral' | 'dramatis' };
}

export const LIMITS = {
  panelMin: 1,
  panelMax: 4,
  garlandMin: 4.5,
  garlandMax: 20,
  garlandStep: 0.5,
  paletteMin: 2,
  paletteMax: 5,
  maxItems: 40,
  maxText: 40,
};

export const STAGE_BOUNDS = { minX: -3.2, maxX: 3.2, minZ: 0.4, maxZ: 3.0 };
