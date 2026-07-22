/** Indian 6-digit postal PIN. */
const INDIA_PINCODE_PATTERN = /^[1-9]\d{5}$/;

/** US ZIP (5 or ZIP+4). */
const US_ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

/** Map known postal formats to ISD dial codes (digits only, no +). */
export const resolveIsdFromPincode = (pincode?: string | null): string => {
  const pin = (pincode ?? "").trim();

  if (INDIA_PINCODE_PATTERN.test(pin)) return "91";
  if (US_ZIP_PATTERN.test(pin)) return "1";

  // App address flow is India-first; fall back to India ISD.
  return "91";
};

export const normalizeIsdCode = (isd?: string | null): string => {
  const digits = (isd ?? "").replace(/\D/g, "");
  return digits || "91";
};

export const buildFullMobileNumber = (isd?: string | null, mobile?: string | null): string => {
  const dial = normalizeIsdCode(isd);
  const national = (mobile ?? "").replace(/\D/g, "");
  if (!national) return "";
  if (national.startsWith(dial)) return national;
  return `${dial}${national}`;
};

/** Strip a leading ISD from a stored full number when possible. */
export const splitMobileAndIsd = (
  mobile?: string | null,
  isd?: string | null,
  pincode?: string | null
): { mobileIsd: string; mobile: string } => {
  const mobileIsd = normalizeIsdCode(isd || resolveIsdFromPincode(pincode));
  const digits = (mobile ?? "").replace(/\D/g, "");

  if (!digits) {
    return { mobileIsd, mobile: "" };
  }

  if (digits.startsWith(mobileIsd) && digits.length > mobileIsd.length) {
    return { mobileIsd, mobile: digits.slice(mobileIsd.length) };
  }

  return { mobileIsd, mobile: digits };
};
