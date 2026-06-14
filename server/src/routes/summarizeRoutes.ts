import { Router } from "express";
import multer from "multer";
import { listModels, summarizeChat, summarizeFile, summarizeText } from "../controllers/summarizeController.js";
import { authenticateToken } from "../controllers/userController.js";
import { isSupportedFile } from "../utils/fileExtractor.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isSupportedFile(file.originalname, file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Unsupported file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT"));
  },
});

router.get("/models", authenticateToken as any, listModels as any);
router.post("/text", authenticateToken as any, summarizeText as any);
router.post("/file", authenticateToken as any, upload.single("file"), summarizeFile as any);
router.post("/chat", authenticateToken as any, summarizeChat as any);

export default router;
