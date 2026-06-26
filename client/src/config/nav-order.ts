import { NavList } from "./nav";

export const PROFILE_ROUTE = "/profile";
export const SETTINGS_ROUTE = "/settings";

export const pinnedMenuRoutes = [PROFILE_ROUTE, SETTINGS_ROUTE] as const;

const pinnedMenuRouteSet = new Set<string>(pinnedMenuRoutes);

export const defaultMenuOrder = NavList.map((item) => item.route);

export const sortableMenuRoutes = NavList.filter((item) => !pinnedMenuRouteSet.has(item.route)).map(
  (item) => item.route
);

export function normalizeMenuOrder(menuOrder: string[] | undefined | null): string[] {
  const validRoutes = new Set(defaultMenuOrder);
  const ordered = (menuOrder ?? []).filter((route) => validRoutes.has(route) && !pinnedMenuRouteSet.has(route));
  const remaining = sortableMenuRoutes.filter((route) => !ordered.includes(route));

  return [...ordered, ...remaining, ...pinnedMenuRoutes];
}

export function getSortableMenuOrder(menuOrder: string[] | undefined | null): string[] {
  return normalizeMenuOrder(menuOrder).filter((route) => !pinnedMenuRouteSet.has(route));
}

export function sortNavItemsByOrder<T extends { route: string }>(
  items: T[],
  menuOrder: string[] | undefined | null
): T[] {
  const normalized = normalizeMenuOrder(menuOrder);
  const orderMap = new Map(normalized.map((route, index) => [route, index]));

  return [...items].sort((a, b) => (orderMap.get(a.route) ?? Number.MAX_SAFE_INTEGER) - (orderMap.get(b.route) ?? Number.MAX_SAFE_INTEGER));
}
