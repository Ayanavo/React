import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  EyeNoneIcon,
  EyeOpenIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Table as TableModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "./pagination";
import "./table.css";
import { User } from "./user.model";

function table() {
  const columnHelper = createColumnHelper<User>();
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const navigate = useNavigate();
  // const [columnOrder, setColumnOrder] = useState<string[]>([]);

  useEffect(() => {
    // Fetch data from an API or other source here
    const fetchData = async () => {
      try {
        // Fetch data from an API or other source
        const response = await fetch("https://jsonplaceholder.typicode.com/todos/");
        const users = await response.json();
        setData(users);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [sorting]);

  const columnConfig: { key: keyof User | "select" | "action"; label: string }[] = [
    { key: "select", label: "Select" },
    { key: "userId", label: "User Id" },
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    { key: "completed", label: "Completed" },
    { key: "action", label: "Action" },
  ];

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
                    variant="ghost"
                    className="h-8 w-8 p-0 border-2 dropdown-menu-trigger relative transform transition-transform duration-200 ease-in-out  group-hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ">
                    <span className="sr-only">Open menu</span>
                    <div className="absolute inset-0 bg-white rounded transform scale-75 transition-transform duration-200 ease-in-out group-hover:scale-100"></div>
                    <DotsHorizontalIcon className="h-4 w-4 relative z-10 transform transition-transform duration-200 ease-in-out" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onSelect={() => navigate(`/update/${row.original.id}`)}>
                    <Pencil1Icon className="h-4 w-4 mr-2" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate(`/details/${row.original.id}`)}>
                    <EyeOpenIcon className="h-4 w-4 mr-2" />
                    <span>View</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <TrashIcon className="h-4 w-4 mr-2" />
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
      return columnHelper.accessor(column.key, {
        header: () => column.label,
        cell: (info) => {
          const value = info.getValue();

          if (typeof value === "boolean") {
            return (
              <div key={index} className="flex justify-right h-full">
                {value ?
                  <Badge variant="default" key={column.key} className="flex justify-evenly cursor-default text-green-500 bg-green-200 hover:bg-inherit/50">
                    <CheckCircledIcon key={column.key} className="h-4 w-4 " />
                    <div>Completed</div>
                  </Badge>
                : <Badge variant="default" key={column.key} className="flex justify-evenly cursor-default text-red-500 bg-red-200 hover:bg-inherit/50">
                    <CrossCircledIcon key={column.key} className="h-4 w-4 " />
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
    state: { sorting: sorting, pagination: pagination, rowSelection: rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-none p-3 flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6 text-start">Columns</h1>
        <Button onClick={() => navigate("/create")} className="flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Record</span>
        </Button>
      </div>

      <Table className="w-full overflow-auto">
        <TableCaption>A list of all available data.</TableCaption>
        <TableHeader className="bg-muted/50">
          {tableBody.getHeaderGroups().map((column) => (
            <TableRow key={column.id}>
              {/* <DndContext> */}
              {/* <SortableContext items={column.headers} strategy={horizontalListSortingStrategy}> */}
              {column.headers.map((headers) => (
                <TableHead key={headers.id} className="w-[100px] ">
                  {headers.isPlaceholder ?
                    null
                  : headers.column.getCanSort() ?
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="font-bold hover:bg-primary/20 active:bg-primary/30 focus-visible:bg-primary/20 px-2">
                          {flexRender(headers.column.columnDef.header, headers.getContext())}
                          <CaretSortIcon className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[160px]">
                        <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => setSorting([{ id: headers.column.id, desc: false }])}>
                          <ArrowUpIcon className="h-4 w-4 mr-2" />
                          Ascending
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => setSorting([{ id: headers.column.id, desc: true }])}>
                          <ArrowDownIcon className="h-4 w-4 mr-2" />
                          Descending
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center cursor-pointer" onClick={headers.column.getToggleVisibilityHandler()}>
                          <EyeNoneIcon className="h-4 w-4 mr-2" />
                          Hide Column
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  : flexRender(headers.column.columnDef.header, headers.getContext())}
                </TableHead>
              ))}
              {/* </SortableContext> */}
              {/* </DndContext> */}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {tableBody.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="group cursor-pointer hover:bg-muted/50" data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="font-medium truncate max-w-[200px] pr-0 pl-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationComponent tableBody={tableBody} pagination={pagination} setPagination={setPagination} />
    </div>
  );
}

export default table;
