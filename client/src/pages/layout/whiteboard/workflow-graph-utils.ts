import type { Edge, Node } from "@xyflow/react";
import type { WorkflowNodeType } from "./engine/node-registry";
import { getDefaultNodeData } from "./workflow-templates";

export function createWorkflowNodeId() {
  return `wf-${crypto.randomUUID()}`;
}

export function createWorkflowNode(type: WorkflowNodeType): Node {
  return {
    id: createWorkflowNodeId(),
    type,
    position: { x: 0, y: 0 },
    data: getDefaultNodeData(type),
  };
}

export function updateWorkflowNodeData(nodes: Node[], nodeId: string, patch: Record<string, unknown>) {
  return nodes.map((node) =>
    node.id === nodeId ? { ...node, data: { ...(node.data ?? {}), ...patch } } : node
  );
}

export function removeWorkflowNode(nodes: Node[], edges: Edge[], nodeId: string) {
  return {
    nodes: nodes.filter((node) => node.id !== nodeId),
    edges: edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
  };
}

export function addWorkflowEdge( edges: Edge[], connection: Omit<Edge, "id">) {
  const id = `edge-${crypto.randomUUID()}`;
  return [...edges, { ...connection, id }];
}

export function removeWorkflowEdge(edges: Edge[], edgeId: string) {
  return edges.filter((edge) => edge.id !== edgeId);
}
