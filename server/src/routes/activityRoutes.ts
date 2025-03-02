import express from "express";
import { createActivity, getActivities, deleteActivity, updateActivity, getActivityById } from "../controllers/activityController.js"; // Note the .js extension
import Activity from "../models/activityModel.js";

const router = express.Router();

// Define the /activities route
router.get("/", getActivities);

// POST a new activity
router.post("/create", createActivity as any);

// GET an activity by ID
router.get("/:id", getActivityById as any);

// UPDATE an activity by ID
router.put("/update/:id", updateActivity as any);

// DELETE an activity
router.delete("/delete/:id", deleteActivity as any);

export default router;
