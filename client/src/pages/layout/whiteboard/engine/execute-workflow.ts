import { buildActivityPayload } from "@/shared/utils/activity-payload";
import type { ActivityPayload } from "@/shared/services/activity";
import { createActivity } from "@/shared/services/activity";
import type { CVSubmitPayload, CVTemplateRecord } from "@/shared/services/cvbuilder";
import { fetchCVTemplates, submitCV } from "@/shared/services/cvbuilder";
import type { NotePayload } from "@/shared/services/note";
import { createNote } from "@/shared/services/note";
import moment from "moment";
import type { Edge, Node } from "@xyflow/react";
import type { WorkflowNodeType, WorkflowNodeOutputs } from "./node-registry";
import { getNodeDefinition } from "./node-registry";

export type WorkflowRunResult = {
  nodeId: string;
  nodeType: string;
  success: boolean;
  message: string;
  resourceId?: string;
};

export type WorkflowExecutionResult = {
  results: WorkflowRunResult[];
  error?: string;
};

type ResolvedInputs = Record<string, unknown>;

type NodeData = Record<string, unknown>;

function cloneCvElements<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getIncomingEdges(nodeId: string, edges: Edge[]) {
  return edges.filter((edge) => edge.target === nodeId);
}

function getExecOutgoing(nodeId: string, edges: Edge[]) {
  return edges.filter((edge) => edge.source === nodeId && edge.sourceHandle === "out-exec" && edge.targetHandle === "in-exec");
}

function resolveInputValue(
  node: Node,
  handleId: string,
  edges: Edge[],
  nodeOutputs: Map<string, WorkflowNodeOutputs>,
  resolvedInputs: ResolvedInputs
) {
  if (resolvedInputs[handleId] !== undefined) {
    return resolvedInputs[handleId];
  }

  const incoming = getIncomingEdges(node.id, edges).find((edge) => edge.targetHandle === handleId);
  if (!incoming?.source || !incoming.sourceHandle) {
    return undefined;
  }

  const upstreamOutputs = nodeOutputs.get(incoming.source);
  if (!upstreamOutputs) return undefined;

  const socket = getNodeDefinition(node.type)?.inputs.find((item) => item.id === handleId);
  if (!socket) return undefined;

  return upstreamOutputs[socket.type as keyof WorkflowNodeOutputs];
}

function resolveNodeInputs(node: Node, edges: Edge[], nodeOutputs: Map<string, WorkflowNodeOutputs>) {
  const definition = getNodeDefinition(node.type);
  const data = (node.data ?? {}) as NodeData;
  const resolved: ResolvedInputs = {};

  if (!definition) {
    return { resolved, data };
  }

  for (const input of definition.inputs) {
    const wired = resolveInputValue(node, input.id, edges, nodeOutputs, resolved);
    if (wired !== undefined) {
      resolved[input.id] = wired;
      continue;
    }

    if (input.type === "string" && typeof data[input.id.replace("in-", "")] === "string") {
      resolved[input.id] = data[input.id.replace("in-", "")];
    }
  }

  return { resolved, data };
}

function resolveUpstreamOutputs(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  nodeOutputs: Map<string, WorkflowNodeOutputs>,
  templates: CVTemplateRecord[],
  resolving: Set<string>
): Promise<void> {
  if (nodeOutputs.has(nodeId) || resolving.has(nodeId)) {
    return Promise.resolve();
  }

  const node = nodes.find((item) => item.id === nodeId);
  if (!node?.type) return Promise.resolve();

  resolving.add(nodeId);

  const upstreamExec = getIncomingEdges(nodeId, edges).filter((edge) => edge.targetHandle === "in-exec");
  const upstreamData = getIncomingEdges(nodeId, edges).filter((edge) => edge.targetHandle !== "in-exec");

  const dependencies = [...upstreamExec, ...upstreamData]
    .map((edge) => edge.source)
    .filter((sourceId): sourceId is string => Boolean(sourceId));

  return dependencies
    .reduce((chain, sourceId) => chain.then(() => resolveUpstreamOutputs(sourceId, nodes, edges, nodeOutputs, templates, resolving)), Promise.resolve())
    .then(async () => {
      if (!nodeOutputs.has(nodeId)) {
        const outputs = await executeNode(node, edges, nodeOutputs, templates);
        nodeOutputs.set(nodeId, outputs);
      }
      resolving.delete(nodeId);
    });
}

async function executeNode(
  node: Node,
  edges: Edge[],
  nodeOutputs: Map<string, WorkflowNodeOutputs>,
  templates: CVTemplateRecord[]
): Promise<WorkflowNodeOutputs> {
  const type = node.type as WorkflowNodeType;
  const { resolved, data } = resolveNodeInputs(node, edges, nodeOutputs);

  switch (type) {
    case "manualTrigger":
      return { exec: true };

    case "textInput":
      return { string: String(data.value ?? "") };

    case "dateTimeInput":
      return { date: String(data.value ?? moment().toISOString()) };

    case "tagInput":
      return { tag: data.tagId ? String(data.tagId) : undefined };

    case "mergeText": {
      const partA = String(resolved["in-a"] ?? "");
      const partB = String(resolved["in-b"] ?? "");
      const separator = String(data.separator ?? " ");
      return { string: `${partA}${separator}${partB}`.trim() };
    }

    case "noteBuilder": {
      const title = String(resolved["in-title"] ?? data.title ?? "Untitled note");
      const body = String(resolved["in-body"] ?? data.body ?? "");
      const color = String(resolved["in-color"] ?? data.color ?? "");
      const tag = resolved["in-tag"] ? String(resolved["in-tag"]) : undefined;
      const payload: NotePayload = {
        title: title.trim() || "Untitled note",
        body,
        color,
        image: [],
        tag: tag || "",
      };
      return { exec: true, notePayload: payload };
    }

    case "activityBuilder": {
      const title = String(resolved["in-title"] ?? data.title ?? "Untitled activity");
      const start = String(resolved["in-start"] ?? data.start ?? moment().toISOString());
      const end = resolved["in-end"] ? String(resolved["in-end"]) : data.end ? String(data.end) : undefined;
      const tag = resolved["in-tag"] ? String(resolved["in-tag"]) : undefined;
      const payload = buildActivityPayload({
        title,
        start,
        end,
        priority: (data.priority as ActivityPayload["priority"]) ?? "medium",
        tag,
      });
      return { exec: true, activityPayload: payload };
    }

    case "cvTemplate": {
      const templateId = String(data.templateId ?? "");
      const template = templates.find((item) => item.id === templateId);
      if (!template) {
        throw new Error("CV template node requires a valid template");
      }

      const payload: CVSubmitPayload = {
        name: String(resolved["in-name"] ?? data.name ?? template.name),
        job: String(resolved["in-job"] ?? data.job ?? ""),
        tag: data.tag ? String(data.tag) : "",
        elements: cloneCvElements(template.elements),
        pageProperties: cloneCvElements(template.pageProperties),
        atsScore: null,
        atsAnalysis: null,
      };
      return { exec: true, cvPayload: payload };
    }

    case "createNote": {
      const payload = resolved["in-note"] as NotePayload | undefined;
      if (!payload) throw new Error("Create Note requires a connected note payload");
      const response = await createNote(payload);
      return { exec: true, string: response?.note?._id };
    }

    case "createActivity": {
      const payload = resolved["in-activity"] as ActivityPayload | undefined;
      if (!payload) throw new Error("Create Activity requires a connected activity payload");
      const response = await createActivity(payload);
      return { exec: true, string: response?.activity?._id };
    }

    case "createCv": {
      const payload = resolved["in-cv"] as CVSubmitPayload | undefined;
      if (!payload) throw new Error("Create CV requires a connected CV payload");
      const response = await submitCV(payload);
      return { exec: true, string: response?.cv?._id ?? response?._id };
    }

    default:
      return {};
  }
}

export async function executeWorkflow(nodes: Node[], edges: Edge[]): Promise<WorkflowExecutionResult> {
  const triggers = nodes.filter((node) => node.type === "manualTrigger");
  if (triggers.length === 0) {
    return { results: [], error: "Add a Manual Trigger node to run this workflow." };
  }

  const nodeOutputs = new Map<string, WorkflowNodeOutputs>();
  const results: WorkflowRunResult[] = [];
  const visited = new Set<string>();
  const queue = [...triggers.map((node) => node.id)];
  let templates: CVTemplateRecord[] = [];

  if (nodes.some((node) => node.type === "cvTemplate")) {
    templates = await fetchCVTemplates();
  }

  const resolving = new Set<string>();

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId || visited.has(nodeId)) continue;

    const node = nodes.find((item) => item.id === nodeId);
    if (!node?.type) continue;

    const hasExecInput = getNodeDefinition(node.type)?.inputs.some((input) => input.type === "exec");
    if (hasExecInput) {
      const execIncoming = getIncomingEdges(nodeId, edges).some(
        (edge) => edge.targetHandle === "in-exec" && edge.sourceHandle === "out-exec" && nodeOutputs.has(edge.source)
      );
      const isTrigger = node.type === "manualTrigger";
      if (!isTrigger && !execIncoming) {
        continue;
      }
    }

    visited.add(nodeId);

    try {
      await resolveUpstreamOutputs(nodeId, nodes, edges, nodeOutputs, templates, resolving);
      const outputs = nodeOutputs.get(nodeId) ?? (await executeNode(node, edges, nodeOutputs, templates));
      nodeOutputs.set(nodeId, outputs);

      if (["createNote", "createActivity", "createCv"].includes(node.type)) {
        results.push({
          nodeId,
          nodeType: node.type,
          success: true,
          message: `${getNodeDefinition(node.type)?.label ?? node.type} completed`,
          resourceId: outputs.string,
        });
      }

      for (const edge of getExecOutgoing(nodeId, edges)) {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Node execution failed";
      results.push({
        nodeId,
        nodeType: node.type,
        success: false,
        message,
      });
      return { results, error: message };
    }
  }

  const outputNodes = nodes.filter((node) => ["createNote", "createActivity", "createCv"].includes(node.type ?? ""));
  const executedOutputs = new Set(results.map((result) => result.nodeId));
  const missingOutputs = outputNodes.filter((node) => !executedOutputs.has(node.id));

  if (missingOutputs.length > 0) {
    return {
      results,
      error: "Some output nodes are not connected to the trigger chain. Wire exec sockets from Manual Trigger through builders to outputs.",
    };
  }

  if (results.length === 0) {
    return {
      results,
      error: "No output nodes ran. Connect Create Note, Create Activity, or Create CV nodes to the workflow.",
    };
  }

  return { results };
}
