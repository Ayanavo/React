import moment from "moment";
import { Response } from "express";
import User, { IUser } from "../models/userModel.js";
import { emitUserLoginStatus } from "../websockets/socket.js";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  path: "/",
};

export const issueAuthSession = async (user: IUser, res: Response) => {
  const loginTime = moment().toDate();
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

export const invalidateUserSession = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) return;

  const now = moment().toDate();
  let totalTimeSpentMs = user.totalTimeSpentMs ?? 0;

  if (user.isLoggedIn && user.currentSessionStartedAt) {
    totalTimeSpentMs += moment(now).diff(moment(user.currentSessionStartedAt));
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
