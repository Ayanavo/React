import { apiUrl } from "@/shared/interceptors/auth-interceptor";

export type OAuthProvider = "google" | "github";

export const startOAuthLogin = (provider: OAuthProvider): void => {
  window.location.href = `${apiUrl}auth/oauth/${provider}`;
};
