import { formatAppDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { CalendarClock, MapPin, Sparkles } from "lucide-react";
import moment from "moment";
import React, { useMemo } from "react";
import { ActivityItem, PRIORITY_LABELS } from "./activity.types";
import "./activity-upcoming.scss";

function getRelativeLabel(start: string) {
  const day = moment(start).startOf("day");
  const today = moment().startOf("day");
  const diff = day.diff(today, "days");

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return day.format("dddd");
  return null;
}

function getScheduleLabel(activity: ActivityItem) {
  if (activity.allDay) return "All day";

  return formatAppDate(activity.start, true);
}

export default function ActivityUpcomingList({
  activities,
  onSelect,
}: {
  activities: ActivityItem[];
  onSelect: (activity: ActivityItem) => void;
}) {
  const upcoming = useMemo(
    () =>
      activities
        .filter((item) => moment(item.start).isSameOrAfter(moment(), "day"))
        .sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf())
        .slice(0, 6),
    [activities],
  );

  return (
    <section className="activity-upcoming">
      <header className="activity-upcoming__header">
        <div>
          <span className="activity-upcoming__header-icon" aria-hidden="true">
            <CalendarClock className="h-4 w-4" />
          </span>
          <h3 className="activity-upcoming__title">Upcoming</h3>
          <p className="activity-upcoming__subtitle">Your next scheduled moments</p>
        </div>
        <span className="activity-upcoming__count">{upcoming.length}</span>
      </header>

      {upcoming.length === 0 ?
        <div className="activity-upcoming__empty">
          <span className="activity-upcoming__empty-icon" aria-hidden="true">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="activity-upcoming__empty-title">Nothing scheduled yet</p>
          <p className="activity-upcoming__empty-text">
            Pick a date on the calendar or use the picker to plan your next activity.
          </p>
        </div>
      : <ul className="activity-upcoming__list">
          {upcoming.map((activity) => {
            const start = moment(activity.start);
            const relativeLabel = getRelativeLabel(activity.start);
            const isToday = start.isSame(moment(), "day");

            return (
              <li key={activity.id} className="activity-upcoming__item">
                <button
                  type="button"
                  onClick={() => onSelect(activity)}
                  className={cn("activity-upcoming__card", isToday && "activity-upcoming__card--today")}>
                  <div className="activity-upcoming__date">
                    <span className="activity-upcoming__date-day">{start.format("D")}</span>
                    <span className="activity-upcoming__date-month">{start.format("MMM")}</span>
                  </div>

                  <div className="activity-upcoming__body">
                    <div className="activity-upcoming__meta-row">
                      {relativeLabel ?
                        <span className="activity-upcoming__relative">{relativeLabel}</span>
                      : null}
                      <span className="activity-upcoming__time">{getScheduleLabel(activity)}</span>
                      {activity.source === "holiday" ?
                        <span className="activity-upcoming__badge activity-upcoming__badge--holiday">Holiday</span>
                      : <span className="activity-upcoming__badge activity-upcoming__badge--priority">
                          {PRIORITY_LABELS[activity.priority]}
                        </span>
                      }
                    </div>

                    <span className="activity-upcoming__title-text">{activity.title}</span>

                    {activity.location ?
                      <div className="activity-upcoming__details">
                        <MapPin className="activity-upcoming__details-icon" />
                        <span className="activity-upcoming__details-text">{activity.location}</span>
                      </div>
                    : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      }
    </section>
  );
}
