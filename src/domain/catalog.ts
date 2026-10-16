import type { CatalogId } from './design.ts';

export interface CatalogItem {
  id: CatalogId;
  name: string;
  category: 'backdrop' | 'balon' | 'properti';
  price: number;
  unit: string;
  active: boolean;
}

export const BASE_PACKAGE_PRICE = 2500000;

export const DEFAULT_CATALOG: CatalogItem[] = [
  { id: 'panel', name: 'Panel backdrop', category: 'backdrop', price: 400000, unit: 'panel', active: true },
  { id: 'led-backdrop', name: 'LED lampu backdrop', category: 'backdrop', price: 150000, unit: 'set', active: true },
  { id: 'neon-nama', name: 'Neon sign nama', category: 'backdrop', price: 350000, unit: 'buah', active: true },
  { id: 'garland-meter', name: 'Balon garland', category: 'balon', price: 250000, unit: 'meter', active: true },
  { id: 'aksen-balon', name: 'Aksen dekor balon (daun)', category: 'balon', price: 150000, unit: 'set', active: true },
  { id: 'tiang-balon', name: 'Tiang balon', category: 'balon', price: 200000, unit: 'tiang', active: true },
  { id: 'balon-jumbo', name: 'Balon jumbo 36"', category: 'balon', price: 75000, unit: 'buah', active: true },
  { id: 'balon-gantung', name: 'Balon gantung', category: 'balon', price: 25000, unit: 'buah', active: true },
  { id: 'karakter', name: 'Karakter cutout 100 cm', category: 'properti', price: 100000, unit: 'karakter', active: true },
  { id: 'angka-lampu', name: 'Angka lampu', category: 'properti', price: 250000, unit: 'angka', active: true },
  { id: 'meja-kue', name: 'Meja kue', category: 'properti', price: 50000, unit: 'meja', active: true },
  { id: 'meja-formal', name: 'Meja formal + taplak', category: 'properti', price: 200000, unit: 'meja', active: true },
  { id: 'standing-flower', name: 'Standing flower', category: 'properti', price: 300000, unit: 'buah', active: true },
  { id: 'tanaman', name: 'Tanaman besar', category: 'properti', price: 100000, unit: 'buah', active: true },
  { id: 'karpet', name: 'Karpet panggung', category: 'properti', price: 150000, unit: 'lembar', active: true },
  { id: 'lampu-sorot', name: 'Lampu sorot', category: 'properti', price: 100000, unit: 'buah', active: true },
];
