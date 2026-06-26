import type { Connection, Edge, Node } from "@xyflow/react";
import { areSocketTypesCompatible, getSocketType } from "./socket-types";

export function isValidWorkflowConnection(connection: Connection, nodes: Node[]) {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target || !sourceHandle || !targetHandle) return false;
  if (source === target) return false;

  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);
  if (!sourceNode?.type || !targetNode?.type) return false;

  const sourceType = getSocketType(sourceHandle, sourceNode.type, "source");
  const targetType = getSocketType(targetHandle, targetNode.type, "target");
  if (!sourceType || !targetType) return false;

  return areSocketTypesCompatible(sourceType, targetType);
}

export function hasExecCycle(nodes: Node[], edges: Edge[]) {
  const execEdges = edges.filter((edge) => edge.sourceHandle === "out-exec" && edge.targetHandle === "in-exec");
  const adjacency = new Map<string, string[]>();

  for (const edge of execEdges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visiting.add(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      if (dfs(next)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  return nodes.some((node) => dfs(node.id));
}
