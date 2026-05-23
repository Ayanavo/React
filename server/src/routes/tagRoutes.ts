import { Router } from "express";
import { createTag, deleteTag, getTagById, getTags, updateTag } from "../controllers/tagController.js";
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticateToken as any, getTags as any);
router.post("/create", authenticateToken as any, createTag as any);
router.get("/:id", authenticateToken as any, getTagById as any);
router.put("/update/:id", authenticateToken as any, updateTag as any);
router.delete("/delete/:id", authenticateToken as any, deleteTag as any);

export default router;
