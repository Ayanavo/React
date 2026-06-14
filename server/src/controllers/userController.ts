import { hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt, { Secret, VerifyErrors } from "jsonwebtoken";
import admin from "../firebase.js";
import User from "../models/userModel.js";
import { getUserDataByRefreshToken, getUserDataByToken, getUserIdFromRefreshToken } from "../services/userAccess.js";
import { emitUserLoginStatus } from "../websockets/socket.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  path: "/",
};

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

//Sign Up
export const signUp = async (req: Request, res: Response) => {
  // Validate input
  await body("email").isEmail().run(req);
  await body("password").isLength({ min: 6 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { photoURL, firstName, lastName, title, email, password } = req.body;

    if (!firstName || !lastName || !title || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const newUser = new User({ photoURL, firstName, lastName, title, email, ...{ password: hashedPassword } });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
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

    const loginTime = new Date();
    user.isLoggedIn = true;
    user.lastLoginAt = loginTime;
    user.currentSessionStartedAt = loginTime;
    await user.save();

    emitUserLoginStatus(user._id.toString(), true, {
      lastLoginAt: loginTime.toISOString(),
      currentSessionStartedAt: loginTime.toISOString(),
    });

    const jwt = await user.generateJwt();
    const refreshToken = await user.generateRefreshToken();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      token: jwt,
      message: "Successfully logged in",
      expiresIn: 1 * 60 * 60,
    });
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
      res.status(200).json({ user: decoded });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const saveUserProfile = async (req: Request, res: Response) => {
  try {
    if (req.headers?.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Not authenticated" });
      const decoded = await getUserDataByToken(token);
      if (decoded === null) return res.status(401).json({ message: "Invalid token" });
      const userId = decoded._id;
      const { photoURL, firstName, lastName, mobile, addressLine1, addressLine2, landmark, city, state, pincode } = req.body;

      if ([firstName, lastName, mobile, addressLine1, city, state, pincode].some((field) => field === undefined)) {
        return res.status(400).json({ message: "Required fields are missing" });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.firstName = firstName;
      user.lastName = lastName;
      user.photoURL = photoURL;
      user.mobile = mobile;
      user.address.addressLine1 = addressLine1;
      user.address.addressLine2 = addressLine2 ?? "";
      user.address.landmark = landmark ?? "";
      user.address.city = city;
      user.address.state = state;
      user.address.pincode = pincode;

      await user.save();
      res.status(200).json({ message: "Profile updated successfully" });
    }
  } catch (error) {
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

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const accessToken = req.query.access as string;
    if (!accessToken) {
      return res.status(400).json({ message: "No access token provided" });
    }
    const decoded = await admin.auth().verifyIdToken(accessToken);
    req.user = { id: decoded.uid, email: decoded.email };

    res.status(200).json({ token: decoded, message: "Successfully logged in", expiresIn: 1 * 60 * 60 });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Failed to verify token" });
  }
};
