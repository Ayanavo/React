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
import { ChevronDownIcon, ChevronUpIcon, EyeOffIcon, ListFilterIcon } from "lucide-react";
import React from "react";

type ColumnProps<TData> = {
  tableBody: TableModel<TData>;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  isLoading?: boolean;
  pageSize?: number;
};

function column<TData>({ tableBody, setSorting, isLoading = false, pageSize = 10 }: ColumnProps<TData>) {
  const visibleColumns = tableBody.getVisibleLeafColumns();
  const skeletonRows = Array.from({ length: Math.min(Math.max(pageSize, 1), 12) });

  return (
    <div className="relative min-h-0 flex-1 overflow-auto rounded-lg border border-border/70 bg-card shadow-sm">
      <Table className="min-w-[760px] table-fixed">
        <TableCaption className="py-5 text-xs">A list of all available data.</TableCaption>

        <TableHeader className="sticky top-0 z-10 bg-primary/5 backdrop-blur supports-[backdrop-filter]:bg-primary/10">
          {tableBody.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-primary/10 hover:bg-transparent">
              {/* <DndContext> */}
              {/* <SortableContext items={column.headers} strategy={horizontalListSortingStrategy}> */}
              {headerGroup.headers.map((header) => {
                const isSelectColumn = header.column.id === "select";
                const isActionColumn = header.column.id === "action";
                const columnMeta = header.column.columnDef.meta as { align?: "left" | "center" | "right" } | undefined;
                const align =
                  columnMeta?.align ??
                  (isSelectColumn ? "center"
                  : isActionColumn ? "right"
                  : "left");

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-11 whitespace-nowrap px-4 text-xs font-semibold uppercase text-foreground/70",
                      isSelectColumn && "w-12 px-3 text-center",
                      isActionColumn && "w-24 text-right",
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
                                "inline-flex h-8 max-w-full items-center gap-1.5 rounded-md px-2 transition-colors hover:bg-background/75 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                                align === "center" && "justify-center text-center",
                                align === "right" && "ml-auto justify-end text-right",
                                align === "left" && "-ml-2 text-left"
                              )}>
                              <span className="truncate">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </span>
                              <ListFilterIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  </TableHead>
                );
              })}
              {/* </SortableContext> */}
              {/* </DndContext> */}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ?
            skeletonRows.map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} className="h-11 border-border/60">
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
                        isActionColumn && "w-24 text-right",
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
                className="group h-11 cursor-pointer border-border/60 hover:bg-muted/35 data-[state=selected]:bg-primary/5"
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
                        isActionColumn && "w-24 text-right",
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
                        {/* <Skeleton className="w-[100px] h-[20px] rounded-full" /> */}
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
