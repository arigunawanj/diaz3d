import type { PlacedItem } from '@/domain/design';

export interface ItemProps {
  item: PlacedItem;
  /** Garland palette, used as the default colour for balloon props. */
  palette: string[];
}

export const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);
export const num = (v: unknown, fallback: number) => (typeof v === 'number' ? v : fallback);
export const flag = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
