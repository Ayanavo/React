import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationSummary,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Table } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { User } from "./user.model";

function getVisiblePages(pageIndex: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const pages = new Set<number>([0, pageCount - 1, pageIndex]);

  if (pageIndex > 0) pages.add(pageIndex - 1);
  if (pageIndex < pageCount - 1) pages.add(pageIndex + 1);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (index > 0 && previous !== undefined && page - previous > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  });

  return result;
}

function pagination({
  tableBody,
  pagination,
  setPagination,
}: {
  tableBody: Table<User>;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
}) {
  const pageCount = tableBody.getPageCount();
  const visiblePages = useMemo(() => getVisiblePages(pagination.pageIndex, pageCount), [pagination.pageIndex, pageCount]);

  const rangeStart = pageCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const rangeEnd = Math.min((pagination.pageIndex + 1) * pagination.pageSize, tableBody.getRowCount());

  return (
    <div className="w-full min-w-0 px-1 py-3 sm:px-0 sm:py-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem className="w-full basis-full sm:w-auto sm:basis-auto">
            <PaginationSummary>
              <span className="font-semibold text-foreground">{rangeStart}</span>
              {" - "}
              <span className="font-semibold text-foreground">{rangeEnd}</span>
              {" of "}
              <span className="font-semibold text-foreground">{tableBody.getRowCount()}</span>
              {" items"}
            </PaginationSummary>
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (tableBody.getCanPreviousPage()) tableBody.previousPage();
              }}
              className={cn(!tableBody.getCanPreviousPage() && "pointer-events-none opacity-50")}
            />
          </PaginationItem>

          {visiblePages.map((page, index) =>
            page === "ellipsis" ?
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            : <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  className="cursor-pointer"
                  isActive={page === pagination.pageIndex}
                  onClick={(event) => {
                    event.preventDefault();
                    setPagination((old) => ({ ...old, pageIndex: page }));
                  }}>
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (tableBody.getCanNextPage()) tableBody.nextPage();
              }}
              className={cn(!tableBody.getCanNextPage() && "pointer-events-none opacity-50")}
            />
          </PaginationItem>

          <PaginationItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 min-w-9 px-2">
                  {tableBody.getState().pagination.pageSize}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {[10, 20, 30, 50, 100].map((size) => (
                  <DropdownMenuItem
                    key={size}
                    className="flex cursor-pointer items-center"
                    onClick={() => setPagination((old) => ({ ...old, pageSize: size }))}>
                    {size}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default pagination;
