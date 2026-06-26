import { hash } from "bcrypt";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt, { Secret, VerifyErrors } from "jsonwebtoken";
import admin from "../firebase.js";
import type { DecodedIdToken } from "firebase-admin/auth";
import User, { IUser } from "../models/userModel.js";
import { getUserDataByRefreshToken, getUserDataByToken, getUserIdFromRefreshToken } from "../services/userAccess.js";
import { emitUserLoginStatus } from "../websockets/socket.js";
import { assertEmailVerifiedForRegistration, clearVerificationRecord } from "./emailVerificationController.js";
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN, PASSWORD_PATTERN_MESSAGE } from "../utils/passwordValidation.js";
import { grantDefaultUserAccess } from "../services/userPermissions.js";
import { CompanyProfile, formatCompaniesForResponse, sanitizeCompanies } from "../utils/profileValidation.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  path: "/",
};

const formatCompanies = (companies: unknown): CompanyProfile[] => formatCompaniesForResponse(companies);

const formatUserProfileResponse = (user: Record<string, any>) => ({
  ...user,
  companies: formatCompanies(user.companies),
});

const invalidateUserSession = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  let totalTimeSpentMs = user.totalTimeSpentMs ?? 0;

  if (user.isLoggedIn && user.currentSessionStartedAt) {
    totalTimeSpentMs += now.getTime() - user.currentSessionStartedAt.getTime();
  }

  user.isLoggedIn = false;
  user.lastLogoutAt = now;
  user.totalTimeSpentMs = totalTimeSpentMs;
  user.currentSessionStartedAt = null;
  await user.save();

  emitUserLoginStatus(userId, false, {
    lastLogoutAt: now.toISOString(),
    totalTimeSpentMs,
    currentSessionStartedAt: null,
  });
};

const issueAuthSession = async (user: IUser, res: Response) => {
  const loginTime = new Date();
  user.isLoggedIn = true;
  user.lastLoginAt = loginTime;
  user.currentSessionStartedAt = loginTime;
  await user.save();

  emitUserLoginStatus(String(user._id), true, {
    lastLoginAt: loginTime.toISOString(),
    currentSessionStartedAt: loginTime.toISOString(),
  });

  const accessToken = user.generateJwt();
  const refreshTokenValue = user.generateRefreshToken();

  res.cookie("refreshToken", refreshTokenValue, refreshCookieOptions);

  return {
    token: accessToken,
    message: "Successfully logged in",
    expiresIn: 1 * 60 * 60,
  };
};

//Sign Up
export const signUp = async (req: Request, res: Response) => {
  // Validate input
  await body("email").isEmail().run(req);
  await body("password")
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .matches(PASSWORD_PATTERN)
    .withMessage(PASSWORD_PATTERN_MESSAGE)
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { photoURL, firstName, lastName, title, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (!firstName || !lastName || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const verificationCheck = await assertEmailVerifiedForRegistration(normalizedEmail);
    if (!verificationCheck.ok) {
      return res.status(400).json({ message: verificationCheck.message });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const newUser = new User({
      photoURL,
      firstName,
      lastName,
      title: title ?? "",
      email: normalizedEmail,
      password: hashedPassword,
    });
    await newUser.save();
    await grantDefaultUserAccess(String(newUser._id));
    await clearVerificationRecord(normalizedEmail);

    const authResponse = await issueAuthSession(newUser, res);
    res.status(201).json({
      ...authResponse,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const login = async (req: Request, res: Response) => {
  // Validate input
  await body("email").isEmail().run(req);
  await body("password").isLength({ min: 6 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  try {
    const { email, password } = req.body;

    // Set a timeout for the database operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database operation timed out")), 5000);
    });

    // Race between the database operation and the timeout
    const user = (await Promise.race([User.findOne({ email }), timeoutPromise])) as any;

    if (!user) {
      return res.status(401).json({
        message: "Email is not registered",
        status: "error",
      });
    }

    const isValidPassword = await Promise.race([user.matchPassword(password), timeoutPromise]);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid password",
        status: "error",
      });
    }

    const authResponse = await issueAuthSession(user, res);

    return res.status(200).json(authResponse);
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific error types
    if (error instanceof Error && error.message === "Database operation timed out") {
      return res.status(504).json({
        message: "Login request timed out. Please try again.",
        status: "error",
      });
    }

    return res.status(500).json({
      message: "An error occurred during login. Please try again.",
      status: "error",
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    let user = token ? await getUserDataByToken(token) : null;

    if (!user) {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        user = await getUserDataByRefreshToken(refreshToken);
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    await invalidateUserSession(user._id.toString());

    res.clearCookie("refreshToken", refreshCookieOptions);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to logout" });
  }
};

// authentication
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.API_SECRET_KEY as Secret, (err: VerifyErrors | null, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    req.user = decoded;
    next();
  });
}

// Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  const cookieRefreshToken = req.cookies.refreshToken;

  if (!cookieRefreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const user = await getUserDataByRefreshToken(cookieRefreshToken);
    if (!user) {
      const userId = getUserIdFromRefreshToken(cookieRefreshToken);
      if (userId) {
        await invalidateUserSession(userId);
      }
      res.clearCookie("refreshToken", refreshCookieOptions);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      await invalidateUserSession(user._id.toString());
      res.clearCookie("refreshToken", refreshCookieOptions);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newToken = userDoc.generateJwt();

    res.status(200).json({
      token: newToken,
      message: "Token refreshed successfully",
      expiresIn: 1 * 60 * 60,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    const userId = getUserIdFromRefreshToken(cookieRefreshToken);
    if (userId) {
      await invalidateUserSession(userId);
    }
    res.clearCookie("refreshToken", refreshCookieOptions);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (req.headers?.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = await getUserDataByToken(token);
      if (decoded === null) return res.status(401).json({ message: "Invalid token" });
      if (!decoded) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user: formatUserProfileResponse(decoded as Record<string, any>) });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const saveUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.headers?.authorization) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = await getUserDataByToken(token);
    if (decoded === null) return res.status(401).json({ message: "Invalid token" });

    const userId = decoded._id;
    const { photoURL, firstName, lastName, mobile, addressLine1, addressLine2, landmark, city, state, pincode, companies } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sanitizedCompanies = sanitizeCompanies(companies);

    user.firstName = firstName;
    user.lastName = lastName;
    user.photoURL = photoURL ?? "";
    user.mobile = mobile;
    user.address.addressLine1 = addressLine1;
    user.address.addressLine2 = addressLine2 ?? "";
    user.address.landmark = landmark ?? "";
    user.address.city = city;
    user.address.state = state;
    user.address.pincode = pincode;
    user.companies = sanitizedCompanies;
    user.markModified("companies");

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      companies: sanitizedCompanies,
    });
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors ?? {}).map((entry: any) => ({
          field: entry.path,
          message: entry.message,
        })),
      });
    }

    if (error?.code === 11000) {
      return res.status(409).json({ message: "Mobile number is already in use" });
    }

    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const saveSettings = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const { date_format, currency_format, font_style, theme } = req.body;
    if ([date_format, currency_format, font_style, theme].some((field) => field === undefined || field === "")) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const decoded = await getUserDataByToken(token);
    if (decoded === null) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.settings = {
      date_format,
      currency_format,
      font_style,
      theme,
    };

    await user.save();
    res.status(200).json({ message: "Settings saved successfully", settings: user.settings });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ message: "Failed to save settings" });
  }
};

type SocialAuthProvider = "google.com" | "github.com";

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

const resolveSocialAuthProvider = (provider: string | undefined): SocialAuthProvider | null => {
  if (provider === "google.com" || provider === "github.com") {
    return provider;
  }
  return null;
};

const findOrCreateSocialUser = async (decoded: DecodedIdToken): Promise<{ user: IUser; isNewUser: boolean }> => {
  const email = decoded.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("SOCIAL_EMAIL_REQUIRED");
  }

  const firebaseUid = decoded.uid;
  const authProvider = resolveSocialAuthProvider(decoded.firebase?.sign_in_provider);
  if (!authProvider) {
    throw new Error("SOCIAL_PROVIDER_UNSUPPORTED");
  }

  const photoURL = decoded.picture ?? "";
  const { firstName, lastName } = parseDisplayName(decoded.name, email);

  let user = await User.findOne({ $or: [{ firebaseUid }, { email }] });

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await hash(randomPassword, 10);

    user = new User({
      photoURL,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      firebaseUid,
      authProvider,
    });
    await user.save();
    await grantDefaultUserAccess(String(user._id));
    return { user, isNewUser: true };
  }

  if (user.firebaseUid && user.firebaseUid !== firebaseUid) {
    throw new Error("SOCIAL_ACCOUNT_CONFLICT");
  }

  if (!user.firebaseUid) {
    user.firebaseUid = firebaseUid;
  }

  user.authProvider = authProvider;

  if (photoURL && !user.photoURL) {
    user.photoURL = photoURL;
  }

  if (!user.firstName?.trim()) {
    user.firstName = firstName;
  }

  if (!user.lastName?.trim()) {
    user.lastName = lastName;
  }

  await user.save();
  return { user, isNewUser: false };
};

export const socialLogin = async (req: Request, res: Response) => {
  try {
    const idToken = (req.body?.idToken ?? req.query.access) as string | undefined;
    if (!idToken) {
      return res.status(400).json({ message: "No ID token provided" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { user, isNewUser } = await findOrCreateSocialUser(decoded);
    const authResponse = await issueAuthSession(user, res);

    return res.status(200).json({
      ...authResponse,
      isNewUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SOCIAL_EMAIL_REQUIRED") {
        return res.status(400).json({
          message: "Your social account did not share an email address. Please use a provider that exposes your email or register with email instead.",
        });
      }

      if (error.message === "SOCIAL_PROVIDER_UNSUPPORTED") {
        return res.status(400).json({ message: "Unsupported social sign-in provider." });
      }

      if (error.message === "SOCIAL_ACCOUNT_CONFLICT") {
        return res.status(409).json({
          message: "This email is already linked to a different social account.",
        });
      }
    }

    console.error("Social login error:", error);
    return res.status(401).json({ message: "Social authentication failed. Please try again." });
  }
};

export const verifyToken = socialLogin;
