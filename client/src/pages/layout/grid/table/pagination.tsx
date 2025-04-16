import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table } from "@tanstack/react-table";
import React from "react";
import { User } from "./user.model";
function pagination({
  tableBody,
  pagination,
  setPagination,
}: {
  tableBody: Table<User>;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
}) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <span className="text-sm text-gray-700 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{pagination.pageIndex * pagination.pageSize + 1}</span> -{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{Math.min((pagination.pageIndex + 1) * pagination.pageSize, tableBody.getRowCount())}</span> of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{tableBody.getRowCount()}</span> Items
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationPrevious onClick={() => tableBody.previousPage()} className={`cursor-pointer ${!tableBody.getCanPreviousPage() && "disabledlink"}`} />
            </PaginationItem>
            {Array(tableBody.getPageCount())
              .fill(0)
              .map((_, index) => {
                if (index <= 4) {
                  return (
                    <PaginationItem key={index}>
                      <PaginationLink className="cursor-pointer" isActive={index === pagination.pageIndex} onClick={() => setPagination((old) => ({ ...old, pageIndex: index }))}>
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              })}

            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => tableBody.nextPage()} className={`cursor-pointer ${!tableBody.getCanNextPage() && "disabledlink"}`} />
            </PaginationItem>
            <PaginationItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{tableBody.getState().pagination.pageSize}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  {[10, 20, 30, 50, 100].map((size) => (
                    <DropdownMenuItem key={size} className="flex items-center cursor-pointer" onClick={() => setPagination((old) => ({ ...old, pageSize: size }))}>
                      {size}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export default pagination;
