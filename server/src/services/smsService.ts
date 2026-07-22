import axios from "axios";
import { getMobileVerificationConfig, normalizeMobileNumber } from "../config/mobileVerification.js";

const BREVO_SEND_SMS_URL = "https://api.brevo.com/v3/transactionalSMS/send";
const EXTERNAL_REQUEST_TIMEOUT_MS = 30_000;

export const sendVerificationSms = async (mobile: string, otp: string): Promise<void> => {
  const { brevoApiKey, brevoSmsSender } = getMobileVerificationConfig();

  if (!brevoApiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!brevoSmsSender) {
    throw new Error("BREVO_SMS_SENDER is not configured");
  }

  const recipient = normalizeMobileNumber(mobile);
  if (!recipient) {
    throw new Error("Mobile number is invalid");
  }

  try {
    await axios.post(
      BREVO_SEND_SMS_URL,
      {
        sender: brevoSmsSender,
        recipient,
        content: `Your Notofy verification code is ${otp}. It expires in 10 minutes.`,
        type: "transactional",
        tag: "mobile-verification",
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
        "Failed to send verification SMS";
      throw new Error(message);
    }

    throw error;
  }
};
