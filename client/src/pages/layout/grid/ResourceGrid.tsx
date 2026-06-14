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
import { formatAppDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConfirmDialog } from "@/shared/confirmation";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { EllipsisIcon, PencilIcon, PlusIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import React, { useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ColumnComponent from "./table/column";
import KanbanComponent from "./table/kanban";
import PaginationComponent from "./table/pagination";
import "./table/table.css";

export type GridColumnType = "text" | "date" | "color";

export type GridColumnConfig<T> = {
  key: (keyof T & string) | "select" | "action";
  label: string;
  type?: GridColumnType;
  align?: "left" | "center" | "right";
  listable?: boolean;
  kanbanIdKey?: keyof T & string;
  kanbanColorKey?: keyof T & string;
  render?: (value: any, row: T) => React.ReactNode;
};

type ResourceGridProps<T extends { _id: string }> = {
  queryKey: string;
  resourceLabel: string;
  basePath: string;
  addLabel?: string;
  columns: GridColumnConfig<T>[];
  fetchList: () => Promise<T[]>;
  deleteResource: (id: string) => Promise<unknown>;
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

  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      showToast({
        title: `${resourceLabel} deleted successfully`,
        variant: "success",
      });
    },
    onError: (error: Error) => {
      showToast({
        title: `${resourceLabel} deletion failed`,
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
      if (column.key === "action") {
        return columnHelper.display({
          id: "action",
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
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
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
          header: () => column.label,
          meta: { align: column.align },
          cell: (info) => formatAppDate(info.getValue() as string, "-"),
        });
      }

      if (column.type === "color") {
        return columnHelper.accessor((row) => row[column.key as keyof T], {
          id: column.key,
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

  const tableBody = useReactTable({
    data,
    columns: createColumns(),
    state: { sorting, pagination, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  const handleSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setGlobalFilter(event.currentTarget.value ?? "");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="flex flex-none items-center justify-between gap-3 px-0.5 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Input
              id={id}
              className="h-9 rounded-lg border-border/70 bg-card pe-16 shadow-sm"
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
            <div className="flex items-center gap-1.5">
             
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

        <div className="flex shrink-0 items-center gap-2">
          <TooltipProvider disableHoverableContent>
            <ToggleGroup
              className="gap-0"
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
            <Button
              onClick={onAddClick ?? (() => navigate(`${basePath}/create`))}
              className="flex h-9 items-center gap-2 rounded-lg shadow-sm">
              <PlusIcon className="h-4 w-4" />
              <span>{addLabel ?? `Add ${resourceLabel}`}</span>
            </Button>
          : null}
        </div>
      </div>

      {layout === "column" && (
        <ColumnComponent
          tableBody={tableBody as never}
          setSorting={setSorting}
          isLoading={isLoading || (isFetching && data.length === 0)}
          pageSize={pagination.pageSize}
        />
      )}
      {layout === "kanban" && (
        <KanbanComponent
          tableBody={tableBody as never}
          columns={columnConfig}
          listableColumns={listableColumns}
          groupByKey={resolvedKanbanGroupByKey}
          isLoading={isLoading || (isFetching && data.length === 0)}
          pageSize={pagination.pageSize}
        />
      )}
      {layout === "column" && (
        <PaginationComponent tableBody={tableBody as never} pagination={pagination} setPagination={setPagination} />
      )}
    </div>
  );
}

export default ResourceGrid;
