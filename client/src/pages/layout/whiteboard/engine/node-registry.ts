import type { ActivityPayload } from "@/shared/services/activity";
import type { CVSubmitPayload } from "@/shared/services/cvbuilder";
import type { NotePayload } from "@/shared/services/note";
import type { SocketDefinition } from "./socket-types";
import { registerSocketRegistry } from "./socket-types";

export type WorkflowNodeType =
  | "manualTrigger"
  | "textInput"
  | "dateTimeInput"
  | "tagInput"
  | "noteBuilder"
  | "activityBuilder"
  | "cvTemplate"
  | "mergeText"
  | "createNote"
  | "createActivity"
  | "createCv";

export type NodeCategory = "trigger" | "input" | "builder" | "transform" | "output";

export type NodePaletteItem = {
  type: WorkflowNodeType;
  label: string;
  category: NodeCategory;
  description: string;
};

export type NodeDefinition = {
  type: WorkflowNodeType;
  label: string;
  category: NodeCategory;
  inputs: SocketDefinition[];
  outputs: SocketDefinition[];
};

export type WorkflowNodeOutputs = {
  exec?: boolean;
  string?: string;
  date?: string;
  tag?: string;
  notePayload?: NotePayload;
  activityPayload?: ActivityPayload;
  cvPayload?: CVSubmitPayload;
};

export const NODE_DEFINITIONS: Record<WorkflowNodeType, NodeDefinition> = {
  manualTrigger: {
    type: "manualTrigger",
    label: "Manual Trigger",
    category: "trigger",
    inputs: [],
    outputs: [{ id: "out-exec", label: "Run", type: "exec" }],
  },
  textInput: {
    type: "textInput",
    label: "Text",
    category: "input",
    inputs: [],
    outputs: [{ id: "out-string", label: "Text", type: "string" }],
  },
  dateTimeInput: {
    type: "dateTimeInput",
    label: "Date & Time",
    category: "input",
    inputs: [],
    outputs: [{ id: "out-date", label: "Date", type: "date" }],
  },
  tagInput: {
    type: "tagInput",
    label: "Tag",
    category: "input",
    inputs: [],
    outputs: [{ id: "out-tag", label: "Tag", type: "tag" }],
  },
  noteBuilder: {
    type: "noteBuilder",
    label: "Note Builder",
    category: "builder",
    inputs: [
      { id: "in-exec", label: "Run", type: "exec" },
      { id: "in-title", label: "Title", type: "string" },
      { id: "in-body", label: "Body", type: "string" },
      { id: "in-color", label: "Color", type: "string" },
      { id: "in-tag", label: "Tag", type: "tag" },
    ],
    outputs: [
      { id: "out-exec", label: "Run", type: "exec" },
      { id: "out-note", label: "Note", type: "notePayload" },
    ],
  },
  activityBuilder: {
    type: "activityBuilder",
    label: "Activity Builder",
    category: "builder",
    inputs: [
      { id: "in-exec", label: "Run", type: "exec" },
      { id: "in-title", label: "Title", type: "string" },
      { id: "in-start", label: "Start", type: "date" },
      { id: "in-end", label: "End", type: "date" },
      { id: "in-tag", label: "Tag", type: "tag" },
    ],
    outputs: [
      { id: "out-exec", label: "Run", type: "exec" },
      { id: "out-activity", label: "Activity", type: "activityPayload" },
    ],
  },
  cvTemplate: {
    type: "cvTemplate",
    label: "CV Template",
    category: "builder",
    inputs: [
      { id: "in-exec", label: "Run", type: "exec" },
      { id: "in-name", label: "Name", type: "string" },
      { id: "in-job", label: "Job", type: "string" },
    ],
    outputs: [
      { id: "out-exec", label: "Run", type: "exec" },
      { id: "out-cv", label: "CV", type: "cvPayload" },
    ],
  },
  mergeText: {
    type: "mergeText",
    label: "Merge Text",
    category: "transform",
    inputs: [
      { id: "in-a", label: "A", type: "string" },
      { id: "in-b", label: "B", type: "string" },
    ],
    outputs: [{ id: "out-string", label: "Text", type: "string" }],
  },
  createNote: {
    type: "createNote",
    label: "Create Note",
    category: "output",
    inputs: [
      { id: "in-exec", label: "Run", type: "exec" },
      { id: "in-note", label: "Note", type: "notePayload" },
    ],
    outputs: [{ id: "out-exec", label: "Done", type: "exec" }],
  },
  createActivity: {
    type: "createActivity",
    label: "Create Activity",
    category: "output",
    inputs: [
      { id: "in-exec", label: "Run", type: "exec" },
      { id: "in-activity", label: "Activity", type: "activityPayload" },
    ],
    outputs: [{ id: "out-exec", label: "Done", type: "exec" }],
  },
  createCv: {
    type: "createCv",
    label: "Create CV",
    category: "output",
    inputs: [
      { id: "in-exec", label: "Run", type: "exec" },
      { id: "in-cv", label: "CV", type: "cvPayload" },
    ],
    outputs: [{ id: "out-exec", label: "Done", type: "exec" }],
  },
};

export const NODE_PALETTE: NodePaletteItem[] = Object.values(NODE_DEFINITIONS).map((definition) => ({
  type: definition.type,
  label: definition.label,
  category: definition.category,
  description: `${definition.label} node`,
}));

const socketRegistry = Object.fromEntries(
  Object.entries(NODE_DEFINITIONS).map(([type, definition]) => [
    type,
    { inputs: definition.inputs, outputs: definition.outputs },
  ])
);

registerSocketRegistry(socketRegistry);

export function getNodeDefinition(type: string | undefined) {
  if (!type) return null;
  return NODE_DEFINITIONS[type as WorkflowNodeType] ?? null;
}
