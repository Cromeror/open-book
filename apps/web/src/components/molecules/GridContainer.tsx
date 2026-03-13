'use client';

import type { ReactNode } from 'react';

export interface GridItem {
  /** Unique key for the item */
  id: string;
  /** Content to render inside the grid cell */
  content: ReactNode;
  /** Column span (1-4, defaults to 1) */
  colSpan?: 1 | 2 | 3 | 4;
}

export interface GridContainerProps {
  /** Items to display in the grid */
  items: GridItem[];
  /** Number of columns (1-4, defaults to 3) */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between items: 'sm' | 'md' | 'lg' (defaults to 'md') */
  gap?: 'sm' | 'md' | 'lg';
}

const columnsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

const gapMap = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
} as const;

const colSpanMap = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'sm:col-span-2 lg:col-span-4',
} as const;

/**
 * GridContainer - Molecule component
 *
 * Renders items in a responsive mosaic/grid layout.
 * Each item can optionally span multiple columns.
 */
export function GridContainer({ items, columns = 3, gap = 'md' }: GridContainerProps) {
  if (items.length === 0) return null;

  return (
    <div className={`grid ${columnsMap[columns]} ${gapMap[gap]}`}>
      {items.map((item) => (
        <div key={item.id} className={item.colSpan ? colSpanMap[item.colSpan] : ''}>
          {item.content}
        </div>
      ))}
    </div>
  );
}
