import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import showToast from "@/hooks/toast";
import { formatAppDate } from "@/lib/date-format";
import ResourceGrid, { GridColumnConfig } from "@/pages/layout/grid/ResourceGrid";
import { useConfirmDialog } from "@/shared/confirmation";
import { CVBuilderRecord, deleteCVBuilder, fetchCVBuilderById, fetchCVBuilderList } from "@/shared/services/cvbuilder";
import { getTags } from "@/shared/services/tag";
import { DownloadIcon, EllipsisIcon, EyeIcon, Trash2Icon } from "lucide-react";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

type UserRef = string | { firstName?: string; lastName?: string; email?: string };

type CVAccessRecord = {
  _id: string;
  name: string;
  job: string;
  tagName: string;
  tagColor?: string;
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
      tagName: tagRecord?.name ?? cv.tag ?? "-",
      tagColor: tagRecord?.color,
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
    render: (value) => <span className="font-semibold text-foreground">{value}</span>,
  },
  { key: "job", label: "Job" },
  {
    key: "tagName",
    label: "Tag",
    render: (value, row) => {
      const tagStyle = row.tagColor ? { borderColor: `${row.tagColor}4f`, backgroundColor: `${row.tagColor}40` } : undefined;

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
  { key: "createdAt", label: "Created Date" },
  { key: "modifiedAt", label: "Modified Date" },
  { key: "action", label: "Actions" },
];

const CVAccessGrid = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();

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
    <div className="opacity-0 transition-opacity group-hover:opacity-100">
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

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-2 pt-3">
        <BreadcrumbInbuild />
      </div>
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
      />
    </div>
  );
};

export default CVAccessGrid;
