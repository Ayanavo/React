import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY = "holiday@group.v.calendar.google.com";
const API_KEY = "AIzaSyC9Sx3wIqJfi6Uf_1BIOLn-2EOKrTCYcSY";
const CALENDAR_REGION = "en.indian";
const TIME_ZONE = "Asia/Kolkata";

export function HolidayEvent() {
  return useQuery({
    queryKey: ["h-events"],
    queryFn: () =>
      axios.get<{
        kind: string;
        etag: string;
        summary: string;
        description: string;
        updated: string;
        timeZone: string;
        accessRole: string;
        defaultReminder: Array<any>;
        nextPageToken: string;
        items: Array<any>;
      }>(`${BASE_CALENDAR_URL}/${CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${API_KEY}`),
  });
}
