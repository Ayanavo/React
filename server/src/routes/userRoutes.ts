import { Router } from "express";
import { login, signUp, logout, refreshToken, getUserProfile, saveUserProfile, verifyToken } from "../controllers/userController.js";
import { RequestHandler } from "express";

const router = Router();

router.post("/login", login as unknown as RequestHandler);
router.post("/register", signUp as RequestHandler);
router.post("/logout", logout as RequestHandler);
router.post("/refresh-token", refreshToken as RequestHandler);
router.get("/getUserProfile", getUserProfile as RequestHandler);
router.post("/saveUserProfile", saveUserProfile as RequestHandler);
router.get("/verifyToken", verifyToken as RequestHandler);

export default router;
