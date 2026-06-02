const IS_PROD = process.env.NODE_ENV === "production";
const PROD_URL = (process.env.DOMAIN_NAME || "").trim();
const FRONTEND_URL = process.env.FRONTEND_URL?.trim();
const DEV_URLS = ["http://localhost:5000"];

export const corsAllowlist: string[] = IS_PROD ? ([FRONTEND_URL, PROD_URL, "https://ayanavo.github.io"].filter(Boolean) as string[]) : DEV_URLS;

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true;
  return corsAllowlist.includes(origin);
};
