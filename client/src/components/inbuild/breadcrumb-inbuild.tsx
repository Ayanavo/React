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
  dashboard: "Dashboard",
  notes: "Notes",
  profile: "Profile",
  settings: "Settings",
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

function BreadcrumbInbuild({ isEditMode = false, className = "flex items-center" }: BreadcrumbInbuildProps) {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  const getRouteLabel = (segment: string, index: number) => {
    const isLastSegment = index === segments.length - 1;
    const isCVBuilderAction = segments[0] === "cv-builder" && (segment === "create" || isEditMode);

    if (isLastSegment && isCVBuilderAction) {
      return isEditMode ? "Update" : "Create";
    }

    return routeLabels[segment] ?? formatRouteLabel(segment);
  };

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <House className="w-5" />
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
              <BreadcrumbItem>
                {isLastSegment ?
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                : <BreadcrumbLink asChild>
                    <Link to={href}>{label}</Link>
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
