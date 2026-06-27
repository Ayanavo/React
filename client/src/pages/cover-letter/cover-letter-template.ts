import moment from "moment";
import type { CVElement } from "@/lib/useCV";
import type { UserContactInfo } from "@/shared/utils/profile-contact";
import {
  buildCoverLetterClosing,
  buildCoverLetterHeaderContent,
  normalizeCoverLetterClosing,
  sanitizeCoverLetterBody,
} from "@/shared/utils/profile-contact";

const A4_HEIGHT = 1123;

export function createCoverLetterTemplate(profile?: UserContactInfo | null): {
  elements: CVElement[];
  pageProperties: Record<string, unknown>;
} {
  const pageId = crypto.randomUUID();
  const sectionId = crypto.randomUUID();
  const blockId = crypto.randomUUID();
  const headerId = crypto.randomUUID();

  const elements: CVElement[] = [
    {
      id: pageId,
      type: "page",
      children: [
        {
          id: sectionId,
          type: "section",
          height: A4_HEIGHT,
          children: [
            {
              id: headerId,
              type: "header",
              properties: {
                headerStyle: {
                  content: buildCoverLetterHeaderContent(profile),
                  color: "#111827",
                  fontSize: 14,
                  backgroundColor: "transparent",
                  textAlign: "start",
                  underline: { enabled: false, width: "fullWidth", gap: 4 },
                },
              },
            },
            {
              id: blockId,
              type: "block",
              children: [
                {
                  id: crypto.randomUUID(),
                  type: "date",
                  content: moment().toISOString(),
                  properties: {
                    fontSize: 12,
                    fontWeight: "normal",
                    dateFormat: "DD_MMM_YYYY",
                    textAlign: "end",
                  },
                  editable: true,
                },
                {
                  id: crypto.randomUUID(),
                  type: "text",
                  content: "Dear Hiring Manager,",
                  properties: { fontSize: 14, fontWeight: "normal", textAlign: "start" },
                  editable: true,
                },
                {
                  id: crypto.randomUUID(),
                  type: "text",
                  content: "",
                  properties: { fontSize: 14, fontWeight: "normal", textAlign: "start" },
                  editable: true,
                },
                {
                  id: crypto.randomUUID(),
                  type: "text",
                  content: buildCoverLetterClosing(profile),
                  properties: { fontSize: 14, fontWeight: "normal", textAlign: "start" },
                  editable: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return {
    elements,
    pageProperties: {
      backgroundColor: "#ffffff",
      color: "#111827",
    },
  };
}

export function applyDraftToTemplate(
  elements: CVElement[],
  sections: { salutation: string; body: string[]; closing: string },
  profile?: UserContactInfo | null
): CVElement[] {
  const clone = structuredClone(elements);
  const section = clone[0]?.children?.[0];
  const block = section?.children?.find((child) => child.type === "block");
  if (!block) return clone;

  const header = section?.children?.find((child) => child.type === "header");
  if (header?.properties?.headerStyle) {
    header.properties.headerStyle.content = buildCoverLetterHeaderContent(profile);
  }

  const dateElement = block.children?.find((child) => child.type === "date");
  const bodyElements = sanitizeCoverLetterBody(sections.body).map((paragraph) => ({
    id: crypto.randomUUID(),
    type: "text" as const,
    content: paragraph,
    properties: { fontSize: 14, fontWeight: "normal" as const, textAlign: "start" as const },
    editable: true,
  }));

  block.children = [
    ...(dateElement ? [dateElement] : []),
    {
      id: crypto.randomUUID(),
      type: "text",
      content: sections.salutation?.trim() || "Dear Hiring Manager,",
      properties: { fontSize: 14, fontWeight: "normal", textAlign: "start" as const },
      editable: true,
    },
    ...bodyElements,
    {
      id: crypto.randomUUID(),
      type: "text",
      content: normalizeCoverLetterClosing(sections.closing, profile),
      properties: { fontSize: 14, fontWeight: "normal", textAlign: "start" as const },
      editable: true,
    },
  ];

  return clone;
}
