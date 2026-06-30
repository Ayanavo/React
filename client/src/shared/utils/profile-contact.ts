import type { ProfileResponse } from "@/shared/services/auth";
import { getCurrentUserAPI } from "@/shared/services/auth";
import type { CVElement, fontWeight } from "@/lib/useCV";

export type UserContactInfo = {
  fullName: string;
  email?: string;
  mobile?: string;
  city?: string;
  state?: string;
  designation?: string;
  companyName?: string;
};

export type CoverLetterHeaderLine = {
  text: string;
  fontSize: number;
  fontWeight: fontWeight;
  color: string;
};

const CLOSING_LINE_PATTERN =
  /^(sincerely|best regards|kind regards|warm regards|regards|yours truly|respectfully|thank you)[,.!\s]*$/i;


export function mapProfileUserToContactInfo(user: ProfileResponse["user"] & { email?: string }): UserContactInfo {
  const currentCompany = user.companies?.find((company) => company.isPresent) ?? user.companies?.[0];

  return {
    fullName: [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
    email: user.email?.trim() || undefined,
    mobile: user.mobile?.trim() || undefined,
    city: user.address?.city?.trim() || undefined,
    state: user.address?.state?.trim() || undefined,
    designation: currentCompany?.designation?.trim() || undefined,
    companyName: currentCompany?.companyName?.trim() || undefined,
  };
}

export async function fetchUserContactInfo(): Promise<UserContactInfo | null> {
  try {
    const response = await getCurrentUserAPI();
    if (!response.user) return null;
    return mapProfileUserToContactInfo(response.user);
  } catch {
    return null;
  }
}

export function buildCoverLetterHeaderLines(info?: UserContactInfo | null): CoverLetterHeaderLine[] {
  if (!info?.fullName) {
    return [
      { text: "[Your Name]", fontSize: 22, fontWeight: "bold", color: "#0f172a" },
      { text: "[Email]", fontSize: 12, fontWeight: "normal", color: "#475569" },
      { text: "[Phone]", fontSize: 12, fontWeight: "normal", color: "#475569" },
      { text: "[City, Country]", fontSize: 12, fontWeight: "normal", color: "#64748b" },
    ];
  }

  const lines: CoverLetterHeaderLine[] = [
    { text: info.fullName, fontSize: 22, fontWeight: "bold", color: "#0f172a" },
  ];

  if (info.designation) {
    lines.push({ text: info.designation, fontSize: 14, fontWeight: "medium", color: "#2563eb" });
  }

  if (info.email) {
    lines.push({ text: info.email, fontSize: 12, fontWeight: "normal", color: "#475569" });
  }

  if (info.mobile) {
    lines.push({ text: info.mobile, fontSize: 12, fontWeight: "normal", color: "#475569" });
  }

  const location = [info.city, info.state].filter(Boolean).join(", ");
  if (location) {
    lines.push({ text: location, fontSize: 12, fontWeight: "normal", color: "#64748b" });
  }

  return lines;
}

export function buildCoverLetterHeaderContent(info?: UserContactInfo | null): string {
  return buildCoverLetterHeaderLines(info)
    .map((line) => line.text)
    .join("\n");
}

export function buildCoverLetterClosing(info?: UserContactInfo | null): string {
  const name = info?.fullName?.trim();
  return name ? `Sincerely,\n${name}` : "Sincerely,\n[Your Name]";
}

export function sanitizeCoverLetterBody(body: string[]): string[] {
  return body
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => {
      if (!paragraph) return false;
      if (paragraph.includes("[Your Name]")) return false;
      if (CLOSING_LINE_PATTERN.test(paragraph)) return false;
      if (/^sincerely,/i.test(paragraph)) return false;
      return true;
    });
}

export function normalizeCoverLetterClosing(closing: string | undefined, info?: UserContactInfo | null): string {
  const name = info?.fullName?.trim();
  const trimmed = closing?.trim() || "Sincerely,";

  if (name && trimmed.toLowerCase().includes(name.toLowerCase())) {
    return trimmed;
  }

  const closingLine = CLOSING_LINE_PATTERN.test(trimmed) || /^sincerely,/i.test(trimmed) ? trimmed.replace(/\n.*/s, "").trim() : "Sincerely,";
  const normalizedLine = closingLine.endsWith(",") ? closingLine : `${closingLine},`;

  return name ? `${normalizedLine}\n${name}` : `${normalizedLine}\n[Your Name]`;
}

export function seedEmptyCvWithProfile(elements: CVElement[], info: UserContactInfo): CVElement[] {
  const clone = structuredClone(elements);
  const page = clone.find((node) => node.type === "page");
  const section = page?.children?.find((node) => node.type === "section");
  const block = section?.children?.find((node) => node.type === "block");

  if (!block) return clone;
  if ((block.children?.length ?? 0) > 0) return clone;

  const contactLine = [info.email, info.mobile].filter(Boolean).join("  |  ");
  const locationLine = [info.city, info.state].filter(Boolean).join(", ");

  block.children = [
    {
      id: crypto.randomUUID(),
      type: "text",
      content: info.fullName || "Your Name",
      properties: { fontSize: 26, fontWeight: "bold", textAlign: "start", color: "#0f172a" },
      editable: true,
    },
    ...(info.designation ?
      [
        {
          id: crypto.randomUUID(),
          type: "text",
          content: info.designation,
          properties: { fontSize: 14, fontWeight: "medium", textAlign: "start", color: "#2563eb" },
          editable: true,
        } as CVElement,
      ]
    : []),
    ...(contactLine ?
      [
        {
          id: crypto.randomUUID(),
          type: "text",
          content: contactLine,
          properties: { fontSize: 12, fontWeight: "normal", textAlign: "start", color: "#64748b" },
          editable: true,
        } as CVElement,
      ]
    : []),
    ...(locationLine ?
      [
        {
          id: crypto.randomUUID(),
          type: "location",
          content: locationLine,
          properties: { fontSize: 12, fontWeight: "normal", textAlign: "start", color: "#64748b" },
          editable: true,
        } as CVElement,
      ]
    : []),
  ];

  return clone;
}
