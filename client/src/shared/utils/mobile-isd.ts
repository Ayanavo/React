export type IsdOption = {
  iso: string;
  name: string;
  isd: string;
  flag: string;
};

/** Common ISD options shown in the mobile country selector. */
export const ISD_OPTIONS: IsdOption[] = [
  { iso: "IN", name: "India", isd: "91", flag: "🇮🇳" },
  { iso: "US", name: "United States", isd: "1", flag: "🇺🇸" },
  { iso: "CA", name: "Canada", isd: "1", flag: "🇨🇦" },
  { iso: "GB", name: "United Kingdom", isd: "44", flag: "🇬🇧" },
  { iso: "AU", name: "Australia", isd: "61", flag: "🇦🇺" },
  { iso: "AE", name: "United Arab Emirates", isd: "971", flag: "🇦🇪" },
  { iso: "SA", name: "Saudi Arabia", isd: "966", flag: "🇸🇦" },
  { iso: "SG", name: "Singapore", isd: "65", flag: "🇸🇬" },
  { iso: "MY", name: "Malaysia", isd: "60", flag: "🇲🇾" },
  { iso: "DE", name: "Germany", isd: "49", flag: "🇩🇪" },
  { iso: "FR", name: "France", isd: "33", flag: "🇫🇷" },
  { iso: "IT", name: "Italy", isd: "39", flag: "🇮🇹" },
  { iso: "ES", name: "Spain", isd: "34", flag: "🇪🇸" },
  { iso: "NL", name: "Netherlands", isd: "31", flag: "🇳🇱" },
  { iso: "JP", name: "Japan", isd: "81", flag: "🇯🇵" },
  { iso: "KR", name: "South Korea", isd: "82", flag: "🇰🇷" },
  { iso: "CN", name: "China", isd: "86", flag: "🇨🇳" },
  { iso: "HK", name: "Hong Kong", isd: "852", flag: "🇭🇰" },
  { iso: "NZ", name: "New Zealand", isd: "64", flag: "🇳🇿" },
  { iso: "ZA", name: "South Africa", isd: "27", flag: "🇿🇦" },
  { iso: "BR", name: "Brazil", isd: "55", flag: "🇧🇷" },
  { iso: "MX", name: "Mexico", isd: "52", flag: "🇲🇽" },
  { iso: "PH", name: "Philippines", isd: "63", flag: "🇵🇭" },
  { iso: "ID", name: "Indonesia", isd: "62", flag: "🇮🇩" },
  { iso: "TH", name: "Thailand", isd: "66", flag: "🇹🇭" },
  { iso: "VN", name: "Vietnam", isd: "84", flag: "🇻🇳" },
  { iso: "BD", name: "Bangladesh", isd: "880", flag: "🇧🇩" },
  { iso: "PK", name: "Pakistan", isd: "92", flag: "🇵🇰" },
  { iso: "LK", name: "Sri Lanka", isd: "94", flag: "🇱🇰" },
  { iso: "NP", name: "Nepal", isd: "977", flag: "🇳🇵" },
];

const INDIA_PINCODE_PATTERN = /^[1-9]\d{5}$/;
const US_ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

export const resolveIsdFromPincode = (pincode?: string | null): string => {
  const pin = (pincode ?? "").trim();
  if (INDIA_PINCODE_PATTERN.test(pin)) return "91";
  if (US_ZIP_PATTERN.test(pin)) return "1";
  return "91";
};

export const resolveIsdOptionFromPincode = (pincode?: string | null): IsdOption => {
  const isd = resolveIsdFromPincode(pincode);
  return ISD_OPTIONS.find((option) => option.isd === isd) ?? ISD_OPTIONS[0];
};

export const findIsdOption = (isd?: string | null, iso?: string | null): IsdOption => {
  if (iso) {
    const byIso = ISD_OPTIONS.find((option) => option.iso === iso);
    if (byIso) return byIso;
  }

  const digits = (isd ?? "").replace(/\D/g, "");
  return ISD_OPTIONS.find((option) => option.isd === digits) ?? ISD_OPTIONS[0];
};

export const buildFullMobileNumber = (isd?: string | null, mobile?: string | null): string => {
  const dial = (isd ?? "").replace(/\D/g, "") || "91";
  const national = (mobile ?? "").replace(/\D/g, "");
  if (!national) return "";
  if (national.startsWith(dial)) return national;
  return `${dial}${national}`;
};

export const splitMobileAndIsd = (
  mobile?: string | null,
  isd?: string | null,
  pincode?: string | null
): { mobileIsd: string; mobileCountry: string; mobile: string } => {
  const option = findIsdOption(isd || resolveIsdFromPincode(pincode));
  const digits = (mobile ?? "").replace(/\D/g, "");

  if (!digits) {
    return { mobileIsd: option.isd, mobileCountry: option.iso, mobile: "" };
  }

  if (digits.startsWith(option.isd) && digits.length > option.isd.length) {
    return {
      mobileIsd: option.isd,
      mobileCountry: option.iso,
      mobile: digits.slice(option.isd.length),
    };
  }

  return { mobileIsd: option.isd, mobileCountry: option.iso, mobile: digits };
};
