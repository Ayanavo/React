import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import ResourceGrid, { GridColumnConfig } from "@/pages/layout/grid/ResourceGrid";
import { deleteTag, getTags } from "@/shared/services/tag";
import React from "react";
import { Tag } from "./tag.model";

const tagColumns: GridColumnConfig<Tag>[] = [
  { key: "select" as const, label: "Select" },
  { key: "name" as const, label: "Tag Name", type: "text" as const },
  { key: "description" as const, label: "Tag Description", type: "text" as const },
  { key: "color" as const, label: "Tag Color", type: "color" as const },
  { key: "createdAt" as const, label: "Created Date", type: "date" as const },
  { key: "updatedAt" as const, label: "Modified Date", type: "date" as const },
  { key: "action" as const, label: "Actions" },
];

function tagslayout() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-2 pt-3">
        <BreadcrumbInbuild />
      </div>
      <ResourceGrid<Tag>
        queryKey="tags"
        resourceLabel="Tag"
        basePath="/tags"
        addLabel="Add Tag"
        columns={tagColumns}
        fetchList={getTags}
        deleteResource={deleteTag}
        actionConfig={{
          deleteConfirmOptions: {
            title: "Delete Tag",
            message: "Are you sure you want to delete this tag?",
            confirmText: "Delete",
            cancelText: "Cancel",
            showLoadingOnConfirmClick: true,
          },
        }}
      />
    </div>
  );
}

export default tagslayout;
