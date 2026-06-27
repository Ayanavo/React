import { Request, Response } from "express";
import { buildOAuthRedirectUrl, OAuthProvider } from "../config/oauth.js";
import { issueAuthSession } from "../services/authSession.js";
import { buildProviderAuthorizeUrl, fetchOAuthProfile, findOrCreateOAuthUser, parseOAuthState } from "../services/oauthService.js";

const isOAuthProvider = (value: string): value is OAuthProvider => value === "google" || value === "github";

const redirectWithError = (res: Response, message: string) => {
  return res.redirect(buildOAuthRedirectUrl({ error: message }));
};

export const startOAuthHandler = (req: Request, res: Response) => {
  const provider = String(req.params.provider ?? "");

  if (!isOAuthProvider(provider)) {
    return res.status(400).json({ message: "Unsupported OAuth provider" });
  }

  try {
    const authorizeUrl = buildProviderAuthorizeUrl(provider);
    return res.redirect(authorizeUrl);
  } catch (error) {
    console.error("OAuth start error:", error);
    if (error instanceof Error && error.message.endsWith("_OAUTH_NOT_CONFIGURED")) {
      return res.status(500).json({ message: `${provider} OAuth is not configured on the server` });
    }
    return res.status(500).json({ message: "Failed to start OAuth sign-in" });
  }
};

export const oauthCallbackHandler = async (req: Request, res: Response) => {
  const oauthError = typeof req.query.error === "string" ? req.query.error : undefined;
  if (oauthError) {
    return redirectWithError(res, "OAuth sign-in was cancelled or denied");
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";

  if (!code || !state) {
    return redirectWithError(res, "Invalid OAuth callback");
  }

  try {
    const provider = parseOAuthState(state);
    const profile = await fetchOAuthProfile(provider, code);
    const { user, isNewUser } = await findOrCreateOAuthUser(profile);
    const authResponse = await issueAuthSession(user, res);

    return res.redirect(
      buildOAuthRedirectUrl({
        token: authResponse.token,
        isNewUser: String(isNewUser),
      })
    );
  } catch (error) {
    console.error("OAuth callback error:", error);

    if (error instanceof Error) {
      if (error.message === "INVALID_OAUTH_STATE") {
        return redirectWithError(res, "OAuth state validation failed. Please try again.");
      }
      if (error.message === "OAUTH_EMAIL_REQUIRED") {
        return redirectWithError(
          res,
          "Your account did not share an email address. Please use a provider that exposes your email."
        );
      }
      if (error.message === "OAUTH_ACCOUNT_CONFLICT") {
        return redirectWithError(res, "This email is already linked to a different OAuth account.");
      }
      if (error.message.endsWith("_OAUTH_NOT_CONFIGURED")) {
        return redirectWithError(res, "OAuth provider is not configured on the server.");
      }
    }

    return redirectWithError(res, "OAuth authentication failed. Please try again.");
  }
};
