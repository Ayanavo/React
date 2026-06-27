import moment from "moment";
import { hash, compare } from "bcrypt";
import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import { getEmailVerificationConfig, buildRegistrationRedirectUrl } from "../config/emailVerification.js";
import RegistrationVerification from "../models/registrationVerificationModel.js";
import User from "../models/userModel.js";
import { sendVerificationEmail } from "../services/emailService.js";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const generateVerificationToken = (): string => randomBytes(32).toString("hex");

const buildVerifyUrl = (email: string, rawToken: string): string => {
  const { apiPublicUrl } = getEmailVerificationConfig();
  const params = new URLSearchParams({ token: rawToken, email });
  return `${apiPublicUrl}/api/auth/verify-email?${params.toString()}`;
};

const getResendAvailableIn = (lastSentAt: Date): number => {
  const { resendCooldownSeconds } = getEmailVerificationConfig();
  const elapsedSeconds = moment().diff(moment(lastSentAt), "seconds");
  return Math.max(0, resendCooldownSeconds - elapsedSeconds);
};

const issueVerificationEmail = async (email: string, forceResend = false) => {
  const config = getEmailVerificationConfig();
  const now = moment().toDate();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { status: 409 as const, body: { message: "Email is already registered" } };
  }

  let record = await RegistrationVerification.findOne({ email });

  if (record && !forceResend) {
    const retryAfterSeconds = getResendAvailableIn(record.lastSentAt);
    if (retryAfterSeconds > 0) {
      return {
        status: 429 as const,
        body: {
          message: "Please wait before requesting another verification email",
          retryAfterSeconds,
        },
      };
    }
  }

  if (record?.isVerified && record.registrationExpiresAt && record.registrationExpiresAt > now) {
    return {
      status: 200 as const,
      body: {
        message: "Email is already verified",
        alreadyVerified: true,
        registrationExpiresAt: record.registrationExpiresAt.toISOString(),
      },
    };
  }

  const rawToken = generateVerificationToken();
  const tokenHash = await hash(rawToken, 10);
  const tokenExpiresAt = moment(now).add(config.tokenTtlMinutes, "minutes").toDate();

  if (record) {
    record.tokenHash = tokenHash;
    record.tokenExpiresAt = tokenExpiresAt;
    record.registrationExpiresAt = null;
    record.isVerified = false;
    record.verifiedAt = null;
    record.lastSentAt = now;
    await record.save();
  } else {
    record = await RegistrationVerification.create({
      email,
      tokenHash,
      tokenExpiresAt,
      registrationExpiresAt: null,
      isVerified: false,
      verifiedAt: null,
      lastSentAt: now,
    });
  }

  const verifyUrl = buildVerifyUrl(email, rawToken);
  await sendVerificationEmail(email, verifyUrl);

  return {
    status: 200 as const,
    body: {
      message: "Verification email sent",
      resendAvailableIn: config.resendCooldownSeconds,
    },
  };
};

export const sendVerificationEmailHandler = async (req: Request, res: Response) => {
  await body("email").isEmail().normalizeEmail().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid email address", errors: errors.array() });
  }

  try {
    const email = normalizeEmail(req.body.email);
    const result = await issueVerificationEmail(email, false);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Send verification email error:", error);
    return res.status(500).json({ message: "Failed to send verification email" });
  }
};

export const resendVerificationEmailHandler = async (req: Request, res: Response) => {
  await body("email").isEmail().normalizeEmail().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid email address", errors: errors.array() });
  }

  try {
    const email = normalizeEmail(req.body.email);
    const record = await RegistrationVerification.findOne({ email });

    if (record) {
      const retryAfterSeconds = getResendAvailableIn(record.lastSentAt);
      if (retryAfterSeconds > 0) {
        return res.status(429).json({
          message: "Please wait before requesting another verification email",
          retryAfterSeconds,
        });
      }
    }

    const result = await issueVerificationEmail(email, true);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Resend verification email error:", error);
    return res.status(500).json({ message: "Failed to resend verification email" });
  }
};

export const verifyEmailLinkHandler = async (req: Request, res: Response) => {
  await query("email").isEmail().run(req);
  await query("token").isString().notEmpty().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid verification link" });
  }

  try {
    const email = normalizeEmail(String(req.query.email));
    const rawToken = String(req.query.token);
    const { registrationWindowMinutes } = getEmailVerificationConfig();

    const record = await RegistrationVerification.findOne({ email });
    if (!record) {
      return res.redirect(buildRegistrationRedirectUrl({ error: "invalid-link" }));
    }

    if (moment(record.tokenExpiresAt).isBefore(moment())) {
      return res.redirect(
        buildRegistrationRedirectUrl({ error: "expired-link", email })
      );
    }

    const tokenMatches = await compare(rawToken, record.tokenHash);
    if (!tokenMatches) {
      return res.redirect(buildRegistrationRedirectUrl({ error: "invalid-link" }));
    }

    const now = moment().toDate();
    const registrationExpiresAt = moment(now).add(registrationWindowMinutes, "minutes").toDate();
    record.isVerified = true;
    record.verifiedAt = now;
    record.registrationExpiresAt = registrationExpiresAt;
    record.tokenExpiresAt = registrationExpiresAt;
    await record.save();

    return res.redirect(buildRegistrationRedirectUrl({ step: "details", email }));
  } catch (error) {
    console.error("Verify email link error:", error);
    return res.redirect(buildRegistrationRedirectUrl({ error: "verification-failed" }));
  }
};

export const getVerificationStatusHandler = async (req: Request, res: Response) => {
  await query("email").isEmail().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    const email = normalizeEmail(String(req.query.email));
    const now = moment().toDate();
    const record = await RegistrationVerification.findOne({ email });

    if (!record) {
      return res.status(200).json({
        isVerified: false,
        registrationExpiresAt: null,
        canRegister: false,
      });
    }

    const registrationWindowValid = Boolean(record.registrationExpiresAt && record.registrationExpiresAt > now);

    return res.status(200).json({
      isVerified: record.isVerified && registrationWindowValid,
      registrationExpiresAt: record.registrationExpiresAt?.toISOString() ?? null,
      canRegister: record.isVerified && registrationWindowValid,
    });
  } catch (error) {
    console.error("Verification status error:", error);
    return res.status(500).json({ message: "Failed to fetch verification status" });
  }
};

export const assertEmailVerifiedForRegistration = async (email: string) => {
  const normalizedEmail = normalizeEmail(email);
  const record = await RegistrationVerification.findOne({ email: normalizedEmail });

  if (!record?.isVerified || !record.registrationExpiresAt) {
    return { ok: false as const, message: "Email is not verified" };
  }

  if (moment(record.registrationExpiresAt).isBefore(moment())) {
    return { ok: false as const, message: "Registration window has expired. Please verify your email again." };
  }

  return { ok: true as const, record };
};

export const clearVerificationRecord = async (email: string): Promise<void> => {
  await RegistrationVerification.deleteOne({ email: normalizeEmail(email) });
};
