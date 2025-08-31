import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY = "holiday@group.v.calendar.google.com";
const API_KEY = "AIzaSyC9Sx3wIqJfi6Uf_1BIOLn-2EOKrTCYcSY";
const CALENDAR_REGION = "en.indian";
const apiUrl = import.meta.env.VITE_API_URL;
import { User } from "@/pages/layout/grid/table/user.model";
import { request } from "../interceptors/auth-interceptor";
// const TIME_ZONE = "Asia/Kolkata";

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

const activityURL = `${apiUrl}activities`;

export const fetchActivities = async (page: number, limit: number) => {
  const response = await request<{ activities: User[]; total: number }>({
    method: "GET",
    url: activityURL,
    data: { page, limit },
  });
  return response.data;
};

export const createActivity = async (postData: any) => {
  const response = await request({
    method: "POST",
    url: `${activityURL}/create`,
    data: postData,
  });
  return response.data;
};

export const fetchActivityDetail = async (userID: string) => {
  const response = await request({
    method: "GET",
    url: `${activityURL}/${userID}`,
  });
  return response.data;
};

export const updateActivity = async (userID: string, postData: User) => {
  const response = await request({
    method: "PUT",
    url: `${activityURL}/update/${userID}`,
    data: postData,
  });
  return response.data;
};

export const deleteActivity = async (userID: string) => {
  const response = await request({
    method: "DELETE",
    url: `${activityURL}/delete/${userID}`,
  });
  return response.data;
};
