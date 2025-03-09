import { Router } from "express";
import { createActivity, getActivities, deleteActivity, updateActivity, getActivityById } from "../controllers/activityController.js"; // Note the .js extension
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

// Define the /activities route
router.get("/", authenticateToken as any, getActivities);

// POST a new activity
router.post("/create", authenticateToken as any, createActivity as any);

// GET an activity by ID
router.get("/:id", authenticateToken as any, getActivityById as any);

// UPDATE an activity by ID
router.put("/update/:id", authenticateToken as any, updateActivity as any);

// DELETE an activity
router.delete("/delete/:id", authenticateToken as any, deleteActivity as any);

export default router;
