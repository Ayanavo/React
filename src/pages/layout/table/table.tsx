import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, CheckCircledIcon, CrossCircledIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import "./table.css";

type User = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

function table() {
  const columnHelper = createColumnHelper<User>();
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    console.log("sorting", sorting);

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

  const columnConfig: { key: string; label: string }[] = [
    { key: "userId", label: "User Id" },
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    { key: "completed", label: "Completed" },
  ];

  const createColumns = (config: any[]) => {
    return config.map((column) =>
      columnHelper.accessor(column.key, {
        header: () => column.label,
        cell: (info) => {
          const value = info.getValue();
          if (typeof value === "boolean") {
            return value ? <CheckCircledIcon /> : <CrossCircledIcon />;
          }
          return value;
        },
      })
    );
  };

  const columns = createColumns(columnConfig);

  const tableBody = useReactTable({
    data: data,
    columns,
    debugTable: true,
    state: { sorting: sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <>
      <Table className="w-full">
        {/* <TableCaption>A list of all available data.</TableCaption> */}
        <TableHeader className="bg-muted/50">
          {tableBody.getHeaderGroups().map((column) => (
            <TableRow key={column.id}>
              {column.headers.map((headers) => (
                <TableHead className="w-[100px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="m-2 font-bold hover:bg-primary/20 active:bg-primary/30 focus-visible:bg-primary/20 px-2">
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
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {tableBody.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell className="font-medium">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <Pagination>
            <span className="text-sm text-gray-700 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{tableBody.getRowModel().rows.length}</span> -{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{tableBody.getRowModel().rows.length}</span> of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{tableBody.getRowCount()}</span> Items
            </span>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => tableBody.previousPage()} className={`${!tableBody.getCanPreviousPage() && "disabledlink"}`} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => tableBody.nextPage()} className={`${!tableBody.getCanNextPage() && "disabledlink"}`} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}

export default table;
