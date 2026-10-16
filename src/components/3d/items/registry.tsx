import type React from 'react';
import type { CatalogId } from '@/domain/design';
import type { ItemProps } from './types';
import { Character } from './Character';
import { MarqueeDigit } from './MarqueeDigit';
import { CakeTable } from './CakeTable';
import { BalloonColumn, JumboBalloon, HangingBalloons } from './Balloons';
import { NeonSign, Carpet, StandingFlower, Plant, Spotlight, FormalTable } from './Props';

export type PlacedCatalogId = Exclude<CatalogId, 'panel' | 'garland-meter' | 'led-backdrop' | 'aksen-balon'>;

export const ITEM_RENDERERS: Record<PlacedCatalogId, React.FC<ItemProps>> = {
  karakter: Character,
  'angka-lampu': MarqueeDigit,
  'meja-kue': CakeTable,
  'tiang-balon': BalloonColumn,
  'balon-jumbo': JumboBalloon,
  'balon-gantung': HangingBalloons,
  'neon-nama': NeonSign,
  karpet: Carpet,
  'standing-flower': StandingFlower,
  tanaman: Plant,
  'lampu-sorot': Spotlight,
  'meja-formal': FormalTable,
};

/** Footprint radius (selection ring) and height (toolbar anchor) per item. */
export const ITEM_BOUNDS: Record<PlacedCatalogId, { radius: number; height: number }> = {
  karakter: { radius: 0.55, height: 1.7 },
  'angka-lampu': { radius: 0.45, height: 1.25 },
  'meja-kue': { radius: 0.35, height: 1.35 },
  'tiang-balon': { radius: 0.35, height: 2.5 },
  'balon-jumbo': { radius: 0.45, height: 2.3 },
  'balon-gantung': { radius: 0.4, height: 3.0 },
  'neon-nama': { radius: 0.7, height: 1.7 },
  karpet: { radius: 1.3, height: 0.3 },
  'standing-flower': { radius: 0.35, height: 1.7 },
  tanaman: { radius: 0.45, height: 1.3 },
  'lampu-sorot': { radius: 0.3, height: 1.45 },
  'meja-formal': { radius: 0.85, height: 1.2 },
};
