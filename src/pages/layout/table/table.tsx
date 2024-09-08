import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import React, { useState } from "react";

type User = {
  id: number;
  name: string;
  age: number;
};
function table() {
  const columnHelper = createColumnHelper<User>();
  const [data] = useState([
    { id: 1, name: "John Doe", age: 30 },
    { id: 2, name: "Jane Smith", age: 28 },
    { id: 3, name: "Alice Johnson", age: 35 },
  ]);

  const columns = [
    columnHelper.accessor("id", {
      header: () => "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: () => "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("age", {
      header: () => "Age",
      cell: (info) => info.getValue(),
    }),
  ];

  const tableBody = useReactTable({ data: data, columns, debugTable: true, getCoreRowModel: getCoreRowModel() });
  return (
    <Table className="table-auto w-screen">
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
