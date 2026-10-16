import type { CatalogId, Design, PlacedItem, TemplateType } from './design.ts';

export interface Preset {
  id: string;
  templateType: TemplateType;
  name: string;
  badge: string;
  description: string;
  design: Design;
}

const item = (uid: string, catalogId: CatalogId, x: number, z: number, params: PlacedItem['params'] = {}, rotationY = 0): PlacedItem => ({
  uid, catalogId, position: [x, z], rotationY, params,
});

interface PresetInput {
  id: string;
  templateType: TemplateType;
  name: string;
  badge: string;
  description: string;
  backdrop: Omit<Design['backdrop'], 'panelCount'>;
  garland: Pick<Design['garland'], 'palette' | 'finish' | 'pattern' | 'leafAccent'> & Partial<Design['garland']>;
  items: PlacedItem[];
  environment: Design['environment'];
}

const preset = (p: PresetInput): Preset => ({
  id: p.id,
  templateType: p.templateType,
  name: p.name,
  badge: p.badge,
  description: p.description,
  design: {
    version: 1,
    templateType: p.templateType,
    presetId: p.id,
    backdrop: { panelCount: 1, ...p.backdrop },
    garland: {
      visible: true,
      lengthM: 4.5,
      sizes: { s5: true, s12: true, s18: true },
      density: 'sedang',
      ...p.garland,
    },
    items: p.items,
    environment: p.environment,
  },
});

export const PRESETS: Preset[] = [
  preset({
    id: 'safari',
    templateType: 'anak',
    name: 'Wild One Safari',
    badge: 'Populer',
    description: 'Hijau sage, cokelat karamel, motif dalmatian, dan hewan hutan yang lucu.',
    backdrop: {
      shape: 'double-arch', mainColor: '#F5EBE1', secondaryColor: '#E8DBCB',
      title: "Noah's", subtitle: 'WILD ONE', textColor: '#212121', font: 'serif', led: false, ledColor: '#FFE6A7',
    },
    garland: { palette: ['#566E58', '#7E4C2F', '#EDE4D4'], finish: 'glossy', pattern: 'dalmatian', leafAccent: true },
    items: [
      item('safari-k1', 'karakter', -1.9, 1.0, { character: 'giraffe' }, 0.25),
      item('safari-k2', 'karakter', -1.05, 1.35, { character: 'lion' }, 0.1),
      item('safari-k3', 'karakter', 1.05, 1.35, { character: 'elephant' }, -0.1),
      item('safari-a1', 'angka-lampu', 1.85, 1.0, { digit: 1, lit: true }, -0.2),
      item('safari-m1', 'meja-kue', 0, 1.25, { style: 'smooth', color: '#F2E8DC', cake: true }),
      item('safari-t1', 'tanaman', -2.6, 0.6, { kind: 'monstera' }),
    ],
    environment: { floor: 'wood', light: 'hangat' },
  }),
  preset({
    id: 'pastel-dream',
    templateType: 'anak',
    name: 'Sweet Pastel Dream',
    badge: 'Lucu',
    description: 'Pink lembut, lilac, mint, dan sentuhan metalik dengan teddy yang menggemaskan.',
    backdrop: {
      shape: 'wavy', mainColor: '#FDE2E4', secondaryColor: '#F8EDEB',
      title: "Mia's", subtitle: 'SWEET ONE', textColor: '#6D597A', font: 'script', led: true, ledColor: '#FFB7B2',
    },
    garland: { palette: ['#F7CAD0', '#CDB4DB', '#B5E2FA'], finish: 'metalik', pattern: 'polka', leafAccent: false },
    items: [
      item('pastel-k1', 'karakter', -1.6, 1.15, { character: 'bear' }, 0.2),
      item('pastel-k2', 'karakter', 1.6, 1.15, { character: 'giraffe' }, -0.2),
      item('pastel-a1', 'angka-lampu', 0.9, 1.4, { digit: 1, lit: true }),
      item('pastel-m1', 'meja-kue', -0.2, 1.3, { style: 'ribbed', color: '#FFF1F3', cake: true }),
      item('pastel-j1', 'balon-jumbo', -2.5, 0.8, { color: '#F7CAD0' }),
    ],
    environment: { floor: 'marble', light: 'hangat' },
  }),
  preset({
    id: 'rose-gold',
    templateType: 'sweet17',
    name: 'Rose Gold Glam',
    badge: 'Favorit',
    description: 'Rose gold, blush, dan putih mutiara dengan angka 17 yang menyala.',
    backdrop: {
      shape: 'round', mainColor: '#F6E3DC', secondaryColor: '#EBCFC4',
      title: 'Alya', subtitle: 'SWEET SEVENTEEN', textColor: '#7A4A3E', font: 'script', led: true, ledColor: '#FFD6C2',
    },
    garland: { palette: ['#D8A39D', '#F3D5CF', '#FFFFFF', '#C9A27E'], finish: 'chrome', pattern: 'polos', leafAccent: false },
    items: [
      item('rose-a1', 'angka-lampu', -1.25, 1.2, { digit: 1, lit: true }, 0.15),
      item('rose-a2', 'angka-lampu', -0.6, 1.3, { digit: 7, lit: true }, 0.05),
      item('rose-m1', 'meja-kue', 0.6, 1.3, { style: 'smooth', color: '#FFFFFF', cake: true }),
      item('rose-s1', 'standing-flower', 2.2, 0.8, { color: '#F3D5CF' }),
    ],
    environment: { floor: 'marble', light: 'netral' },
  }),
  preset({
    id: 'midnight-neon',
    templateType: 'sweet17',
    name: 'Midnight Neon',
    badge: 'Bold',
    description: 'Navy gelap, ungu neon, dan chrome perak untuk pesta malam.',
    backdrop: {
      shape: 'half-arch', mainColor: '#141B34', secondaryColor: '#232C4F',
      title: 'Rafa', subtitle: 'SEVENTEEN', textColor: '#F4F1FF', font: 'modern', led: true, ledColor: '#B57BFF',
    },
    garland: { palette: ['#1E2A5A', '#7B4DFF', '#C0C7D6'], finish: 'chrome', pattern: 'polos', leafAccent: false },
    items: [
      item('neon-a1', 'angka-lampu', 1.05, 1.2, { digit: 1, lit: true }, -0.1),
      item('neon-a2', 'angka-lampu', 1.7, 1.1, { digit: 7, lit: true }, -0.2),
      item('neon-m1', 'meja-kue', -0.6, 1.3, { style: 'ribbed', color: '#2A2F45', cake: true }),
      item('neon-l1', 'lampu-sorot', -2.6, 1.6, {}, 0.6),
    ],
    environment: { floor: 'checkered', light: 'dramatis' },
  }),
  preset({
    id: 'ivory-elegance',
    templateType: 'formal',
    name: 'Ivory Elegance',
    badge: 'Klasik',
    description: 'Gading, champagne, dan hijau daun untuk acara resmi yang tenang.',
    backdrop: {
      shape: 'single-arch', mainColor: '#F4EEE3', secondaryColor: '#E7DCCB',
      title: 'Selamat Datang', subtitle: 'PT NUSANTARA', textColor: '#3B342A', font: 'serif', led: false, ledColor: '#FFF1D0',
    },
    garland: { palette: ['#EFE6D6', '#D9C7A5', '#FFFFFF'], finish: 'doff', pattern: 'polos', leafAccent: true },
    items: [
      item('ivory-f1', 'meja-formal', 0, 1.4, { color: '#FFFFFF' }),
      item('ivory-s1', 'standing-flower', -1.9, 0.9, { color: '#EFE6D6' }),
      item('ivory-s2', 'standing-flower', 1.9, 0.9, { color: '#EFE6D6' }),
    ],
    environment: { floor: 'marble', light: 'netral' },
  }),
  preset({
    id: 'emerald-gala',
    templateType: 'formal',
    name: 'Emerald Gala',
    badge: 'Mewah',
    description: 'Hijau emerald, emas, dan hitam untuk gala dinner dan peresmian.',
    backdrop: {
      shape: 'double-arch', mainColor: '#1F3B33', secondaryColor: '#2C5246',
      title: 'Gala Dinner', subtitle: '2026', textColor: '#E9D9A6', font: 'serif', led: true, ledColor: '#FFE1A1',
    },
    garland: { palette: ['#1F5C4A', '#C9A54C', '#111111'], finish: 'metalik', pattern: 'polos', leafAccent: true },
    items: [
      item('emerald-f1', 'meja-formal', 0, 1.4, { color: '#111111' }),
      item('emerald-s1', 'standing-flower', -1.9, 0.9, { color: '#C9A54C' }),
      item('emerald-s2', 'standing-flower', 1.9, 0.9, { color: '#C9A54C' }),
      item('emerald-c1', 'karpet', 0, 2.2, { color: '#7A1E2B' }),
    ],
    environment: { floor: 'wood', light: 'dramatis' },
  }),
];

export const DEFAULT_PRESET_ID = 'safari';

export const getPreset = (id: string): Preset | undefined => PRESETS.find((p) => p.id === id);
