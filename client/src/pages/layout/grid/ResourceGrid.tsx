import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { formatAppDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table";
import { EllipsisIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import React, { useEffect, useId, useState } from "react";
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
};

type ResourceGridProps<T extends { _id: string }> = {
  queryKey: string;
  resourceLabel: string;
  basePath: string;
  addLabel?: string;
  columns: GridColumnConfig<T>[];
  fetchList: () => Promise<T[]>;
  deleteResource: (id: string) => Promise<unknown>;
};

function ResourceGrid<T extends { _id: string }>({ queryKey, resourceLabel, basePath, addLabel, columns: columnConfig, fetchList, deleteResource }: ResourceGridProps<T>) {
  const columnHelper = createColumnHelper<T>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const id = useId();

  const { data: list = [], isSuccess } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchList,
  });

  const [data, setData] = useState<T[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [layout, setLayout] = useState<string>("column");

  useEffect(() => {
    if (isSuccess) {
      setData(list);
    }
  }, [list, isSuccess]);

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

  const createColumns = () => {
    return columnConfig.map((column) => {
      if (column.key === "action") {
        return columnHelper.display({
          id: "action",
          header: column.label,
          cell: ({ row }) => (
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <EllipsisIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => navigate(`${basePath}/update/${row.original._id}`)}>
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onSelect={() => deleteMutation.mutate(row.original._id)}>
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        });
      }

      if (column.key === "select") {
        return columnHelper.display({
          id: "select",
          header: ({ table }) => <Checkbox aria-label="Select all" checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />,
          cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
        });
      }

      if (column.type === "date") {
        return columnHelper.accessor((row) => row[column.key as keyof T], {
          id: column.key,
          header: () => column.label,
          cell: (info) => formatAppDate(info.getValue() as string, "-"),
        });
      }

      if (column.type === "color") {
        return columnHelper.accessor((row) => row[column.key as keyof T], {
          id: column.key,
          header: () => column.label,
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
        cell: (info) => {
          const value = info.getValue();
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
    <div className="flex h-[90vh] flex-col overflow-hidden">
      <div className="flex flex-none items-center justify-between space-x-2 p-3">
        <div className="relative">
          <Input id={id} className="pe-11" placeholder="Search..." type="search" defaultValue={globalFilter} onKeyDown={handleSearchKey} />
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
            <kbd className="inline-flex h-5 max-h-full items-center rounded-md border border-border px-1 text-[0.625rem] font-medium text-muted-foreground/70">Enter</kbd>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider disableHoverableContent>
            <ToggleGroup className="gap-0" type="single" variant="outline" value={layout} onValueChange={(value) => value && setLayout(value)}>
              {TableLayout.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === TableLayout.length - 1;
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem className={cn(isFirst && "rounded-r-none", isLast && "rounded-l-none", !(isFirst || isLast) && "rounded-none border-x-0")} value={item.name}>
                        <IconsComponent customClass="h-4 w-4" icon={item.icon} />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </ToggleGroup>
          </TooltipProvider>
          <Button onClick={() => navigate(`${basePath}/create`)} className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>{addLabel ?? `Add ${resourceLabel}`}</span>
          </Button>
        </div>
      </div>

      {layout === "column" && <ColumnComponent tableBody={tableBody as never} setSorting={setSorting} />}
      {layout === "kanban" && <KanbanComponent tableBody={tableBody as never} />}
      <PaginationComponent tableBody={tableBody as never} pagination={pagination} setPagination={setPagination} />
    </div>
  );
}

export default ResourceGrid;
