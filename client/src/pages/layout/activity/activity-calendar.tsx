import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatAppTime, getMomentHourFormat, getWeekdayLabels } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import moment from "moment";
import React, { useEffect, useMemo, useRef } from "react";
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

const WEEK_HOURS = Array.from({ length: 24 }, (_, index) => index);
const WEEK_HOUR_HEIGHT_REM = 3.5;

function getTimedEventsForDay(events: CalendarEvent[], day: moment.Moment) {
  return getEventsForDay(events, day).filter((event) => !event.allDay);
}

function getAllDayEventsForDay(events: CalendarEvent[], day: moment.Moment) {
  return getEventsForDay(events, day).filter((event) => event.allDay);
}

function getTimedEventStyle(event: CalendarEvent, day: moment.Moment): React.CSSProperties {
  const dayStart = day.clone().startOf("day");
  const dayEnd = day.clone().endOf("day");
  let start = moment(event.start);
  let end = event.end ? moment(event.end) : start.clone().add(1, "hour");

  if (start.isBefore(dayStart)) start = dayStart.clone();
  if (end.isAfter(dayEnd)) end = dayEnd.clone();
  if (!end.isAfter(start)) end = start.clone().add(15, "minutes");

  const totalMinutes = 24 * 60;
  const startMinutes = start.diff(dayStart, "minutes");
  const durationMinutes = Math.max(15, end.diff(start, "minutes"));

  return {
    top: `${(startMinutes / totalMinutes) * 100}%`,
    height: `${(durationMinutes / totalMinutes) * 100}%`,
    backgroundColor: event.color ?? "hsl(var(--primary))",
  };
}

function getCurrentTimeOffset() {
  const minutes = moment().diff(moment().startOf("day"), "minutes");
  return `${(minutes / (24 * 60)) * 100}%`;
}

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
  return formatAppTime(event.start);
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

function EventChip({ event, onClick }: { event: CalendarEvent; onClick: (event: React.MouseEvent) => void }) {
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
  const weekdays = getWeekdayLabels();

  return (
    <div className="activity-calendar__month">
      <div className="activity-calendar__weekdays">
        {weekdays.map((day) => (
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
                  isFocused && "activity-calendar__cell--focused"
                )}
                onClick={() => onDateClick(day.toDate())}>
                <span
                  className={cn("activity-calendar__day-number", isToday && "activity-calendar__day-number--today")}>
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

function WeekTimedEvent({
  event,
  day,
  onEventClick,
}: {
  event: CalendarEvent;
  day: moment.Moment;
  onEventClick: (event: CalendarEvent, date: Date) => void;
}) {
  const style = getTimedEventStyle(event, day);
  const timeLabel = getEventTimeLabel(event);

  return (
    <CalendarTooltip content={getEventTooltipContent(event)}>
      <button
        type="button"
        className="activity-calendar__week-event"
        style={style}
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          onEventClick(event, day.toDate());
        }}>
        <span className="activity-calendar__week-event-title">{event.title}</span>
        <span className="activity-calendar__week-event-time">{timeLabel}</span>
      </button>
    </CalendarTooltip>
  );
}

function WeekView({ focusDate, events, focusedDate, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
  const days = useMemo(() => getWeekDays(moment(focusDate)), [focusDate]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const currentHour = moment().hour();
    const targetHour = Math.max(0, currentHour - 1);
    container.scrollTop = targetHour * WEEK_HOUR_HEIGHT_REM * 16;
  }, [focusDate]);

  return (
    <div className="activity-calendar__week">
      <div className="activity-calendar__week-sticky">
        <div className="activity-calendar__week-header">
          <div className="activity-calendar__week-gutter activity-calendar__week-gutter--header" aria-hidden="true" />

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
                  isFocused && "activity-calendar__week-day-header--focused"
                )}
                onClick={() => onDateClick(day.toDate())}>
                <span className="activity-calendar__week-day-name">{day.format("ddd")}</span>
                <span
                  className={cn(
                    "activity-calendar__week-day-date",
                    isToday && "activity-calendar__week-day-date--today"
                  )}>
                  {day.format("D")}
                </span>
              </button>
            );
          })}
        </div>

        <div className="activity-calendar__week-all-day">
          <div className="activity-calendar__week-gutter activity-calendar__week-gutter--all-day">All-day</div>

          {days.map((day) => {
            const allDayEvents = getAllDayEventsForDay(events, day);
            const isToday = day.isSame(moment(), "day");
            const isFocused = isSameDay(day, focusedDate);

            return (
              <div
                key={day.format("YYYY-MM-DD")}
                className={cn(
                  "activity-calendar__week-all-day-cell",
                  isToday && "activity-calendar__week-all-day-cell--today",
                  isFocused && "activity-calendar__week-all-day-cell--focused"
                )}>
                {allDayEvents.map((event) => (
                  <EventChip
                    key={event.id ?? `${event.title}-${event.start}`}
                    event={event}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onEventClick(event, day.toDate());
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div ref={scrollRef} className="activity-calendar__body scrollbar-none">
        <div className="activity-calendar__week-grid">
          <div className="activity-calendar__week-time-column" aria-hidden="true">
            {WEEK_HOURS.map((hour) => (
              <div key={hour} className="activity-calendar__week-hour-label">
                {hour === 0 ? null : moment().hour(hour).minute(0).format(getMomentHourFormat())}
              </div>
            ))}
          </div>

          <div className="activity-calendar__week-columns">
            {days.map((day) => {
              const timedEvents = getTimedEventsForDay(events, day);
              const isToday = day.isSame(moment(), "day");
              const isFocused = isSameDay(day, focusedDate);

              return (
                <div
                  key={day.format("YYYY-MM-DD")}
                  className={cn(
                    "activity-calendar__week-day-column",
                    isToday && "activity-calendar__week-day-column--today",
                    isFocused && "activity-calendar__week-day-column--focused"
                  )}>
                  {WEEK_HOURS.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className="activity-calendar__week-hour-slot"
                      aria-label={`Add event on ${day.format("dddd, MMMM D")} at ${moment().hour(hour).minute(0).format(getMomentHourFormat())}`}
                      onClick={() => onDateClick(day.clone().hour(hour).minute(0).second(0).millisecond(0).toDate())}
                    />
                  ))}

                  {timedEvents.map((event) => (
                    <WeekTimedEvent
                      key={event.id ?? `${event.title}-${event.start}`}
                      event={event}
                      day={day}
                      onEventClick={onEventClick}
                    />
                  ))}

                  {isToday && (
                    <div
                      className="activity-calendar__week-now-indicator"
                      style={{ top: getCurrentTimeOffset() }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayView({ focusDate, events, focusedDate, onDateClick, onEventClick }: Omit<ActivityCalendarProps, "view">) {
  const day = moment(focusDate);
  const allDayEvents = getAllDayEventsForDay(events, day);
  const timedEvents = getTimedEventsForDay(events, day);
  const isToday = day.isSame(moment(), "day");
  const isFocused = isSameDay(day, focusedDate);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const currentHour = moment().hour();
    const targetHour = Math.max(0, currentHour - 1);
    container.scrollTop = targetHour * WEEK_HOUR_HEIGHT_REM * 16;
  }, [focusDate]);

  return (
    <div className="activity-calendar__day">
      <div className="activity-calendar__day-sticky">
        <div className="activity-calendar__day-header">
          <div className="activity-calendar__week-gutter activity-calendar__week-gutter--header" aria-hidden="true" />

          <button
            type="button"
            aria-current={isToday ? "date" : undefined}
            className={cn(
              "activity-calendar__day-day-header",
              isToday && "activity-calendar__day-day-header--today",
              isFocused && "activity-calendar__day-day-header--focused"
            )}
            onClick={() => onDateClick(day.toDate())}>
            <span className="activity-calendar__week-day-name">{day.format("ddd")}</span>
            <span
              className={cn("activity-calendar__week-day-date", isToday && "activity-calendar__week-day-date--today")}>
              {day.format("D")}
            </span>
          </button>
        </div>

        <div className="activity-calendar__day-all-day">
          <div className="activity-calendar__week-gutter activity-calendar__week-gutter--all-day">All-day</div>

          <div
            className={cn(
              "activity-calendar__day-all-day-cell",
              isToday && "activity-calendar__day-all-day-cell--today",
              isFocused && "activity-calendar__day-all-day-cell--focused"
            )}>
            {allDayEvents.map((event) => (
              <EventChip
                key={event.id ?? `${event.title}-${event.start}`}
                event={event}
                onClick={(clickEvent) => {
                  clickEvent.stopPropagation();
                  onEventClick(event, day.toDate());
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="activity-calendar__body scrollbar-none">
        <div className="activity-calendar__day-grid">
          <div className="activity-calendar__week-time-column" aria-hidden="true">
            {WEEK_HOURS.map((hour) => (
              <div key={hour} className="activity-calendar__week-hour-label">
                {hour === 0 ? null : moment().hour(hour).minute(0).format(getMomentHourFormat())}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "activity-calendar__day-column",
              isToday && "activity-calendar__day-column--today",
              isFocused && "activity-calendar__day-column--focused"
            )}>
            {WEEK_HOURS.map((hour) => (
              <button
                key={hour}
                type="button"
                className="activity-calendar__week-hour-slot"
                aria-label={`Add event on ${day.format("dddd, MMMM D")} at ${moment().hour(hour).minute(0).format(getMomentHourFormat())}`}
                onClick={() => onDateClick(day.clone().hour(hour).minute(0).second(0).millisecond(0).toDate())}
              />
            ))}

            {timedEvents.map((event) => (
              <WeekTimedEvent
                key={event.id ?? `${event.title}-${event.start}`}
                event={event}
                day={day}
                onEventClick={onEventClick}
              />
            ))}

            {isToday && (
              <div
                className="activity-calendar__week-now-indicator"
                style={{ top: getCurrentTimeOffset() }}
                aria-hidden="true"
              />
            )}
          </div>
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
  const weekdays = getWeekdayLabels();

  return (
    <div className={cn("activity-calendar__year-month", isCurrentMonth && "activity-calendar__year-month--current")}>
      <div className="activity-calendar__year-month-title">{month.format("MMMM")}</div>
      <div className="activity-calendar__year-weekdays" aria-hidden="true">
        {weekdays.map((day) => (
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
                isFocused && "activity-calendar__year-day--focused"
              )}
              onClick={() => {
                if (dayEvents.length === 1) {
                  onEventClick(dayEvents[0], day.toDate());
                  return;
                }

                onDateClick(day.toDate());
              }}>
              <span
                className={cn(
                  "activity-calendar__year-day-number",
                  isToday && "activity-calendar__year-day-number--today"
                )}>
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
    [year]
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
