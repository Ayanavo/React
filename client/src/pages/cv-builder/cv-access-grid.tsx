import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import showToast from "@/hooks/toast";
import { formatAppDate } from "@/lib/date-format";
import ResourceGrid, { GridColumnConfig } from "@/pages/layout/grid/ResourceGrid";
import { useConfirmDialog } from "@/shared/confirmation";
import { CVBuilderRecord, deleteCVBuilder, fetchCVBuilderById, fetchCVBuilderList } from "@/shared/services/cvbuilder";
import { getTags } from "@/shared/services/tag";
import { useQuery } from "@tanstack/react-query";
import { DownloadIcon, EllipsisIcon, EyeIcon, ListFilterIcon, Trash2Icon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { atsBadgeClassName, formatAtsBadgeLabel } from "./ats-utils";

type UserRef = string | { firstName?: string; lastName?: string; email?: string };

type CVAccessRecord = {
  _id: string;
  name: string;
  job: string;
  tagId: string;
  tagName: string;
  tagColor?: string;
  atsScore: number | null;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
};

const formatUser = (user?: UserRef) => {
  if (!user) return "-";
  if (typeof user === "string") return user;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.email || "-";
};

const fetchCVAccessList = async (): Promise<CVAccessRecord[]> => {
  const [cvBuilderList, tags] = await Promise.all([fetchCVBuilderList(), getTags()]);
  const tagMap = new Map(tags.map((tag) => [tag._id, tag]));

  return cvBuilderList.map((cv: CVBuilderRecord) => {
    const tagRecord = tagMap.get(cv.tag || "");

    return {
      _id: cv._id,
      name: cv.name || "Untitled CV",
      job: cv.job || "-",
      tagId: cv.tag || "",
      tagName: tagRecord?.name ?? cv.tag ?? "-",
      tagColor: tagRecord?.color,
      atsScore: typeof cv.atsScore === "number" ? cv.atsScore : (cv.atsAnalysis?.score ?? null),
      createdBy: formatUser(cv.createdBy as UserRef),
      createdAt: formatAppDate(cv.createdAt, "-"),
      modifiedBy: formatUser(cv.modifiedBy as UserRef),
      modifiedAt: formatAppDate(cv.updatedAt, "-"),
    };
  });
};

const columns: GridColumnConfig<CVAccessRecord>[] = [
  { key: "select", label: "Select" },
  {
    key: "name",
    label: "Name",
    width: 180,
    minWidth: 140,
    render: (value) => <span className="font-semibold text-foreground">{value}</span>,
  },
  { key: "job", label: "Job", width: 160, minWidth: 120 },
  {
    key: "atsScore",
    label: "ATS Score",
    width: 110,
    minWidth: 90,
    render: (value: number | null) =>
      typeof value === "number" ?
        <Badge className={atsBadgeClassName(value)}>{formatAtsBadgeLabel(value)}</Badge>
      : <span className="text-muted-foreground">—</span>,
  },
  {
    key: "tagName",
    label: "Tag",
    width: 140,
    minWidth: 110,
    listable: true,
    kanbanIdKey: "tagId",
    kanbanColorKey: "tagColor",
    render: (value, row) => {
      const tagStyle =
        row.tagColor ? { borderColor: `${row.tagColor}4f`, backgroundColor: `${row.tagColor}40` } : undefined;

      return (
        <Badge variant="secondary" className="cursor-default gap-2 rounded-lg" style={tagStyle}>
          {row.tagColor ?
            <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.tagColor }} />
          : null}
          {value}
        </Badge>
      );
    },
  },
  { key: "createdAt", label: "Created Date", width: 150, minWidth: 130 },
  { key: "modifiedAt", label: "Modified Date", width: 150, minWidth: 130 },
  { key: "action", label: "Actions" },
];

const CVAccessGrid = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [selectedTagId, setSelectedTagId] = useState("all");

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const filterFn = useCallback(
    (row: CVAccessRecord) => selectedTagId === "all" || row.tagId === selectedTagId,
    [selectedTagId]
  );

  const openBuilder = () => {
    sessionStorage.removeItem("cv-editor-session");
    sessionStorage.removeItem("cv-page-properties");
    navigate("/cv-builder/create");
  };

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

  const actionRenderer = (row: CVAccessRecord, del: (id: string) => void) => (
    <div className="grid-row-actions opacity-0 transition-opacity group-hover:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <span className="sr-only">Open menu</span>
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onSelect={() => navigate(`/cv-builder/${row._id}`)}>
            <EyeIcon className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => downloadCV(row._id)}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onSelect={async () => {
              const ok = await confirm({
                title: "Delete CV",
                message: "Are you sure you want to delete this CV?",
                confirmText: "Delete",
                cancelText: "Cancel",
                showLoadingOnConfirmClick: true,
              });
              if (ok) del(row._id);
            }}>
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const hasActiveFilter = selectedTagId !== "all";

  const filterControls = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 shrink-0">
          <ListFilterIcon className="h-4 w-4" />
          <span className="sr-only">Filter</span>
          {hasActiveFilter ?
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64" onCloseAutoFocus={(event) => event.preventDefault()}>
        <DropdownMenuLabel>Filters</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-2 px-2 py-2" onClick={(event) => event.stopPropagation()}>
          <p className="text-xs font-medium text-muted-foreground">Tag</p>
          <Select value={selectedTagId} onValueChange={setSelectedTagId}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag._id} value={tag._id}>
                  <span className="flex items-center gap-2">
                    {tag.color ?
                      <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                    : null}
                    {tag.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilter ?
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setSelectedTagId("all")}>Clear filters</DropdownMenuItem>
          </>
        : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex flex-none items-center px-4 pt-3 sm:px-6 sm:pt-4">
        <BreadcrumbInbuild className="w-full min-w-0" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-3 pb-2 sm:px-6">
        <ResourceGrid<CVAccessRecord>
        queryKey="cv-builder-list"
        resourceLabel="CV"
        basePath="/cv-builder"
        addLabel="Create New"
        columns={columns}
        fetchList={fetchCVAccessList}
        deleteResource={deleteCVBuilder}
        actionRenderer={actionRenderer}
        onAddClick={openBuilder}
        filterControls={filterControls}
        filterFn={filterFn}
        />
      </div>
    </div>
  );
};

export default CVAccessGrid;
