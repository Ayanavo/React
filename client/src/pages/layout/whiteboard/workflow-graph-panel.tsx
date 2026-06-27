import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ActivityPriority } from "@/pages/layout/activity/activity.types";
import DateTimePicker from "@/pages/layout/activity/datepicker";
import { cn } from "@/lib/utils";
import { fetchCVTemplates, type CVTemplateRecord } from "@/shared/services/cvbuilder";
import { getTags } from "@/shared/services/tag";
import type { Edge, Node } from "@xyflow/react";
import moment from "moment";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { getNodeDefinition, NODE_DEFINITIONS, type WorkflowNodeType } from "./engine/node-registry";
import { isValidWorkflowConnection } from "./engine/validate-connection";
import {
  addWorkflowEdge,
  removeWorkflowEdge,
  removeWorkflowNode,
  updateWorkflowNodeData,
} from "./workflow-graph-utils";

type WorkflowGraphPanelProps = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  isLoading?: boolean;
};

function WorkflowGraphSkeleton() {
  return (
    <div className="workflow-graph-panel workflow-graph-panel--loading">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="workflow-graph-panel__skeleton-card">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

function NodeDeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClick}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function WorkflowNodeFields({
  node,
  onPatch,
}: {
  node: Node;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const data = (node.data ?? {}) as Record<string, unknown>;
  const [tags, setTags] = useState<{ _id: string; name: string }[]>([]);
  const [templates, setTemplates] = useState<CVTemplateRecord[]>([]);

  useEffect(() => {
    if (node.type === "tagInput") {
      getTags().then(setTags).catch(() => setTags([]));
    }
    if (node.type === "cvTemplate") {
      fetchCVTemplates().then(setTemplates).catch(() => setTemplates([]));
    }
  }, [node.type]);

  switch (node.type) {
    case "textInput":
      return (
        <>
          <Label className="workflow-graph-panel__label">Text</Label>
          <Input
            value={String(data.value ?? "")}
            onChange={(event) => onPatch({ value: event.target.value })}
            placeholder="Enter text…"
            className="h-8"
          />
        </>
      );
    case "dateTimeInput":
      return (
        <>
          <Label className="workflow-graph-panel__label">Date & time</Label>
          <DateTimePicker
            mode="form"
            type="datetime"
            date={
              data.value && moment(String(data.value)).isValid() ?
                moment(String(data.value)).toDate()
              : moment().toDate()
            }
            onSendData={(nextDate) => onPatch({ value: moment(nextDate).toISOString() })}
          />
        </>
      );
    case "tagInput":
      return (
        <>
          <Label className="workflow-graph-panel__label">Tag</Label>
          <Select value={String(data.tagId ?? "")} onValueChange={(value) => onPatch({ tagId: value })}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag._id} value={tag._id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      );
    case "noteBuilder":
      return (
        <>
          <Label className="workflow-graph-panel__label">Fallback title</Label>
          <Input value={String(data.title ?? "")} onChange={(e) => onPatch({ title: e.target.value })} className="h-8" />
          <Label className="workflow-graph-panel__label">Fallback body</Label>
          <Input value={String(data.body ?? "")} onChange={(e) => onPatch({ body: e.target.value })} className="h-8" />
        </>
      );
    case "activityBuilder":
      return (
        <>
          <Label className="workflow-graph-panel__label">Fallback title</Label>
          <Input value={String(data.title ?? "")} onChange={(e) => onPatch({ title: e.target.value })} className="h-8" />
          <Label className="workflow-graph-panel__label">Priority</Label>
          <Select
            value={String(data.priority ?? "medium")}
            onValueChange={(value) => onPatch({ priority: value as ActivityPriority })}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["low", "medium", "high", "urgent"] as ActivityPriority[]).map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      );
    case "cvTemplate":
      return (
        <>
          <Label className="workflow-graph-panel__label">Template</Label>
          <Select value={String(data.templateId ?? "")} onValueChange={(value) => onPatch({ templateId: value })}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label className="workflow-graph-panel__label">CV name</Label>
          <Input value={String(data.name ?? "")} onChange={(e) => onPatch({ name: e.target.value })} className="h-8" />
          <Label className="workflow-graph-panel__label">Job title</Label>
          <Input value={String(data.job ?? "")} onChange={(e) => onPatch({ job: e.target.value })} className="h-8" />
        </>
      );
    case "mergeText":
      return (
        <>
          <Label className="workflow-graph-panel__label">Separator</Label>
          <Input
            value={String(data.separator ?? " ")}
            onChange={(e) => onPatch({ separator: e.target.value })}
            className="h-8"
          />
        </>
      );
    default:
      return <p className="workflow-graph-panel__hint">No extra settings for this node.</p>;
  }
}

function WorkflowGraphPanel({ nodes, edges, onNodesChange, onEdgesChange, isLoading }: WorkflowGraphPanelProps) {
  const [newSource, setNewSource] = useState("");
  const [newSourceHandle, setNewSourceHandle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newTargetHandle, setNewTargetHandle] = useState("");

  const sourceHandles = useMemo(() => {
    const node = nodes.find((item) => item.id === newSource);
    if (!node?.type) return [];
    return getNodeDefinition(node.type)?.outputs ?? [];
  }, [newSource, nodes]);

  const targetHandles = useMemo(() => {
    const node = nodes.find((item) => item.id === newTarget);
    if (!node?.type) return [];
    return getNodeDefinition(node.type)?.inputs ?? [];
  }, [newTarget, nodes]);

  const handleDeleteNode = (nodeId: string) => {
    const next = removeWorkflowNode(nodes, edges, nodeId);
    onNodesChange(next.nodes);
    onEdgesChange(next.edges);
  };

  const handleAddConnection = () => {
    if (!newSource || !newTarget || !newSourceHandle || !newTargetHandle) return;

    const connection = {
      source: newSource,
      target: newTarget,
      sourceHandle: newSourceHandle,
      targetHandle: newTargetHandle,
    };

    if (!isValidWorkflowConnection(connection, nodes)) return;

    onEdgesChange(addWorkflowEdge(edges, connection));
  };

  if (isLoading) {
    return <WorkflowGraphSkeleton />;
  }

  return (
    <div className="workflow-graph-panel">
      <section className="workflow-graph-panel__section">
        <div className="workflow-graph-panel__section-header">
          <h3 className="workflow-graph-panel__section-title">Nodes</h3>
          <span className="workflow-graph-panel__section-meta">{nodes.length} total</span>
        </div>

        {nodes.length === 0 && (
          <div className="workflow-graph-panel__empty">
            <p className="workflow-graph-panel__empty-title">No nodes yet</p>
            <p className="workflow-graph-panel__empty-copy">
              Use <strong>Add node</strong> in the toolbar to build your automation. Connect nodes in the section below.
            </p>
          </div>
        )}

        <div className="workflow-graph-panel__node-list">
          {nodes.map((node) => {
            const definition = node.type ? NODE_DEFINITIONS[node.type as WorkflowNodeType] : null;
            if (!definition) return null;

            return (
              <article key={node.id} className={cn("workflow-graph-panel__node", definition.category === "output" && "workflow-graph-panel__node--output")}>
                <div className="workflow-graph-panel__node-header">
                  <div>
                    <span className="workflow-graph-panel__node-category">{definition.category}</span>
                    <h4 className="workflow-graph-panel__node-title">{definition.label}</h4>
                  </div>
                  <NodeDeleteButton label={`Delete ${definition.label}`} onClick={() => handleDeleteNode(node.id)} />
                </div>
                <div className="workflow-graph-panel__node-body">
                  <WorkflowNodeFields
                    node={node}
                    onPatch={(patch) => onNodesChange(updateWorkflowNodeData(nodes, node.id, patch))}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="workflow-graph-panel__section">
        <div className="workflow-graph-panel__section-header">
          <h3 className="workflow-graph-panel__section-title">Connections</h3>
          <span className="workflow-graph-panel__section-meta">{edges.length} total</span>
        </div>

        {edges.length > 0 && (
          <ul className="workflow-graph-panel__edge-list">
            {edges.map((edge) => {
              const source = nodes.find((node) => node.id === edge.source);
              const target = nodes.find((node) => node.id === edge.target);
              const sourceLabel = source?.type ? NODE_DEFINITIONS[source.type as WorkflowNodeType]?.label : edge.source;
              const targetLabel = target?.type ? NODE_DEFINITIONS[target.type as WorkflowNodeType]?.label : edge.target;

              return (
                <li key={edge.id} className="workflow-graph-panel__edge">
                  <div className="workflow-graph-panel__edge-copy">
                    <span>{sourceLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>{targetLabel}</span>
                    <span className="workflow-graph-panel__edge-sockets">
                      {edge.sourceHandle} → {edge.targetHandle}
                    </span>
                  </div>
                  <NodeDeleteButton label="Remove connection" onClick={() => onEdgesChange(removeWorkflowEdge(edges, edge.id))} />
                </li>
              );
            })}
          </ul>
        )}

        <div className="workflow-graph-panel__connect-form">
          <Select value={newSource} onValueChange={(value) => { setNewSource(value); setNewSourceHandle(""); }}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Source node" />
            </SelectTrigger>
            <SelectContent>
              {nodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.type ? NODE_DEFINITIONS[node.type as WorkflowNodeType]?.label : node.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={newSourceHandle} onValueChange={setNewSourceHandle} disabled={!newSource}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Output socket" />
            </SelectTrigger>
            <SelectContent>
              {sourceHandles.map((socket) => (
                <SelectItem key={socket.id} value={socket.id}>
                  {socket.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={newTarget} onValueChange={(value) => { setNewTarget(value); setNewTargetHandle(""); }}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Target node" />
            </SelectTrigger>
            <SelectContent>
              {nodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.type ? NODE_DEFINITIONS[node.type as WorkflowNodeType]?.label : node.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={newTargetHandle} onValueChange={setNewTargetHandle} disabled={!newTarget}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Input socket" />
            </SelectTrigger>
            <SelectContent>
              {targetHandles.map((socket) => (
                <SelectItem key={socket.id} value={socket.id}>
                  {socket.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" size="sm" className="h-8 gap-1.5" onClick={handleAddConnection}>
                <Plus className="h-4 w-4" />
                Connect
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add connection between nodes</TooltipContent>
          </Tooltip>
        </div>
      </section>
    </div>
  );
}

export default WorkflowGraphPanel;
