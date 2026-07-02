import { Types } from "mongoose";
import MasterAccess from "../models/masterAccessModel.js";

/** Default modules granted to newly registered users. */
export const DEFAULT_NEW_USER_ROUTES = [
  "/activities",
  "/notes",
  "/tags",
  "/summarize",
  "/cv-builder",
  "/cover-letter",
];

export const DEFAULT_NEW_USER_MENU_ORDER = [
  "/activities",
  "/notes",
  "/tags",
  "/summarize",
  "/cv-builder",
  "/cover-letter",
  "/profile",
  "/settings",
];

const REQUIRED_ROUTES = ["/profile", "/settings"];
const LEGACY_DEFAULT_MODULES = ["/activities", "/notes", "/cv-builder"];

const toObjectId = (userId: Types.ObjectId | string): Types.ObjectId =>
  userId instanceof Types.ObjectId ? userId : new Types.ObjectId(userId);

const hasLegacyDefaultModuleAccess = (routes: string[]): boolean =>
  LEGACY_DEFAULT_MODULES.every((route) => routes.includes(route));

const shouldUpgradeToFullDefaultAccess = (routes: string[]): boolean => {
  if (!routes.length) return false;

  const merged = mergeRequiredRoutes(routes);
  if (hasLegacyDefaultModuleAccess(merged)) return true;

  const optionalDefaults = DEFAULT_NEW_USER_ROUTES.filter((route) => !REQUIRED_ROUTES.includes(route));
  const hasSomeDefaults = optionalDefaults.some((route) => merged.includes(route));
  const missingSomeDefaults = optionalDefaults.some((route) => !merged.includes(route));

  return hasSomeDefaults && missingSomeDefaults;
};

export const mergeRequiredRoutes = (routes: string[] | undefined | null): string[] =>
  Array.from(new Set([...(routes ?? []), ...REQUIRED_ROUTES]));

export const resolveAllowedRoutes = (routes: string[] | undefined | null): string[] => {
  if (!routes?.length) {
    return mergeRequiredRoutes(DEFAULT_NEW_USER_ROUTES);
  }

  const merged = mergeRequiredRoutes(routes);
  if (!shouldUpgradeToFullDefaultAccess(routes)) {
    return merged;
  }

  return mergeRequiredRoutes(Array.from(new Set([...merged, ...DEFAULT_NEW_USER_ROUTES])));
};

export const resolveMenuOrder = (
  menuOrder: string[] | undefined | null,
  allowedRoutes?: string[] | null
): string[] => {
  if (!menuOrder?.length) {
    return DEFAULT_NEW_USER_MENU_ORDER;
  }

  const resolvedRoutes = resolveAllowedRoutes(allowedRoutes);
  const allowed = new Set(resolvedRoutes);

  return menuOrder.filter((route) => allowed.has(route) || REQUIRED_ROUTES.includes(route));
};

export const grantDefaultUserAccess = async (userId: Types.ObjectId | string): Promise<void> => {
  const objectUserId = toObjectId(userId);

  await MasterAccess.findOneAndUpdate(
    { userId: objectUserId },
    {
      $set: {
        userId: objectUserId,
        allowedRoutes: mergeRequiredRoutes(DEFAULT_NEW_USER_ROUTES),
        menuOrder: DEFAULT_NEW_USER_MENU_ORDER,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};
