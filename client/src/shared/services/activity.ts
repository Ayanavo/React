import { CalendarView } from "@/pages/layout/activity/activity-calendar";
import { ActivityPriority } from "@/pages/layout/activity/activity.types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import { API_TIMEOUT_MS, axiosInstance } from "@/shared/interceptors/auth-interceptor";

const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
const INDIAN_HOLIDAY_CALENDAR_ID = "en.indian%23holiday@group.v.calendar.google.com";
const HOLIDAY_TIME_ZONE = "Asia/Kolkata";
const apiUrl = import.meta.env.VITE_API_URL;

export type GoogleCalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  status?: string;
  start: { date?: string; dateTime?: string; timeZone?: string };
  end?: { date?: string; dateTime?: string; timeZone?: string };
};

type GoogleCalendarEventsResponse = {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
};

function getHolidayApiKey() {
  return import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY as string | undefined;
}

export function getHolidayFetchRange(focusDate: Date, view: CalendarView) {
  const focus = moment(focusDate);

  if (view === "dayGridDay") {
    return {
      timeMin: focus.clone().startOf("day").toISOString(),
      timeMax: focus.clone().endOf("day").add(1, "second").toISOString(),
    };
  }

  if (view === "dayGridWeek") {
    return {
      timeMin: focus.clone().startOf("week").toISOString(),
      timeMax: focus.clone().endOf("week").add(1, "second").toISOString(),
    };
  }

  if (view === "dayGridYear") {
    return {
      timeMin: focus.clone().startOf("year").toISOString(),
      timeMax: focus.clone().endOf("year").add(1, "second").toISOString(),
    };
  }

  if (view === "dayGridMonth") {
    const gridStart = focus.clone().startOf("month").startOf("week");
    const gridEnd = focus.clone().endOf("month").endOf("week");

    return {
      timeMin: gridStart.toISOString(),
      timeMax: gridEnd.add(1, "second").toISOString(),
    };
  }

  return {
    timeMin: focus.clone().startOf("month").startOf("week").toISOString(),
    timeMax: focus.clone().endOf("month").endOf("week").add(1, "second").toISOString(),
  };
}

export async function fetchHolidayEvents(timeMin: string, timeMax: string) {
  const apiKey = getHolidayApiKey();
  if (!apiKey) {
    return [];
  }

  const items: GoogleCalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const response = await axios.get<GoogleCalendarEventsResponse>(
      `${BASE_CALENDAR_URL}/${INDIAN_HOLIDAY_CALENDAR_ID}/events`,
      {
        timeout: API_TIMEOUT_MS,
        params: {
          key: apiKey,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 250,
          timeZone: HOLIDAY_TIME_ZONE,
          ...(pageToken ? { pageToken } : {}),
        },
      }
    );

    const pageItems = (response.data.items ?? []).filter((item) => item.status !== "cancelled" && item.summary?.trim());
    items.push(...pageItems);
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return items;
}

export function useHolidayEvents(focusDate: Date, view: CalendarView) {
  const { timeMin, timeMax } = getHolidayFetchRange(focusDate, view);
  const rangeKey = `${timeMin.slice(0, 10)}_${timeMax.slice(0, 10)}`;

  return useQuery({
    queryKey: ["h-events", rangeKey],
    queryFn: () => fetchHolidayEvents(timeMin, timeMax),
    enabled: Boolean(getHolidayApiKey()),
    placeholderData: [],
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}

const activityURL = `${apiUrl}activities`;

export type RecurrencePayload = {
  enabled: boolean;
  interval?: "day" | "week" | "month" | "year";
  count?: number;
  endDate?: string;
};

export type ActivityPayload = {
  title: string;
  description?: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  priority?: ActivityPriority;
  location?: string;
  tag?: string;
  recurrence?: RecurrencePayload;
};

export type ActivityRecord = ActivityPayload & {
  _id: string;
  name?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const fetchActivities = async (page: number, limit: number) => {
  const response = await axiosInstance.get<{ activities: ActivityRecord[] }>(`${activityURL}?page=${page}&limit=${limit}`);
  return response.data;
};

export const createActivity = async (postData: ActivityPayload) => {
  const response = await axiosInstance.post<{
    message: string;
    activity: ActivityRecord;
    activities?: ActivityRecord[];
  }>(`${activityURL}/create`, postData);
  return response.data;
};

export const fetchActivityDetail = async (activityId: string) => {
  const response = await axiosInstance.get<{ activity: ActivityRecord }>(`${activityURL}/${activityId}`);
  return response.data;
};

export const updateActivity = async (activityId: string, postData: ActivityPayload) => {
  const response = await axiosInstance.put<{ message: string; activity: ActivityRecord }>(
    `${activityURL}/update/${activityId}`,
    postData
  );
  return response.data;
};

export const deleteActivity = async (activityId: string) => {
  const response = await axiosInstance.delete<{ message: string }>(`${activityURL}/delete/${activityId}`);
  return response.data;
};

/** @deprecated Use useHolidayEvents instead */
export function HolidayEvent() {
  return useHolidayEvents(moment().toDate(), "dayGridMonth");
}
