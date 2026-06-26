import type { WorkflowNodeType } from "./engine/node-registry";

export function getDefaultNodeData(type: WorkflowNodeType): Record<string, unknown> {
  switch (type) {
    case "textInput":
      return { value: "" };
    case "dateTimeInput":
      return { value: new Date().toISOString().slice(0, 16) };
    case "tagInput":
      return { tagId: "" };
    case "noteBuilder":
      return { title: "", body: "", color: "#fde68a" };
    case "activityBuilder":
      return { title: "", start: new Date().toISOString().slice(0, 16), priority: "medium" };
    case "cvTemplate":
      return { templateId: "", name: "", job: "", tag: "" };
    case "mergeText":
      return { separator: " " };
    default:
      return {};
  }
}
