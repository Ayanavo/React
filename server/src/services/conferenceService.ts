import axios from "axios";
import crypto from "crypto";
import moment from "moment";
import { getGoogleCalendarConfig } from "../config/googleCalendar.js";
import { getZoomConfig } from "../config/zoom.js";

const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_BASE = "https://www.googleapis.com/calendar/v3/calendars";
const EXTERNAL_REQUEST_TIMEOUT_MS = 30_000;

export type ConferenceProvider = "zoom" | "google_meet";

export type CreateConferenceLinkInput = {
  provider: ConferenceProvider;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  description?: string;
  previousMeetingId?: string;
};

export type ConferenceLinkResult = {
  provider: ConferenceProvider;
  link: string;
  meetingId?: string;
  calendarEventId?: string;
};

type ZoomTokenCache = {
  accessToken: string;
  expiresAt: number;
};

let zoomTokenCache: ZoomTokenCache | null = null;

function getMeetingDurationMinutes(start: Date, end?: Date, allDay?: boolean): number {
  if (allDay) {
    return 60;
  }

  if (end) {
    const minutes = moment(end).diff(moment(start), "minutes");
    return Math.max(15, Math.min(minutes, 480));
  }

  return 60;
}

function formatZoomStartTime(start: Date): string {
  return moment(start).utc().format("YYYY-MM-DDTHH:mm:ss");
}

async function getZoomAccessToken(): Promise<string> {
  const config = getZoomConfig();
  if (!config) {
    throw new Error("Zoom is not configured. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET.");
  }

  if (zoomTokenCache && Date.now() < zoomTokenCache.expiresAt - 60_000) {
    return zoomTokenCache.accessToken;
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      ZOOM_TOKEN_URL,
      new URLSearchParams({
        grant_type: "account_credentials",
        account_id: config.accountId,
      }),
      {
        timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data?.access_token as string | undefined;
    const expiresIn = Number(response.data?.expires_in ?? 3600);

    if (!accessToken) {
      throw new Error("Zoom token response did not include an access token");
    }

    zoomTokenCache = {
      accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    return accessToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { reason?: string; error_description?: string } | undefined)?.reason ||
        (error.response?.data as { error_description?: string } | undefined)?.error_description ||
        error.message;
      throw new Error(`Failed to authenticate with Zoom: ${message}`);
    }

    throw error;
  }
}

async function deleteZoomMeeting(meetingId: string): Promise<void> {
  const config = getZoomConfig();
  if (!config) {
    return;
  }

  const accessToken = await getZoomAccessToken();

  try {
    await axios.delete(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
      timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return;
    }
  }
}

async function createZoomMeeting(input: CreateConferenceLinkInput): Promise<ConferenceLinkResult> {
  const config = getZoomConfig();
  if (!config) {
    throw new Error("Zoom is not configured. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET.");
  }

  const start = moment(input.start);
  if (!start.isValid()) {
    throw new Error("A valid start date is required to schedule a Zoom meeting");
  }

  if (input.previousMeetingId) {
    await deleteZoomMeeting(input.previousMeetingId);
  }

  const accessToken = await getZoomAccessToken();
  const duration = getMeetingDurationMinutes(start.toDate(), input.end ? moment(input.end).toDate() : undefined, input.allDay);

  try {
    const response = await axios.post(
      `${ZOOM_API_BASE}/users/${config.userId}/meetings`,
      {
        topic: input.title.trim() || "Scheduled meeting",
        type: 2,
        start_time: formatZoomStartTime(start.toDate()),
        duration,
        timezone: "UTC",
        agenda: input.description?.trim() || undefined,
        settings: {
          join_before_host: false,
          waiting_room: true,
        },
      },
      {
        timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const joinUrl = response.data?.join_url as string | undefined;
    const meetingId = response.data?.id ? String(response.data.id) : undefined;

    if (!joinUrl) {
      throw new Error("Zoom did not return a join URL");
    }

    if (config.calendarId) {
      await syncZoomCalendarEvent({
        accessToken,
        calendarId: config.calendarId,
        title: input.title,
        description: input.description,
        start: start.toDate(),
        end: input.end ? moment(input.end).toDate() : moment(start).add(duration, "minutes").toDate(),
        allDay: input.allDay,
        joinUrl,
        timezone: config.timezone,
      });
    }

    return {
      provider: "zoom",
      link: joinUrl,
      meetingId,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message ||
        "Failed to create Zoom meeting";
      throw new Error(message);
    }

    throw error;
  }
}

async function syncZoomCalendarEvent({
  accessToken,
  calendarId,
  title,
  description,
  start,
  end,
  allDay,
  joinUrl,
  timezone,
}: {
  accessToken: string;
  calendarId: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  joinUrl: string;
  timezone: string;
}) {
  const payload = allDay
    ? {
        summary: title,
        description: [description?.trim(), `Join Zoom: ${joinUrl}`].filter(Boolean).join("\n\n"),
        location: joinUrl,
        start: { date: moment(start).utc().format("YYYY-MM-DD") },
        end: { date: moment(end).utc().add(1, "day").format("YYYY-MM-DD") },
      }
    : {
        summary: title,
        description: [description?.trim(), `Join Zoom: ${joinUrl}`].filter(Boolean).join("\n\n"),
        location: joinUrl,
        start: { dateTime: moment(start).toISOString(), timeZone: timezone },
        end: { dateTime: moment(end).toISOString(), timeZone: timezone },
      };

  try {
    await axios.post(`${ZOOM_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`, payload, {
      timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch {
    // Calendar sync is optional; the schedulable meeting link is still valid.
  }
}

async function getGoogleAccessToken(): Promise<string> {
  const config = getGoogleCalendarConfig();
  if (!config) {
    throw new Error(
      "Google Meet is not configured. Set GOOGLE_CALENDAR_REFRESH_TOKEN with calendar.events scope."
    );
  }

  try {
    const response = await axios.post(
      GOOGLE_TOKEN_URL,
      new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token",
      }),
      {
        timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = response.data?.access_token as string | undefined;
    if (!accessToken) {
      throw new Error("Google token response did not include an access token");
    }

    return accessToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { error_description?: string } | undefined)?.error_description ||
        error.message;
      throw new Error(`Failed to authenticate with Google Calendar: ${message}`);
    }

    throw error;
  }
}

async function createGoogleMeetLink(input: CreateConferenceLinkInput): Promise<ConferenceLinkResult> {
  const config = getGoogleCalendarConfig();
  if (!config) {
    throw new Error(
      "Google Meet is not configured. Set GOOGLE_CALENDAR_REFRESH_TOKEN with calendar.events scope."
    );
  }

  const start = moment(input.start);
  if (!start.isValid()) {
    throw new Error("A valid start date is required to schedule a Google Meet");
  }

  const end = input.end && moment(input.end).isValid() ? moment(input.end) : start.clone().add(60, "minutes");
  const accessToken = await getGoogleAccessToken();
  const requestId = crypto.randomUUID();

  const payload = input.allDay
    ? {
        summary: input.title.trim() || "Scheduled meeting",
        description: input.description?.trim() || undefined,
        start: { date: start.utc().format("YYYY-MM-DD") },
        end: { date: end.utc().add(1, "day").format("YYYY-MM-DD") },
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }
    : {
        summary: input.title.trim() || "Scheduled meeting",
        description: input.description?.trim() || undefined,
        start: { dateTime: start.toISOString(), timeZone: config.timezone },
        end: { dateTime: end.toISOString(), timeZone: config.timezone },
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      };

  try {
    const response = await axios.post(
      `${GOOGLE_CALENDAR_BASE}/${encodeURIComponent(config.calendarId)}/events`,
      payload,
      {
        timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
        params: { conferenceDataVersion: 1 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const hangoutLink = response.data?.hangoutLink as string | undefined;
    const entryPoints = response.data?.conferenceData?.entryPoints as Array<{ uri?: string }> | undefined;
    const link = hangoutLink || entryPoints?.find((entry) => entry.uri)?.uri;
    const calendarEventId = response.data?.id as string | undefined;

    if (!link) {
      throw new Error("Google Calendar did not return a Meet link");
    }

    return {
      provider: "google_meet",
      link,
      calendarEventId,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message ||
        error.message ||
        "Failed to create Google Meet";
      throw new Error(message);
    }

    throw error;
  }
}

export async function createConferenceLink(input: CreateConferenceLinkInput): Promise<ConferenceLinkResult> {
  if (input.provider === "zoom") {
    return createZoomMeeting(input);
  }

  return createGoogleMeetLink(input);
}

export function isConferenceProviderConfigured(provider: ConferenceProvider): boolean {
  if (provider === "zoom") {
    return Boolean(getZoomConfig());
  }

  return Boolean(getGoogleCalendarConfig());
}
