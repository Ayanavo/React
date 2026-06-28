import { Types } from "mongoose";
import MasterAccess from "../models/masterAccessModel.js";

/** Default modules granted to newly registered users. */
export const DEFAULT_NEW_USER_ROUTES = ["/activities", "/notes", "/cv-builder", "/cover-letter"];

export const DEFAULT_NEW_USER_MENU_ORDER = [
  "/activities",
  "/notes",
  "/cv-builder",
  "/cover-letter",
  "/profile",
  "/settings",
];

const REQUIRED_ROUTES = ["/profile", "/settings"];
const LEGACY_DEFAULT_MODULES = ["/activities", "/notes", "/cv-builder"];
const COVER_LETTER_ROUTE = "/cover-letter";

const hasLegacyDefaultModuleAccess = (routes: string[]): boolean =>
  LEGACY_DEFAULT_MODULES.every((route) => routes.includes(route));

export const mergeRequiredRoutes = (routes: string[] | undefined | null): string[] =>
  Array.from(new Set([...(routes ?? []), ...REQUIRED_ROUTES]));

export const resolveAllowedRoutes = (routes: string[] | undefined | null): string[] => {
  const baseRoutes = routes?.length ? routes : DEFAULT_NEW_USER_ROUTES;
  const merged = mergeRequiredRoutes(baseRoutes);

  if (!merged.includes(COVER_LETTER_ROUTE) && hasLegacyDefaultModuleAccess(merged)) {
    return [...merged, COVER_LETTER_ROUTE];
  }

  return merged;
};

export const resolveMenuOrder = (
  menuOrder: string[] | undefined | null,
  allowedRoutes?: string[] | null
): string[] => {
  if (!menuOrder?.length) {
    return DEFAULT_NEW_USER_MENU_ORDER;
  }

  const resolvedRoutes = resolveAllowedRoutes(allowedRoutes);
  if (!resolvedRoutes.includes(COVER_LETTER_ROUTE) || menuOrder.includes(COVER_LETTER_ROUTE)) {
    return menuOrder;
  }

  if (!hasLegacyDefaultModuleAccess(menuOrder)) {
    return menuOrder;
  }

  const cvBuilderIndex = menuOrder.indexOf("/cv-builder");
  if (cvBuilderIndex === -1) {
    return [...menuOrder, COVER_LETTER_ROUTE];
  }

  const next = [...menuOrder];
  next.splice(cvBuilderIndex + 1, 0, COVER_LETTER_ROUTE);
  return next;
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
