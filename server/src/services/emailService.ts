import axios from "axios";
import { buildAppIconUrl, getEmailVerificationConfig } from "../config/emailVerification.js";
import { buildVerificationEmailContent } from "../templates/emailVerificationTemplate.js";
import { buildPasswordResetEmailContent } from "../templates/passwordResetEmailTemplate.js";

const BREVO_SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";
const EXTERNAL_REQUEST_TIMEOUT_MS = 30_000;

const sendTransactionalEmail = async (
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> => {
  const { brevoApiKey, brevoFromEmail, brevoFromName } = getEmailVerificationConfig();

  if (!brevoApiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!brevoFromEmail) {
    throw new Error("BREVO_FROM_EMAIL is not configured");
  }

  await axios.post(
    BREVO_SEND_EMAIL_URL,
    {
      sender: { name: brevoFromName, email: brevoFromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    },
    {
      timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    }
  );
};

export const sendVerificationEmail = async (to: string, verifyUrl: string): Promise<void> => {
  const iconSrc = buildAppIconUrl();
  const { html, text } = buildVerificationEmailContent(verifyUrl, iconSrc);

  try {
    await sendTransactionalEmail(to, "Verify your email for Notofy", html, text);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message ||
        "Failed to send verification email";
      throw new Error(message);
    }

    throw error;
  }
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<void> => {
  const iconSrc = buildAppIconUrl();
  const { html, text } = buildPasswordResetEmailContent(resetUrl, iconSrc);

  try {
    await sendTransactionalEmail(to, "Reset your Notofy password", html, text);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message ||
        "Failed to send password reset email";
      throw new Error(message);
    }

    throw error;
  }
};
