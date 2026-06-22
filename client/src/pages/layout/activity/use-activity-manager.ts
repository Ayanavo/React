import {
    ActivityPayload,
    ActivityRecord,
    createActivity as createActivityApi,
    deleteActivity as deleteActivityApi,
    fetchActivities,
    GoogleCalendarEvent,
    updateActivity as updateActivityApi,
    useHolidayEvents,
} from "@/shared/services/activity";
import { getTags } from "@/shared/services/tag";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useCallback, useMemo } from "react";
import { CalendarEvent, CalendarView } from "./activity-calendar";
import {
    ActivityFormValues,
    ActivityItem,
    ActivityPriority,
    ActivitySource,
    ActivityStatus,
    ActivityType,
    DEFAULT_ACTIVITY_COLOR
} from "./activity.types";

function formValuesToPayload(values: ActivityFormValues): ActivityPayload {
  const start = moment(values.date);
  const end = values.endDate ? moment(values.endDate) : start.clone().add(1, "hour");

  const payload: ActivityPayload = {
    title: values.title.trim(),
    description: values.description?.trim() ?? "",
    start: start.toISOString(),
    end: values.allDay ? start.clone().add(1, "day").format("YYYY-MM-DD") : end.toISOString(),
    allDay: values.allDay,
    color: values.color || DEFAULT_ACTIVITY_COLOR,
    priority: values.priority,
    location: values.location?.trim() ?? "",
    tag: values.tag || undefined,
  };

  if (values.recurring && values.recurrenceInterval && values.recurrenceEndDate) {
    payload.recurrence = {
      enabled: true,
      interval: values.recurrenceInterval,
      count: Math.min(99, Math.max(1, values.recurrenceCount ?? 1)),
      endDate: moment(values.recurrenceEndDate).toISOString(),
    };
  }

  return payload;
}

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
    type: "event" as ActivityType,
    location: record.location,
    tag: record.tag ? String(record.tag) : undefined,
    source: "api" as ActivitySource,
  }));
}

function activityToFormValues(activity: ActivityItem | null, fallbackDate: Date): ActivityFormValues {
  if (!activity) {
    return {
      title: "",
      description: "",
      date: fallbackDate,
      allDay: false,
      color: DEFAULT_ACTIVITY_COLOR,
      priority: "medium",
      location: "",
      tag: "",
      recurring: false,
      recurrenceCount: 1,
      recurrenceInterval: "month",
      recurrenceEndDate: moment(fallbackDate).add(1, "month").toDate(),
    };
  }

  return {
    title: activity.title,
    description: activity.description ?? "",
    date: new Date(activity.start),
    endDate: activity.end ? new Date(activity.end) : undefined,
    allDay: activity.allDay ?? false,
    color: activity.color ?? DEFAULT_ACTIVITY_COLOR,
    priority: activity.priority,
    location: activity.location ?? "",
    tag: activity.tag ?? "",
  };
}

function activityToCalendarEvent(
  activity: ActivityItem,
  tagNameById: Map<string, string> = new Map()
): CalendarEvent {
  const tagId = activity.tag?.trim();

  return {
    id: activity.id,
    title: activity.title,
    start: activity.allDay ? moment(activity.start).format("YYYY-MM-DD") : activity.start,
    end: activity.end,
    allDay: activity.allDay,
    color: activity.color,
    location: activity.location?.trim() || undefined,
    tagName: tagId ? tagNameById.get(tagId) ?? tagId : undefined,
  };
}

function mapHolidayItems(items: GoogleCalendarEvent[]): ActivityItem[] {
  return items.map((item) => {
    const isAllDay = Boolean(item.start.date);
    const start = item.start.date ?? item.start.dateTime ?? "";
    const end = item.end?.date ?? item.end?.dateTime;

    return {
      id: `holiday-${item.id}`,
      title: item.summary,
      description: item.description,
      start,
      end,
      allDay: isAllDay,
      color: "#0284c7",
      status: "done",
      priority: "low",
      type: "holiday",
      source: "holiday" as ActivitySource,
    };
  });
}

export function useActivityManager(focusDate: Date, calendarView: CalendarView) {
  const queryClient = useQueryClient();

  const holidaysQuery = useHolidayEvents(focusDate, calendarView);
  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });
  const apiQuery = useQuery({
    queryKey: ["activities"],
    queryFn: () => fetchActivities(1, 100),
  });

  const holidayActivities = useMemo(() => mapHolidayItems(holidaysQuery.data ?? []), [holidaysQuery.data]);

  const apiActivities = useMemo(() => {
    const records = apiQuery.data?.activities ?? [];
    return mapApiActivities(records);
  }, [apiQuery.data]);

  const activities = useMemo(() => [...apiActivities, ...holidayActivities], [apiActivities, holidayActivities]);

  const tagNameById = useMemo(
    () => new Map((tagsQuery.data ?? []).map((tag) => [tag._id, tag.name])),
    [tagsQuery.data]
  );

  const calendarEvents = useMemo(
    () => activities.map((activity) => activityToCalendarEvent(activity, tagNameById)),
    [activities, tagNameById]
  );

  const stats = useMemo(() => {
    const trackable = activities.filter((item) => item.source !== "holiday");
    const today = moment().startOf("day");

    return {
      total: trackable.length,
      today: trackable.filter((item) => moment(item.start).isSame(today, "day")).length,
      completed: trackable.filter((item) => item.status === "done").length,
      overdue: trackable.filter(
        (item) => item.status !== "done" && item.status !== "cancelled" && moment(item.start).isBefore(today, "day")
      ).length,
    };
  }, [activities]);

  const refreshActivities = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ["activities"] });
  }, [queryClient]);

  const upsertActivityInCache = useCallback(
    (activity: ActivityRecord) => {
      queryClient.setQueryData<{ activities: ActivityRecord[] }>(["activities"], (current) => {
        const activities = current?.activities ?? [];
        const next = [activity, ...activities.filter((item) => item._id !== activity._id)];
        return { activities: next };
      });
    },
    [queryClient]
  );

  const createActivity = useCallback(
    async (values: ActivityFormValues) => {
      const response = await createActivityApi(formValuesToPayload(values));
      const createdActivities = response.activities?.length ? response.activities : [response.activity];

      createdActivities.forEach((activity) => upsertActivityInCache(activity));
      await refreshActivities();
      return {
        activities: mapApiActivities(createdActivities),
        message: response.message,
      };
    },
    [refreshActivities, upsertActivityInCache]
  );

  const updateActivity = useCallback(
    async (id: string, values: ActivityFormValues) => {
      const existing = apiActivities.find((item) => item.id === id);
      if (!existing || existing.source === "holiday") return null;

      const response = await updateActivityApi(id, formValuesToPayload(values));
      upsertActivityInCache(response.activity);
      await refreshActivities();
      return {
        activity: mapApiActivities([response.activity])[0],
        message: response.message,
      };
    },
    [apiActivities, refreshActivities, upsertActivityInCache]
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      const existing = apiActivities.find((item) => item.id === id);
      if (!existing || existing.source === "holiday") return null;

      const response = await deleteActivityApi(id);
      queryClient.setQueryData<{ activities: ActivityRecord[] }>(["activities"], (current) => ({
        activities: (current?.activities ?? []).filter((item) => item._id !== id),
      }));
      await refreshActivities();
      return { message: response.message };
    },
    [apiActivities, queryClient, refreshActivities]
  );

  const findActivity = useCallback((id?: string) => activities.find((item) => item.id === id) ?? null, [activities]);

  return {
    activities,
    calendarEvents,
    stats,
    isLoading: holidaysQuery.isLoading || apiQuery.isLoading,
    createActivity,
    updateActivity,
    deleteActivity,
    findActivity,
    activityToFormValues,
    activityToCalendarEvent,
  };
}

export { activityToCalendarEvent, activityToFormValues };
