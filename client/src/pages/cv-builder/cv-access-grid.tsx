import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import showToast from "@/hooks/toast";
import { CVElement, PageProperties } from "@/lib/useCV";
import { deleteCVBuilder, fetchCVBuilderById, fetchCVBuilderList } from "@/shared/services/cvbuilder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table";
import { DownloadIcon, EllipsisIcon, EyeIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import React, { useCallback, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type CVListing = {
  id: string;
  name: string;
  job: string;
  tag: string;
  createdBy: string;
  modifiedBy: string;
};

type CVBuilderRecord = {
  _id: string;
  name?: string;
  job?: string;
  tag?: string;
  createdBy?: string | { firstName?: string; lastName?: string; email?: string };
  modifiedBy?: string | { firstName?: string; lastName?: string; email?: string };
  elements: CVElement[];
  pageProperties?: PageProperties;
};

const columnHelper = createColumnHelper<CVListing>();

const formatUser = (user?: CVBuilderRecord["createdBy"]) => {
  if (!user) return "-";
  if (typeof user === "string") return user;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.email || "-";
};

const CVAccessGrid = () => {
  const id = useId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const {
    data: cvBuilderList = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["cv-builder-list"],
    queryFn: fetchCVBuilderList,
  });

  const data = useMemo(
    () =>
      cvBuilderList.map((cv) => ({
        id: cv._id,
        name: cv.name || "Untitled CV",
        job: cv.job || "-",
        tag: cv.tag || "-",
        createdBy: formatUser(cv.createdBy),
        modifiedBy: formatUser(cv.modifiedBy),
      })),
    [cvBuilderList]
  );

  const openBuilder = () => {
    sessionStorage.removeItem("cv-editor-session");
    sessionStorage.removeItem("cv-page-properties");
    navigate("/cv-builder/create");
  };

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: deleteCVBuilder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv-builder-list"] });
      showToast({
        title: "CV deleted successfully",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      showToast({
        title: "CV deletion failed",
        description: error.message,
        variant: "error",
      });
    },
  });

  const deleteCV = useCallback(
    (cvId: string) => {
      deleteMutation.mutate(cvId);
    },
    [deleteMutation]
  );

  const downloadCV = useCallback(async (cvId: string) => {
    try {
      const cvBuilder = await fetchCVBuilderById(cvId);
      const blob = new Blob([JSON.stringify(cvBuilder, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cvBuilder.name || "cv-builder"}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showToast({
        title: "CV download failed",
        description: error instanceof Error ? error.message : "Unable to download CV",
        variant: "error",
      });
    }
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("job", {
        header: "Job",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("tag", {
        header: "Tag",
        cell: (info) => (
          <Badge variant="outline" className="cursor-default">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("createdBy", {
        header: "Created By",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("modifiedBy", {
        header: "Modified By",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 w-8 p-0 border-2 dropdown-menu-trigger">
                  <span className="sr-only">Open menu</span>
                  <EllipsisIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem role="button" onSelect={() => navigate(`/cv-builder/${row.original.id}`)}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem role="button" onSelect={() => navigate(`/cv-builder/${row.original.id}`)}>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  <span>View</span>
                </DropdownMenuItem>
                <DropdownMenuItem role="button" onSelect={() => downloadCV(row.original.id)}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem role="button" onSelect={() => deleteCV(row.original.id)}>
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [deleteCV, downloadCV, navigate]
  );

  const tableBody = useReactTable({
    data,
    columns,
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setGlobalFilter(event.currentTarget.value);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] overflow-hidden">
      <div className="flex items-center justify-between px-2 pt-3">
        <BreadcrumbInbuild />
      </div>
      <div className="flex-none p-3 flex justify-between items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Input id={id} className="pe-11" placeholder="Search CVs..." type="search" defaultValue={globalFilter} onKeyDown={handleSearchKey} />
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
            <kbd className="inline-flex h-5 max-h-full items-center rounded border border-border px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">Enter</kbd>
          </div>
        </div>

        <Button onClick={openBuilder} className="flex flex-none items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Create New</span>
        </Button>
      </div>

      <div className="border-2 border-solid rounded-md relative overflow-auto h-screen">
        <Table className="w-full overflow-auto">
          <TableHeader className="backdrop-blur-lg sticky top-0">
            {tableBody.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-9 px-4 font-bold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ?
              Array.from({ length: pagination.pageSize }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="h-10">
                  {columns.map((column, columnIndex) => (
                    <TableCell key={column.id ?? columnIndex} className="px-4">
                      <Skeleton
                        className={
                          column.id === "action" ? "h-8 w-8"
                          : columnIndex === 0 ?
                            "h-4 w-40"
                          : columnIndex === 2 ?
                            "h-5 w-20 rounded-full"
                          : "h-4 w-28"
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : isError ?
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Unable to load CVs.
                </TableCell>
              </TableRow>
            : tableBody.getRowModel().rows.length ?
              tableBody.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group cursor-pointer hover:bg-muted/50 h-10">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="truncate max-w-[220px] px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No CVs found.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4 px-3">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <span className="text-sm text-gray-700 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{tableBody.getRowCount() ? pagination.pageIndex * pagination.pageSize + 1 : 0}</span> -{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{Math.min((pagination.pageIndex + 1) * pagination.pageSize, tableBody.getRowCount())}</span> of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{tableBody.getRowCount()}</span> Items
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious onClick={() => tableBody.previousPage()} className={`cursor-pointer ${!tableBody.getCanPreviousPage() && "disabledlink"}`} />
            </PaginationItem>
            {Array(tableBody.getPageCount())
              .fill(0)
              .map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink className="cursor-pointer" isActive={index === pagination.pageIndex} onClick={() => setPagination((old) => ({ ...old, pageIndex: index }))}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationItem>
              <PaginationNext onClick={() => tableBody.nextPage()} className={`cursor-pointer ${!tableBody.getCanNextPage() && "disabledlink"}`} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default CVAccessGrid;
