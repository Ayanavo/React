import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { WorkflowSummary } from "@/shared/services/workflow";
import { Plus, Trash2, Workflow } from "lucide-react";
import React from "react";

type WorkflowSidebarProps = {
  workflows: WorkflowSummary[];
  activeId: string | null;
  isLoading?: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
};

function WorkflowSidebar({
  workflows,
  activeId,
  isLoading,
  onSelect,
  onCreate,
  onDelete,
}: WorkflowSidebarProps) {
  return (
    <aside className="workflow-page__sidebar">
      <div className="workflow-page__sidebar-header">
        <div>
          <h2 className="workflow-page__sidebar-title">Workflows</h2>
          <p className="workflow-page__sidebar-copy">Design automations for notes, activities, and CVs.</p>
        </div>
        <Button type="button" size="sm" className="h-8 gap-1.5" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      <div className="workflow-page__sidebar-list">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="workflow-page__sidebar-skeleton">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}

        {!isLoading && workflows.length === 0 && (
          <div className="workflow-page__sidebar-empty">
            <Workflow className="h-5 w-5" />
            <p>No saved workflows yet.</p>
          </div>
        )}

        {!isLoading &&
          workflows.map((workflow) => (
            <div
              key={workflow._id}
              className={cn("workflow-page__sidebar-item", activeId === workflow._id && "workflow-page__sidebar-item--active")}>
              <button type="button" className="workflow-page__sidebar-item-main" onClick={() => onSelect(workflow._id)}>
                <span className="workflow-page__sidebar-item-title">{workflow.name}</span>
                <span className="workflow-page__sidebar-item-meta">
                  Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                </span>
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => onDelete(workflow._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete {workflow.name}</TooltipContent>
              </Tooltip>
            </div>
          ))}
      </div>
    </aside>
  );
}

export default WorkflowSidebar;
