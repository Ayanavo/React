import { formatAppDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { ActivityItem, PRIORITY_LABELS } from "@/pages/layout/activity/activity.types";
import { CalendarClock } from "lucide-react";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { ActivityListSkeleton } from "./dashboard-skeletons";

type UpcomingActivitiesListProps = {
  activities: ActivityItem[];
  tagById: Map<string, { name: string; color: string }>;
  isLoading?: boolean;
};

function getRelativeLabel(start: string) {
  const day = moment(start).startOf("day");
  const today = moment().startOf("day");
  const diff = day.diff(today, "days");

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return day.format("ddd");
  return null;
}

function getScheduleLabel(activity: ActivityItem) {
  if (activity.allDay) return "All day";
  return formatAppDate(activity.start, true);
}

const UpcomingActivitiesList: React.FC<UpcomingActivitiesListProps> = ({ activities, tagById, isLoading }) => {
  if (isLoading) {
    return <ActivityListSkeleton count={4} />;
  }

  if (activities.length === 0) {
    return (
      <div className="dashboard__empty">
        <CalendarClock className="h-5 w-5 opacity-50" />
        <p>No upcoming activities</p>
        <Link to="/activities" className="text-sm font-medium text-primary hover:underline">
          Open activities
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard__list">
      {activities.map((activity) => {
        const start = moment(activity.start);
        const relativeLabel = getRelativeLabel(activity.start);
        const isToday = start.isSame(moment(), "day");
        const tag = activity.tag ? tagById.get(activity.tag) : undefined;

        return (
          <Link
            key={activity.id}
            to="/activities"
            className={cn("dashboard__list-item", isToday && "dashboard__list-item--today")}>
            <div className="dashboard__date-chip">
              <span className="text-lg font-semibold leading-none text-foreground">{start.format("D")}</span>
              <span className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{start.format("MMM")}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {relativeLabel ?
                  <span className="text-xs font-medium text-primary">{relativeLabel}</span>
                : null}
                <span className="text-xs text-muted-foreground">{getScheduleLabel(activity)}</span>
                <span className="dashboard__tag">{PRIORITY_LABELS[activity.priority]}</span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-foreground">{activity.title}</p>
              {tag ?
                <span
                  className="dashboard__tag mt-1"
                  style={{ borderColor: `${tag.color}55`, backgroundColor: `${tag.color}22` }}>
                  <span className="dashboard__tag-dot" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </span>
              : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default UpcomingActivitiesList;
