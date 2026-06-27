import React from "react";
import { Link, useLocation } from "react-router-dom";
import { House } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbInbuildProps = {
  isEditMode?: boolean;
  className?: string;
};

const routeLabels: Record<string, string> = {
  activities: "Activities",
  "cv-builder": "CV Builder",
  "cover-letter": "Cover Letter",
  dashboard: "Dashboard",
  notes: "Notes",
  profile: "Profile",
  settings: "Settings",
  terms: "Terms & Conditions",
  table: "Table",
  whiteboard: "Whiteboard",
};

const formatRouteLabel = (segment: string) => {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function BreadcrumbInbuild({ isEditMode = false, className = "flex w-full min-w-0 items-center" }: BreadcrumbInbuildProps) {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  const getRouteLabel = (segment: string, index: number) => {
    const isLastSegment = index === segments.length - 1;
    const isCVBuilderAction = segments[0] === "cv-builder" && (segment === "create" || isEditMode);
    const isCoverLetterAction = segments[0] === "cover-letter" && (segment === "create" || isEditMode);

    if (isLastSegment && isCVBuilderAction) {
      return isEditMode ? "Update" : "Create";
    }

    if (isLastSegment && isCoverLetterAction) {
      return isEditMode ? "Update" : "Create";
    }

    return routeLabels[segment] ?? formatRouteLabel(segment);
  };

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem className="shrink-0">
          <BreadcrumbLink asChild>
            <Link to="/" aria-label="Home">
              <House className="h-5 w-5" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLastSegment = index === segments.length - 1;
          const label = getRouteLabel(segment, index);

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem
                className={
                  isLastSegment ? "min-w-0 flex-1 overflow-hidden" : "max-w-[45%] shrink overflow-hidden"
                }>
                {isLastSegment ?
                  <BreadcrumbPage title={label}>{label}</BreadcrumbPage>
                : <BreadcrumbLink asChild>
                    <Link to={href} title={label}>
                      {label}
                    </Link>
                  </BreadcrumbLink>
                }
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbInbuild;
