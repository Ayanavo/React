import moment from "moment";
import type { CVElement } from "@/lib/useCV";
import {
  buildCoverLetterClosing,
  buildCoverLetterHeaderContent,
  buildCoverLetterHeaderLines,
  normalizeCoverLetterClosing,
  sanitizeCoverLetterBody,
  type UserContactInfo,
} from "@/shared/utils/profile-contact";
const COVER_LETTER_HEADER_STYLE = {
  color: "#111827",
  fontSize: 14,
  backgroundColor: "transparent",
  textAlign: "start" as const,
  underline: { enabled: true, width: "fullWidth" as const, gap: 8 },
};

const COVER_LETTER_BODY_TEXT = {
  fontSize: 14,
  fontWeight: "normal" as const,
  textAlign: "start" as const,
};

/** Gap below between body paragraphs (matches builder "Gap below"). */
const COVER_LETTER_GAP_PARAGRAPH = 12;
/** Gap below/above between major sections such as date, body, and closing. */
const COVER_LETTER_GAP_SECTION = 16;

type CoverLetterSpacing = {
  marginTop?: number;
  marginBottom?: number;
};

function coverLetterTextProperties(spacing: CoverLetterSpacing = {}) {
  return {
    ...COVER_LETTER_BODY_TEXT,
    ...spacing,
  };
}

function buildCoverLetterBodyElements(paragraphs: string[]) {
  return paragraphs.map((paragraph, index) => ({
    id: crypto.randomUUID(),
    type: "text" as const,
    content: paragraph,
    properties: coverLetterTextProperties({
      marginBottom: index < paragraphs.length - 1 ? COVER_LETTER_GAP_PARAGRAPH : COVER_LETTER_GAP_SECTION,
    }),
    editable: true,
  }));
}

function applyProfileToCoverLetterHeader(
  headerStyle: NonNullable<CVElement["properties"]>["headerStyle"],
  profile?: UserContactInfo | null
) {
  const lines = buildCoverLetterHeaderLines(profile);

  return {
    ...headerStyle,
    ...COVER_LETTER_HEADER_STYLE,
    content: buildCoverLetterHeaderContent(profile),
    lines,
  };
}

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
                headerStyle: applyProfileToCoverLetterHeader({}, profile),
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
                    marginBottom: COVER_LETTER_GAP_SECTION,
                  },
                  editable: true,
                },
                {
                  id: crypto.randomUUID(),
                  type: "text",
                  content: "Dear Hiring Manager,",
                  properties: coverLetterTextProperties({ marginBottom: COVER_LETTER_GAP_PARAGRAPH }),
                  editable: true,
                },
                {
                  id: crypto.randomUUID(),
                  type: "text",
                  content: "",
                  properties: coverLetterTextProperties({ marginBottom: COVER_LETTER_GAP_PARAGRAPH }),
                  editable: true,
                },
                {
                  id: crypto.randomUUID(),
                  type: "text",
                  content: buildCoverLetterClosing(profile),
                  properties: coverLetterTextProperties(),
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
    header.properties.headerStyle = applyProfileToCoverLetterHeader(header.properties.headerStyle, profile);
  }

  const dateElement = block.children?.find((child) => child.type === "date");
  const bodyParagraphs = sanitizeCoverLetterBody(sections.body);
  const bodyElements = buildCoverLetterBodyElements(bodyParagraphs);

  const spacedDate =
    dateElement ?
      {
        ...dateElement,
        properties: {
          ...dateElement.properties,
          marginBottom: COVER_LETTER_GAP_SECTION,
        },
      }
    : null;

  block.children = [
    ...(spacedDate ? [spacedDate] : []),
    {
      id: crypto.randomUUID(),
      type: "text",
      content: sections.salutation?.trim() || "Dear Hiring Manager,",
      properties: coverLetterTextProperties({
        marginBottom: bodyParagraphs.length > 0 ? COVER_LETTER_GAP_PARAGRAPH : COVER_LETTER_GAP_SECTION,
      }),
      editable: true,
    },
    ...bodyElements,
    {
      id: crypto.randomUUID(),
      type: "text",
      content: normalizeCoverLetterClosing(sections.closing, profile),
      properties: coverLetterTextProperties(),
      editable: true,
    },
  ];

  return clone;
}
