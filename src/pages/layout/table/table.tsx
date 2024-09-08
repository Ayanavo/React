import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { createColumnHelper, flexRender, getCoreRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";

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
  }, []);

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

  const tableBody = useReactTable({ data: data, columns, debugTable: true, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel() });
  return (
    <Table className="w-full">
      <TableCaption>A list of all available data.</TableCaption>
      <TableHeader>
        {tableBody.getHeaderGroups().map((column) => (
          <TableRow key={column.id}>
            {column.headers.map((headers) => (
              <TableHead className="w-[100px]">{flexRender(headers.column.columnDef.header, headers.getContext())}</TableHead>
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
  );
}

export default table;
