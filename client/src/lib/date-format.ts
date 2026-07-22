import moment, { MomentInput } from "moment";

export const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";
export const DEFAULT_WEEK_START = "sunday";
export const DEFAULT_TIME_FORMAT = "12";

export type WeekStart = "sunday" | "monday" | "saturday";
export type TimeFormat = "12" | "24";

const WEEK_START_DOW: Record<WeekStart, number> = {
  sunday: 0,
  monday: 1,
  saturday: 6,
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getSessionDateFormat() {
  return sessionStorage.getItem("date_format") ?? DEFAULT_DATE_FORMAT;
}

export function getSessionWeekStart(): WeekStart {
  const value = sessionStorage.getItem("week_start");
  if (value === "monday" || value === "saturday" || value === "sunday") return value;
  return DEFAULT_WEEK_START;
}

export function getSessionTimeFormat(): TimeFormat {
  const value = sessionStorage.getItem("time_format");
  if (value === "12" || value === "24") return value;
  return DEFAULT_TIME_FORMAT;
}

export function getMomentTimeFormat(timeFormat: TimeFormat = getSessionTimeFormat()) {
  return timeFormat === "24" ? "HH:mm" : "h:mm A";
}

export function getMomentHourFormat(timeFormat: TimeFormat = getSessionTimeFormat()) {
  return timeFormat === "24" ? "HH:00" : "h A";
}

export function getWeekdayLabels(weekStart: WeekStart = getSessionWeekStart()) {
  const dow = WEEK_START_DOW[weekStart];
  return [...WEEKDAY_LABELS.slice(dow), ...WEEKDAY_LABELS.slice(0, dow)];
}

export function applySessionWeekStart(weekStart: WeekStart = getSessionWeekStart()) {
  moment.updateLocale(moment.locale(), {
    week: {
      dow: WEEK_START_DOW[weekStart],
      doy: weekStart === "monday" ? 4 : 6,
    },
  });
}

applySessionWeekStart();

function toMoment(date?: MomentInput) {
  if (!date) return null;

  const parsed = moment.isMoment(date) || date instanceof Date ? moment(date) : moment(date, moment.ISO_8601, true);
  return parsed.isValid() ? parsed : null;
}

export function formatAppDate(date?: MomentInput, includeTimeOrFallback: boolean | string = false, fallback = "") {
  const parsed = toMoment(date);
  const includeTime = typeof includeTimeOrFallback === "boolean" ? includeTimeOrFallback : false;
  const fallbackText = typeof includeTimeOrFallback === "string" ? includeTimeOrFallback : fallback;
  if (!parsed) return fallbackText;

  const dateFormat = getSessionDateFormat();
  if (includeTime) {
    return parsed.format(`${dateFormat} ${getMomentTimeFormat()}`);
  }
  return parsed.format(dateFormat);
}

export function formatAppDateTime(date?: MomentInput, fallback = "") {
  const parsed = toMoment(date);
  return parsed ? parsed.format(`${getSessionDateFormat()} ${getMomentTimeFormat()}`) : fallback;
}

export function formatAppTime(date?: MomentInput, fallback = "") {
  const parsed = toMoment(date);
  return parsed ? parsed.format(getMomentTimeFormat()) : fallback;
}

export function formatDuration(ms?: number | null, fallback = "—") {
  if (ms == null || ms <= 0) return fallback;

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}

export function formatAppMonthYear(date?: MomentInput, fallback = "") {
  const parsed = toMoment(date);
  if (!parsed) return fallback;

  const dateFormat = getSessionDateFormat();
  const delimiter = dateFormat.match(/[\/.-]/)?.[0];
  if (!delimiter) return parsed.format("MMMM YYYY");

  const monthYearFormat = dateFormat
    .split(delimiter)
    .filter((part) => !part.includes("D"))
    .join(delimiter);

  return parsed.format(monthYearFormat || "MMMM YYYY");
}
