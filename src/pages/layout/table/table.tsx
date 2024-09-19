import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DndContext } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, CheckCircledIcon, CrossCircledIcon, EyeNoneIcon } from "@radix-ui/react-icons";
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
import PaginationComponent from "./pagination";
import "./table.css";
import { User } from "./user.model";

function table() {
  const columnHelper = createColumnHelper<User>();
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

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

  const columnConfig: { key: keyof User | "select"; label: string }[] = [
    { key: "select", label: "Select" },
    { key: "userId", label: "User Id" },
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    { key: "completed", label: "Completed" },
  ];

  const createColumns = (config: typeof columnConfig) => {
    return config.map((column) => {
      if (column.key === "select") {
        return columnHelper.display({
          id: "select",
          header: ({ table }) => (
            <div className="p-2">
              <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />
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
              <div className="flex justify-right h-full">
                {value ?
                  <Badge variant="default" key={column.key} className="flex justify-evenly cursor-default text-green-500 bg-green-200 hover:bg-inherit">
                    <CheckCircledIcon key={column.key} className="h-4 w-4 " />
                    <div>Completed</div>
                  </Badge>
                : <Badge variant="default" key={column.key} className="flex justify-evenly cursor-default text-red-500 bg-red-200 hover:bg-inherit">
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
    state: { sorting: sorting, pagination: pagination, rowSelection: rowSelection, columnOrder: columnOrder },
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
      <div className="flex-none p-3">
        <h1 className="text-3xl font-bold mb-6 text-start">Columns</h1>
      </div>
      <Table className="w-full overflow-auto">
        <TableCaption>A list of all available data.</TableCaption>
        <TableHeader className="bg-muted/50">
          {tableBody.getHeaderGroups().map((column) => (
            <TableRow key={column.id}>
              {/* <DndContext> */}
              {/* <SortableContext items={column.headers} strategy={horizontalListSortingStrategy}> */}
              {column.headers.map((headers) => (
                <TableHead className="w-[100px] ">
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
                      <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => setSorting([{ id: headers.column.id, desc: false }])}>
                          <ArrowUpIcon className="h-4 w-4 ml-2" />
                          Ascending
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => setSorting([{ id: headers.column.id, desc: true }])}>
                          <ArrowDownIcon className="h-4 w-4 ml-2" />
                          Descending
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center cursor-pointer" onClick={headers.column.getToggleVisibilityHandler()}>
                          <EyeNoneIcon className="h-4 w-4 ml-2" />
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
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
