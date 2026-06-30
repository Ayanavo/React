import moment from "moment";
import { parseSummaryBlocks, stripSummaryMarkdown } from "@/shared/utils/summary-blocks";

export function slugifyFileNamePart(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function extractCompanyNameFromJobText(jobText: string): string | null {
  const trimmed = jobText.trim();
  if (!trimmed) return null;

  const blocks = parseSummaryBlocks(trimmed);
  for (const block of blocks) {
    if (block.type !== "heading") continue;
    if (!/company|employer|organization|hiring/i.test(block.text)) continue;

    const name = stripSummaryMarkdown(block.text)
      .replace(/^(company|employer|organization|hiring company)\s*:?\s*/i, "")
      .trim();
    if (name) return name;
  }

  const boldMatch = trimmed.match(/\*\*([^*]{2,80})\*\*/);
  if (boldMatch?.[1]) {
    const candidate = boldMatch[1].trim();
    if (!/requirements?|skills?|overview|responsibilities/i.test(candidate)) {
      return candidate;
    }
  }

  const atMatch = trimmed.match(/\bat\s+([A-Z][A-Za-z0-9&.,'()\- ]{2,80})/);
  if (atMatch?.[1]) {
    return atMatch[1].replace(/[.,]$/, "").trim();
  }

  return null;
}

export function buildCvPdfFileName({
  userName,
  companyName,
  date = moment().format("YYYY-MM-DD"),
}: {
  userName: string;
  companyName: string;
  date?: string;
}): string {
  const parts = [slugifyFileNamePart(userName), slugifyFileNamePart(companyName), slugifyFileNamePart(date)].filter(
    Boolean
  );

  return parts.length > 0 ? parts.join("_") : `CV_${date}`;
}
