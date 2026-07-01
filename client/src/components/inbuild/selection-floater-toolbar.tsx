import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoaderCircleIcon, Trash2Icon, XIcon } from "lucide-react";
import React from "react";

type SelectionFloaterToolbarProps = {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  resourceLabel?: string;
  className?: string;
};

function SelectionFloaterToolbar({
  selectedCount,
  onClear,
  onDelete,
  isDeleting = false,
  resourceLabel = "item",
  className,
}: SelectionFloaterToolbarProps) {
  if (selectedCount <= 0) return null;

  const label = selectedCount === 1 ? resourceLabel : `${resourceLabel}s`;

  return (
    <div
      className={cn("pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4", className)}
      role="toolbar"
      aria-label="Selection actions">
      <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border/70 bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <span className="text-sm font-medium text-foreground">
          {selectedCount} {label} selected
        </span>
        <div className="h-5 w-px bg-border" aria-hidden="true" />
        <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onClear} disabled={isDeleting}>
          <XIcon className="h-4 w-4" />
          Clear
        </Button>
        <Button variant="destructive" size="sm" className="h-8 gap-1.5" onClick={onDelete} disabled={isDeleting}>
          {isDeleting ?
            <LoaderCircleIcon className="h-4 w-4 animate-spin" />
          : <Trash2Icon className="h-4 w-4" />}
          Delete
        </Button>
      </div>
    </div>
  );
}

export default SelectionFloaterToolbar;
