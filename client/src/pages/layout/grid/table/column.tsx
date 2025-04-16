import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender, Table as TableModel } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, EyeOffIcon, ListFilterIcon } from "lucide-react";
import React from "react";
import { User } from "./user.model";

function column({ tableBody, setSorting }: { tableBody: TableModel<User>; setSorting: any }) {
  return (
    <div className="border-2 border-solid rounded-md relative overflow-auto h-screen">
      <Table className="w-full overflow-auto ">
        <TableCaption>A list of all available data.</TableCaption>

        <TableHeader className=" backdrop-blur-lg sticky top-0">
          {tableBody.getHeaderGroups().map((column) => (
            <TableRow key={column.id}>
              {/* <DndContext> */}
              {/* <SortableContext items={column.headers} strategy={horizontalListSortingStrategy}> */}
              {column.headers.map((headers) => (
                <TableHead key={headers.id} className="w-[100px] h-9">
                  {headers.isPlaceholder ?
                    <Skeleton className="w-[100px] h-[20px] rounded-full" />
                  : headers.column.getCanSort() ?
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span className="cursor-pointer flex items-center font-bold hover:text-black active:text-black focus-visible:text-black px-2">
                          {flexRender(headers.column.columnDef.header, headers.getContext())}
                          <ListFilterIcon className="h-4 w-4 ml-2" />
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[160px]">
                        <DropdownMenuItem role="button" className="flex items-center cursor-pointer" onClick={() => setSorting([{ id: headers.column.id, desc: false }])}>
                          <ChevronUpIcon className="h-4 w-4 mr-2" />
                          <span>Ascending</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem role="button" className="flex items-center cursor-pointer" onClick={() => setSorting([{ id: headers.column.id, desc: true }])}>
                          <ChevronDownIcon className="h-4 w-4 mr-2" />
                          <span>Descending</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem role="button" className="flex items-center cursor-pointer" onClick={headers.column.getToggleVisibilityHandler()}>
                          <EyeOffIcon className="h-4 w-4 mr-2" />
                          <span>Hide Column</span>
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
            <TableRow key={row.id} className="group cursor-pointer hover:bg-muted/50 h-9" data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="font-medium truncate max-w-[200px] pr-0 pl-4">
                  {/* <Skeleton className="w-[100px] h-[20px] rounded-full" /> */}
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default column;
