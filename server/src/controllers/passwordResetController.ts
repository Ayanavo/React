import moment from "moment";
import { hash, compare } from "bcrypt";
import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import {
  buildAppIconUrl,
  buildForgotPasswordRedirectUrl,
  buildPasswordResetRedirectUrl,
  getEmailVerificationConfig,
} from "../config/emailVerification.js";
import PasswordReset from "../models/passwordResetModel.js";
import User from "../models/userModel.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { invalidateUserSession } from "../services/authSession.js";
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN, PASSWORD_PATTERN_MESSAGE } from "../utils/passwordValidation.js";
import {
  buildPasswordResetExpiredPage,
  buildPasswordResetInvalidPage,
} from "../templates/passwordResetPagesTemplate.js";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const generateResetToken = (): string => randomBytes(32).toString("hex");

const GENERIC_RESET_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";

const buildResetUrl = (email: string, rawToken: string): string => {
  const { apiPublicUrl } = getEmailVerificationConfig();
  const params = new URLSearchParams({ token: rawToken, email });
  return `${apiPublicUrl}/api/auth/reset-password?${params.toString()}`;
};

const getResendAvailableIn = (lastSentAt: Date): number => {
  const { passwordResetResendCooldownSeconds } = getEmailVerificationConfig();
  const elapsedSeconds = moment().diff(moment(lastSentAt), "seconds");
  return Math.max(0, passwordResetResendCooldownSeconds - elapsedSeconds);
};

const validateResetToken = async (email: string, rawToken: string) => {
  const record = await PasswordReset.findOne({ email });
  if (!record) {
    return { ok: false as const, reason: "invalid-link" as const };
  }

  if (moment(record.tokenExpiresAt).isBefore(moment())) {
    return { ok: false as const, reason: "expired-link" as const, record };
  }

  const tokenMatches = await compare(rawToken, record.tokenHash);
  if (!tokenMatches) {
    return { ok: false as const, reason: "invalid-link" as const };
  }

  const user = await User.findOne({ email });
  if (!user || user.oauthProvider) {
    return { ok: false as const, reason: "invalid-link" as const };
  }

  return { ok: true as const, record, user };
};

const issuePasswordResetEmail = async (email: string) => {
  const config = getEmailVerificationConfig();
  const now = moment().toDate();
  const user = await User.findOne({ email });

  if (!user || user.oauthProvider) {
    return {
      status: 200 as const,
      body: {
        message: GENERIC_RESET_MESSAGE,
        resendAvailableIn: config.passwordResetResendCooldownSeconds,
      },
    };
  }

  let record = await PasswordReset.findOne({ email });
  const retryAfterSeconds = record ? getResendAvailableIn(record.lastSentAt) : 0;

  if (retryAfterSeconds > 0) {
    return {
      status: 429 as const,
      body: {
        message: "Please wait before requesting another password reset email",
        retryAfterSeconds,
      },
    };
  }

  const rawToken = generateResetToken();
  const tokenHash = await hash(rawToken, 10);
  const tokenExpiresAt = moment(now).add(config.passwordResetTokenTtlMinutes, "minutes").toDate();

  if (record) {
    record.tokenHash = tokenHash;
    record.tokenExpiresAt = tokenExpiresAt;
    record.lastSentAt = now;
    await record.save();
  } else {
    record = await PasswordReset.create({
      email,
      tokenHash,
      tokenExpiresAt,
      lastSentAt: now,
    });
  }

  const resetUrl = buildResetUrl(email, rawToken);
  await sendPasswordResetEmail(email, resetUrl);

  return {
    status: 200 as const,
    body: {
      message: GENERIC_RESET_MESSAGE,
      resendAvailableIn: config.passwordResetResendCooldownSeconds,
    },
  };
};

export const requestPasswordResetHandler = async (req: Request, res: Response) => {
  await body("email").isEmail().normalizeEmail().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid email address", errors: errors.array() });
  }

  try {
    const email = normalizeEmail(req.body.email);
    const result = await issuePasswordResetEmail(email);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Request password reset error:", error);
    return res.status(500).json({ message: "Failed to send password reset email" });
  }
};

export const resendPasswordResetHandler = async (req: Request, res: Response) => {
  await body("email").isEmail().normalizeEmail().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid email address", errors: errors.array() });
  }

  try {
    const email = normalizeEmail(req.body.email);
    const result = await issuePasswordResetEmail(email);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Resend password reset error:", error);
    return res.status(500).json({ message: "Failed to resend password reset email" });
  }
};

export const verifyPasswordResetLinkHandler = async (req: Request, res: Response) => {
  await query("email").isEmail().run(req);
  await query("token").isString().notEmpty().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const iconSrc = buildAppIconUrl();
    return res
      .type("html")
      .send(buildPasswordResetInvalidPage({ iconSrc, actionUrl: buildForgotPasswordRedirectUrl() }));
  }

  try {
    const email = normalizeEmail(String(req.query.email));
    const rawToken = String(req.query.token);
    const iconSrc = buildAppIconUrl();
    const validation = await validateResetToken(email, rawToken);

    if (!validation.ok) {
      if (validation.reason === "expired-link") {
        return res.type("html").send(
          buildPasswordResetExpiredPage({
            email,
            returnUrl: buildForgotPasswordRedirectUrl({ email }),
            iconSrc,
          })
        );
      }

      return res
        .type("html")
        .send(buildPasswordResetInvalidPage({ iconSrc, actionUrl: buildForgotPasswordRedirectUrl() }));
    }

    const redirectUrl = buildPasswordResetRedirectUrl({ token: rawToken, email });
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Verify password reset link error:", error);
    const iconSrc = buildAppIconUrl();
    return res
      .type("html")
      .send(buildPasswordResetInvalidPage({ iconSrc, actionUrl: buildForgotPasswordRedirectUrl() }));
  }
};

export const getPasswordResetStatusHandler = async (req: Request, res: Response) => {
  await query("email").isEmail().run(req);
  await query("token").isString().notEmpty().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ valid: false, reason: "invalid-link" });
  }

  try {
    const email = normalizeEmail(String(req.query.email));
    const rawToken = String(req.query.token);
    const validation = await validateResetToken(email, rawToken);

    if (!validation.ok) {
      return res.status(200).json({ valid: false, reason: validation.reason });
    }

    return res.status(200).json({ valid: true, email });
  } catch (error) {
    console.error("Password reset status error:", error);
    return res.status(500).json({ message: "Failed to validate reset link" });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  await body("email").isEmail().normalizeEmail().run(req);
  await body("token").isString().notEmpty().run(req);
  await body("password")
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .matches(PASSWORD_PATTERN)
    .withMessage(PASSWORD_PATTERN_MESSAGE)
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  try {
    const email = normalizeEmail(req.body.email);
    const rawToken = String(req.body.token);
    const { password } = req.body;

    const validation = await validateResetToken(email, rawToken);
    if (!validation.ok) {
      const message =
        validation.reason === "expired-link"
          ? "This password reset link has expired. Please request a new one."
          : "This password reset link is invalid.";
      return res.status(400).json({ message });
    }

    const { user } = validation;
    const isSamePassword = await user.matchPassword(password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from your current password" });
    }

    user.password = await hash(password, 10);
    await user.save();
    await PasswordReset.deleteOne({ email });
    await invalidateUserSession(String(user._id));

    return res.status(200).json({ message: "Password reset successfully. You can now log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};
