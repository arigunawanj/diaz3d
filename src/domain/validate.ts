import {
  BACKDROP_SHAPES, LIMITS, PLACEABLE_IDS, STAGE_BOUNDS,
  type CatalogId, type Design, type PlacedItem,
} from './design.ts';
import { getPreset } from './presets.ts';

export class ValidationError extends Error {
  field: string;
  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

const fail = (field: string, message = `Nilai tidak valid: ${field}`): never => {
  throw new ValidationError(message, field);
};

type Obj = Record<string, unknown>;
const obj = (v: unknown, field: string): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : fail(field));
const bool = (v: unknown, field: string): boolean => (typeof v === 'boolean' ? v : fail(field));
const oneOf = <T extends string>(v: unknown, options: readonly T[], field: string): T =>
  (options as readonly unknown[]).includes(v) ? (v as T) : fail(field);
const text = (v: unknown, field: string, max = LIMITS.maxText): string =>
  typeof v === 'string' && v.length <= max ? v : fail(field);
const color = (v: unknown, field: string): string =>
  typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v) ? v : fail(field);
const num = (v: unknown, field: string, min: number, max: number): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fail(field);
const int = (v: unknown, field: string, min: number, max: number): number =>
  Number.isInteger(v) ? num(v, field, min, max) : fail(field);

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function parseParams(v: unknown, field: string): PlacedItem['params'] {
  const src = obj(v, field);
  const out: PlacedItem['params'] = {};
  for (const [k, val] of Object.entries(src)) {
    if (UNSAFE_KEYS.has(k) || k.length > 24) fail(`${field}.${k}`);
    if (typeof val === 'string') out[k] = text(val, `${field}.${k}`);
    else if (typeof val === 'boolean') out[k] = val;
    else if (typeof val === 'number' && Number.isFinite(val)) out[k] = val;
    else fail(`${field}.${k}`);
  }
  return out;
}

function parseItem(v: unknown, i: number): PlacedItem {
  const f = `items.${i}`;
  const src = obj(v, f);
  const catalogId = oneOf<CatalogId>(src.catalogId, PLACEABLE_IDS, `${f}.catalogId`);
  const pos = src.position;
  if (!Array.isArray(pos) || pos.length !== 2) fail(`${f}.position`);
  const p = pos as unknown[];
  return {
    uid: typeof src.uid === 'string' && /^[\w-]{1,64}$/.test(src.uid) ? src.uid : fail(`${f}.uid`),
    catalogId,
    position: [
      num(p[0], `${f}.position`, STAGE_BOUNDS.minX, STAGE_BOUNDS.maxX),
      num(p[1], `${f}.position`, STAGE_BOUNDS.minZ, STAGE_BOUNDS.maxZ),
    ],
    rotationY: num(src.rotationY, `${f}.rotationY`, -100, 100),
    params: parseParams(src.params, `${f}.params`),
  };
}

/** Strict structural validation; returns a fresh copy with only known keys. */
export function parseDesign(input: unknown): Design {
  const d = obj(input, 'design');
  if (d.version !== 1) fail('version');
  const presetId = typeof d.presetId === 'string' && getPreset(d.presetId) ? d.presetId : fail('presetId');
  const templateType = oneOf(d.templateType, ['anak', 'sweet17', 'formal'] as const, 'templateType');

  const b = obj(d.backdrop, 'backdrop');
  const backdrop: Design['backdrop'] = {
    panelCount: int(b.panelCount, 'backdrop.panelCount', LIMITS.panelMin, LIMITS.panelMax),
    shape: oneOf(b.shape, BACKDROP_SHAPES, 'backdrop.shape'),
    mainColor: color(b.mainColor, 'backdrop.mainColor'),
    secondaryColor: color(b.secondaryColor, 'backdrop.secondaryColor'),
    title: text(b.title, 'backdrop.title'),
    subtitle: text(b.subtitle, 'backdrop.subtitle'),
    textColor: color(b.textColor, 'backdrop.textColor'),
    font: oneOf(b.font, ['serif', 'script', 'modern'] as const, 'backdrop.font'),
    led: bool(b.led, 'backdrop.led'),
    ledColor: color(b.ledColor, 'backdrop.ledColor'),
  };

  const g = obj(d.garland, 'garland');
  const lengthM = num(g.lengthM, 'garland.lengthM', LIMITS.garlandMin, LIMITS.garlandMax);
  if (!Number.isInteger(lengthM / LIMITS.garlandStep)) fail('garland.lengthM');
  if (!Array.isArray(g.palette) || g.palette.length < LIMITS.paletteMin || g.palette.length > LIMITS.paletteMax) fail('garland.palette');
  const sizes = obj(g.sizes, 'garland.sizes');
  const garland: Design['garland'] = {
    visible: bool(g.visible, 'garland.visible'),
    palette: (g.palette as unknown[]).map((c, i) => color(c, `garland.palette.${i}`)),
    lengthM,
    sizes: { s5: bool(sizes.s5, 'garland.sizes'), s12: bool(sizes.s12, 'garland.sizes'), s18: bool(sizes.s18, 'garland.sizes') },
    density: oneOf(g.density, ['jarang', 'sedang', 'padat'] as const, 'garland.density'),
    finish: oneOf(g.finish, ['glossy', 'doff', 'metalik', 'chrome'] as const, 'garland.finish'),
    pattern: oneOf(g.pattern, ['polos', 'dalmatian', 'polka'] as const, 'garland.pattern'),
    leafAccent: bool(g.leafAccent, 'garland.leafAccent'),
  };

  if (!Array.isArray(d.items) || d.items.length > LIMITS.maxItems) fail('items');
  const items = (d.items as unknown[]).map(parseItem);
  if (new Set(items.map((i) => i.uid)).size !== items.length) fail('items');

  const e = obj(d.environment, 'environment');
  const environment: Design['environment'] = {
    floor: oneOf(e.floor, ['wood', 'marble', 'checkered'] as const, 'environment.floor'),
    light: oneOf(e.light, ['hangat', 'netral', 'dramatis'] as const, 'environment.light'),
  };

  return { version: 1, templateType, presetId, backdrop, garland, items, environment };
}

export function normalizeWa(raw: string): string {
  let n = String(raw ?? '').replace(/[\s\-.()]/g, '');
  if (n.startsWith('+62')) n = '62' + n.slice(3);
  else if (n.startsWith('0')) n = '62' + n.slice(1);
  else if (n.startsWith('8')) n = '62' + n;
  if (!/^628\d{7,11}$/.test(n)) fail('wa', 'Nomor WhatsApp tidak valid');
  return n;
}
