export const AUTH_CHANGED_EVENT = "auth-changed";

export const getAuthToken = (): string | null => {
  const raw = sessionStorage.getItem("auth_token");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "string" ? parsed : raw;
  } catch {
    return raw;
  }
};

export const setAuthToken = (token: string): void => {
  sessionStorage.setItem("auth_token", JSON.stringify(token));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const clearAuthToken = (): void => {
  sessionStorage.removeItem("auth_token");
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const isAuthenticated = (): boolean => Boolean(getAuthToken());
