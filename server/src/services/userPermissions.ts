import { Types } from "mongoose";
import MasterAccess from "../models/masterAccessModel.js";

/** Default modules granted to newly registered users. */
export const DEFAULT_NEW_USER_ROUTES = ["/activities", "/notes", "/cv-builder"];

export const DEFAULT_NEW_USER_MENU_ORDER = [
  "/activities",
  "/notes",
  "/cv-builder",
  "/profile",
  "/settings",
];

const REQUIRED_ROUTES = ["/profile", "/settings"];

export const mergeRequiredRoutes = (routes: string[] | undefined | null): string[] =>
  Array.from(new Set([...(routes ?? []), ...REQUIRED_ROUTES]));

export const resolveAllowedRoutes = (routes: string[] | undefined | null): string[] => {
  const baseRoutes = routes?.length ? routes : DEFAULT_NEW_USER_ROUTES;
  return mergeRequiredRoutes(baseRoutes);
};

export const resolveMenuOrder = (menuOrder: string[] | undefined | null): string[] => {
  if (menuOrder?.length) {
    return menuOrder;
  }
  return DEFAULT_NEW_USER_MENU_ORDER;
};

export const grantDefaultUserAccess = async (userId: Types.ObjectId | string): Promise<void> => {
  await MasterAccess.findOneAndUpdate(
    { userId },
    {
      $set: {
        allowedRoutes: mergeRequiredRoutes(DEFAULT_NEW_USER_ROUTES),
        menuOrder: DEFAULT_NEW_USER_MENU_ORDER,
      },
    },
    { upsert: true, new: true }
  );
};
