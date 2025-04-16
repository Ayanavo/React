import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import React from "react";
import { Link, useParams } from "react-router-dom";
import FormBuilderComponent from "../form/form-builder";

function details() {
  const { id } = useParams();
  return (
    <div className="flex flex-col min-h-screen">
      <Breadcrumb className="flex items-center px-6 py-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/table">Activity</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail {id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex-grow">
        <FormBuilderComponent />
      </div>
    </div>
  );
}

export default details;
