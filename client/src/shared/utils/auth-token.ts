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

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const getUserIdFromToken = (): string | null => {
  const token = getAuthToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const id = payload.id;
  if (typeof id === "string" && id.length > 0) return id;
  if (id && typeof id === "object" && "toString" in id) {
    const asString = String(id);
    return asString.length > 0 ? asString : null;
  }

  return null;
};
