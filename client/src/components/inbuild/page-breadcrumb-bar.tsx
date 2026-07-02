import React from "react";
import { cn } from "@/lib/utils";

type PageBreadcrumbBarProps = {
  children: React.ReactNode;
  className?: string;
};

function PageBreadcrumbBar({ children, className }: PageBreadcrumbBarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between bg-background/95 px-6 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80",
        className
      )}>
      {children}
    </div>
  );
}

export default PageBreadcrumbBar;
