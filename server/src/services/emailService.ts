import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import { getEmailVerificationConfig } from "../config/emailVerification.js";
import { buildVerificationEmailContent } from "../templates/emailVerificationTemplate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let resendClient: Resend | null = null;

const getResendClient = (): Resend => {
  if (!resendClient) {
    const { resendApiKey } = getEmailVerificationConfig();
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(resendApiKey);
  }
  return resendClient;
};

const getAppIconAttachment = () => {
  const iconPath = join(__dirname, "../assets/app-icon.svg");
  return {
    filename: "app-icon.svg",
    content: readFileSync(iconPath),
    contentId: "app-icon",
  };
};

export const sendVerificationEmail = async (to: string, verifyUrl: string): Promise<void> => {
  const { resendFromEmail } = getEmailVerificationConfig();
  if (!resendFromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  const { html, text } = buildVerificationEmailContent(verifyUrl);
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: resendFromEmail,
    to,
    subject: "Verify your email for Epsilon",
    html,
    text,
    attachments: [getAppIconAttachment()],
  });

  if (error) {
    throw new Error(error.message || "Failed to send verification email");
  }
};
