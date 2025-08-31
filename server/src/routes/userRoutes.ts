import { Router } from "express";
import { login, signUp, logout, refreshToken } from "../controllers/userController.js";
import { RequestHandler } from "express";

const router = Router();

router.post("/login", login as unknown as RequestHandler);

router.post("/register", signUp as RequestHandler);

router.post("/logout", logout as RequestHandler);

router.post("/refresh-token", refreshToken as RequestHandler);

export default router;
