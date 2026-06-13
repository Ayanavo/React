import { formatAppDate } from "@/lib/date-format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import moment from "moment";
import React, { useMemo } from "react";
import "./activity-calendar.scss";

export type CalendarView = "dayGridMonth" | "dayGridWeek" | "dayGridDay" | "dayGridYear";

export type CalendarEvent = {
  id?: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
};

type ActivityCalendarProps = {
  view: CalendarView;
  focusDate: Date;
  events: CalendarEvent[];
  focusedEventId?: string | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function eventOccursOnDay(event: CalendarEvent, day: moment.Moment) {
  const start = moment(event.start).startOf("day");

  if (!event.end) {
    return day.isSame(start, "day");
  }

  if (event.allDay) {
    const end = moment(event.end).startOf("day");
    return day.isSameOrAfter(start, "day") && day.isBefore(end, "day");
  }

  const end = moment(event.end).startOf("day");
  return day.isSameOrAfter(start, "day") && day.isSameOrBefore(end, "day");
}

function getEventsForDay(events: CalendarEvent[], day: moment.Moment) {
  return events.filter((event) => eventOccursOnDay(event, day));
}

function getMonthDays(focus: moment.Moment) {
  const start = focus.clone().startOf("month").startOf("week");
  const end = focus.clone().endOf("month").endOf("week");
  const days: moment.Moment[] = [];
  const current = start.clone();

  while (current.isSameOrBefore(end, "day")) {
    days.push(current.clone());
    current.add(1, "day");
  }

  return days;
}

function getWeekDays(focus: moment.Moment) {
  const start = focus.clone().startOf("week");
  return Array.from({ length: 7 }, (_, index) => start.clone().add(index, "day"));
}

function CalendarTooltip({ content, children }: { content: React.ReactNode; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
}

function EventChip({
  event,
  isFocused,
  onClick,
}: {
  event: CalendarEvent;
  isFocused?: boolean;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <CalendarTooltip content={event.title}>
      <button
        type="button"
        onClick={onClick}
        className={cn("activity-calendar__event", isFocused && "activity-calendar__event--focused")}
        style={{ backgroundColor: event.color ?? "hsl(var(--primary))" }}>
        <span className="activity-calendar__event-label">{event.title}</span>
      </button>
    </CalendarTooltip>
  );
}

function MonthView({ focusDate, events, focusedEventId, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
  const focus = moment(focusDate);
  const days = useMemo(() => getMonthDays(focus), [focusDate]);

  return (
    <div className="activity-calendar__month">
      <div className="activity-calendar__weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day} className="activity-calendar__weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="activity-calendar__grid">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          const isToday = day.isSame(moment(), "day");
          const isCurrentMonth = day.isSame(focus, "month");
          const visibleEvents = dayEvents.slice(0, 3);
          const hiddenCount = dayEvents.length - visibleEvents.length;

          return (
            <button
              key={day.format("YYYY-MM-DD")}
              type="button"
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "activity-calendar__cell",
                !isCurrentMonth && "activity-calendar__cell--outside",
                isToday && "activity-calendar__cell--today",
              )}
              onClick={() => onDateClick(day.toDate())}
            >
              <span className={cn("activity-calendar__day-number", isToday && "activity-calendar__day-number--today")}>
                {day.format("D")}
              </span>

              <div className="activity-calendar__events">
                {visibleEvents.map((event) => (
                  <EventChip
                    key={event.id ?? `${event.title}-${event.start}`}
                    event={event}
                    isFocused={Boolean(focusedEventId && event.id === focusedEventId)}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onEventClick(event, day.toDate());
                    }}
                  />
                ))}
                {hiddenCount > 0 && (
                  <CalendarTooltip
                    content={
                      <div className="flex max-w-56 flex-col gap-1">
                        {dayEvents.slice(3).map((event) => (
                          <span key={event.id ?? `${event.title}-${event.start}`}>{event.title}</span>
                        ))}
                      </div>
                    }>
                    <span className="activity-calendar__more">+{hiddenCount} more</span>
                  </CalendarTooltip>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ focusDate, events, focusedEventId, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
  const days = useMemo(() => getWeekDays(moment(focusDate)), [focusDate]);

  return (
    <div className="activity-calendar__week">
      <div className="activity-calendar__week-header">
        {days.map((day) => {
          const isToday = day.isSame(moment(), "day");

          return (
            <button
              key={day.format("YYYY-MM-DD")}
              type="button"
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "activity-calendar__week-day-header",
                isToday && "activity-calendar__week-day-header--today"
              )}
              onClick={() => onDateClick(day.toDate())}>
              <span className="activity-calendar__week-day-name">{day.format("ddd")}</span>
              <span className={cn("activity-calendar__week-day-date", isToday && "activity-calendar__week-day-date--today")}>
                {day.format("D")}
              </span>
              {isToday ?
                <span className="activity-calendar__today-label">Today</span>
              : null}
            </button>
          );
        })}
      </div>

      <div className="activity-calendar__week-body">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          const isToday = day.isSame(moment(), "day");

          return (
            <button
              key={day.format("YYYY-MM-DD")}
              type="button"
              aria-current={isToday ? "date" : undefined}
              className={cn("activity-calendar__week-column", isToday && "activity-calendar__week-column--today")}
              onClick={() => onDateClick(day.toDate())}
            >
              {dayEvents.length === 0 ?
                <span className="activity-calendar__empty-slot">Add event</span>
              : dayEvents.map((event) => (
                  <EventChip
                    key={event.id ?? `${event.title}-${event.start}`}
                    event={event}
                    isFocused={Boolean(focusedEventId && event.id === focusedEventId)}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onEventClick(event, day.toDate());
                    }}
                  />
                ))
              }
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayView({ focusDate, events, focusedEventId, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
  const day = moment(focusDate);
  const dayEvents = getEventsForDay(events, day);
  const isToday = day.isSame(moment(), "day");

  return (
    <div className="activity-calendar__day">
      <button
        type="button"
        aria-current={isToday ? "date" : undefined}
        className={cn("activity-calendar__day-banner", isToday && "activity-calendar__day-banner--today")}
        onClick={() => onDateClick(day.toDate())}>
        <span className="activity-calendar__day-banner-weekday">
          {isToday ? "Today" : day.format("dddd")}
        </span>
        <span className={cn("activity-calendar__day-banner-date", isToday && "activity-calendar__day-banner-date--today")}>
          {formatAppDate(day.toDate())}
        </span>
      </button>

      <div className="activity-calendar__day-events" onClick={() => onDateClick(day.toDate())}>
        {dayEvents.length === 0 ?
          <span className="activity-calendar__empty-day">No events scheduled. Click to add one.</span>
        : dayEvents.map((event) => (
            <button
              key={event.id ?? `${event.title}-${event.start}`}
              type="button"
              className={cn(
                "activity-calendar__day-event-card",
                focusedEventId && event.id === focusedEventId && "activity-calendar__day-event-card--focused",
              )}
              onClick={(clickEvent) => {
                clickEvent.stopPropagation();
                onEventClick(event, day.toDate());
              }}
            >
              <span
                className="activity-calendar__day-event-dot"
                style={{ backgroundColor: event.color ?? "hsl(var(--primary))" }}
              />
              <span className="activity-calendar__day-event-content">
                <span className="activity-calendar__day-event-title">{event.title}</span>
                <span className="activity-calendar__day-event-meta">
                  {event.allDay ? "All day" : formatAppDate(event.start, true)}
                </span>
              </span>
            </button>
          ))
        }
      </div>
    </div>
  );
}

function MiniMonth({
  month,
  events,
  focusedEventId,
  onDateClick,
  onEventClick,
}: {
  month: moment.Moment;
  events: CalendarEvent[];
  focusedEventId?: string | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
}) {
  const days = useMemo(() => getMonthDays(month), [month]);
  const isCurrentMonth = month.isSame(moment(), "month");

  return (
    <div className={cn("activity-calendar__year-month", isCurrentMonth && "activity-calendar__year-month--current")}>
      <div className="activity-calendar__year-month-title">{month.format("MMMM")}</div>
      <div className="activity-calendar__year-weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day.charAt(0)}</span>
        ))}
      </div>
      <div className="activity-calendar__year-grid">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          const isToday = day.isSame(moment(), "day");
          const inMonth = day.isSame(month, "month");

          const hasFocusedEvent = Boolean(focusedEventId && dayEvents.some((event) => event.id === focusedEventId));

          const dayButton = (
            <button
              type="button"
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "activity-calendar__year-day",
                !inMonth && "activity-calendar__year-day--outside",
                isToday && "activity-calendar__year-day--today",
                dayEvents.length > 0 && "activity-calendar__year-day--has-events",
                hasFocusedEvent && "activity-calendar__year-day--focused-event",
              )}
              onClick={() => {
                if (dayEvents.length === 1) {
                  onEventClick(dayEvents[0], day.toDate());
                  return;
                }

                onDateClick(day.toDate());
              }}>
              <span className={cn("activity-calendar__year-day-number", isToday && "activity-calendar__year-day-number--today")}>
                {day.format("D")}
              </span>
              {dayEvents.length > 0 && (
                <span className="activity-calendar__year-dots">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id ?? `${event.title}-${event.start}`}
                      className="activity-calendar__year-dot"
                      style={{ backgroundColor: event.color ?? "hsl(var(--primary))" }}
                    />
                  ))}
                </span>
              )}
            </button>
          );

          if (dayEvents.length === 0) {
            return <React.Fragment key={day.format("YYYY-MM-DD")}>{dayButton}</React.Fragment>;
          }

          return (
            <CalendarTooltip
              key={day.format("YYYY-MM-DD")}
              content={
                <div className="flex max-w-56 flex-col gap-1">
                  {dayEvents.map((event) => (
                    <span key={event.id ?? `${event.title}-${event.start}`}>{event.title}</span>
                  ))}
                </div>
              }>
              {dayButton}
            </CalendarTooltip>
          );
        })}
      </div>
    </div>
  );
}

function YearView({ focusDate, events, focusedEventId, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
  const year = moment(focusDate).year();
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => moment({ year, month: index, day: 1 })),
    [year],
  );

  return (
    <div className="activity-calendar__year">
      {months.map((month) => (
        <MiniMonth
          key={month.format("YYYY-MM")}
          month={month}
          events={events}
          focusedEventId={focusedEventId}
          onDateClick={onDateClick}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
}

export default function ActivityCalendar({
  view,
  focusDate,
  events,
  focusedEventId,
  onDateClick,
  onEventClick,
}: ActivityCalendarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="activity-calendar">
        {view === "dayGridMonth" && (
          <MonthView
            focusDate={focusDate}
            events={events}
            focusedEventId={focusedEventId}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
        {view === "dayGridWeek" && (
          <WeekView
            focusDate={focusDate}
            events={events}
            focusedEventId={focusedEventId}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
        {view === "dayGridDay" && (
          <DayView
            focusDate={focusDate}
            events={events}
            focusedEventId={focusedEventId}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
        {view === "dayGridYear" && (
          <YearView
            focusDate={focusDate}
            events={events}
            focusedEventId={focusedEventId}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
