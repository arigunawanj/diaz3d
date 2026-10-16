import { DecorationState, ThemePreset } from '@/types/decoration';

export const DEFAULT_DECORATION: DecorationState = {
  // Backdrop
  backdropShape: 'double-arch',
  backdropMainColor: '#F5EBE1', // warm cream
  backdropSecondaryColor: '#E6D7C3',
  backdropLedGlow: true,
  backdropLedColor: '#FFEAA7',
  titleText: "Noah's",
  subtitleText: 'WILD ONE',
  textColor: '#1E1E1E',
  textFont: 'serif',

  // Balloons
  balloonPrimary: '#5C7A58', // Sage / Forest Olive Green
  balloonSecondary: '#7F5234', // Warm Caramel Brown
  balloonAccent: '#EFE7DB', // Cream / Ivory
  balloonPattern: '#FFFFFF', // Base for dalmatian spots
  balloonPatternType: 'dalmatian',
  balloonFinish: 'glossy',
  showPatternBalloons: true,

  // Characters
  leftCharacter: 'giraffe',
  centerLeftCharacter: 'lion',
  centerRightCharacter: 'elephant',

  // Foliage
  showMonstera: true,
  showPalms: true,

  // Props
  marqueeNumber: 1,
  marqueeLit: true,
  showPedestal: true,
  pedestalColor: '#F2E8DC',
  pedestalStyle: 'smooth',
  showCake: true,

  // Environment
  floorType: 'wood',
  ambientLightColor: '#FFFDF9',
  spotlightIntensity: 1.2,
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'safari',
    name: 'Wild One Safari',
    badge: 'Popular',
    description: 'Sage green, caramel brown, dalmatian spots & cute jungle animals',
    thumbnail: '🦁',
    config: {
      backdropShape: 'double-arch',
      backdropMainColor: '#F5EBE1',
      backdropSecondaryColor: '#E8DBCB',
      backdropLedGlow: true,
      backdropLedColor: '#FFE6A7',
      titleText: "Noah's",
      subtitleText: 'WILD ONE',
      textColor: '#212121',
      balloonPrimary: '#566E58',
      balloonSecondary: '#7E4C2F',
      balloonAccent: '#EDE4D4',
      balloonPatternType: 'dalmatian',
      balloonFinish: 'glossy',
      leftCharacter: 'giraffe',
      centerLeftCharacter: 'lion',
      centerRightCharacter: 'elephant',
      marqueeNumber: 1,
      showMonstera: true,
      showPalms: true,
    },
  },
  {
    id: 'pastel-dream',
    name: 'Sweet Pastel Dream',
    badge: 'Cute',
    description: 'Blush pink, lilac, mint, metallic gold with cute teddy & bunny',
    thumbnail: '🌸',
    config: {
      backdropShape: 'wavy',
      backdropMainColor: '#FDE2E4',
      backdropSecondaryColor: '#F8EDEB',
      backdropLedGlow: true,
      backdropLedColor: '#FFB7B2',
      titleText: "Mia's",
      subtitleText: 'SWEET ONE',
      textColor: '#6D597A',
      balloonPrimary: '#F7CAD0',
      balloonSecondary: '#CDB4DB',
      balloonAccent: '#B5E2FA',
      balloonPatternType: 'polka',
      balloonFinish: 'metallic',
      leftCharacter: 'bear',
      centerLeftCharacter: 'rabbit',
      centerRightCharacter: 'fox',
      marqueeNumber: 1,
      showMonstera: false,
      showPalms: true,
    },
  },
  {
    id: 'boho-sunset',
    name: 'Boho Terracotta Sunset',
    badge: 'Trending',
    description: 'Earthy warm terracotta, desert sand, pampas grass aesthetics',
    thumbnail: '🌾',
    config: {
      backdropShape: 'round',
      backdropMainColor: '#E3B59B',
      backdropSecondaryColor: '#F1DCC9',
      backdropLedGlow: true,
      backdropLedColor: '#FFCC99',
      titleText: "Oliver",
      subtitleText: 'TURNS TWO',
      textColor: '#4A2810',
      balloonPrimary: '#B55A30',
      balloonSecondary: '#DDA15E',
      balloonAccent: '#FEFAE0',
      balloonPatternType: 'none',
      balloonFinish: 'matte',
      leftCharacter: 'bear',
      centerLeftCharacter: 'lion',
      centerRightCharacter: 'koala',
      marqueeNumber: 2,
      showMonstera: false,
      showPalms: true,
    },
  },
  {
    id: 'dino-adventure',
    name: 'Dino Jurassic Quest',
    badge: 'Kids Favorite',
    description: 'Emerald jungle greens, vibrant mustard, friendly baby dinos',
    thumbnail: '🦖',
    config: {
      backdropShape: 'double-arch',
      backdropMainColor: '#E8F5E9',
      backdropSecondaryColor: '#C8E6C9',
      backdropLedGlow: true,
      backdropLedColor: '#A7F3D0',
      titleText: "Leo's",
      subtitleText: 'THREE-REX',
      textColor: '#1B4332',
      balloonPrimary: '#2D6A4F',
      balloonSecondary: '#52B788',
      balloonAccent: '#D8F3DC',
      balloonPatternType: 'dalmatian',
      balloonFinish: 'glossy',
      leftCharacter: 'dino',
      centerLeftCharacter: 'tiger',
      centerRightCharacter: 'elephant',
      marqueeNumber: 3,
      showMonstera: true,
      showPalms: true,
    },
  },
  {
    id: 'space-galaxy',
    name: 'Space Cadet Odyssey',
    badge: 'Sci-Fi',
    description: 'Cosmic deep navy, metallic chrome silver, stars & astronaut',
    thumbnail: '🚀',
    config: {
      backdropShape: 'half-arch',
      backdropMainColor: '#0F172A',
      backdropSecondaryColor: '#1E293B',
      backdropLedGlow: true,
      backdropLedColor: '#38BDF8',
      titleText: "Lucas",
      subtitleText: 'FIRST TRIP AROUND SUN',
      textColor: '#F8FAFC',
      balloonPrimary: '#1E3A8A',
      balloonSecondary: '#475569',
      balloonAccent: '#CBD5E1',
      balloonPatternType: 'none',
      balloonFinish: 'metallic',
      leftCharacter: 'astronaut',
      centerLeftCharacter: 'rabbit',
      centerRightCharacter: 'fox',
      marqueeNumber: 1,
      showMonstera: false,
      showPalms: false,
    },
  },
];

export const COLOR_PALETTES = [
  { name: 'Safari Green', hex: '#5C7A58' },
  { name: 'Caramel Brown', hex: '#7F5234' },
  { name: 'Ivory Cream', hex: '#EFE7DB' },
  { name: 'Terracotta', hex: '#B55A30' },
  { name: 'Mustard Gold', hex: '#DDA15E' },
  { name: 'Candy Pink', hex: '#F7CAD0' },
  { name: 'Lilac Purple', hex: '#CDB4DB' },
  { name: 'Mint Green', hex: '#B7E4C7' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Metallic Silver', hex: '#94A3B8' },
  { name: 'Gloss White', hex: '#FFFFFF' },
  { name: 'Matte Charcoal', hex: '#262626' },
];

export const PRICING_CONFIG = {
  basePackage: 1850000, // IDR base backdrop & frame
  balloonPerMeter: 350000, // Garland
  characterCutout: 120000, // Per cutout character
  marqueeNumber: 175000, // LED light number
  cakePedestal: 150000, // Cake stand & pedestal table
  ledNeonOutline: 200000, // Neon strip
};
