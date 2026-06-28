import axios from "axios";
import { buildAppIconUrl, getEmailVerificationConfig } from "../config/emailVerification.js";
import { buildVerificationEmailContent } from "../templates/emailVerificationTemplate.js";

const BREVO_SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";
const EXTERNAL_REQUEST_TIMEOUT_MS = 30_000;

export const sendVerificationEmail = async (to: string, verifyUrl: string): Promise<void> => {
  const { brevoApiKey, brevoFromEmail, brevoFromName } = getEmailVerificationConfig();

  if (!brevoApiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!brevoFromEmail) {
    throw new Error("BREVO_FROM_EMAIL is not configured");
  }

  const iconSrc = buildAppIconUrl();
  const { html, text } = buildVerificationEmailContent(verifyUrl, iconSrc);

  try {
    await axios.post(
      BREVO_SEND_EMAIL_URL,
      {
        sender: { name: brevoFromName, email: brevoFromEmail },
        to: [{ email: to }],
        subject: "Verify your email for Notofy",
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
