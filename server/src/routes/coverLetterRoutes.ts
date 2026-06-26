import { Router } from "express";
import {
  deleteCoverLetter,
  generateCoverLetterDraft,
  getCoverLetterById,
  getCoverLetterList,
  saveCoverLetter,
  updateCoverLetter,
} from "../controllers/coverLetterController.js";
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticateToken as any, getCoverLetterList as any);
router.post("/generate-draft", authenticateToken as any, generateCoverLetterDraft as any);
router.post("/create", authenticateToken as any, saveCoverLetter as any);
router.put("/update/:id", authenticateToken as any, updateCoverLetter as any);
router.delete("/delete/:id", authenticateToken as any, deleteCoverLetter as any);
router.get("/:id([0-9a-fA-F]{24})", authenticateToken as any, getCoverLetterById as any);

export default router;
