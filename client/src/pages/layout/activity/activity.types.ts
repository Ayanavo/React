export type ActivityStatus = "todo" | "in_progress" | "done" | "cancelled";
export type ActivityPriority = "low" | "medium" | "high" | "urgent";
export type ActivityType = "task" | "event" | "meeting" | "holiday";
export type ActivitySource = "local" | "api" | "holiday";

export type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  type: ActivityType;
  location?: string;
  tag?: string;
  source: ActivitySource;
};

export type RecurrenceInterval = "day" | "month" | "year";

export type ActivityFormValues = {
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  allDay: boolean;
  color: string;
  priority: ActivityPriority;
  location?: string;
  tag?: string;
  recurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceEndDate?: Date;
};

export const RECURRENCE_INTERVAL_LABELS: Record<RecurrenceInterval, string> = {
  day: "Day",
  month: "Month",
  year: "Year",
};

export const ACTIVITY_STORAGE_KEY = "activity-manager-items";

export const STATUS_LABELS: Record<ActivityStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<ActivityPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<ActivityPriority, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  urgent: "#ef4444",
};

export const TYPE_LABELS: Record<ActivityType, string> = {
  task: "Task",
  event: "Event",
  meeting: "Meeting",
  holiday: "Holiday",
};

export const DEFAULT_ACTIVITY_COLOR = "#6366f1";
