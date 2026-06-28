import moment from "moment";

type PasswordResetPageParams = {
  title: string;
  heading: string;
  message: string;
  email?: string;
  iconSrc: string;
  badgeSymbol: string;
  badgeBackground: string;
  actionLabel: string;
  actionUrl: string;
};

const buildPasswordResetPage = ({
  title,
  heading,
  message,
  email,
  iconSrc,
  badgeSymbol,
  badgeBackground,
  actionLabel,
  actionUrl,
}: PasswordResetPageParams): string => {
  const emailLine = email
    ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#71717a;"><strong style="color:#18181b;">${email}</strong></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;min-height:100vh;padding:32px 16px;">
    <tr>
      <td align="center" valign="middle">
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
                      style="display:block;width:96px;height:96px;max-width:96px;border:0;outline:none;text-decoration:none;"
                    />
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;font-size:18px;font-weight:700;color:#ea580c;letter-spacing:0.03em;">Notofy</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 16px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:${badgeBackground};line-height:56px;font-size:28px;margin-bottom:12px;">${badgeSymbol}</div>
              <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;color:#18181b;">${heading}</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">${message}</p>
              ${emailLine}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;text-align:center;">
              <a href="${actionUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">${actionLabel}</a>
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
};

type PageWithEmailParams = {
  email: string;
  iconSrc: string;
};

export const buildPasswordResetExpiredPage = ({
  email,
  returnUrl,
  iconSrc,
}: PageWithEmailParams & { returnUrl: string }): string =>
  buildPasswordResetPage({
    title: "Reset link expired",
    heading: "Reset link expired",
    message: "This password reset link has expired. Return to the application to request a new one.",
    email,
    iconSrc,
    badgeSymbol: "&#9201;",
    badgeBackground: "#fee2e2",
    actionLabel: "Request new reset link",
    actionUrl: returnUrl,
  });

export const buildPasswordResetInvalidPage = ({ iconSrc, actionUrl }: { iconSrc: string; actionUrl: string }): string =>
  buildPasswordResetPage({
    title: "Invalid reset link",
    heading: "Invalid reset link",
    message: "This password reset link is invalid or has already been used. Please request a new reset link.",
    iconSrc,
    badgeSymbol: "&#10007;",
    badgeBackground: "#fee2e2",
    actionLabel: "Back to forgot password",
    actionUrl,
  });
