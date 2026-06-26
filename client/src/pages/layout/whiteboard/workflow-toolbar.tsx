import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Play, Plus, Save } from "lucide-react";
import React from "react";
import { NODE_PALETTE, type NodeCategory, type WorkflowNodeType } from "./engine/node-registry";

const CATEGORY_LABELS: Record<NodeCategory, string> = {
  trigger: "Trigger",
  input: "Input",
  builder: "Builder",
  transform: "Transform",
  output: "Output",
};

type WorkflowToolbarProps = {
  onAddNode: (type: WorkflowNodeType) => void;
  onSave: () => void;
  onRun: () => void;
  isSaving?: boolean;
  isRunning?: boolean;
  canSave?: boolean;
  disabled?: boolean;
};

function ToolbarIconButton({
  label,
  onClick,
  disabled,
  children,
  variant = "outline",
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "outline" | "default";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant={variant} size="sm" className="h-8 gap-1.5" onClick={onClick} disabled={disabled}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function WorkflowToolbar({
  onAddNode,
  onSave,
  onRun,
  isSaving,
  isRunning,
  canSave = true,
  disabled = false,
}: WorkflowToolbarProps) {
  const grouped = NODE_PALETTE.reduce<Record<NodeCategory, typeof NODE_PALETTE>>(
    (acc, item) => {
      acc[item.category].push(item);
      return acc;
    },
    { trigger: [], input: [], builder: [], transform: [], output: [] }
  );

  return (
    <div className="workflow-page__toolbar" role="toolbar" aria-label="Workflow tools">
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" disabled={disabled}>
                  <Plus className="h-4 w-4" />
                  Add node
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {(Object.keys(grouped) as NodeCategory[]).map((category) => (
                  <DropdownMenuGroup key={category}>
                    <DropdownMenuLabel>{CATEGORY_LABELS[category]}</DropdownMenuLabel>
                    {grouped[category].map((item) => (
                      <DropdownMenuItem key={item.type} onClick={() => onAddNode(item.type)}>
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </DropdownMenuGroup>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent>Add a node to the workflow</TooltipContent>
      </Tooltip>

      <div className="workflow-page__tool-spacer" />

      <ToolbarIconButton label="Save workflow" onClick={onSave} disabled={disabled || !canSave || isSaving}>
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save
      </ToolbarIconButton>

      <ToolbarIconButton label="Run workflow" onClick={onRun} disabled={disabled || isRunning} variant="default">
        {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Run
      </ToolbarIconButton>
    </div>
  );
}

export default WorkflowToolbar;
