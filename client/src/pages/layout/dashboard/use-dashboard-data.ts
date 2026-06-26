import { mapNoteRecordToState, sortNotes } from "@/pages/layout/notes/note-mapper";
import { ActivityItem, ActivityStatus, DEFAULT_ACTIVITY_COLOR } from "@/pages/layout/activity/activity.types";
import { ActivityRecord, fetchActivities } from "@/shared/services/activity";
import { getNotes } from "@/shared/services/note";
import { getTags, TagRecord } from "@/shared/services/tag";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useMemo } from "react";

export type DashboardTagSlice = {
  tagId: string;
  label: string;
  color: string;
  count: number;
};

export type DashboardDayCount = {
  label: string;
  count: number;
};

export type DashboardStats = {
  totalNotes: number;
  notesToday: number;
  upcomingActivities: number;
  completedActivities: number;
};

export type DashboardInsight = {
  id: string;
  text: string;
};

function mapActivityRecord(record: ActivityRecord): ActivityItem {
  return {
    id: record._id,
    title: record.name ?? record.title,
    description: record.description,
    start: record.start,
    end: record.end,
    allDay: record.allDay ?? false,
    color: record.color ?? DEFAULT_ACTIVITY_COLOR,
    status: (record.status as ActivityStatus) ?? "todo",
    priority: record.priority ?? "medium",
    type: "event",
    location: record.location,
    tag: record.tag ? String(record.tag) : undefined,
    source: "api",
  };
}

function buildTagLookup(tags: TagRecord[]) {
  return new Map(tags.map((tag) => [tag._id, tag]));
}

function resolveTagLabel(tagId: string | undefined, tagById: Map<string, TagRecord>) {
  if (!tagId) return "Untagged";
  return tagById.get(tagId)?.name ?? "Unknown tag";
}

function resolveTagColor(tagId: string | undefined, tagById: Map<string, TagRecord>, fallbackIndex: number) {
  if (tagId) {
    const color = tagById.get(tagId)?.color;
    if (color) return color;
  }

  const chartVars = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
  return chartVars[fallbackIndex % chartVars.length];
}

export function useDashboardData() {
  const notesQuery = useQuery({ queryKey: ["notes"], queryFn: getNotes });
  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: getTags });
  const activitiesQuery = useQuery({
    queryKey: ["activities"],
    queryFn: () => fetchActivities(1, 200),
  });

  const tags = tagsQuery.data ?? [];
  const tagById = useMemo(() => buildTagLookup(tags), [tags]);

  const notes = useMemo(() => {
    const records = notesQuery.data ?? [];
    const mapped = records.map((note) => mapNoteRecordToState(note, tags));
    return sortNotes(mapped, "updated-desc");
  }, [notesQuery.data, tags]);

  const activities = useMemo(() => {
    const records = activitiesQuery.data?.activities ?? [];
    return records.map(mapActivityRecord);
  }, [activitiesQuery.data]);

  const recentNotes = useMemo(() => notes.slice(0, 5), [notes]);

  const upcomingActivities = useMemo(
    () =>
      activities
        .filter(
          (activity) =>
            moment(activity.start).isSameOrAfter(moment(), "day") &&
            activity.status !== "done" &&
            activity.status !== "cancelled"
        )
        .sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf())
        .slice(0, 6),
    [activities]
  );

  const activitiesByTag = useMemo(() => {
    const counts = new Map<string, number>();

    for (const activity of activities) {
      const key = activity.tag ?? "__untagged__";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const slices: DashboardTagSlice[] = Array.from(counts.entries())
      .map(([tagId, count], index) => ({
        tagId,
        label: tagId === "__untagged__" ? "Untagged" : resolveTagLabel(tagId, tagById),
        color: resolveTagColor(tagId === "__untagged__" ? undefined : tagId, tagById, index),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return slices;
  }, [activities, tagById]);

  const notesPerDay = useMemo(() => {
    const days: DashboardDayCount[] = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = moment().subtract(offset, "days").startOf("day");
      const count = (notesQuery.data ?? []).filter((note) => moment(note.createdAt).isSame(day, "day")).length;
      days.push({ label: day.format("ddd"), count });
    }

    return days;
  }, [notesQuery.data]);

  const stats = useMemo<DashboardStats>(() => {
    const today = moment().startOf("day");
    const notesToday = (notesQuery.data ?? []).filter(
      (note) => moment(note.createdAt).isSame(today, "day") || moment(note.updatedAt).isSame(today, "day")
    ).length;

    return {
      totalNotes: notes.length,
      notesToday,
      upcomingActivities: upcomingActivities.length,
      completedActivities: activities.filter((activity) => activity.status === "done").length,
    };
  }, [activities, notes.length, notesQuery.data, upcomingActivities.length]);

  const insights = useMemo<DashboardInsight[]>(() => {
    const results: DashboardInsight[] = [];
    const topActivityTag = activitiesByTag[0];
    const busiestNoteDay = [...notesPerDay].sort((a, b) => b.count - a.count)[0];
    const weekActivities = activities.filter((activity) =>
      moment(activity.start).isBetween(moment().startOf("week"), moment().endOf("week"), "day", "[]")
    );

    if (topActivityTag && topActivityTag.count > 0) {
      results.push({
        id: "top-tag",
        text: `${topActivityTag.label} is your most active tag with ${topActivityTag.count} ${topActivityTag.count === 1 ? "activity" : "activities"}.`,
      });
    }

    if (busiestNoteDay && busiestNoteDay.count > 0) {
      results.push({
        id: "busiest-day",
        text: `You created the most notes on ${busiestNoteDay.label} this week (${busiestNoteDay.count}).`,
      });
    }

    if (weekActivities.length > 0) {
      results.push({
        id: "week-activities",
        text: `${weekActivities.length} ${weekActivities.length === 1 ? "activity is" : "activities are"} scheduled this week.`,
      });
    }

    if (results.length === 0) {
      results.push({
        id: "empty",
        text: "Start by creating a note or scheduling an activity to see patterns here.",
      });
    }

    return results.slice(0, 3);
  }, [activities, activitiesByTag, notesPerDay]);

  return {
    isLoading: notesQuery.isLoading || tagsQuery.isLoading || activitiesQuery.isLoading,
    isError: notesQuery.isError || tagsQuery.isError || activitiesQuery.isError,
    recentNotes,
    upcomingActivities,
    activitiesByTag,
    notesPerDay,
    stats,
    insights,
    tagById,
  };
}
