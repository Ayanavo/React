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
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "",
  clientUrl: resolveClientUrl(),
  apiPublicUrl: (
    (process.env.NODE_ENV === "production" ? process.env.DOMAIN_NAME : undefined) ??
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, ""),
});

/** HashRouter routes live under #/ — plain /register paths 404 in the SPA. */
export const buildRegistrationRedirectUrl = (params: Record<string, string>): string => {
  const { clientUrl } = getEmailVerificationConfig();
  const query = new URLSearchParams(params).toString();
  return `${clientUrl}/#/register?${query}`;
};
