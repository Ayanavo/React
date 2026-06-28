import moment from "moment";
import { getEmailVerificationConfig } from "../config/emailVerification.js";

export const buildPasswordResetEmailContent = (resetUrl: string, iconSrc: string) => {
  const { passwordResetTokenTtlMinutes } = getEmailVerificationConfig();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td align="center" style="padding:32px 32px 12px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background-color:#fff7ed;border:1px solid #fdba74;border-radius:20px;padding:18px;line-height:0;">
                    <img
                      src="${iconSrc}"
                      alt="Notofy"
                      width="96"
                      height="96"
                      style="display:block;width:96px;height:96px;max-width:96px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"
                    />
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;font-size:18px;font-weight:700;color:#ea580c;letter-spacing:0.03em;">Notofy</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 16px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;color:#18181b;">Reset your password</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">We received a request to reset your Notofy password. Click the button below to choose a new password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;text-align:center;">
              <a href="${resetUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">Reset password</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">This link expires in ${passwordResetTokenTtlMinutes} minutes. If you did not request a password reset, you can safely ignore this email.</p>
              <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#a1a1aa;word-break:break-all;">If the button does not work, copy and paste this URL into your browser:<br />${resetUrl}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 32px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">&copy; ${moment().year()} Notofy. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Reset your password for Notofy

We received a request to reset your password. Open the link below to choose a new password:

${resetUrl}

This link expires in ${passwordResetTokenTtlMinutes} minutes.

If you did not request a password reset, you can safely ignore this email.`;

  return { html, text };
};
