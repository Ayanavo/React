import IconsComponent from "@/common/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { cn } from "@/lib/utils";
import { deleteActivity, fetchActivities } from "@/shared/services/activity";
import { useSidebarLayout } from "@/shared/sidebarlayout";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Table as TableModel,
  useReactTable,
} from "@tanstack/react-table";
import { CheckIcon, EllipsisIcon, EyeIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import moment from "moment";
import React, { useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import ColumnComponent from "./column";
import KanbanComponent from "./kanban";
import PaginationComponent from "./pagination";
import "./table.css";
import { User } from "./user.model";

function table() {
  const {
    data: todos,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ["activities"],
    queryFn: () => fetchActivities(1, 10),
  });
  const columnHelper = createColumnHelper<User>();
  const [data, setData] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const navigate = useNavigate();
  const { SidebarPanel } = useSidebarLayout();

  const id = useId();
  useEffect(() => {
    // Fetch data from an API or other source here
    if (isSuccess && todos) {
      setData(todos.activities ?? []);
    }
  }, [todos, isSuccess]);
  const [layout, setLayout] = useState<string>("column");
  const columnConfig: { key: keyof User | "select" | "action"; label: string }[] = [
    { key: "select", label: "Select" },
    { key: "_id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "createdAt",
      label: "Created At",
    },
    {
      key: "updatedAt",
      label: "Updated At",
    },
    { key: "action", label: "Action" },
  ];

  const TableLayout = [
    { name: "column", label: "Column View", icon: "SquareMenuIcon" },
    {
      name: "kanban",
      label: "Kanban View",
      icon: "SquareKanbanIcon",
    },
  ];

  const openAddPanel = () => {
    navigate("create");
    //next steps
    // openSidebar().then((res) => {
    //   // Add your logic here
    //   console.log(res);
    // });
  };

  const mutation = useMutation<unknown, Error, string>({
    mutationFn: deleteActivity,
    onSuccess: () => {
      showToast({
        title: "Activity deleted successfully",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      showToast({
        title: "Activity deletion failded",
        description: error.message,
        variant: "error",
      });
    },
  });

  const handleDelete = (_id: string) => {
    mutation.mutate(_id);
    refetch();
  };

  const createColumns = (config: typeof columnConfig) => {
    return config.map((column, index) => {
      if (column.key === "action") {
        return columnHelper.display({
          id: "action",
          header: column.label,
          cell: ({ row }) => (
            <div key={index} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-2 dropdown-menu-trigger relative transform transition-transform duration-200 ease-in-out  group-hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <span className="sr-only">Open menu</span>
                    <div className="absolute inset-0  rounded transform scale-75 transition-transform duration-200 ease-in-out group-hover:scale-100"></div>
                    <EllipsisIcon className="h-4 w-4 relative z-10 transform transition-transform duration-200 ease-in-out" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem role="button" onSelect={() => navigate(`/table/update/${row.original._id}`)}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem role="button" onSelect={() => navigate(`/table/details/${row.original._id}`)}>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    <span>View</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem role="button" onSelect={() => handleDelete(row.original._id)}>
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    <span>Delete</span>
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
          header: ({ table }) => (
            <div key={index} className="p-2">
              <Checkbox aria-label="Select all" checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />
            </div>
          ),
          cell: ({ row }) => <Checkbox key={column.key} checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
        });
      }

      if (["createdAt", "updatedAt"].includes(column.key)) {
        return columnHelper.accessor(column.key, {
          header: () => column.label,
          cell: (info) => {
            const value = info.getValue();
            return moment(value).format("YYYY-MM-DD");
          },
        });
      }
      return columnHelper.accessor(column.key, {
        header: () => column.label,
        cell: (info) => {
          const value = info.getValue();

          if (typeof value === "boolean") {
            return (
              <div key={index} className="flex justify-right h-full">
                {value ?
                  <Badge variant="outline" key={column.key} className="flex justify-evenly cursor-default text-green-400  border-green-400 hover:bg-inherit/50 space-x-1">
                    <CheckIcon key={column.key} className="h-4 w-4 " />
                    <div>Completed</div>
                  </Badge>
                : <Badge variant="outline" key={column.key} className="flex justify-evenly cursor-default text-red-400  border-red-400 hover:bg-inherit/50 space-x-1">
                    <XIcon key={column.key} className="h-4 w-4 " />
                    <div>Not Completed</div>
                  </Badge>
                }
              </div>
            );
          }
          return value;
        },
      });
    });
  };

  // const DraggableTableHeader = ({ header }: { header: Header<User, unknown> }) => {
  //   const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
  //     id: header.column.id,
  //   });

  //   const style: CSSProperties = {
  //     opacity: isDragging ? 0.8 : 1,
  //     position: "relative",
  //     transform: CSS.Translate.toString(transform),
  //     transition: "width transform 0.2s ease-in-out",
  //     whiteSpace: "nowrap",
  //     width: header.column.getSize(),
  //     zIndex: isDragging ? 1 : 0,
  //   };

  //   return (
  //     <th colSpan={header.colSpan} ref={setNodeRef} style={style}>
  //       {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
  //       <button {...attributes} {...listeners}>
  //         🟰
  //       </button>
  //     </th>
  //   );
  // };

  // reorder columns after drag & drop
  // function handleDragEnd(event: DragEndEvent) {
  //   const { active, over } = event;
  //   if (active && over && active.id !== over.id) {
  //     setColumnOrder((columnOrder) => {
  //       const oldIndex = columnOrder.indexOf(active.id as string);
  //       const newIndex = columnOrder.indexOf(over.id as string);
  //       return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
  //     });
  //   }
  // }

  const columns = createColumns(columnConfig);

  const tableBody: TableModel<User> = useReactTable({
    data: data,
    columns,
    state: { sorting: sorting, pagination: pagination, rowSelection: rowSelection, globalFilter: globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    debugTable: true,
  });
  function handleSearchKey(event: any): void {
    if (event.key === "Enter") {
      setGlobalFilter(event.target.value ?? "");
    }
  }

  return (
    <>
      {SidebarPanel}
      <div className="flex flex-col h-[90vh] overflow-hidden">
        <div className="flex-none p-3 flex justify-between items-center space-x-2">
          <div className=" relative">
            <Input id={id} className="pe-11" placeholder="Search..." type="search" defaultValue={globalFilter} onKeyDown={handleSearchKey} />
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
              <kbd className="inline-flex h-5 max-h-full items-center rounded border border-border px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                Enter
              </kbd>
            </div>
          </div>

          <div className="flex-none p-3 flex justify-end items-center space-x-2">
            <TooltipProvider disableHoverableContent>
              <ToggleGroup className="gap-0" type="single" variant="outline" value={layout} onValueChange={(value) => value && setLayout(value)}>
                {TableLayout.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === TableLayout.length - 1;
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          className={cn(isFirst && "rounded-r-none", isLast && "rounded-l-none", !(isFirst || isLast) && "rounded-none border-x-0")}
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
            <Button onClick={openAddPanel} className="flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Add Activity</span>
            </Button>
          </div>
        </div>
        {layout === "column" && <ColumnComponent tableBody={tableBody} setSorting={setSorting} />}
        {layout === "kanban" && <KanbanComponent tableBody={tableBody} />}
        <PaginationComponent tableBody={tableBody} pagination={pagination} setPagination={setPagination} />
      </div>
    </>
  );
}

export default table;
// navigate("/table/create", { state: "Activity" })
