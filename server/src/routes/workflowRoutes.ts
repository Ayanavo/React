import { Router } from "express";
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflowById,
  getWorkflows,
  updateWorkflow,
} from "../controllers/workflowController.js";
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticateToken as any, getWorkflows as any);
router.post("/create", authenticateToken as any, createWorkflow as any);
router.get("/:id", authenticateToken as any, getWorkflowById as any);
router.put("/update/:id", authenticateToken as any, updateWorkflow as any);
router.delete("/delete/:id", authenticateToken as any, deleteWorkflow as any);

export default router;
