import moment from "moment";
import type { WorkflowNodeType } from "./engine/node-registry";

export function getDefaultNodeData(type: WorkflowNodeType): Record<string, unknown> {
  switch (type) {
    case "textInput":
      return { value: "" };
    case "dateTimeInput":
      return { value: moment().format("YYYY-MM-DDTHH:mm") };
    case "tagInput":
      return { tagId: "" };
    case "noteBuilder":
      return { title: "", body: "", color: "#fde68a" };
    case "activityBuilder":
      return { title: "", start: moment().format("YYYY-MM-DDTHH:mm"), priority: "medium" };
    case "cvTemplate":
      return { templateId: "", name: "", job: "", tag: "" };
    case "mergeText":
      return { separator: " " };
    default:
      return {};
  }
}
