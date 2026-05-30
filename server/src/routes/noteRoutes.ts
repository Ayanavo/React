import { Router } from "express";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/noteController.js";
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticateToken as any, getNotes as any);
router.post("/create", authenticateToken as any, createNote as any);
router.get("/:id", authenticateToken as any, getNoteById as any);
router.put("/update/:id", authenticateToken as any, updateNote as any);
router.delete("/delete/:id", authenticateToken as any, deleteNote as any);

export default router;
