import moment from "moment";
import { compare, hash } from "bcrypt";
import { randomInt } from "crypto";
import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { getMobileVerificationConfig, normalizeMobileNumber } from "../config/mobileVerification.js";
import MobileVerification from "../models/mobileVerificationModel.js";
import User from "../models/userModel.js";
import { sendVerificationSms } from "../services/smsService.js";
import { buildFullMobileNumber, normalizeIsdCode } from "../utils/mobileIsd.js";

const NATIONAL_MOBILE_PATTERN = /^[1-9]\d{5,14}$/;
const ISD_PATTERN = /^\d{1,4}$/;

const getResendAvailableIn = (lastSentAt: Date): number => {
  const { resendCooldownSeconds } = getMobileVerificationConfig();
  const elapsedSeconds = moment().diff(moment(lastSentAt), "seconds");
  return Math.max(0, resendCooldownSeconds - elapsedSeconds);
};

const generateOtp = (): string => String(randomInt(100000, 1000000));

const resolveMobileParts = (req: Request) => {
  const mobile = String(req.body.mobile ?? "").replace(/\D/g, "");
  const mobileIsd = normalizeIsdCode(req.body.mobileIsd);
  const fullMobile = buildFullMobileNumber(mobileIsd, mobile);
  return { mobile, mobileIsd, fullMobile };
};

export const sendMobileOtpValidators = [
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(NATIONAL_MOBILE_PATTERN)
    .withMessage("Mobile number format is invalid"),
  body("mobileIsd")
    .optional({ values: "falsy" })
    .trim()
    .matches(ISD_PATTERN)
    .withMessage("ISD code is invalid"),
];

export const verifyMobileOtpValidators = [
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(NATIONAL_MOBILE_PATTERN)
    .withMessage("Mobile number format is invalid"),
  body("mobileIsd")
    .optional({ values: "falsy" })
    .trim()
    .matches(ISD_PATTERN)
    .withMessage("ISD code is invalid"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must be numeric"),
];

export const handleMobileVerificationValidation = (req: Request, res: Response, next: () => void) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

export const sendMobileOtpHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { mobile, mobileIsd, fullMobile } = resolveMobileParts(req);
    const config = getMobileVerificationConfig();
    const now = moment().toDate();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.mobileVerified &&
      user.mobile === mobile &&
      normalizeIsdCode(user.mobileIsd) === mobileIsd
    ) {
      return res.status(200).json({
        message: "Mobile number is already verified",
        alreadyVerified: true,
        mobileVerified: true,
      });
    }

    const existingOwner = await User.findOne({
      mobile,
      mobileIsd,
      _id: { $ne: userId },
    });
    if (existingOwner) {
      return res.status(409).json({ message: "Mobile number is already in use" });
    }

    let record = await MobileVerification.findOne({ userId });

    if (record) {
      const retryAfterSeconds = getResendAvailableIn(record.lastSentAt);
      if (retryAfterSeconds > 0) {
        return res.status(429).json({
          message: "Please wait before requesting another OTP",
          retryAfterSeconds,
        });
      }
    }

    const otp = generateOtp();
    const otpHash = await hash(otp, 10);
    const otpExpiresAt = moment(now).add(config.otpTtlMinutes, "minutes").toDate();

    if (record) {
      record.mobile = fullMobile;
      record.otpHash = otpHash;
      record.otpExpiresAt = otpExpiresAt;
      record.lastSentAt = now;
      record.attempts = 0;
      await record.save();
    } else {
      record = await MobileVerification.create({
        userId,
        mobile: fullMobile,
        otpHash,
        otpExpiresAt,
        lastSentAt: now,
        attempts: 0,
      });
    }

    await sendVerificationSms(fullMobile, otp);

    return res.status(200).json({
      message: "Verification code sent successfully",
      expiresAt: otpExpiresAt.toISOString(),
      retryAfterSeconds: config.resendCooldownSeconds,
    });
  } catch (error) {
    console.error("Send mobile OTP error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to send verification code",
    });
  }
};

export const verifyMobileOtpHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { mobile, mobileIsd, fullMobile } = resolveMobileParts(req);
    const otp = String(req.body.otp).trim();
    const config = getMobileVerificationConfig();
    const now = moment().toDate();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const record = await MobileVerification.findOne({ userId });
    if (!record) {
      return res.status(400).json({ message: "No verification code found. Please request a new one." });
    }

    if (normalizeMobileNumber(record.mobile) !== normalizeMobileNumber(fullMobile)) {
      return res.status(400).json({ message: "Mobile number does not match the verification request" });
    }

    if (record.otpExpiresAt <= now) {
      await record.deleteOne();
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (record.attempts >= config.maxAttempts) {
      await record.deleteOne();
      return res.status(429).json({ message: "Too many invalid attempts. Please request a new code." });
    }

    const isValid = await compare(otp, record.otpHash);
    if (!isValid) {
      record.attempts += 1;
      await record.save();
      const remainingAttempts = Math.max(0, config.maxAttempts - record.attempts);
      return res.status(400).json({
        message: "Invalid verification code",
        remainingAttempts,
      });
    }

    const existingOwner = await User.findOne({
      mobile,
      mobileIsd,
      _id: { $ne: userId },
    });
    if (existingOwner) {
      await record.deleteOne();
      return res.status(409).json({ message: "Mobile number is already in use" });
    }

    user.mobile = mobile;
    user.mobileIsd = mobileIsd;
    user.mobileVerified = true;
    user.mobileVerifiedAt = now;
    await user.save();
    await record.deleteOne();

    return res.status(200).json({
      message: "Mobile number verified successfully",
      mobileVerified: true,
      mobileVerifiedAt: now.toISOString(),
      mobile,
      mobileIsd,
    });
  } catch (error) {
    console.error("Verify mobile OTP error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to verify mobile number",
    });
  }
};
