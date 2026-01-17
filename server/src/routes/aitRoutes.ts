import { Router } from "express";
import { chatWithAI } from "../controllers/aiControllers.js";
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

router.post("/chat", authenticateToken as any, chatWithAI as any);

export default router;
