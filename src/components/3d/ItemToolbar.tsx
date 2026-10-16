'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { Copy, Focus, RotateCw, Trash2 } from 'lucide-react';

export interface ItemToolbarActions {
  onFocus(uid: string): void;
  onRotate(uid: string): void;
  onDuplicate(uid: string): void;
  onDelete(uid: string): void;
}

interface ItemToolbarProps extends ItemToolbarActions {
  uid: string;
  position: [number, number, number];
}

const BUTTONS = [
  { key: 'onFocus', label: 'Fokus kamera ke item', Icon: Focus },
  { key: 'onRotate', label: 'Putar 45 derajat', Icon: RotateCw },
  { key: 'onDuplicate', label: 'Duplikat item', Icon: Copy },
  { key: 'onDelete', label: 'Hapus item', Icon: Trash2 },
] as const;

/** Floating action pill anchored above the selected item. */
export const ItemToolbar: React.FC<ItemToolbarProps> = ({ uid, position, ...actions }) => (
  <Html position={position} center zIndexRange={[20, 0]}>
    <div className="item-toolbar" role="toolbar" aria-label="Aksi item" onPointerDown={(e) => e.stopPropagation()}>
      {BUTTONS.map(({ key, label, Icon }) => (
        <button key={key} type="button" aria-label={label} title={label}
          className={key === 'onDelete' ? 'is-danger' : undefined}
          onClick={(e) => { e.stopPropagation(); actions[key](uid); }}>
          <Icon size={15} strokeWidth={2} />
        </button>
      ))}
    </div>
  </Html>
);
