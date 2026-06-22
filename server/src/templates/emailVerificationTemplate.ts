import { getEmailVerificationConfig } from "../config/emailVerification.js";

type VerificationEmailParams = {
  to: string;
  verifyUrl: string;
};

export const buildVerificationEmailContent = (verifyUrl: string) => {
  const { tokenTtlMinutes } = getEmailVerificationConfig();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:32px 32px 16px;text-align:center;">
              <img src="cid:app-icon" alt="Epsilon" width="64" height="64" style="display:block;margin:0 auto 16px;" />
              <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;color:#18181b;">Verify your email</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">Thanks for signing up for Epsilon. Click the button below to verify your email and continue registration.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;text-align:center;">
              <a href="${verifyUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">Verify email address</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">This link expires in ${tokenTtlMinutes} minutes. If you did not create an account, you can safely ignore this email.</p>
              <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#a1a1aa;word-break:break-all;">If the button does not work, copy and paste this URL into your browser:<br />${verifyUrl}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 32px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">&copy; ${new Date().getFullYear()} Epsilon. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Verify your email for Epsilon

Thanks for signing up. Open the link below to verify your email and continue registration:

${verifyUrl}

This link expires in ${tokenTtlMinutes} minutes.

If you did not create an account, you can safely ignore this email.`;

  return { html, text };
};

export type { VerificationEmailParams };
