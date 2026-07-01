import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { ApiMessageResponse } from "@/shared/types/api";
import { formatAppDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConfirmDialog } from "@/shared/confirmation";
import {
  ColumnSizingState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import { EllipsisIcon, PencilIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import AddActionButton from "@/components/inbuild/add-action-button";
import SelectionFloaterToolbar from "@/components/inbuild/selection-floater-toolbar";
import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveGridColumnSizing, normalizeColumnSizingFromConfig } from "./grid-column-sizing";
import ColumnComponent from "./table/column";
import KanbanComponent from "./table/kanban";
import PaginationComponent from "./table/pagination";
import "./table/table.css";

export type GridColumnType = "text" | "date" | "color";

export type KanbanColumnOption = {
  key: string;
  label: string;
  color?: string;
};

export const KANBAN_UNGROUPED_KEY = "__ungrouped__";

export function buildTagKanbanColumns(
  tags: Array<{ _id: string; name: string; color?: string }>
): KanbanColumnOption[] {
  return [
    { key: KANBAN_UNGROUPED_KEY, label: "Unassigned" },
    ...tags.map((tag) => ({ key: tag._id, label: tag.name, color: tag.color })),
  ];
}

export type GridColumnConfig<T> = {
  key: (keyof T & string) | "select" | "action";
  label: string;
  type?: GridColumnType;
  align?: "left" | "center" | "right";
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  listable?: boolean;
  kanbanIdKey?: keyof T & string;
  kanbanColorKey?: keyof T & string;
  kanbanColumns?: KanbanColumnOption[];
  render?: (value: any, row: T) => React.ReactNode;
};

type ResourceGridProps<T extends { _id: string }> = {
  queryKey: string;
  resourceLabel: string;
  basePath: string;
  addLabel?: string;
  columns: GridColumnConfig<T>[];
  fetchList: () => Promise<T[]>;
  deleteResource: (id: string) => Promise<ApiMessageResponse>;
  actionRenderer?: (row: T, deleteResource: (id: string) => void) => React.ReactNode;
  showAddButton?: boolean;
  onAddClick?: () => void;
  actionConfig?: {
    showEdit?: boolean;
    showPermissions?: boolean;
    onOpenPermissions?: (row: T) => void;
    showDelete?: boolean;
    confirmOnDelete?: boolean;
    deleteConfirmOptions?: {
      title?: string;
      message?: string;
      confirmText?: string;
      cancelText?: string;
      showLoadingOnConfirmClick?: boolean;
    };
  };
  filterControls?: React.ReactNode;
  filterFn?: (row: T) => boolean;
  bulkDeleteFilter?: (row: T) => boolean;
  enableBulkDelete?: boolean;
};

function ResourceGrid<T extends { _id: string }>({
  queryKey,
  resourceLabel,
  basePath,
  addLabel,
  columns: columnConfig,
  fetchList,
  deleteResource,
  actionRenderer,
  showAddButton = true,
  onAddClick,
  actionConfig,
  filterControls,
  filterFn,
  bulkDeleteFilter,
  enableBulkDelete = true,
}: ResourceGridProps<T>) {
  const columnHelper = createColumnHelper<T>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const id = useId();
  const { confirm } = useConfirmDialog();

  const {
    data: list = [],
    isLoading,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchList,
  });

  const [data, setData] = useState<T[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [layout, setLayout] = useState<string>("column");
  const [kanbanGroupByKey, setKanbanGroupByKey] = useState<string>("");

  const filteredList = useMemo(() => {
    if (!filterFn) return list;
    return list.filter(filterFn);
  }, [list, filterFn]);

  useEffect(() => {
    if (isSuccess) {
      setData(filteredList);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [filteredList, isSuccess]);

  const deleteMutation = useMutation<ApiMessageResponse, Error, string>({
    mutationFn: deleteResource,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      showToast({ title: data?.message || `${resourceLabel} deleted successfully`, variant: "success" });
    },
    onError: (error: Error) => {
      showToast({
        title: `${resourceLabel} deletion failed`,
        description: error.message,
        variant: "error",
      });
    },
  });

  const bulkDeleteMutation = useMutation<number, Error, string[]>({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(ids.map((id) => deleteResource(id)));
      const succeeded = results.filter((result) => result.status === "fulfilled").length;
      const failed = results.length - succeeded;

      if (failed > 0 && succeeded === 0) {
        const firstError = results.find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
        throw new Error(firstError?.reason instanceof Error ? firstError.reason.message : "Bulk delete failed");
      }

      return succeeded;
    },
    onSuccess: (deletedCount) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setRowSelection({});
      const label = deletedCount === 1 ? resourceLabel : `${resourceLabel}s`;
      showToast({
        title: `${deletedCount} ${label} deleted successfully`,
        variant: "success",
      });
    },
    onError: (error: Error) => {
      showToast({
        title: `${resourceLabel} bulk deletion failed`,
        description: error.message,
        variant: "error",
      });
    },
  });

  const TableLayout = [
    { name: "column", label: "Column View", icon: "SquareMenuIcon" },
    { name: "kanban", label: "Kanban View", icon: "SquareKanbanIcon" },
  ];

  const listableColumns = useMemo(
    () => columnConfig.filter((column) => column.listable && column.key !== "select" && column.key !== "action"),
    [columnConfig]
  );

  const resolvedKanbanGroupByKey = useMemo(() => {
    if (listableColumns.some((column) => column.key === kanbanGroupByKey)) {
      return kanbanGroupByKey;
    }
    return listableColumns[0]?.key ?? "";
  }, [kanbanGroupByKey, listableColumns]);

  const createColumns = () => {
    return columnConfig.map((column) => {
      const sizing = resolveGridColumnSizing(column);

      if (column.key === "action") {
        return columnHelper.display({
          id: "action",
          ...sizing,
          header: column.label,
          meta: { align: column.align ?? "right" },
          cell: ({ row }) => {
            if (actionRenderer) {
              return (
                <div className="flex justify-end">
                  {actionRenderer(row.original, (resourceId) => deleteMutation.mutate(resourceId))}
                </div>
              );
            }

            // default action menu is configurable via actionConfig prop
            const {
              showEdit = true,
              showPermissions = false,
              onOpenPermissions,
              showDelete = true,
              confirmOnDelete = true,
              deleteConfirmOptions,
            } = actionConfig || {};

            const handleDeleteSelect = async () => {
              if (confirmOnDelete) {
                const ok = await confirm({
                  title: deleteConfirmOptions?.title ?? "Delete",
                  message: deleteConfirmOptions?.message ?? "Are you sure you want to delete this item?",
                  confirmText: deleteConfirmOptions?.confirmText ?? "Delete",
                  cancelText: deleteConfirmOptions?.cancelText ?? "Cancel",
                  showLoadingOnConfirmClick: deleteConfirmOptions?.showLoadingOnConfirmClick ?? false,
                });
                if (!ok) return;
              }
              deleteMutation.mutate(row.original._id);
            };

            return (
              <div className="grid-row-actions opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <EllipsisIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {showEdit && (
                      <DropdownMenuItem onSelect={() => navigate(`${basePath}/update/${row.original._id}`)}>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {showPermissions && onOpenPermissions && (
                      <>
                        <DropdownMenuItem onSelect={() => onOpenPermissions(row.original)}>
                          <ShieldCheckIcon className="mr-2 h-4 w-4" />
                          Permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {showDelete && (
                      <DropdownMenuItem className="text-destructive" onSelect={handleDeleteSelect}>
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          },
        });
      }

      if (column.key === "select") {
        return columnHelper.display({
          id: "select",
          ...sizing,
          meta: { align: column.align ?? "center" },
          header: ({ table }) => (
            <Checkbox
              className="border-primary/60 shadow-none"
              aria-label="Select all"
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              className="border-primary/60 shadow-none"
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
        });
      }

      if (column.type === "date") {
        return columnHelper.accessor((row) => row[column.key as keyof T], {
          id: column.key,
          ...sizing,
          header: () => column.label,
          meta: { align: column.align },
          cell: (info) => formatAppDate(info.getValue() as string, "-"),
        });
      }

      if (column.type === "color") {
        return columnHelper.accessor((row) => row[column.key as keyof T], {
          id: column.key,
          ...sizing,
          header: () => column.label,
          meta: { align: column.align },
          cell: (info) => {
            const value = info.getValue() as string;
            return (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-md border" style={{ backgroundColor: value || "transparent" }} />
                <span className="text-sm text-muted-foreground">{value || "-"}</span>
              </div>
            );
          },
        });
      }

      return columnHelper.accessor((row) => row[column.key as keyof T], {
        id: column.key,
        ...sizing,
        header: () => column.label,
        meta: { align: column.align },
        cell: (info) => {
          const value = info.getValue();
          if (column.render) return column.render(value, info.row.original);
          return value ?? "-";
        },
      });
    });
  };

  const handleColumnSizingChange = (updater: Updater<ColumnSizingState>) => {
    setColumnSizing((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return normalizeColumnSizingFromConfig(next, columnConfig);
    });
  };

  const tableBody = useReactTable({
    data,
    columns: createColumns(),
    state: { sorting, pagination, rowSelection, globalFilter, columnSizing },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: handleColumnSizingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
  });

  const hasSelectColumn = columnConfig.some((column) => column.key === "select");
  const selectedRows = tableBody.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const getDeletableSelectedIds = useCallback(() => {
    const rows = bulkDeleteFilter ? selectedRows.filter((row) => bulkDeleteFilter(row.original)) : selectedRows;
    return rows.map((row) => row.original._id);
  }, [bulkDeleteFilter, selectedRows]);

  const handleClearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const ids = getDeletableSelectedIds();
    if (ids.length === 0) return;

    const label = ids.length === 1 ? resourceLabel.toLowerCase() : `${resourceLabel.toLowerCase()}s`;
    const ok = await confirm({
      title: ids.length === 1 ? `Delete ${resourceLabel}` : `Delete ${ids.length} ${resourceLabel}s`,
      message: `Are you sure you want to delete ${ids.length} selected ${label}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      showLoadingOnConfirmClick: true,
    });

    if (!ok) return;
    bulkDeleteMutation.mutate(ids);
  }, [bulkDeleteMutation, confirm, getDeletableSelectedIds, resourceLabel]);

  const handleSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setGlobalFilter(event.currentTarget.value ?? "");
    }
  };

  return (
    <div className="grid-layout flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <div className="grid-toolbar mb-3 flex-none">
        <div className="grid-toolbar__filters">
          <div className="grid-toolbar__search relative min-w-0 w-full max-w-xs flex-1 md:flex-none">
            <Input
              id={id}
              className="h-9 rounded-lg border-border/70 bg-background/80 pe-16 shadow-sm backdrop-blur-sm"
              placeholder="Search..."
              type="search"
              defaultValue={globalFilter}
              onKeyDown={handleSearchKey}
            />
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
              <kbd className="inline-flex h-5 max-h-full items-center rounded-md border border-border/70 bg-muted/40 px-1 text-[0.625rem] font-medium text-muted-foreground/70">
                Enter
              </kbd>
            </div>
          </div>
          {filterControls}
          {layout === "kanban" && listableColumns.length > 0 ?
            <div className="hidden items-center gap-1.5 md:flex">
             
              <Select value={resolvedKanbanGroupByKey} onValueChange={setKanbanGroupByKey}>
                <SelectTrigger className="h-9 w-[11.5rem] rounded-lg border-border/70 bg-card shadow-sm">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent align="start">
                  {listableColumns.map((column) => (
                    <SelectItem key={column.key} value={column.key}>
                      {column.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          : null}
        </div>

        <div className="grid-toolbar__actions">
          <TooltipProvider disableHoverableContent>
            <ToggleGroup
              className="hidden gap-0 md:flex"
              type="single"
              variant="outline"
              value={layout}
              onValueChange={(value) => value && setLayout(value)}>
              {TableLayout.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === TableLayout.length - 1;
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        className={cn(
                          "h-9 bg-card shadow-sm",
                          isFirst && "rounded-r-none",
                          isLast && "rounded-l-none",
                          !(isFirst || isLast) && "rounded-none border-x-0"
                        )}
                        value={item.name}>
                        <IconsComponent customClass="h-4 w-4" icon={item.icon} />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </ToggleGroup>
          </TooltipProvider>
          {showAddButton ?
            <AddActionButton
              label={addLabel ?? `Add ${resourceLabel}`}
              onClick={onAddClick ?? (() => navigate(`${basePath}/create`))}
            />
          : null}
        </div>
      </div>

      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", layout !== "column" && "md:hidden")}>
        <ColumnComponent
          tableBody={tableBody as never}
          setSorting={setSorting}
          isLoading={isLoading || (isFetching && data.length === 0)}
          pageSize={pagination.pageSize}
        />
        <PaginationComponent tableBody={tableBody as never} pagination={pagination} setPagination={setPagination} />
      </div>
      {layout === "kanban" && (
        <div className="hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
          <KanbanComponent
            tableBody={tableBody as never}
            columns={columnConfig}
            listableColumns={listableColumns}
            groupByKey={resolvedKanbanGroupByKey}
            isLoading={isLoading || (isFetching && data.length === 0)}
            pageSize={pagination.pageSize}
          />
        </div>
      )}

      {hasSelectColumn && enableBulkDelete ?
        <SelectionFloaterToolbar
          selectedCount={selectedCount}
          onClear={handleClearSelection}
          onDelete={handleBulkDelete}
          isDeleting={bulkDeleteMutation.isPending}
          resourceLabel={resourceLabel}
        />
      : null}
    </div>
  );
}

export default ResourceGrid;
