import { Request, Response } from "express";
import { Types } from "mongoose";
import MasterAccess from "../models/masterAccessModel.js";
import User from "../models/userModel.js";
import { getUserDataByToken } from "../services/userAccess.js";
import {
  mergeRequiredRoutes,
  resolveAllowedRoutes,
  resolveMenuOrder,
} from "../services/userPermissions.js";

const defaultMenuOrder = [
  "/master-access",
  "/activities",
  "/notes",
  "/tags",
  "/cv-builder",
  "/whiteboard",
  "/summarize",
  "/profile",
  "/settings",
];

const normalizeMenuOrder = (menuOrder: string[] | undefined | null): string[] => {
  const validRoutes = new Set(defaultMenuOrder);
  const settingsRoute = "/settings";
  const ordered = (menuOrder ?? []).filter((route) => validRoutes.has(route) && route !== settingsRoute);
  const remaining = defaultMenuOrder.filter((route) => route !== settingsRoute && !ordered.includes(route));

  return [...ordered, ...remaining, settingsRoute];
};


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
      MasterAccess.findOne({ userId }).select("userId allowedRoutes menuOrder").lean(),
      User.findById(userId).select("isLoggedIn lastLoginAt lastLogoutAt totalTimeSpentMs currentSessionStartedAt").lean(),
    ]);
    res.status(200).json({
      permissions: {
        userId,
        allowedRoutes: resolveAllowedRoutes(record?.allowedRoutes),
        menuOrder: record?.menuOrder?.length ? normalizeMenuOrder(record.menuOrder) : resolveMenuOrder(record?.menuOrder),
        isLoggedIn: user?.isLoggedIn ?? false,
        lastLoginAt: user?.lastLoginAt ?? null,
        lastLogoutAt: user?.lastLogoutAt ?? null,
        totalTimeSpentMs: user?.totalTimeSpentMs ?? 0,
        currentSessionStartedAt: user?.currentSessionStartedAt ?? null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
};

export const savePermissions = async (req: Request, res: Response) => {
  try {
    const { userId, routes, menuOrder } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });
    if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid userId" });
    const updated = await MasterAccess.findOneAndUpdate(
      { userId },
      {
        $set: {
          allowedRoutes: mergeRequiredRoutes(routes),
          menuOrder: normalizeMenuOrder(menuOrder),
        },
      },
      { upsert: true, new: true }
    )
      .select("userId allowedRoutes menuOrder")
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
    const record = await MasterAccess.findOne({ userId }).select("allowedRoutes menuOrder").lean();
    res.status(200).json({
      allowedRoutes: resolveAllowedRoutes(record?.allowedRoutes),
      menuOrder: record?.menuOrder?.length ? normalizeMenuOrder(record.menuOrder) : resolveMenuOrder(record?.menuOrder),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
};
