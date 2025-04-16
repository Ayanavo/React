import { Router } from "express";
import { login, signUp, logout, refreshToken } from "../controllers/userController.js";

const router = Router();

router.post("/login", login as any);

router.post("/register", signUp as any);

router.post("/logout", logout as any);

router.post("/refresh-token", refreshToken as any);

export default router;
