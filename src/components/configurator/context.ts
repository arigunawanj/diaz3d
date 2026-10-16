'use client';

import { createContext, useContext, type Dispatch } from 'react';
import type { CatalogId, Design } from '@/domain/design';
import type { CatalogItem } from '@/domain/catalog';
import type { EditorAction } from '@/domain/editor';
import type { PriceBreakdown } from '@/domain/pricing';

export type PanelTab = 'template' | 'backdrop' | 'balon' | 'properti';

export interface ConfiguratorApi {
  design: Design;
  dispatch: Dispatch<EditorAction>;
  catalog: CatalogItem[];
  pricing: PriceBreakdown;
  selectedUid: string | null;
  select(uid: string | null): void;
  addItem(catalogId: CatalogId, position?: [number, number]): void;
  removeItem(uid: string): void;
}

export const ConfiguratorContext = createContext<ConfiguratorApi | null>(null);

export const useConfigurator = () => {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error('useConfigurator outside Configurator');
  return ctx;
};
