import type { ActivityPriority } from "@/pages/layout/activity/activity.types";
import type { ActivityPayload } from "@/shared/services/activity";
import moment from "moment";

export type ActivityBuilderInput = {
  title: string;
  description?: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  priority?: ActivityPriority;
  location?: string;
  tag?: string;
};

const DEFAULT_ACTIVITY_COLOR = "#6366f1";

export function buildActivityPayload(input: ActivityBuilderInput): ActivityPayload {
  const start = moment(input.start);
  const end = input.end ? moment(input.end) : start.clone().add(1, "hour");

  return {
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    start: start.toISOString(),
    end: input.allDay ? start.clone().add(1, "day").format("YYYY-MM-DD") : end.toISOString(),
    allDay: input.allDay ?? false,
    color: input.color || DEFAULT_ACTIVITY_COLOR,
    priority: input.priority ?? "medium",
    location: input.location?.trim() ?? "",
    tag: input.tag || undefined,
  };
}
