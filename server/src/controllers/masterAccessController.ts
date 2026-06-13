import { Request, Response } from "express";
import { Types } from "mongoose";
import MasterAccess from "../models/masterAccessModel.js";
import User from "../models/userModel.js";
import { getUserDataByToken } from "../services/userAccess.js";

const requiredRoutes = ["/profile", "/settings"];

const mergeRequiredRoutes = (routes: string[] | undefined | null): string[] =>
  Array.from(new Set([...(routes ?? []), ...requiredRoutes]));


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
    const [record, user] = await Promise.all([
      MasterAccess.findOne({ userId }).select("userId allowedRoutes").lean(),
      User.findById(userId).select("isLoggedIn lastLoginAt").lean(),
    ]);
    res.status(200).json({
      permissions: {
        userId,
        allowedRoutes: mergeRequiredRoutes(record?.allowedRoutes),
        isLoggedIn: user?.isLoggedIn ?? false,

        lastLoginAt: user?.lastLoginAt ?? null,
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
    const updated = await MasterAccess.findOneAndUpdate(
      { userId },
      { $set: { allowedRoutes: mergeRequiredRoutes(routes) } },
      { upsert: true, new: true }
    )
      .select("userId allowedRoutes")
      .lean();
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
    res.status(200).json(mergeRequiredRoutes(record?.allowedRoutes));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
};
