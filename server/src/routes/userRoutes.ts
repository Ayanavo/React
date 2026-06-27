import { RequestHandler, Router } from "express";
import {
  getVerificationStatusHandler,
  resendVerificationEmailHandler,
  sendVerificationEmailHandler,
  verifyEmailLinkHandler,
} from "../controllers/emailVerificationController.js";
import {
  getUserProfile,
  login,
  logout,
  refreshToken,
  saveSettings,
  saveUserProfile,
  signUp,
} from "../controllers/userController.js";
import { oauthCallbackHandler, startOAuthHandler } from "../controllers/oauthController.js";
import { handleSaveUserProfileValidation, saveUserProfileValidators } from "../utils/profileValidation.js";

const router = Router();

router.post("/send-verification-email", sendVerificationEmailHandler as unknown as RequestHandler);
router.post("/resend-verification-email", resendVerificationEmailHandler as unknown as RequestHandler);
router.get("/verify-email", verifyEmailLinkHandler as unknown as RequestHandler);
router.get("/verification-status", getVerificationStatusHandler as unknown as RequestHandler);
router.get("/oauth/callback", oauthCallbackHandler as unknown as RequestHandler);
router.get("/oauth/:provider", startOAuthHandler as unknown as RequestHandler);
router.post("/login", login as unknown as RequestHandler);
router.post("/register", signUp);
router.post("/logout", logout as RequestHandler);
router.post("/refresh-token", refreshToken as RequestHandler);
router.get("/getUserProfile", getUserProfile as RequestHandler);
router.post("/saveUserProfile", ...saveUserProfileValidators, handleSaveUserProfileValidation, saveUserProfile as RequestHandler);
router.get("/saveSetting", saveSettings as RequestHandler);
router.post("/SaveSettings", saveSettings as RequestHandler);

export default router;
