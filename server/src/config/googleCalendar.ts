export type GoogleCalendarConfig = {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  calendarId: string;
  timezone: string;
};

export const getGoogleCalendarConfig = (): GoogleCalendarConfig | null => {
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim();
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();

  if (!refreshToken || !clientId || !clientSecret) {
    return null;
  }

  return {
    refreshToken,
    clientId,
    clientSecret,
    calendarId: process.env.GOOGLE_CALENDAR_ID?.trim() || "primary",
    timezone: process.env.GOOGLE_CALENDAR_TIMEZONE?.trim() || "Asia/Kolkata",
  };
};
