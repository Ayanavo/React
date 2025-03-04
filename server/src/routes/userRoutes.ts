import { Router } from "express";
import { login, signUp, logout } from "../controllers/userController.js";

const router = Router();

router.post("/login", login as any);

router.post("/register", signUp as any);

router.post("/logout", logout as any);

export default router;
