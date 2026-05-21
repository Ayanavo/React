import moment, { MomentInput } from "moment";

export const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";

export function getSessionDateFormat() {
  return sessionStorage.getItem("date_format") ?? DEFAULT_DATE_FORMAT;
}

function toMoment(date?: MomentInput) {
  if (!date) return null;

  const parsed = moment.isMoment(date) || date instanceof Date ? moment(date) : moment(date, moment.ISO_8601, true);
  return parsed.isValid() ? parsed : null;
}

export function formatAppDate(date?: MomentInput, fallback = "") {
  const parsed = toMoment(date);
  return parsed ? parsed.format(getSessionDateFormat()) : fallback;
}

export function formatAppDateTime(date?: MomentInput, fallback = "") {
  const parsed = toMoment(date);
  return parsed ? parsed.format(`${getSessionDateFormat()} hh:mm A`) : fallback;
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
