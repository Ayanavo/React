import crypto from "crypto";
import axios from "axios";
import { hash } from "bcrypt";
import { getOAuthConfig, OAuthProvider } from "../config/oauth.js";
import User, { IUser } from "../models/userModel.js";
import { grantDefaultUserAccess } from "./userPermissions.js";

const EXTERNAL_REQUEST_TIMEOUT_MS = 30_000;

export type OAuthProfile = {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  photoURL: string;
};

const isOAuthProvider = (value: string): value is OAuthProvider => value === "google" || value === "github";

export const createOAuthState = (provider: OAuthProvider): string => {
  const { stateSecret } = getOAuthConfig();
  if (!stateSecret) {
    throw new Error("API_SECRET_KEY is not configured");
  }

  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${provider}:${nonce}`;
  const signature = crypto.createHmac("sha256", stateSecret).update(payload).digest("hex");
  return `${payload}:${signature}`;
};

export const parseOAuthState = (state: string): OAuthProvider => {
  const { stateSecret } = getOAuthConfig();
  const [provider, nonce, signature] = state.split(":");

  if (!provider || !nonce || !signature || !isOAuthProvider(provider)) {
    throw new Error("INVALID_OAUTH_STATE");
  }

  const payload = `${provider}:${nonce}`;
  const expectedSignature = crypto.createHmac("sha256", stateSecret).update(payload).digest("hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error("INVALID_OAUTH_STATE");
  }

  return provider;
};

const parseDisplayName = (displayName: string | undefined, email: string): { firstName: string; lastName: string } => {
  const trimmed = displayName?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: parts[0] };
    }
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }

  const localPart = email.split("@")[0] ?? "User";
  return { firstName: localPart, lastName: "User" };
};

const getProviderCredentials = (provider: OAuthProvider) => {
  const config = getOAuthConfig();
  const credentials = config[provider];

  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error(`${provider.toUpperCase()}_OAUTH_NOT_CONFIGURED`);
  }

  return credentials;
};

export const buildProviderAuthorizeUrl = (provider: OAuthProvider): string => {
  const { callbackUrl } = getOAuthConfig();
  const credentials = getProviderCredentials(provider);
  const state = createOAuthState(provider);

  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    state,
    scope: credentials.scope,
  });

  if (provider === "google") {
    params.set("access_type", "online");
    params.set("prompt", "select_account");
  }

  return `${credentials.authorizeUrl}?${params.toString()}`;
};

const fetchGoogleProfile = async (code: string): Promise<OAuthProfile> => {
  const { callbackUrl } = getOAuthConfig();
  const credentials = getProviderCredentials("google");

  const tokenResponse = await axios.post(
    credentials.tokenUrl,
    new URLSearchParams({
      code,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
    {
      timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const accessToken = tokenResponse.data?.access_token as string | undefined;
  if (!accessToken) {
    throw new Error("OAUTH_TOKEN_EXCHANGE_FAILED");
  }

  const profileResponse = await axios.get(credentials.profileUrl, {
    timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const email = String(profileResponse.data?.email ?? "").trim().toLowerCase();
  if (!email) {
    throw new Error("OAUTH_EMAIL_REQUIRED");
  }

  const { firstName, lastName } = parseDisplayName(profileResponse.data?.name, email);

  return {
    provider: "google",
    providerUserId: String(profileResponse.data?.id ?? ""),
    email,
    firstName,
    lastName,
    photoURL: String(profileResponse.data?.picture ?? ""),
  };
};

const fetchGitHubProfile = async (code: string): Promise<OAuthProfile> => {
  const { callbackUrl, github } = getOAuthConfig();
  const credentials = getProviderCredentials("github");

  const tokenResponse = await axios.post(
    credentials.tokenUrl,
    {
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      code,
      redirect_uri: callbackUrl,
    },
    {
      timeout: EXTERNAL_REQUEST_TIMEOUT_MS,
      headers: { Accept: "application/json" },
    }
  );

  const accessToken = tokenResponse.data?.access_token as string | undefined;
  if (!accessToken) {
    throw new Error("OAUTH_TOKEN_EXCHANGE_FAILED");
  }

  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "Notofy-OAuth",
  };

  const [profileResponse, emailsResponse] = await Promise.all([
    axios.get(credentials.profileUrl, { timeout: EXTERNAL_REQUEST_TIMEOUT_MS, headers: authHeaders }),
    axios.get(github.emailsUrl, { timeout: EXTERNAL_REQUEST_TIMEOUT_MS, headers: authHeaders }),
  ]);

  const emails = Array.isArray(emailsResponse.data) ? emailsResponse.data : [];
  const primaryEmail =
    emails.find((entry: { primary?: boolean; verified?: boolean; email?: string }) => entry.primary && entry.verified)
      ?.email ??
    emails.find((entry: { verified?: boolean; email?: string }) => entry.verified)?.email ??
    emails[0]?.email ??
    profileResponse.data?.email;

  const email = String(primaryEmail ?? "").trim().toLowerCase();
  if (!email) {
    throw new Error("OAUTH_EMAIL_REQUIRED");
  }

  const displayName = profileResponse.data?.name || profileResponse.data?.login;
  const { firstName, lastName } = parseDisplayName(displayName, email);

  return {
    provider: "github",
    providerUserId: String(profileResponse.data?.id ?? ""),
    email,
    firstName,
    lastName,
    photoURL: String(profileResponse.data?.avatar_url ?? ""),
  };
};

export const fetchOAuthProfile = async (provider: OAuthProvider, code: string): Promise<OAuthProfile> => {
  if (provider === "google") {
    return fetchGoogleProfile(code);
  }
  return fetchGitHubProfile(code);
};

export const findOrCreateOAuthUser = async (profile: OAuthProfile): Promise<{ user: IUser; isNewUser: boolean }> => {
  let user = await User.findOne({
    $or: [{ email: profile.email }, { oauthProvider: profile.provider, oauthId: profile.providerUserId }],
  });

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await hash(randomPassword, 10);

    user = new User({
      photoURL: profile.photoURL,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      password: hashedPassword,
      oauthProvider: profile.provider,
      oauthId: profile.providerUserId,
    });
    await user.save();
    await grantDefaultUserAccess(String(user._id));
    return { user, isNewUser: true };
  }

  if (user.oauthId && user.oauthProvider && user.oauthId !== profile.providerUserId) {
    throw new Error("OAUTH_ACCOUNT_CONFLICT");
  }

  if (!user.oauthId) {
    user.oauthId = profile.providerUserId;
    user.oauthProvider = profile.provider;
  }

  if (profile.photoURL && !user.photoURL) {
    user.photoURL = profile.photoURL;
  }

  if (!user.firstName?.trim()) {
    user.firstName = profile.firstName;
  }

  if (!user.lastName?.trim()) {
    user.lastName = profile.lastName;
  }

  await user.save();
  return { user, isNewUser: false };
};
