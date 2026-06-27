import { getEmailVerificationConfig } from "./emailVerification.js";

export type OAuthProvider = "google" | "github";

const DEFAULT_DEV_CLIENT_URL = "http://localhost:5173/React";

const resolveClientUrl = (): string => {
  const { clientUrl } = getEmailVerificationConfig();
  return clientUrl || DEFAULT_DEV_CLIENT_URL;
};

export const getOAuthConfig = () => {
  const { apiPublicUrl } = getEmailVerificationConfig();

  return {
    google: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      profileUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      scope: "openid email profile",
    },
    github: {
      clientId: process.env.GITHUB_OAUTH_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET ?? "",
      authorizeUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      profileUrl: "https://api.github.com/user",
      emailsUrl: "https://api.github.com/user/emails",
      scope: "read:user user:email",
    },
    callbackUrl: `${apiPublicUrl}/api/auth/oauth/callback`,
    clientUrl: resolveClientUrl(),
    stateSecret: process.env.API_SECRET_KEY ?? "",
  };
};

export const buildOAuthRedirectUrl = (params: Record<string, string>): string => {
  const { clientUrl } = getOAuthConfig();
  const query = new URLSearchParams(params).toString();
  return `${clientUrl}/#/auth/callback?${query}`;
};
