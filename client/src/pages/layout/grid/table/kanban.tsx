import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GridColumnConfig } from "@/pages/layout/grid/ResourceGrid";
import { flexRender, Row, Table as TableModel } from "@tanstack/react-table";
import { LayoutGridIcon } from "lucide-react";
import React, { useMemo } from "react";

const UNGROUPED_KEY = "__ungrouped__";

type KanbanGroup<TData> = {
  key: string;
  label: string;
  color?: string;
  rows: Row<TData>[];
};

type KanbanProps<TData extends { _id: string }> = {
  tableBody: TableModel<TData>;
  columns: GridColumnConfig<TData>[];
  listableColumns: GridColumnConfig<TData>[];
  groupByKey: string;
  isLoading?: boolean;
  pageSize?: number;
};

function getGroupKey<TData extends { _id: string }>(row: TData, column: GridColumnConfig<TData>) {
  if (column.kanbanIdKey) {
    const id = row[column.kanbanIdKey];
    return id != null && String(id).trim() !== "" ? String(id) : UNGROUPED_KEY;
  }

  const value = row[column.key as keyof TData];
  if (value == null || value === "" || value === "-") return UNGROUPED_KEY;
  return String(value);
}

function getGroupLabel<TData extends { _id: string }>(row: TData, column: GridColumnConfig<TData>) {
  const value = row[column.key as keyof TData];
  if (value == null || value === "" || value === "-") return "Unassigned";
  return String(value);
}

function getGroupColor<TData extends { _id: string }>(row: TData, column: GridColumnConfig<TData>) {
  if (!column.kanbanColorKey) return undefined;
  const color = row[column.kanbanColorKey];
  return typeof color === "string" && color.trim() !== "" ? color : undefined;
}

function buildKanbanGroups<TData extends { _id: string }>(
  rows: Row<TData>[],
  groupColumn: GridColumnConfig<TData>
): KanbanGroup<TData>[] {
  const groupMap = new Map<string, KanbanGroup<TData>>();

  rows.forEach((row) => {
    const key = getGroupKey(row.original, groupColumn);
    const existing = groupMap.get(key);

    if (existing) {
      existing.rows.push(row);
      return;
    }

    groupMap.set(key, {
      key,
      label: getGroupLabel(row.original, groupColumn),
      color: getGroupColor(row.original, groupColumn),
      rows: [row],
    });
  });

  const groups = Array.from(groupMap.values());
  groups.sort((a, b) => {
    if (a.key === UNGROUPED_KEY) return 1;
    if (b.key === UNGROUPED_KEY) return -1;
    return a.label.localeCompare(b.label);
  });

  return groups;
}

function KanbanColumnHeader({ label, color, count }: { label: string; color?: string; count: number }) {
  const accentStyle =
    color ?
      {
        borderColor: `${color}55`,
        backgroundColor: `${color}18`,
      }
    : undefined;

  return (
    <div className="kanban-column__header sticky top-0 z-10 border-b border-primary/10 bg-primary/5 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-primary/10">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {color ?
            <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          : null}
          <Badge variant="secondary" className="max-w-full truncate rounded-lg font-semibold" style={accentStyle}>
            {label}
          </Badge>
        </div>
        <span className="shrink-0 rounded-md border border-border/70 bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {count}
        </span>
      </div>
    </div>
  );
}

function KanbanCard<TData extends { _id: string }>({
  row,
  groupColumnKey,
  columnLabels,
}: {
  row: Row<TData>;
  groupColumnKey: string;
  columnLabels: Record<string, string>;
}) {
  const cells = row
    .getVisibleCells()
    .filter((cell) => !["select", "action", groupColumnKey].includes(cell.column.id));

  const titleCell = cells[0];
  const detailCells = cells.slice(1);

  const actionCell = row.getVisibleCells().find((cell) => cell.column.id === "action");

  return (
    <article
      className="group rounded-lg border border-border/70 bg-background p-3 shadow-sm transition-colors hover:bg-muted/35 data-[state=selected]:border-primary/30 data-[state=selected]:bg-primary/5"
      data-state={row.getIsSelected() ? "selected" : undefined}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          {titleCell ?
            <div className="text-sm font-semibold text-foreground">
              {flexRender(titleCell.column.columnDef.cell, titleCell.getContext())}
            </div>
          : null}

          {detailCells.length > 0 ?
            <dl className="space-y-1.5">
              {detailCells.map((cell) => (
                  <div key={cell.id} className="flex items-start gap-2 text-xs">
                    <dt className="w-24 shrink-0 font-medium text-muted-foreground">
                      {columnLabels[cell.column.id] ?? cell.column.id}
                    </dt>
                    <dd className="min-w-0 flex-1 font-medium text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </dd>
                  </div>
                ))}
            </dl>
          : null}
        </div>

        {actionCell ?
          <div className="shrink-0">{flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}</div>
        : null}
      </div>
    </article>
  );
}

function KanbanSkeleton({ columns = 3, cards = 4 }: { columns?: number; cards?: number }) {
  return (
    <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <div
          key={`kanban-skeleton-column-${columnIndex}`}
          className="flex w-[min(100%,18rem)] shrink-0 flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
          <div className="border-b border-primary/10 bg-primary/5 px-3 py-3">
            <Skeleton className="h-6 w-28 rounded-lg" />
          </div>
          <div className="space-y-3 p-3">
            {Array.from({ length: cards }).map((__, cardIndex) => (
              <div
                key={`kanban-skeleton-card-${columnIndex}-${cardIndex}`}
                className="space-y-2 rounded-lg border border-border/70 bg-background p-3 shadow-sm">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-2/3 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanEmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed border-border/70 bg-card p-10 text-center shadow-sm">
      <div className="max-w-sm space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
          <LayoutGridIcon className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-foreground">Kanban view unavailable</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function Kanban<TData extends { _id: string }>({
  tableBody,
  columns,
  listableColumns,
  groupByKey,
  isLoading = false,
  pageSize = 10,
}: KanbanProps<TData>) {
  const columnLabels = useMemo(
    () =>
      columns.reduce<Record<string, string>>((labels, column) => {
        if (column.key !== "select" && column.key !== "action") {
          labels[column.key] = column.label;
        }
        return labels;
      }, {}),
    [columns]
  );

  const activeGroupColumn = useMemo(
    () => listableColumns.find((column) => column.key === groupByKey) ?? listableColumns[0],
    [groupByKey, listableColumns]
  );

  const rows = tableBody.getFilteredRowModel().rows;
  const groups = useMemo(
    () => (activeGroupColumn ? buildKanbanGroups(rows, activeGroupColumn) : []),
    [activeGroupColumn, rows]
  );

  if (isLoading) {
    return (
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
        <KanbanSkeleton columns={Math.min(Math.max(pageSize / 4, 2), 4)} />
      </div>
    );
  }

  if (listableColumns.length === 0) {
    return (
      <KanbanEmptyState message="Mark at least one column as listable in the grid configuration to group items into kanban columns." />
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
      {groups.length === 0 ?
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
          No items match the current filters.
        </div>
      : <div className="kanban-board scrollbar-none flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
          {groups.map((group) => (
            <section
              key={group.key}
              className="kanban-column flex w-[min(100%,18rem)] shrink-0 flex-col overflow-hidden rounded-lg border border-border/70 bg-muted/10 shadow-sm">
              <KanbanColumnHeader label={group.label} color={group.color} count={group.rows.length} />

              <div className="kanban-column__body scrollbar-none flex flex-1 flex-col gap-3 overflow-y-auto p-3">
                {group.rows.map((row) => (
                  <KanbanCard
                    key={row.id}
                    row={row}
                    groupColumnKey={activeGroupColumn?.key ?? ""}
                    columnLabels={columnLabels}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      }
    </div>
  );
}

export default Kanban;
