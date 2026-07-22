export type ZoomConfig = {
  accountId: string;
  clientId: string;
  clientSecret: string;
  userId: string;
  timezone: string;
  calendarId?: string;
};

export const getZoomConfig = (): ZoomConfig | null => {
  const accountId = process.env.ZOOM_ACCOUNT_ID?.trim();
  const clientId = process.env.ZOOM_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOOM_CLIENT_SECRET?.trim();

  if (!accountId || !clientId || !clientSecret) {
    return null;
  }

  return {
    accountId,
    clientId,
    clientSecret,
    userId: process.env.ZOOM_USER_ID?.trim() || "me",
    timezone: process.env.ZOOM_DEFAULT_TIMEZONE?.trim() || "Asia/Kolkata",
    calendarId: process.env.ZOOM_CALENDAR_ID?.trim(),
  };
};
