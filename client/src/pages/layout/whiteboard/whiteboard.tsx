import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { useConfirmDialog } from "@/shared/confirmation";
import { useQueryClient } from "@tanstack/react-query";
import type { Edge, Node } from "@xyflow/react";
import React, { useCallback, useEffect, useState } from "react";
import { executeWorkflow } from "./engine/execute-workflow";
import type { WorkflowNodeType } from "./engine/node-registry";
import { hasExecCycle } from "./engine/validate-connection";
import {
  useCreateWorkflow,
  useDeleteWorkflow,
  useUpdateWorkflow,
  useWorkflow,
  useWorkflows,
  WORKFLOWS_QUERY_KEY,
} from "./use-workflows";
import { createWorkflowNode } from "./workflow-graph-utils";
import WorkflowGraphPanel from "./workflow-graph-panel";
import WorkflowSidebar from "./workflow-sidebar";
import WorkflowToolbar from "./workflow-toolbar";
import "./workflow.scss";

function WhiteboardComponent() {
  const { confirm } = useConfirmDialog();
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading: isLoadingList } = useWorkflows();
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("Untitled workflow");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const { data: activeWorkflow, isLoading: isLoadingWorkflow } = useWorkflow(activeWorkflowId);
  const createWorkflowMutation = useCreateWorkflow();
  const updateWorkflowMutation = useUpdateWorkflow();
  const deleteWorkflowMutation = useDeleteWorkflow();

  useEffect(() => {
    if (!activeWorkflowId && workflows.length > 0) {
      setActiveWorkflowId(workflows[0]._id);
    }
  }, [activeWorkflowId, workflows]);

  useEffect(() => {
    if (!activeWorkflow) return;
    setWorkflowName(activeWorkflow.name);
    setNodes(activeWorkflow.nodes ?? []);
    setEdges(activeWorkflow.edges ?? []);
    setIsDirty(false);
  }, [activeWorkflow]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleSelectWorkflow = useCallback(
    async (id: string) => {
      if (isDirty && id !== activeWorkflowId) {
        const accepted = await confirm({
          title: "Unsaved changes",
          message: "You have unsaved changes. Switch workflows anyway?",
          confirmText: "Continue",
          cancelText: "Cancel",
        });
        if (!accepted) return;
      }
      setActiveWorkflowId(id);
      setIsDirty(false);
    },
    [activeWorkflowId, confirm, isDirty]
  );

  const handleSave = useCallback(async () => {
    const payload = {
      name: workflowName.trim() || "Untitled workflow",
      nodes,
      edges,
    };

    try {
      if (activeWorkflowId) {
        await updateWorkflowMutation.mutateAsync({ id: activeWorkflowId, payload });
        showToast({ title: "Workflow saved", variant: "success" });
        setIsDirty(false);
        return activeWorkflowId;
      }

      const result = await createWorkflowMutation.mutateAsync(payload);
      setActiveWorkflowId(result.workflow._id);
      showToast({ title: "Workflow created", variant: "success" });
      setIsDirty(false);
      return result.workflow._id;
    } catch {
      showToast({ title: "Failed to save workflow", variant: "error" });
      return null;
    }
  }, [activeWorkflowId, createWorkflowMutation, edges, nodes, updateWorkflowMutation, workflowName]);

  const handleRun = useCallback(async () => {
    const workflowId = isDirty || !activeWorkflowId ? await handleSave() : activeWorkflowId;
    if (!workflowId) return;

    if (hasExecCycle(nodes, edges)) {
      showToast({
        title: "Workflow has a cycle in the execution chain. Remove circular exec connections.",
        variant: "error",
      });
      return;
    }

    setIsRunning(true);
    try {
      const result = await executeWorkflow(nodes, edges);

      if (result.error) {
        showToast({ title: result.error, variant: "error" });
        return;
      }

      const successCount = result.results.filter((item) => item.success).length;
      showToast({
        title: `Workflow completed (${successCount} action${successCount === 1 ? "" : "s"})`,
        variant: "success",
      });

      await updateWorkflowMutation.mutateAsync({
        id: workflowId,
        payload: {
          name: workflowName.trim() || "Untitled workflow",
          lastRunAt: new Date().toISOString(),
        },
      });

      void queryClient.invalidateQueries({ queryKey: ["notes"] });
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      void queryClient.invalidateQueries({ queryKey: ["cv-builder-list"] });
      void queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY });
    } catch {
      showToast({ title: "Workflow execution failed", variant: "error" });
    } finally {
      setIsRunning(false);
    }
  }, [activeWorkflowId, edges, handleSave, isDirty, nodes, queryClient, updateWorkflowMutation, workflowName]);

  const handleCreate = useCallback(async () => {
    if (isDirty) {
      const accepted = await confirm({
        title: "Unsaved changes",
        message: "You have unsaved changes. Create a new workflow anyway?",
        confirmText: "Continue",
        cancelText: "Cancel",
      });
      if (!accepted) return;
    }

    setActiveWorkflowId(null);
    setWorkflowName("Untitled workflow");
    setNodes([]);
    setEdges([]);
    setIsDirty(false);
  }, [confirm, isDirty]);

  const handleDelete = useCallback(
    async (id: string) => {
      const workflow = workflows.find((item) => item._id === id);
      const accepted = await confirm({
        title: "Delete workflow",
        message: `Delete "${workflow?.name ?? "this workflow"}"? This cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
      });
      if (!accepted) return;

      try {
        await deleteWorkflowMutation.mutateAsync(id);
        if (activeWorkflowId === id) {
          setActiveWorkflowId(null);
          setNodes([]);
          setEdges([]);
          setWorkflowName("Untitled workflow");
        }
        showToast({ title: "Workflow deleted", variant: "success" });
      } catch {
        showToast({ title: "Failed to delete workflow", variant: "error" });
      }
    },
    [activeWorkflowId, confirm, deleteWorkflowMutation, workflows]
  );

  const handleAddNode = useCallback(
    (type: WorkflowNodeType) => {
      setNodes((current) => [...current, createWorkflowNode(type)]);
      markDirty();
    },
    [markDirty]
  );

  const handleNodesChange = useCallback(
    (nextNodes: Node[]) => {
      setNodes(nextNodes);
      markDirty();
    },
    [markDirty]
  );

  const handleEdgesChange = useCallback(
    (nextEdges: Edge[]) => {
      setEdges(nextEdges);
      markDirty();
    },
    [markDirty]
  );

  const isWorkspaceLoading = isLoadingList || (Boolean(activeWorkflowId) && isLoadingWorkflow);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="workflow-page">
        <div className="workflow-page__header">
          <BreadcrumbInbuild />
          <div className="workflow-page__title-row">
            {isWorkspaceLoading ? (
              <Skeleton className="h-9 w-full max-w-md" />
            ) : (
              <Input
                value={workflowName}
                onChange={(event) => {
                  setWorkflowName(event.target.value);
                  markDirty();
                }}
                className="workflow-page__name-input"
                placeholder="Workflow name"
                aria-label="Workflow name"
              />
            )}
          </div>
        </div>

        <div className="workflow-page__body">
          <WorkflowSidebar
            workflows={workflows}
            activeId={activeWorkflowId}
            isLoading={isLoadingList}
            onSelect={handleSelectWorkflow}
            onCreate={handleCreate}
            onDelete={handleDelete}
          />

          <div className="workflow-page__workspace">
            <WorkflowToolbar
              onAddNode={handleAddNode}
              onSave={handleSave}
              onRun={handleRun}
              isSaving={createWorkflowMutation.isPending || updateWorkflowMutation.isPending}
              isRunning={isRunning}
              canSave={isDirty || !activeWorkflowId}
              disabled={isWorkspaceLoading}
            />

            <WorkflowGraphPanel
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              isLoading={isWorkspaceLoading}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default WhiteboardComponent;
