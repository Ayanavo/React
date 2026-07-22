import {
  ActivityItem,
  ActivityPriority,
  ActivityStatus,
  DEFAULT_ACTIVITY_COLOR,
} from "@/pages/layout/activity/activity.types";
import { ActivityRecord, fetchActivities } from "@/shared/services/activity";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useMemo } from "react";

function mapApiActivities(records: ActivityRecord[]): ActivityItem[] {
  return records.map((record) => ({
    id: record._id,
    title: record.name ?? record.title,
    description: record.description,
    start: record.start,
    end: record.end,
    allDay: record.allDay ?? false,
    color: record.color ?? DEFAULT_ACTIVITY_COLOR,
    status: (record.status as ActivityStatus) ?? "todo",
    priority: (record.priority as ActivityPriority) ?? "medium",
    type: "event",
    location: record.location,
    tag: record.tag ? String(record.tag) : undefined,
    source: "api",
  }));
}

function isActionable(activity: ActivityItem) {
  return activity.status !== "done" && activity.status !== "cancelled";
}

export function useActivityNotifications(enabled = true) {
  const apiQuery = useQuery({
    queryKey: ["activities"],
    queryFn: () => fetchActivities(1, 100),
    enabled,
  });

  const activities = useMemo(() => mapApiActivities(apiQuery.data?.activities ?? []), [apiQuery.data]);

  const grouped = useMemo(() => {
    const today = moment().startOf("day");

    const overdue = activities
      .filter((item) => isActionable(item) && moment(item.start).isBefore(today, "day"))
      .sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf());

    const todayItems = activities
      .filter((item) => moment(item.start).isSame(today, "day"))
      .sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf());

    const upcoming = activities
      .filter((item) => isActionable(item) && moment(item.start).isAfter(today, "day"))
      .sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf())
      .slice(0, 10);

    const unreadCount = overdue.length + todayItems.filter(isActionable).length;

    return { overdue, today: todayItems, upcoming, unreadCount };
  }, [activities]);

  return {
    ...grouped,
    isLoading: apiQuery.isLoading,
    isEmpty: grouped.overdue.length === 0 && grouped.today.length === 0 && grouped.upcoming.length === 0,
  };
}
