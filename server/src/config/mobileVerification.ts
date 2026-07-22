export const getMobileVerificationConfig = () => ({
  otpTtlMinutes: Number(process.env.MOBILE_VERIFICATION_OTP_TTL_MINUTES) || 10,
  resendCooldownSeconds: Number(process.env.MOBILE_VERIFICATION_RESEND_COOLDOWN_SECONDS) || 60,
  maxAttempts: Number(process.env.MOBILE_VERIFICATION_MAX_ATTEMPTS) || 5,
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  brevoSmsSender: (process.env.BREVO_SMS_SENDER ?? "Notofy").slice(0, 11),
});

export const normalizeMobileNumber = (mobile: string): string => mobile.replace(/\D/g, "");
