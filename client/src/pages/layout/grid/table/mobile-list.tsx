import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { flexRender, Row, Table as TableModel } from "@tanstack/react-table";
import React, { useMemo } from "react";

type MobileGridListProps<TData> = {
  tableBody: TableModel<TData>;
  isLoading?: boolean;
  pageSize?: number;
  className?: string;
};

function getColumnLabel<TData>(
  tableBody: TableModel<TData>,
  columnId: string
): string {
  const header = tableBody
    .getHeaderGroups()[0]
    ?.headers.find((item) => item.column.id === columnId);

  if (!header) return columnId;

  const rendered = flexRender(header.column.columnDef.header, header.getContext());
  if (typeof rendered === "string" || typeof rendered === "number") {
    return String(rendered);
  }

  return columnId
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function getCellTitle(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function MobileGridCard<TData>({
  row,
  columnLabels,
}: {
  row: Row<TData>;
  columnLabels: Record<string, string>;
}) {
  const selectCell = row.getVisibleCells().find((cell) => cell.column.id === "select");
  const actionCell = row.getVisibleCells().find((cell) => cell.column.id === "action");
  const dataCells = row
    .getVisibleCells()
    .filter((cell) => !["select", "action"].includes(cell.column.id));

  return (
    <article
      className="grid-row-card group rounded-lg border border-border/70 bg-card p-3 shadow-sm transition-colors data-[state=selected]:border-primary/30 data-[state=selected]:bg-primary/5"
      data-state={row.getIsSelected() ? "selected" : undefined}>
      {(selectCell || actionCell) && (
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/50 pb-2">
          {selectCell ?
            <div className="shrink-0">
              {flexRender(selectCell.column.columnDef.cell, selectCell.getContext())}
            </div>
          : <div />}
          {actionCell ?
            <div className="grid-table-cell--action shrink-0 [&>div]:opacity-100">
              {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
            </div>
          : null}
        </div>
      )}

      {dataCells.length > 0 ?
        <dl className="space-y-2.5">
          {dataCells.map((cell) => {
            const label = columnLabels[cell.column.id] ?? cell.column.id;
            const title = getCellTitle(cell.getValue());

            return (
              <div
                key={cell.id}
                className="grid-row-card__field grid min-w-0 grid-cols-[minmax(5.5rem,34%)_1fr] items-start gap-x-3 gap-y-0.5">
                <dt className="truncate text-xs font-medium text-muted-foreground" title={label}>
                  {label}
                </dt>
                <dd className="min-w-0 overflow-hidden" title={title}>
                  <div className="grid-row-card__value line-clamp-3 text-sm font-medium text-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      : null}
    </article>
  );
}

function MobileGridList<TData>({
  tableBody,
  isLoading = false,
  pageSize = 10,
  className,
}: MobileGridListProps<TData>) {
  const rows = tableBody.getRowModel().rows;
  const visibleColumns = tableBody.getVisibleLeafColumns();
  const skeletonRows = Array.from({ length: Math.min(Math.max(pageSize, 1), 8) });

  const columnLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    visibleColumns.forEach((column) => {
      if (column.id !== "select" && column.id !== "action") {
        labels[column.id] = getColumnLabel(tableBody, column.id);
      }
    });
    return labels;
  }, [tableBody, visibleColumns]);

  return (
    <div className={cn("grid-row-view flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card dark:bg-background", className)}>
      <div className="grid-row-view__scroll min-h-0 flex-1 overflow-y-auto bg-transparent p-2 dark:bg-background">
        {isLoading ?
          <div className="space-y-3">
            {skeletonRows.map((_, rowIndex) => (
              <div
                key={`mobile-skeleton-${rowIndex}`}
                className="space-y-2.5 rounded-lg border border-border/70 bg-card p-3 shadow-sm">
                <Skeleton className="h-3 w-1/3 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-3 w-1/3 rounded-full" />
                <Skeleton className="h-4 w-5/6 rounded-full" />
                <Skeleton className="h-3 w-1/3 rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-full" />
              </div>
            ))}
          </div>
        : rows.length === 0 ?
          <div className="flex h-full min-h-32 items-center justify-center px-4 text-center text-sm text-muted-foreground">
            No results found.
          </div>
        : <div className="space-y-3">
            {rows.map((row) => (
              <MobileGridCard key={row.id} row={row} columnLabels={columnLabels} />
            ))}
          </div>
        }
      </div>
    </div>
  );
}

export default MobileGridList;
