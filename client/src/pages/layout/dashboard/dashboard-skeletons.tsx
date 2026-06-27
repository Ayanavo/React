import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React from "react";

export function StatCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        "dashboard__stat",
        featured && "border-primary/20 bg-primary/5"
      )}>
      <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-7 w-10" />
        <Skeleton className="h-3.5 w-20" />
      </div>
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="dashboard__stat-strip">
      <StatCardSkeleton featured />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}

export function BarChartSkeleton({ bars = 7 }: { bars?: number }) {
  const heights = [45, 72, 58, 88, 64, 76, 52];

  return (
    <div className="dashboard__chart flex items-end justify-between gap-2 px-1 pb-1">
      {Array.from({ length: bars }).map((_, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-2">
          <Skeleton
            className="w-full max-w-8 rounded-full"
            style={{ height: `${heights[index % heights.length]}%` }}
          />
          <Skeleton className="h-2.5 w-6" />
        </div>
      ))}
    </div>
  );
}

export function HorizontalBarChartSkeleton({ rows = 4 }: { rows?: number }) {
  const widths = ["w-[88%]", "w-[72%]", "w-[56%]", "w-[40%]"];

  return (
    <div className="dashboard__chart flex flex-col justify-center gap-3 py-1">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-3 w-16 shrink-0" />
          <Skeleton className={cn("h-4 rounded-full", widths[index % widths.length])} />
        </div>
      ))}
    </div>
  );
}

export function InsightRowSkeleton() {
  return (
    <div className="dashboard__insight">
      <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
    </div>
  );
}

export function InsightsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="dashboard__list">
      {Array.from({ length: count }).map((_, index) => (
        <InsightRowSkeleton key={index} />
      ))}
    </div>
  );
}

export function ActivityRowSkeleton() {
  return (
    <div className="dashboard__list-item pointer-events-none">
      <Skeleton className="h-11 w-9 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function ActivityListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="dashboard__list">
      {Array.from({ length: count }).map((_, index) => (
        <ActivityRowSkeleton key={index} />
      ))}
    </div>
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="dashboard__list-item pointer-events-none block min-w-0">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-10 shrink-0" />
        </div>
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function NoteGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="dashboard__list gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <NoteCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function NoteListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="dashboard__list">
      {Array.from({ length: count }).map((_, index) => (
        <NoteCardSkeleton key={index} />
      ))}
    </div>
  );
}
