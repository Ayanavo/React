const IS_PROD = process.env.NODE_ENV === "production";
const PROD_URL = (process.env.DOMAIN_NAME || "").trim();
const FRONTEND_URL = process.env.FRONTEND_URL?.trim();

export const corsAllowlist: string[] = ([FRONTEND_URL, PROD_URL].filter(Boolean) as string[])

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return false;
  return IS_PROD ? corsAllowlist.includes(origin) : true;
};
