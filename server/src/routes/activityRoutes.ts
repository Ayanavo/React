import { Router } from "express";
import { createActivity, getActivities, deleteActivity, updateActivity, getActivityById } from "../controllers/activityController.js"; // Note the .js extension
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticateToken as any, getActivities);
router.post("/create", authenticateToken as any, createActivity as any);
router.get("/:id", authenticateToken as any, getActivityById as any);
router.put("/update/:id", authenticateToken as any, updateActivity as any);
router.delete("/delete/:id", authenticateToken as any, deleteActivity as any);

export default router;
