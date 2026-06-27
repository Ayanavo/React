import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Cell, flexRender, SortingState, Table as TableModel } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronUpIcon, EyeOffIcon } from "lucide-react";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { GRID_COLUMN_ACTION_WIDTH, GRID_COLUMN_SELECT_WIDTH } from "../grid-column-sizing";
import MobileGridList from "./mobile-list";
import "./table.css";

type ColumnProps<TData> = {
  tableBody: TableModel<TData>;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  isLoading?: boolean;
  pageSize?: number;
};

const PINNED_LEFT = new Set(["select"]);
const PINNED_RIGHT = new Set(["action"]);
const FILL_COLUMN_PRIORITY = ["description", "name", "job", "title"];

function resolveFillColumnId<TData>(tableBody: TableModel<TData>) {
  const columns = tableBody.getVisibleLeafColumns();

  for (const id of FILL_COLUMN_PRIORITY) {
    if (columns.some((col) => col.id === id && !PINNED_LEFT.has(col.id) && !PINNED_RIGHT.has(col.id))) {
      return id;
    }
  }

  return columns.find((col) => !PINNED_LEFT.has(col.id) && !PINNED_RIGHT.has(col.id))?.id;
}

function getPinSide(columnId: string): "left" | "right" | null {
  if (PINNED_LEFT.has(columnId)) return "left";
  if (PINNED_RIGHT.has(columnId)) return "right";
  return null;
}

function column<TData>({ tableBody, setSorting, isLoading = false, pageSize = 10 }: ColumnProps<TData>) {
  const visibleColumns = tableBody.getVisibleLeafColumns();
  const fillColumnId = useMemo(() => resolveFillColumnId(tableBody), [tableBody, visibleColumns.length]);
  const skeletonRows = Array.from({ length: Math.min(Math.max(pageSize, 1), 12) });
  const activeSort = tableBody.getState().sorting[0];
  const columnSizingInfo = tableBody.getState().columnSizingInfo;
  const isResizing = columnSizingInfo.isResizingColumn;
  const columnSizing = tableBody.getState().columnSizing;
  const tableRef = useRef<HTMLTableElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const scrollHostRef = useRef<HTMLDivElement>(null);
  const widthSnapshotRef = useRef<Record<string, number> | null>(null);
  const [, forceSnapshotRender] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const scrollElement = scrollHostRef.current;
    if (!scrollElement) return;

    const updateWidth = () => setContainerWidth(scrollElement.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(scrollElement);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const bodyScroll = scrollHostRef.current;
    const headerScroll = headerScrollRef.current;
    if (!bodyScroll || !headerScroll) return;

    const syncLayout = () => {
      headerScroll.scrollLeft = bodyScroll.scrollLeft;
      const scrollbarWidth = bodyScroll.offsetWidth - bodyScroll.clientWidth;
      headerScroll.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
    };

    syncLayout();
    bodyScroll.addEventListener("scroll", syncLayout, { passive: true });

    const observer = new ResizeObserver(syncLayout);
    observer.observe(bodyScroll);

    return () => {
      bodyScroll.removeEventListener("scroll", syncLayout);
      observer.disconnect();
    };
  }, [isLoading, tableBody.getRowModel().rows.length]);

  useLayoutEffect(() => {
    if (!isResizing) {
      widthSnapshotRef.current = null;
    }
  }, [isResizing]);

  const captureWidthSnapshot = () => {
    const heads = tableRef.current?.querySelectorAll<HTMLTableCellElement>("thead [data-column-id]");
    if (!heads?.length) return;

    widthSnapshotRef.current = Object.fromEntries(
      [...heads].map((head) => [head.dataset.columnId!, head.offsetWidth])
    );
    forceSnapshotRender((value) => value + 1);
  };

  const handleResizeStart =
    (handler: (event: unknown) => void) => (event: React.MouseEvent | React.TouchEvent) => {
      captureWidthSnapshot();
      handler(event);
    };

  const activeSnapshot = widthSnapshotRef.current;

  const renderHeaderLabel = (label: React.ReactNode) => (
    <span className="grid-table-head-label truncate">{label}</span>
  );

  const getFixedColumnWidth = (columnId: string, size: number) => {
    if (columnId === "select") return GRID_COLUMN_SELECT_WIDTH;
    if (columnId === "action") return GRID_COLUMN_ACTION_WIDTH;
    return size;
  };

  const resolveColumnWidth = (columnId: string, size: number, minSize = 80) => {
    const snapshotWidth = activeSnapshot?.[columnId];

    if (columnSizingInfo.isResizingColumn === columnId) {
      const startWidth = snapshotWidth ?? columnSizingInfo.startSize ?? size;
      return Math.max(minSize, startWidth + (columnSizingInfo.deltaOffset ?? 0));
    }

    return snapshotWidth ?? size;
  };

  const getResolvedColumnWidth = (columnId: string, size: number, minSize: number, isFillColumn: boolean) => {
    if (columnId === "select") return GRID_COLUMN_SELECT_WIDTH;
    if (columnId === "action") return GRID_COLUMN_ACTION_WIDTH;

    if (isResizing && activeSnapshot) {
      return resolveColumnWidth(columnId, size, minSize);
    }

    const hasManualSize = Object.prototype.hasOwnProperty.call(columnSizing, columnId);

    if (isFillColumn && !hasManualSize && fillColumnId && containerWidth > 0) {
      const othersSum = visibleColumns
        .filter((column) => column.id !== fillColumnId)
        .reduce((sum, column) => sum + getFixedColumnWidth(column.id, column.getSize()), 0);
      return Math.max(minSize, containerWidth - othersSum);
    }

    return size;
  };

  const getColumnSizeStyle = (
    columnId: string,
    size: number,
    minSize = 80,
    isFillColumn = false
  ): React.CSSProperties => {
    const width = getResolvedColumnWidth(columnId, size, minSize, isFillColumn);
    return { width, minWidth: minSize, maxWidth: width };
  };

  const resolvedTableWidth = visibleColumns.reduce((sum, column) => {
    const minSize = column.columnDef.minSize ?? 80;
    return sum + getResolvedColumnWidth(column.id, column.getSize(), minSize, column.id === fillColumnId);
  }, 0);

  const getStickyCellClass = (columnId: string) => {
    const pinSide = getPinSide(columnId);

    return cn(
      pinSide === "left" && "grid-table-sticky-left",
      pinSide === "right" && "grid-table-sticky-right"
    );
  };

  const tableStyle: React.CSSProperties = {
    width: Math.max(resolvedTableWidth, containerWidth),
    minWidth: "100%",
  };

  const renderHeader = (header: ReturnType<TableModel<TData>["getHeaderGroups"]>[0]["headers"][0]) => {
    const columnId = header.column.id;
    const isSelectColumn = columnId === "select";
    const isActionColumn = columnId === "action";
    const isFixedColumn = isSelectColumn || isActionColumn;
    const columnMeta = header.column.columnDef.meta as { align?: "left" | "center" | "right" } | undefined;
    const align = columnMeta?.align ?? (isSelectColumn ? "center" : "left");
    const isSorted = activeSort?.id === columnId;
    const sortDirection = isSorted ? activeSort.desc : undefined;
    const canResize = header.column.getCanResize() && !isFixedColumn;
    const isFillColumn = fillColumnId === columnId;
    const columnMinSize = header.column.columnDef.minSize ?? 80;

    return (
      <TableHead
        key={header.id}
        data-column-id={columnId}
        style={getColumnSizeStyle(columnId, header.getSize(), columnMinSize, isFillColumn)}
        className={cn(
          "grid-table-head whitespace-nowrap",
          canResize && "grid-table-head--resizable relative pr-3",
          isFillColumn && "grid-table-col--fill",
          isSelectColumn && "grid-table-head--select px-3 text-center",
          isActionColumn && "grid-table-head--action px-2 text-center",
          align === "center" && "text-center",
          align === "right" && "text-right",
          getStickyCellClass(columnId)
        )}>
        <div
          className={cn(
            "flex h-full items-center",
            align === "center" && "justify-center",
            align === "right" && "justify-end"
          )}>
          {header.isPlaceholder ?
            <Skeleton className="h-4 w-24 rounded-full" />
          : header.column.getCanSort() ?
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "grid-table-head-sort",
                    isSorted && "grid-table-head-sort--active",
                    align === "center" && "justify-center text-center",
                    align === "right" && "ml-auto justify-end text-right",
                    align === "left" && "text-left"
                  )}>
                  <span className="truncate">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </span>
                  {isSorted ?
                    sortDirection ?
                      <ArrowDownIcon className="grid-table-head-sort__icon" aria-hidden="true" />
                    : <ArrowUpIcon className="grid-table-head-sort__icon" aria-hidden="true" />
                  : null}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[160px]">
                <DropdownMenuItem
                  role="button"
                  className="flex cursor-pointer items-center"
                  onClick={() => setSorting([{ id: columnId, desc: false }])}>
                  <ChevronUpIcon className="mr-2 h-4 w-4" />
                  <span>Ascending</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  role="button"
                  className="flex cursor-pointer items-center"
                  onClick={() => setSorting([{ id: columnId, desc: true }])}>
                  <ChevronDownIcon className="mr-2 h-4 w-4" />
                  <span>Descending</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  role="button"
                  className="flex cursor-pointer items-center"
                  onClick={header.column.getToggleVisibilityHandler()}>
                  <EyeOffIcon className="mr-2 h-4 w-4" />
                  <span>Hide Column</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          : isSelectColumn ?
            flexRender(header.column.columnDef.header, header.getContext())
          : isActionColumn ?
            <span className="sr-only">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>
          : renderHeaderLabel(flexRender(header.column.columnDef.header, header.getContext()))}
        </div>
        {canResize && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${columnId} column`}
            onDoubleClick={() => header.column.resetSize()}
            onMouseDown={handleResizeStart(header.getResizeHandler())}
            onTouchStart={handleResizeStart(header.getResizeHandler())}
            className={cn(
              "grid-table-resizer",
              header.column.getIsResizing() && "grid-table-resizer--active"
            )}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </TableHead>
    );
  };

  const renderCell = (cell: Cell<TData, unknown>) => {
    const columnId = cell.column.id;
    const isSelectColumn = columnId === "select";
    const isActionColumn = columnId === "action";
    const columnMeta = cell.column.columnDef.meta as { align?: "left" | "center" | "right" } | undefined;
    const align = columnMeta?.align ?? (isSelectColumn ? "center" : "left");
    const isFillColumn = fillColumnId === columnId;
    const columnMinSize = cell.column.columnDef.minSize ?? 80;

    return (
      <TableCell
        key={cell.id}
        style={getColumnSizeStyle(columnId, cell.column.getSize(), columnMinSize, isFillColumn)}
        className={cn(
          "px-4 py-2 align-middle text-sm font-medium text-foreground",
          isFillColumn && "grid-table-col--fill",
          isSelectColumn && "grid-table-cell--select px-3",
          isActionColumn && "grid-table-cell--action px-2 text-center",
          align === "center" && "text-center",
          align === "right" && "text-right",
          align === "left" && !isSelectColumn && !isActionColumn && "truncate",
          getStickyCellClass(columnId)
        )}>
        <div
          className={cn(
            "flex min-h-8 w-full items-center",
            (align === "center" || isActionColumn) && "justify-center",
            align === "right" && "justify-end",
            align === "left" && !isActionColumn && "min-w-0"
          )}>
          <div className={cn("min-w-0", align === "left" && !isActionColumn && "truncate")}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        </div>
      </TableCell>
    );
  };

  return (
    <>
      <div
        className={cn(
          "grid-table-shell hidden min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex",
          isResizing && "grid-table-shell--resizing"
        )}>
      <div ref={headerScrollRef} className="grid-table-header-band flex-none overflow-hidden">
        <Table
          ref={tableRef}
          className="relative table-fixed"
          style={tableStyle}>
          <TableHeader className="grid-table-header">
            {tableBody.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="grid-table-header-row hover:bg-transparent">
                {headerGroup.headers.map((header) => renderHeader(header))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>

      <div ref={scrollHostRef} className="grid-table-scroll-host min-h-0 flex-1 basis-0">
        <Table className="relative table-fixed" style={tableStyle}>
          <TableBody>
            {isLoading ?
              skeletonRows.map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`} className="grid-table-row h-11">
                  {visibleColumns.map((column, columnIndex) => (
                    <TableCell
                      key={column.id}
                      style={getColumnSizeStyle(
                        column.id,
                        column.getSize(),
                        column.columnDef.minSize ?? 80,
                        fillColumnId === column.id
                      )}
                      className={cn(
                        "px-4 py-2 align-middle",
                        column.id === "select" && "grid-table-cell--select px-3",
                        column.id === "action" && "grid-table-cell--action px-2 text-center",
                        getStickyCellClass(column.id)
                      )}>
                      <div className="flex min-h-8 w-full items-center justify-center">
                        <Skeleton
                          className={cn(
                            "h-4",
                            column.id === "select" && "h-4 w-4 rounded-sm",
                            column.id === "action" && "mx-auto h-8 w-8",
                            column.id !== "select" &&
                              column.id !== "action" &&
                              (columnIndex === 1 ? "w-36"
                              : columnIndex === 2 ? "w-28"
                              : columnIndex === 3 ? "w-44"
                              : "w-24")
                          )}
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : tableBody.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="grid-table-row group h-11 cursor-pointer data-[state=selected]:bg-primary/5"
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => renderCell(cell))}
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
      </div>

      <MobileGridList
        tableBody={tableBody}
        isLoading={isLoading}
        pageSize={pageSize}
        className="md:hidden"
      />
    </>
  );
}

export default column;
