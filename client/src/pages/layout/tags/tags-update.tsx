import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ResourceFormBuilder from "@/pages/layout/grid/form/ResourceFormBuilder";
import { getTagById, TagPayload, updateTag } from "@/shared/services/tag";
import React from "react";
import { Link, useParams } from "react-router-dom";
import tagsForm from "./tags-form";

function tagsupdate() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex min-h-screen flex-col">
      <Breadcrumb className="flex items-center px-6 py-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/tags">Tags</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Update {id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex-grow">
        <ResourceFormBuilder<TagPayload>
          formJson={tagsForm}
          queryKey="tags"
          listPath="/tags"
          resourceLabel="Tag"
          updateResource={updateTag}
          fetchResource={getTagById}
        />
      </div>
    </div>
  );
}

export default tagsupdate;
