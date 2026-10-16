import { LIMITS, PLACEABLE_IDS, STAGE_BOUNDS, type CatalogId, type Design, type PlacedItem } from './design.ts';
import { DEFAULT_PRESET_ID, getPreset } from './presets.ts';
import { parseDesign } from './validate.ts';

export type EditorAction =
  | { type: 'applyPreset'; presetId: string }
  | { type: 'load'; design: Design }
  | { type: 'addItem'; uid: string; catalogId: CatalogId; position?: [number, number]; params?: PlacedItem['params'] }
  | { type: 'removeItem'; uid: string }
  | { type: 'moveItem'; uid: string; position: [number, number] }
  | { type: 'rotateItem'; uid: string; deltaY: number }
  | { type: 'duplicateItem'; uid: string; newUid: string }
  | { type: 'updateItemParams'; uid: string; params: PlacedItem['params'] }
  | { type: 'setBackdrop'; patch: Partial<Design['backdrop']> }
  | { type: 'setGarland'; patch: Partial<Design['garland']> }
  | { type: 'setEnvironment'; patch: Partial<Design['environment']> };

export const DEFAULT_DROP: [number, number] = [0, 1.6];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round2 = (v: number) => Math.round(v * 100) / 100;

export const clampToStage = ([x, z]: [number, number]): [number, number] => [
  round2(clamp(x, STAGE_BOUNDS.minX, STAGE_BOUNDS.maxX)),
  round2(clamp(z, STAGE_BOUNDS.minZ, STAGE_BOUNDS.maxZ)),
];

const mapItem = (d: Design, uid: string, fn: (i: PlacedItem) => PlacedItem): Design => ({
  ...d,
  items: d.items.map((i) => (i.uid === uid ? fn(i) : i)),
});

export function designReducer(state: Design, action: EditorAction): Design {
  switch (action.type) {
    case 'applyPreset': {
      const preset = getPreset(action.presetId);
      return preset ? structuredClone(preset.design) : state;
    }
    case 'load':
      return structuredClone(action.design);
    case 'addItem': {
      if (state.items.length >= LIMITS.maxItems || !PLACEABLE_IDS.includes(action.catalogId)) return state;
      const same = state.items.filter((i) => i.catalogId === action.catalogId).length;
      const position = clampToStage(action.position ?? [DEFAULT_DROP[0] + 0.35 * same, DEFAULT_DROP[1]]);
      const item: PlacedItem = { uid: action.uid, catalogId: action.catalogId, position, rotationY: 0, params: { ...action.params } };
      return { ...state, items: [...state.items, item] };
    }
    case 'removeItem':
      return { ...state, items: state.items.filter((i) => i.uid !== action.uid) };
    case 'moveItem':
      return mapItem(state, action.uid, (i) => ({ ...i, position: clampToStage(action.position) }));
    case 'rotateItem':
      return mapItem(state, action.uid, (i) => ({ ...i, rotationY: (i.rotationY + action.deltaY) % (Math.PI * 2) }));
    case 'duplicateItem': {
      const src = state.items.find((i) => i.uid === action.uid);
      if (!src || state.items.length >= LIMITS.maxItems) return state;
      const copy: PlacedItem = {
        ...src, uid: action.newUid, params: { ...src.params },
        position: clampToStage([src.position[0] + 0.4, src.position[1]]),
      };
      return { ...state, items: [...state.items, copy] };
    }
    case 'updateItemParams':
      return mapItem(state, action.uid, (i) => ({ ...i, params: { ...i.params, ...action.params } }));
    case 'setBackdrop': {
      const backdrop = { ...state.backdrop, ...action.patch };
      backdrop.panelCount = clamp(Math.round(backdrop.panelCount), LIMITS.panelMin, LIMITS.panelMax);
      return { ...state, backdrop };
    }
    case 'setGarland': {
      const garland = { ...state.garland, ...action.patch, sizes: { ...state.garland.sizes, ...action.patch.sizes } };
      const step = LIMITS.garlandStep;
      garland.lengthM = clamp(Math.round(garland.lengthM / step) * step, LIMITS.garlandMin, LIMITS.garlandMax);
      if (garland.palette.length < LIMITS.paletteMin) garland.palette = state.garland.palette;
      garland.palette = garland.palette.slice(0, LIMITS.paletteMax);
      return { ...state, garland };
    }
    case 'setEnvironment':
      return { ...state, environment: { ...state.environment, ...action.patch } };
  }
}

export const DRAFT_KEY = 'diaz3d:draft:v1';

export function loadDraft(storage: Pick<Storage, 'getItem'> | null): Design {
  try {
    const raw = storage?.getItem(DRAFT_KEY);
    if (raw) return parseDesign(JSON.parse(raw));
  } catch {
    // corrupt or blocked storage: fall through to the default preset
  }
  return structuredClone(getPreset(DEFAULT_PRESET_ID)!.design);
}

export function saveDraft(storage: Pick<Storage, 'setItem'> | null, d: Design): void {
  try {
    storage?.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    // storage full or blocked: drafts are a convenience only
  }
}
