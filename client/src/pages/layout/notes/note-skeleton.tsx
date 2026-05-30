import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React from "react";

const LIST_SKELETON_COUNT = 6;
const GRID_SKELETON_COUNT = 8;

type NoteCardSkeletonProps = {
  className?: string;
  tall?: boolean;
};

export function NoteCardSkeleton({ className, tall }: NoteCardSkeletonProps) {
  return (
    <Card className={cn("min-h-[140px] shadow-none", className)} aria-hidden>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="min-w-0 flex-1 space-y-2 pr-2">
          <Skeleton className="h-4 w-4/5 max-w-[220px]" />
          {tall && <Skeleton className="h-3 w-2/5 max-w-[120px]" />}
        </div>
        <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {tall && <Skeleton className="h-24 w-full rounded-md" />}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className={cn("h-3", tall ? "w-3/5" : "w-2/3")} />
      </CardContent>
    </Card>
  );
}

export function NoteListSkeleton() {
  return (
    <>
      {Array.from({ length: LIST_SKELETON_COUNT }).map((_, index) => (
        <NoteCardSkeleton key={index} className="m-3" tall={index % 3 === 0} />
      ))}
    </>
  );
}

export function NoteGridSkeleton() {
  return (
    <div className="m-3 columns-1 gap-4 sm:columns-2 md:columns-3 xl:columns-4">
      {Array.from({ length: GRID_SKELETON_COUNT }).map((_, index) => (
        <NoteCardSkeleton key={index} className="mb-4 w-full break-inside-avoid" tall={index % 2 === 0} />
      ))}
    </div>
  );
}
