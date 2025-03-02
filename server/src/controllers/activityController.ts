import { Request, Response } from "express";
import Activity from "../models/activityModel.js"; // Note the .js extension

// GET all activities
export const getActivities = async (req: Request, res: Response) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities", error });
  }
};

// GET an activity by ID

export const getActivityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity", error });
  }
};

// POST a new activity
export const createActivity = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required" });
    }
    const newActivity = new Activity({ name, description });
    await newActivity.save();

    res.status(201).json({ message: "Activity created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating activity", error });
  }
};

//PATCH an activity by ID
export const updateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name && !description) {
      return res.status(400).json({ message: "Name and description are required" });
    }
    const updatedActivity = await Activity.findByIdAndUpdate(id, { name, description }, { new: true });
    res.json(updatedActivity);
  } catch (error) {
    res.status(500).json({ message: "Error updating activity", error });
  }
};

// DELETE an activity by ID
export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedActivity = await Activity.findByIdAndDelete(id);
    if (!deletedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting activity", error });
  }
};
