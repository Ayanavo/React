export const GRID_COLUMN_SELECT_WIDTH = 48;
export const GRID_COLUMN_ACTION_WIDTH = 64;

export type GridColumnSizingInput = {
  key: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
};

export function resolveGridColumnSizing(column: GridColumnSizingInput) {
  if (column.key === "select") {
    return {
      size: GRID_COLUMN_SELECT_WIDTH,
      minSize: GRID_COLUMN_SELECT_WIDTH,
      maxSize: GRID_COLUMN_SELECT_WIDTH,
      enableResizing: false,
    };
  }

  if (column.key === "action") {
    return {
      size: GRID_COLUMN_ACTION_WIDTH,
      minSize: GRID_COLUMN_ACTION_WIDTH,
      maxSize: GRID_COLUMN_ACTION_WIDTH,
      enableResizing: false,
    };
  }

  const minSize = column.minWidth ?? column.width ?? 120;
  const size = column.width ?? minSize;

  return {
    size,
    minSize,
    ...(column.maxWidth != null ? { maxSize: column.maxWidth } : {}),
    enableResizing: column.resizable !== false,
  };
}

type ColumnWithDefaultSize = {
  id: string;
  columnDef: { size?: number };
};

export function normalizeColumnSizing<T extends ColumnWithDefaultSize>(
  nextSizing: Record<string, number>,
  columns: T[]
): Record<string, number> {
  const normalized = { ...nextSizing };

  for (const column of columns) {
    const defaultSize = column.columnDef.size;
    if (defaultSize != null && normalized[column.id] === defaultSize) {
      delete normalized[column.id];
    }
  }

  return normalized;
}

export function normalizeColumnSizingFromConfig<T extends { key: string; width?: number; minWidth?: number }>(
  nextSizing: Record<string, number>,
  columnConfig: T[]
): Record<string, number> {
  const normalized = { ...nextSizing };

  for (const column of columnConfig) {
    if (column.key === "select" || column.key === "action") continue;
    const defaultSize = column.width ?? column.minWidth ?? 120;
    if (normalized[column.key] === defaultSize) {
      delete normalized[column.key];
    }
  }

  return normalized;
}
