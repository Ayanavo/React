import { formatAppDate } from "@/lib/date-format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
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
  location?: string;
  tagName?: string;
};

type ActivityCalendarProps = {
  view: CalendarView;
  focusDate: Date;
  events: CalendarEvent[];
  focusedDate?: Date | null;
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
      <TooltipContent className="border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function isSameDay(a: moment.Moment, b: Date | null | undefined) {
  return Boolean(b && a.isSame(moment(b), "day"));
}

function getEventTimeLabel(event: CalendarEvent) {
  if (event.allDay) return "All day";

  const parsed = moment(event.start);
  return parsed.isValid() ? parsed.format("h:mm A") : "";
}

function EventTooltipContent({ event }: { event: CalendarEvent }) {
  const timeLabel = getEventTimeLabel(event);

  return (
    <div className="activity-calendar__tooltip flex max-w-56 flex-col gap-1">
      <span className="font-semibold">{event.title}</span>
      <span className="text-xs text-muted-foreground">{timeLabel}</span>
      {event.tagName ?
        <span className="text-xs text-muted-foreground">Tag: {event.tagName}</span>
      : null}
      {event.location ?
        <span className="text-xs text-muted-foreground">Location: {event.location}</span>
      : null}
    </div>
  );
}

function getEventTooltipContent(event: CalendarEvent) {
  return <EventTooltipContent event={event} />;
}

function EventTimeRow({ event, className }: { event: CalendarEvent; className?: string }) {
  const timeLabel = getEventTimeLabel(event);

  return (
    <span className={cn("activity-calendar__event-time", className)}>
      <Clock className="activity-calendar__event-time-icon" aria-hidden="true" />
      <span className="activity-calendar__event-time-label">{timeLabel}</span>
    </span>
  );
}

function EventChip({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <CalendarTooltip content={getEventTooltipContent(event)}>
      <button
        type="button"
        onClick={onClick}
        className="activity-calendar__event"
        style={{ backgroundColor: event.color ?? "hsl(var(--primary))" }}>
        <span className="activity-calendar__event-label">{event.title}</span>
        <EventTimeRow event={event} />
      </button>
    </CalendarTooltip>
  );
}

function MonthView({ focusDate, events, focusedDate, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
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

      <div className="activity-calendar__body scrollbar-none">
        <div className="activity-calendar__grid">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          const isToday = day.isSame(moment(), "day");
          const isCurrentMonth = day.isSame(focus, "month");
          const isFocused = isSameDay(day, focusedDate);
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
                isFocused && "activity-calendar__cell--focused",
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
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onEventClick(event, day.toDate());
                    }}
                  />
                ))}
                {hiddenCount > 0 && (
                  <CalendarTooltip
                    content={
                      <div className="activity-calendar__tooltip flex max-w-56 flex-col gap-1.5">
                        {dayEvents.slice(3).map((event) => (
                          <EventTooltipContent key={event.id ?? `${event.title}-${event.start}`} event={event} />
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
    </div>
  );
}

function WeekView({ focusDate, events, focusedDate, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
  const days = useMemo(() => getWeekDays(moment(focusDate)), [focusDate]);

  return (
    <div className="activity-calendar__week">
      <div className="activity-calendar__week-header">
        {days.map((day) => {
          const isToday = day.isSame(moment(), "day");
          const isFocused = isSameDay(day, focusedDate);

          return (
            <button
              key={day.format("YYYY-MM-DD")}
              type="button"
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "activity-calendar__week-day-header",
                isToday && "activity-calendar__week-day-header--today",
                isFocused && "activity-calendar__week-day-header--focused",
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

      <div className="activity-calendar__body scrollbar-none">
        <div className="activity-calendar__week-body">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          const isToday = day.isSame(moment(), "day");
          const isFocused = isSameDay(day, focusedDate);

          return (
            <button
              key={day.format("YYYY-MM-DD")}
              type="button"
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "activity-calendar__week-column",
                isToday && "activity-calendar__week-column--today",
                isFocused && "activity-calendar__week-column--focused",
              )}
              onClick={() => onDateClick(day.toDate())}
            >
              {dayEvents.length === 0 ?
                <span className="activity-calendar__empty-slot">Add event</span>
              : dayEvents.map((event) => (
                  <EventChip
                    key={event.id ?? `${event.title}-${event.start}`}
                    event={event}
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
    </div>
  );
}

function DayView({ focusDate, events, focusedDate, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
  const day = moment(focusDate);
  const dayEvents = getEventsForDay(events, day);
  const isToday = day.isSame(moment(), "day");
  const isFocused = isSameDay(day, focusedDate);

  return (
    <div className="activity-calendar__day">
      <button
        type="button"
        aria-current={isToday ? "date" : undefined}
        className={cn(
          "activity-calendar__day-banner",
          isToday && "activity-calendar__day-banner--today",
          isFocused && "activity-calendar__day-banner--focused",
        )}
        onClick={() => onDateClick(day.toDate())}>
        <span className="activity-calendar__day-banner-weekday">
          {isToday ? "Today" : day.format("dddd")}
        </span>
        <span className={cn("activity-calendar__day-banner-date", isToday && "activity-calendar__day-banner-date--today")}>
          {formatAppDate(day.toDate())}
        </span>
      </button>

      <div className="activity-calendar__body scrollbar-none">
        <div
          className={cn("activity-calendar__day-events", isFocused && "activity-calendar__day-events--focused")}
          onClick={() => onDateClick(day.toDate())}>
        {dayEvents.length === 0 ?
          <span className="activity-calendar__empty-day">No events scheduled. Click to add one.</span>
        : dayEvents.map((event) => (
            <button
              key={event.id ?? `${event.title}-${event.start}`}
              type="button"
              className="activity-calendar__day-event-card"
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
                <EventTimeRow event={event} className="activity-calendar__day-event-meta" />
              </span>
            </button>
          ))
        }
        </div>
      </div>
    </div>
  );
}

function MiniMonth({
  month,
  events,
  focusedDate,
  onDateClick,
  onEventClick,
}: {
  month: moment.Moment;
  events: CalendarEvent[];
  focusedDate?: Date | null;
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
          const isFocused = isSameDay(day, focusedDate);

          const dayButton = (
            <button
              type="button"
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "activity-calendar__year-day",
                !inMonth && "activity-calendar__year-day--outside",
                isToday && "activity-calendar__year-day--today",
                dayEvents.length > 0 && "activity-calendar__year-day--has-events",
                isFocused && "activity-calendar__year-day--focused",
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
                <div className="activity-calendar__tooltip flex max-w-56 flex-col gap-1.5">
                  {dayEvents.map((event) => (
                    <EventTooltipContent key={event.id ?? `${event.title}-${event.start}`} event={event} />
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

function YearView({ focusDate, events, focusedDate, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
  const year = moment(focusDate).year();
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => moment({ year, month: index, day: 1 })),
    [year],
  );

  return (
    <div className="activity-calendar__year-view">
      <div className="activity-calendar__body scrollbar-none">
        <div className="activity-calendar__year">
          {months.map((month) => (
            <MiniMonth
              key={month.format("YYYY-MM")}
              month={month}
              events={events}
              focusedDate={focusedDate}
              onDateClick={onDateClick}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActivityCalendar({
  view,
  focusDate,
  events,
  focusedDate,
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
            focusedDate={focusedDate}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
        {view === "dayGridWeek" && (
          <WeekView
            focusDate={focusDate}
            events={events}
            focusedDate={focusedDate}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
        {view === "dayGridDay" && (
          <DayView
            focusDate={focusDate}
            events={events}
            focusedDate={focusedDate}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
        {view === "dayGridYear" && (
          <YearView
            focusDate={focusDate}
            events={events}
            focusedDate={focusedDate}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
