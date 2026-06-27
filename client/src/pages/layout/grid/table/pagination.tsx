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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Table } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { User } from "./user.model";

function getVisiblePages(
  pageIndex: number,
  pageCount: number
): Array<number | "ellipsis"> {
  if (pageCount <= 0) return [];
  if (pageCount === 1) return [0];

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

function PageSizeControl({
  pageSize,
  onPageSizeChange,
  className,
}: {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Rows per page"
          className={cn("h-9 min-w-9 shrink-0 px-2", className)}>
          {pageSize}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {[10, 20, 30, 50, 100].map((size) => (
          <DropdownMenuItem
            key={size}
            className="flex cursor-pointer items-center"
            onClick={() => onPageSizeChange(size)}>
            {size}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  const isMobile = useIsMobile();
  const pageCount = tableBody.getPageCount();
  const visiblePages = useMemo(
    () => getVisiblePages(pagination.pageIndex, pageCount),
    [pagination.pageIndex, pageCount]
  );

  const rangeStart = pageCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const rangeEnd = Math.min((pagination.pageIndex + 1) * pagination.pageSize, tableBody.getRowCount());
  const totalRows = tableBody.getRowCount();
  const pageSize = tableBody.getState().pagination.pageSize;

  const handlePageSizeChange = (size: number) => {
    setPagination((old) => ({ ...old, pageSize: size }));
  };

  const summary = (
    <PaginationSummary>
      <span className="font-semibold text-foreground">{rangeStart}</span>
      <span>{" - "}</span>
      <span className="font-semibold text-foreground">{rangeEnd}</span>
      <span>{" of "}</span>
      <span className="font-semibold text-foreground">{totalRows}</span>
      <span className="hidden min-[380px]:inline"> items</span>
    </PaginationSummary>
  );

  const previousButton = (
    <PaginationPrevious
      href="#"
      onClick={(event) => {
        event.preventDefault();
        if (tableBody.getCanPreviousPage()) tableBody.previousPage();
      }}
      className={cn(!tableBody.getCanPreviousPage() && "pointer-events-none opacity-50")}
    />
  );

  const nextButton = (
    <PaginationNext
      href="#"
      onClick={(event) => {
        event.preventDefault();
        if (tableBody.getCanNextPage()) tableBody.nextPage();
      }}
      className={cn(!tableBody.getCanNextPage() && "pointer-events-none opacity-50")}
    />
  );

  if (isMobile) {
    return (
      <div className="grid-pagination grid-pagination--mobile w-full min-w-0 shrink-0 border-t border-border/60 bg-background/80 px-2 py-3 backdrop-blur-sm">
        <div className="flex w-full min-w-0 flex-nowrap items-center gap-1">
          <div className="min-w-0 flex-1 overflow-hidden">{summary}</div>
          {previousButton}
          {pageCount > 1 ?
            <span className="flex h-9 shrink-0 items-center whitespace-nowrap px-1 text-xs font-medium text-muted-foreground">
              {pagination.pageIndex + 1}/{pageCount}
            </span>
          : null}
          {nextButton}
          <PageSizeControl pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid-pagination w-full min-w-0 shrink-0 py-3 sm:py-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>{summary}</PaginationItem>

          <PaginationItem>{previousButton}</PaginationItem>

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

          <PaginationItem>{nextButton}</PaginationItem>

          <PaginationItem>
            <PageSizeControl pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default pagination;
