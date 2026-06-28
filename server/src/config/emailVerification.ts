const DEFAULT_DEV_CLIENT_URL = "http://localhost:5173/React";

const resolveClientUrl = (): string => {
  if (process.env.CLIENT_URL?.trim()) {
    return process.env.CLIENT_URL.trim().replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    const frontendUrl = (process.env.FRONTEND_URL ?? "").trim().replace(/\/$/, "");
    if (!frontendUrl) return DEFAULT_DEV_CLIENT_URL;
    return frontendUrl.endsWith("/React") ? frontendUrl : `${frontendUrl}/React`;
  }

  return DEFAULT_DEV_CLIENT_URL;
};

export const getEmailVerificationConfig = () => ({
  tokenTtlMinutes: Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES) || 10,
  registrationWindowMinutes: Number(process.env.REGISTRATION_WINDOW_TTL_MINUTES) || 30,
  resendCooldownSeconds: Number(process.env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS) || 60,
  passwordResetTokenTtlMinutes: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES) || 10,
  passwordResetResendCooldownSeconds: Number(process.env.PASSWORD_RESET_RESEND_COOLDOWN_SECONDS) || 60,
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  brevoFromEmail: process.env.BREVO_FROM_EMAIL ?? "",
  brevoFromName: process.env.BREVO_FROM_NAME ?? "Notofy",
  clientUrl: resolveClientUrl(),
  apiPublicUrl: (
    (process.env.NODE_ENV === "production" ? process.env.DOMAIN_NAME : undefined) ??
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, ""),
});

const EMAIL_ICON_FILENAME = "app-icon-email.png";

export const buildAppIconUrl = (): string => {
  const { apiPublicUrl } = getEmailVerificationConfig();
  return `${apiPublicUrl}/api/public/${EMAIL_ICON_FILENAME}`;
};

/** HashRouter routes live under #/ — plain /auth/register paths are required for the SPA. */
export const buildRegistrationRedirectUrl = (params: Record<string, string>): string => {
  const { clientUrl } = getEmailVerificationConfig();
  const query = new URLSearchParams(params).toString();
  return `${clientUrl}/#/auth/register?${query}`;
};

export const buildPasswordResetRedirectUrl = (params: Record<string, string>): string => {
  const { clientUrl } = getEmailVerificationConfig();
  const query = new URLSearchParams(params).toString();
  return `${clientUrl}/#/auth/reset-password?${query}`;
};

export const buildForgotPasswordRedirectUrl = (params: Record<string, string> = {}): string => {
  const { clientUrl } = getEmailVerificationConfig();
  const query = new URLSearchParams(params).toString();
  return query ? `${clientUrl}/#/auth/forgot-password?${query}` : `${clientUrl}/#/auth/forgot-password`;
};
