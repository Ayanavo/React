import { Request, Response } from "express";
import User from "../models/userModel.js";
import MasterAccess from "../models/masterAccessModel.js";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password -__v");
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await MasterAccess.findOneAndDelete({ userId });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const record = await MasterAccess.findOne({ userId });
    res.status(200).json({ permissions: record || { allowedRoutes: [] } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
};

export const savePermissions = async (req: Request, res: Response) => {
  try {
    const { userId, routes } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });
    const updated = await MasterAccess.findOneAndUpdate({ userId }, { $set: { allowedRoutes: routes || [] } }, { upsert: true, new: true });
    res.status(200).json({ message: "Permissions saved", updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save permissions" });
  }
};
