import { Router } from "express";
import { login, signUp, logout } from "../controllers/userController.js";

const router = Router();

router.get("/login", login as any);

router.get("/register", signUp as any);

router.get("/logout", logout as any);

export default router;
