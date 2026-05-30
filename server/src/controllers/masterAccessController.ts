import { Request, Response } from "express";
import { Types } from "mongoose";
import MasterAccess from "../models/masterAccessModel.js";
import User from "../models/userModel.js";
import { getUserDataByToken } from "../services/userAcess.js";

const requiredRoutes = ["/profile", "/settings"];

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
    if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid userId" });

    const record = await MasterAccess.findOne({ userId }).select("userId allowedRoutes").lean();
    res.status(200).json({
      permissions: {
        userId,
        allowedRoutes: Array.from(new Set([...record?.allowedRoutes || [], ...requiredRoutes])),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
};

export const savePermissions = async (req: Request, res: Response) => {
  try {
    const { userId, routes } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });
    if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid userId" });

    const updated = await MasterAccess.findOneAndUpdate({ userId }, { $set: { allowedRoutes: Array.from(new Set([...routes, ...requiredRoutes])) } }, { upsert: true, new: true }).select("userId allowedRoutes").lean();
    res.status(200).json({ message: "Permissions saved", permissions: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save permissions" });
  }
};

export const getPermissionsByToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = await getUserDataByToken(token);
    if (decoded === null) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const userId = decoded._id;
    const record = await MasterAccess.findOne({ userId }).select("allowedRoutes").lean();
    console.log(record);
    
    res.status(200).json(record?.allowedRoutes || requiredRoutes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
};