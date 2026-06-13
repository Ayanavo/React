const IS_PROD = process.env.NODE_ENV === "production";

/** GitHub Pages production frontend (Origin header has no path segment). */
const DEFAULT_PROD_FRONTEND = "https://ayanavo.github.io";

const normalizeOrigin = (value: string): string => value.trim().replace(/\/+$/, "");

const parseOrigins = (value?: string): string[] =>
  (value ?? "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

/** Comma-separated list, e.g. FRONTEND_URL=https://ayanavo.github.io,http://localhost:5173 */
const envOrigins = parseOrigins(process.env.FRONTEND_URL);

export const corsAllowlist: string[] = [
  ...new Set([DEFAULT_PROD_FRONTEND, ...envOrigins]),
];

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return !IS_PROD;
  return IS_PROD ? corsAllowlist.includes(normalizeOrigin(origin)) : true;
};
