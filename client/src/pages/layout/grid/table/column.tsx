import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { flexRender, SortingState, Table as TableModel } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronUpIcon, EyeOffIcon } from "lucide-react";
import React from "react";
import "./table.css";

type ColumnProps<TData> = {
  tableBody: TableModel<TData>;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  isLoading?: boolean;
  pageSize?: number;
};

function column<TData>({ tableBody, setSorting, isLoading = false, pageSize = 10 }: ColumnProps<TData>) {
  const visibleColumns = tableBody.getVisibleLeafColumns();
  const skeletonRows = Array.from({ length: Math.min(Math.max(pageSize, 1), 12) });
  const activeSort = tableBody.getState().sorting[0];

  const renderHeaderLabel = (label: React.ReactNode) => (
    <span className="grid-table-head-label truncate">{label}</span>
  );

  return (
    <div className="grid-table-shell scrollbar-none relative min-h-0 flex-1">
      <Table className="relative z-[1] min-w-[760px] table-fixed">
        <TableCaption className="grid-table-caption">Browse, sort, and manage your records below.</TableCaption>

        <TableHeader className="grid-table-header">
          {tableBody.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="grid-table-header-row hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const isSelectColumn = header.column.id === "select";
                const isActionColumn = header.column.id === "action";
                const columnMeta = header.column.columnDef.meta as { align?: "left" | "center" | "right" } | undefined;
                const align =
                  columnMeta?.align ??
                  (isSelectColumn ? "center"
                  : isActionColumn ? "right"
                  : "left");
                const isSorted = activeSort?.id === header.column.id;
                const sortDirection = isSorted ? activeSort.desc : undefined;

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "grid-table-head whitespace-nowrap",
                      isSelectColumn && "grid-table-head--select px-3 text-center",
                      isActionColumn && "grid-table-head--action grid-table-head--sticky-action text-right",
                      align === "center" && "text-center",
                      align === "right" && "text-right"
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
                              onClick={() => setSorting([{ id: header.column.id, desc: false }])}>
                              <ChevronUpIcon className="mr-2 h-4 w-4" />
                              <span>Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              role="button"
                              className="flex cursor-pointer items-center"
                              onClick={() => setSorting([{ id: header.column.id, desc: true }])}>
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
                      : isActionColumn ?
                        <span className="sr-only">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      : renderHeaderLabel(flexRender(header.column.columnDef.header, header.getContext()))}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ?
            skeletonRows.map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} className="grid-table-row h-11">
                {visibleColumns.map((column, columnIndex) => {
                  const isSelectColumn = column.id === "select";
                  const isActionColumn = column.id === "action";
                  const columnMeta = column.columnDef.meta as { align?: "left" | "center" | "right" } | undefined;
                  const align =
                    columnMeta?.align ??
                    (isSelectColumn ? "center"
                    : isActionColumn ? "right"
                    : "left");

                  return (
                    <TableCell
                      key={column.id}
                      className={cn(
                        "px-4 py-2 align-middle",
                        isSelectColumn && "w-12 px-3",
                        isActionColumn && "grid-table-cell--action text-right",
                        align === "center" && "text-center",
                        align === "right" && "text-right"
                      )}>
                      <div
                        className={cn(
                          "flex min-h-8 w-full items-center",
                          align === "center" && "justify-center",
                          align === "right" && "justify-end"
                        )}>
                        <Skeleton
                          className={cn(
                            "h-4",
                            isSelectColumn && "h-4 w-4 rounded-sm",
                            isActionColumn && "h-8 w-8",
                            !isSelectColumn &&
                              !isActionColumn &&
                              (columnIndex === 1 ? "w-36"
                              : columnIndex === 2 ? "w-28"
                              : columnIndex === 3 ? "w-44"
                              : "w-24")
                          )}
                        />
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          : tableBody.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="grid-table-row group h-11 cursor-pointer data-[state=selected]:bg-primary/5"
                data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => {
                  const isSelectColumn = cell.column.id === "select";
                  const isActionColumn = cell.column.id === "action";
                  const columnMeta = cell.column.columnDef.meta as { align?: "left" | "center" | "right" } | undefined;
                  const align =
                    columnMeta?.align ??
                    (isSelectColumn ? "center"
                    : isActionColumn ? "right"
                    : "left");

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-4 py-2 align-middle text-sm font-medium text-foreground",
                        isSelectColumn && "w-12 px-3",
                        isActionColumn && "grid-table-cell--action text-right",
                        align === "center" && "text-center",
                        align === "right" && "text-right",
                        align === "left" && !isSelectColumn && !isActionColumn && "truncate"
                      )}>
                      <div
                        className={cn(
                          "flex min-h-8 w-full items-center",
                          align === "center" && "justify-center",
                          align === "right" && "justify-end",
                          align === "left" && "min-w-0"
                        )}>
                        <div className={cn("min-w-0", align === "left" && "truncate")}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  );
}

export default column;
