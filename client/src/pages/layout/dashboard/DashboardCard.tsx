import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

type DashboardCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerAction?: ReactNode;
};

export function DashboardCard({ title, description, children, className, contentClassName, headerAction }: DashboardCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      {(title || description || headerAction) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            {title && <CardTitle className="text-base font-semibold">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerAction}
        </CardHeader>
      )}
      <CardContent className={cn(!title && !description && !headerAction && "pt-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export default DashboardCard;
