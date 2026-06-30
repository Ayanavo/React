import type { CVElement, PageProperties, fontWeight } from "@/lib/useCV";
import type { ProfileResponse } from "@/shared/services/auth";
import { paginateCvElements } from "./cv-page-pagination";
import { mapProfileUserToContactInfo } from "@/shared/utils/profile-contact";
import { parseSummaryBlocks, stripSummaryMarkdown, type SummaryBlock } from "@/shared/utils/summary-blocks";
import {
  calculateWorkExperience,
  hasMonthYear,
  monthYearToDate,
  normalizeCompanies,
  type CompanyEntry,
} from "@/shared/utils/work-experience";
import moment from "moment";

const GAP = { xs: 6, sm: 10, md: 14, lg: 20, section: 22 };

const PAGE_PROPERTIES: PageProperties = {
  backgroundColor: "#ffffff",
  color: "#0f172a",
  dividerColor: "#e2e8f0",
  dividerStyle: "solid",
};

const TOKEN_STYLE = {
  backgroundColor: "#dbeafe",
  borderColor: "#93c5fd",
  radius: 6,
};

type CvTextProps = {
  fontSize: number;
  fontWeight: fontWeight;
  textAlign: "start";
  color: string;
  marginTop?: number;
  marginBottom?: number;
  textIndent?: number;
};

function textEl(content: string, properties: CvTextProps): CVElement {
  return {
    id: crypto.randomUUID(),
    type: "text",
    content,
    properties,
    editable: true,
  };
}

function listEl(items: string[], properties: Partial<CvTextProps> & { listIcon?: "bullet" | "number" }): CVElement {
  return {
    id: crypto.randomUUID(),
    type: "list",
    content: items,
    properties: {
      fontSize: 13,
      fontWeight: "normal",
      textAlign: "start",
      color: "#334155",
      marginBottom: GAP.sm,
      listStyle: { icon: properties.listIcon ?? "bullet" },
      ...properties,
    },
    editable: true,
  };
}

function quoteEl(content: string, marginTop?: number): CVElement {
  return {
    id: crypto.randomUUID(),
    type: "quote",
    content,
    properties: {
      fontSize: 13,
      fontWeight: "normal",
      textAlign: "start",
      color: "#475569",
      marginTop,
      marginBottom: GAP.sm,
      textIndent: 12,
    },
    editable: true,
  };
}

function tokenEl(tokens: string[]): CVElement {
  return {
    id: crypto.randomUUID(),
    type: "token",
    content: tokens,
    properties: {
      fontSize: 12,
      fontWeight: "medium",
      textAlign: "start",
      color: "#1e40af",
      marginTop: GAP.xs,
      marginBottom: GAP.sm,
      tokenStyle: TOKEN_STYLE,
    },
    editable: true,
  };
}

function dateEl(isoDate: string, marginBottom = GAP.xs): CVElement {
  return {
    id: crypto.randomUUID(),
    type: "date",
    content: isoDate,
    properties: {
      fontSize: 12,
      fontWeight: "normal",
      textAlign: "start",
      color: "#64748b",
      marginBottom,
      dateFormat: "MMM_YYYY",
    },
    editable: true,
  };
}

function sectionHeader(title: string): CVElement {
  return {
    id: crypto.randomUUID(),
    type: "header",
    properties: {
      headerStyle: {
        content: title,
        fontSize: 15,
        color: "#0f172a",
        backgroundColor: "#f8fafc",
        textAlign: "start",
        underline: { enabled: true, width: "fullWidth", gap: 6 },
      },
    },
  };
}

function createSection(headerTitle: string | null, blocks: CVElement[]): CVElement {
  const children: CVElement[] = [];

  if (headerTitle) {
    children.push(sectionHeader(headerTitle));
  }

  for (const block of blocks) {
    children.push(block);
  }

  return {
    id: crypto.randomUUID(),
    type: "section",
    children,
  };
}

function createBlock(children: CVElement[], width?: number): CVElement {
  return {
    id: crypto.randomUUID(),
    type: "block",
    ...(width ? { width } : {}),
    children,
  };
}

function formatCompanyRange(company: CompanyEntry): string {
  const from =
    hasMonthYear(company.fromMonth, company.fromYear) ?
      moment(monthYearToDate(company.fromMonth, company.fromYear)!).format("MMM YYYY")
    : company.fromYear || "";

  const to =
    company.isPresent ?
      "Present"
    : hasMonthYear(company.toMonth, company.toYear) ?
      moment(monthYearToDate(company.toMonth, company.toYear)!).format("MMM YYYY")
    : company.toYear || "";

  if (from && to) return `${from} – ${to}`;
  return from || to || "";
}

function formatFullAddress(user: ProfileResponse["user"]): string {
  const address = user.address;
  if (!address) return "";

  const cityState = [address.city, address.state].filter(Boolean).join(", ");
  return [address.addressLine1, address.addressLine2, address.landmark, cityState, address.pincode]
    .filter((part) => part?.trim())
    .join(", ");
}

function buildProfessionalSummaryText(user: ProfileResponse["user"]): string {
  const contact = mapProfileUserToContactInfo(user);
  const { years } = calculateWorkExperience(user.companies ?? []);
  const location = [user.address?.city, user.address?.state].filter(Boolean).join(", ");
  const role = contact.designation || "professional";
  const company = contact.companyName;
  const experiencePhrase = years > 0 ? `${years}+ years of experience` : "a strong track record of delivery";

  return `I am a results-oriented ${role}${company ? ` at ${company}` : ""} with ${experiencePhrase}${location ? `, based in ${location}` : ""}. I combine analytical thinking, clear communication, and hands-on execution to deliver measurable outcomes. I adapt quickly, collaborate effectively across teams, and maintain high standards under tight deadlines.`;
}

function buildCareerHighlights(user: ProfileResponse["user"]): string[] {
  const contact = mapProfileUserToContactInfo(user);
  const { years, months } = calculateWorkExperience(user.companies ?? []);
  const highlights: string[] = [];

  if (years > 0 || months > 0) {
    const tenure =
      years > 0 && months > 0 ? `${years}+ years (${years}y ${months}m)` : years > 0 ? `${years}+ years` : `${months} months`;
    highlights.push(`I bring ${tenure} of progressive professional experience`);
  }

  if (contact.designation && contact.companyName) {
    highlights.push(`I currently work as ${contact.designation} at ${contact.companyName}`);
  } else if (contact.designation) {
    highlights.push(`I specialize in ${contact.designation}`);
  }

  const location = [user.address?.city, user.address?.state].filter(Boolean).join(", ");
  if (location) {
    highlights.push(`I am based in ${location}`);
  }

  highlights.push(
    "I maintain a consistent focus on quality, ownership, and stakeholder alignment",
    "I am comfortable working in fast-paced, cross-functional environments",
    "I am committed to continuous learning and professional growth"
  );

  return highlights.slice(0, 6);
}

function buildExperienceBullets(company: CompanyEntry): string[] {
  const designation = company.designation?.trim() || "Professional";
  const companyName = company.companyName?.trim() || "the organization";

  return [
    `I led key initiatives and deliverables as ${designation}, contributing directly to team and business objectives at ${companyName}`,
    `I partnered with stakeholders to clarify requirements, prioritize work, and ship reliable outcomes on schedule`,
    `I improved processes, documentation, and collaboration practices to raise team efficiency and output quality`,
    `I applied domain expertise to troubleshoot challenges, reduce rework, and support long-term maintainability`,
  ];
}

function extractSkillTokens(summary: string, blocks: SummaryBlock[]): string[] {
  const fromBold = [...summary.matchAll(/\*\*([^*]{2,42})\*\*/g)]
    .map((match) => stripSummaryMarkdown(match[1]).trim())
    .filter((term) => term.length > 1 && !term.includes("\n"));

  const skillHeadingPattern = /skill|qualification|requirement|technology|stack|tool|competenc|expertise/i;
  const fromLists: string[] = [];
  let inSkillSection = false;

  for (const block of blocks) {
    if (block.type === "heading") {
      inSkillSection = skillHeadingPattern.test(block.text);
      continue;
    }

    if (!inSkillSection) continue;

    if (block.type === "ul" || block.type === "ol") {
      for (const item of block.items) {
        const plain = stripSummaryMarkdown(item);
        const parts = plain
          .split(/[,;|/]/)
          .map((part) => part.trim())
          .filter((part) => part.length > 1 && part.length < 36);

        if (parts.length > 1) {
          fromLists.push(...parts);
        } else if (plain.length <= 36) {
          fromLists.push(plain);
        }
      }
    }
  }

  const merged = [...fromBold, ...fromLists]
    .map((term) => term.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  return [...new Set(merged)].slice(0, 18);
}

function normalizeSummaryHeading(text: string): string {
  const plain = stripSummaryMarkdown(text);
  const lower = plain.toLowerCase();

  if (lower.includes("overview") || lower.includes("summary")) return "Target Role Overview";
  if (lower.includes("responsibilit")) return "Key Responsibilities";
  if (lower.includes("requirement") || lower.includes("qualification")) return "Role Requirements";
  if (lower.includes("skill") || lower.includes("competenc")) return "Required Skills & Competencies";
  if (lower.includes("benefit") || lower.includes("offer")) return "Role Benefits & Highlights";
  if (lower.includes("company") || lower.includes("about")) return "Company & Context";
  if (lower.includes("experience") || lower.includes("background")) return "Preferred Experience";

  return plain;
}

function reframeSummaryListItem(item: string, heading: string): string {
  const plain = stripSummaryMarkdown(item).trim();
  if (!plain || /^I[\s']|^My /i.test(plain)) return plain;

  const isCandidateFitSection = /skill|qualification|requirement|competenc|experience|background|strength|highlight/i.test(
    heading.toLowerCase()
  );

  if (!isCandidateFitSection) return plain;

  if (/^(the ideal candidate|candidates?|applicants?)\b/i.test(plain)) {
    return plain
      .replace(/^the ideal candidate (should |must |will )?/i, "I ")
      .replace(/^candidates? (should |must |will )?/i, "I ")
      .replace(/^applicants? (should |must |will )?/i, "I ");
  }

  if (/^(\d+\+?\s*years?)/i.test(plain)) {
    return `I have ${plain.charAt(0).toLowerCase()}${plain.slice(1)}`;
  }

  if (/^(experience with|proficient in|knowledge of|familiarity with|strong|excellent|proven)/i.test(plain)) {
    return `I have ${plain.charAt(0).toLowerCase()}${plain.slice(1)}`;
  }

  return `I bring ${plain.charAt(0).toLowerCase()}${plain.slice(1)}`;
}

function summaryBlocksToCvElements(blocks: SummaryBlock[]): CVElement[] {
  const elements: CVElement[] = [];
  let isFirstParagraph = true;
  let currentHeading = "";

  for (const block of blocks) {
    if (block.type === "heading") {
      isFirstParagraph = true;
      currentHeading = normalizeSummaryHeading(block.text);
      elements.push(
        textEl(currentHeading, {
          fontSize: block.level <= 2 ? 15 : 14,
          fontWeight: "semi-bold",
          textAlign: "start",
          color: "#0f172a",
          marginTop: elements.length > 0 ? GAP.lg : undefined,
          marginBottom: GAP.xs,
        })
      );
      continue;
    }

    if (block.type === "paragraph") {
      const plain = stripSummaryMarkdown(block.text);
      if (!plain) continue;

      if (isFirstParagraph && plain.length > 80) {
        elements.push(quoteEl(plain, elements.length > 0 ? GAP.sm : undefined));
        isFirstParagraph = false;
        continue;
      }

      isFirstParagraph = false;
      elements.push(
        textEl(plain, {
          fontSize: 13,
          fontWeight: "normal",
          textAlign: "start",
          color: "#334155",
          marginBottom: GAP.sm,
        })
      );
      continue;
    }

    isFirstParagraph = false;
    const items = block.items
      .map((item) => reframeSummaryListItem(item, currentHeading))
      .filter(Boolean);
    if (items.length === 0) continue;

    elements.push(listEl(items, { listIcon: block.type === "ol" ? "number" : "bullet" }));
  }

  return elements;
}

function buildContactSection(user: ProfileResponse["user"]): CVElement {
  const contact = mapProfileUserToContactInfo(user);
  const fullAddress = formatFullAddress(user);
  const locationLine = [contact.city, contact.state].filter(Boolean).join(", ");

  const leftChildren: CVElement[] = [
    textEl(contact.fullName || "Your Name", {
      fontSize: 26,
      fontWeight: "bold",
      textAlign: "start",
      color: "#0f172a",
      marginBottom: GAP.xs,
    }),
  ];

  if (contact.designation) {
    leftChildren.push(
      textEl(contact.designation, {
        fontSize: 14,
        fontWeight: "medium",
        textAlign: "start",
        color: "#2563eb",
        marginBottom: GAP.xs,
      })
    );
  }

  if (contact.companyName) {
    leftChildren.push(
      textEl(contact.companyName, {
        fontSize: 13,
        fontWeight: "normal",
        textAlign: "start",
        color: "#475569",
        marginBottom: GAP.sm,
      })
    );
  }

  const rightChildren: CVElement[] = [];

  if (contact.email) {
    rightChildren.push(
      textEl(contact.email, {
        fontSize: 12,
        fontWeight: "normal",
        textAlign: "start",
        color: "#64748b",
        marginBottom: GAP.xs,
      })
    );
  }

  if (contact.mobile) {
    rightChildren.push(
      textEl(contact.mobile, {
        fontSize: 12,
        fontWeight: "normal",
        textAlign: "start",
        color: "#64748b",
        marginBottom: GAP.xs,
      })
    );
  }

  if (fullAddress) {
    rightChildren.push(
      textEl(fullAddress, {
        fontSize: 12,
        fontWeight: "normal",
        textAlign: "start",
        color: "#64748b",
        marginBottom: GAP.xs,
      })
    );
  } else if (locationLine) {
    rightChildren.push({
      id: crypto.randomUUID(),
      type: "location",
      content: locationLine,
      properties: {
        fontSize: 12,
        fontWeight: "normal",
        textAlign: "start",
        color: "#64748b",
        marginBottom: GAP.xs,
      },
      editable: true,
    });
  }

  return createSection(null, [createBlock(leftChildren, 58), createBlock(rightChildren, 42)]);
}

function buildSkillsBlock(summary: string, blocks: SummaryBlock[]): CVElement[] {
  const tokens = extractSkillTokens(summary, blocks);
  if (tokens.length === 0) return [];

  const groupedList = [
    `My core strengths include ${tokens.slice(0, 6).join(", ")}`,
    "I have demonstrated ability to apply relevant tools, methods, and domain knowledge in production settings",
    "I am comfortable ramping up on new technologies and contributing quickly in collaborative teams",
  ];

  return [
    sectionHeader("Technical Skills & Keywords"),
    tokenEl(tokens),
    listEl(groupedList, { marginTop: GAP.sm }),
  ];
}

function buildEducationBlock(): CVElement[] {
  return [
    sectionHeader("Education & Certifications"),
    textEl("My degree / institution name", {
      fontSize: 14,
      fontWeight: "semi-bold",
      textAlign: "start",
      color: "#0f172a",
      marginTop: GAP.sm,
      marginBottom: GAP.xs,
    }),
    textEl("My graduation date, honors, relevant coursework, and academic achievements", {
      fontSize: 13,
      fontWeight: "normal",
      textAlign: "start",
      color: "#64748b",
      marginBottom: GAP.sm,
    }),
    listEl(
      [
        "My certifications, licenses, or professional credentials",
        "Workshops, bootcamps, or continuing education programs I have completed",
        "Notable projects, publications, or community contributions I have made",
      ],
      { listIcon: "bullet" }
    ),
  ];
}

function buildCareerSummaryParts(user: ProfileResponse["user"]): CVElement[] {
  return [
    sectionHeader("Professional Summary"),
    quoteEl(buildProfessionalSummaryText(user)),
    listEl(buildCareerHighlights(user), { marginTop: GAP.sm, marginBottom: GAP.md }),
  ];
}

function buildExperienceParts(user: ProfileResponse["user"], includeSectionHeader = true): CVElement[] {
  const companies = normalizeCompanies(user.companies ?? []);
  const parts: CVElement[] = includeSectionHeader ? [sectionHeader("Work Experience")] : [];

  if (companies.length === 0) {
    parts.push(
      textEl("Add your work history here — role titles, companies, dates, and measurable achievements.", {
        fontSize: 13,
        fontWeight: "normal",
        textAlign: "start",
        color: "#64748b",
        marginTop: GAP.sm,
        marginBottom: GAP.sm,
      }),
      listEl(
        [
          "I have delivered consistent results across cross-functional projects and stakeholder expectations",
          "I have owned end-to-end delivery from planning through execution, review, and follow-up",
          "I have strengthened team workflows through clear communication, documentation, and mentorship",
        ],
        { listIcon: "bullet" }
      )
    );
    return parts;
  }

  companies.forEach((company, index) => {
    const title = [company.designation, company.companyName].filter(Boolean).join(" — ");
    const range = formatCompanyRange(company);
    const startDate = monthYearToDate(company.fromMonth, company.fromYear);

    if (title) {
      parts.push(
        textEl(title, {
          fontSize: 14,
          fontWeight: "semi-bold",
          textAlign: "start",
          color: "#0f172a",
          marginTop: index > 0 ? GAP.md : GAP.sm,
          marginBottom: GAP.xs,
        })
      );
    }

    if (startDate) {
      parts.push(dateEl(startDate.toISOString()));
    } else if (range) {
      parts.push(
        textEl(range, {
          fontSize: 12,
          fontWeight: "normal",
          textAlign: "start",
          color: "#64748b",
          marginBottom: GAP.xs,
        })
      );
    }

    parts.push(listEl(buildExperienceBullets(company).slice(0, 3), { listIcon: "bullet" }));
  });

  return parts;
}

function buildExperienceSections(user: ProfileResponse["user"]): CVElement[] {
  const companies = normalizeCompanies(user.companies ?? []);

  if (companies.length <= 1) {
    return [createSection(null, [createBlock(buildExperienceParts(user))])];
  }

  return companies.map((company, index) => {
    const title = [company.designation, company.companyName].filter(Boolean).join(" — ");
    const range = formatCompanyRange(company);
    const startDate = monthYearToDate(company.fromMonth, company.fromYear);
    const parts: CVElement[] = index === 0 ? [sectionHeader("Work Experience")] : [];

    if (title) {
      parts.push(
        textEl(title, {
          fontSize: 14,
          fontWeight: "semi-bold",
          textAlign: "start",
          color: "#0f172a",
          marginTop: index > 0 ? GAP.md : GAP.sm,
          marginBottom: GAP.xs,
        })
      );
    }

    if (startDate) {
      parts.push(dateEl(startDate.toISOString()));
    } else if (range) {
      parts.push(
        textEl(range, {
          fontSize: 12,
          fontWeight: "normal",
          textAlign: "start",
          color: "#64748b",
          marginBottom: GAP.xs,
        })
      );
    }

    parts.push(listEl(buildExperienceBullets(company).slice(0, 3), { listIcon: "bullet" }));

    return createSection(null, [createBlock(parts)]);
  });
}

function buildCareerObjectivesParts(): CVElement[] {
  return [
    sectionHeader("Career Objectives"),
    quoteEl(
      "I am seeking a challenging role where I can apply my experience, expand my skill set, and contribute to meaningful outcomes for the team and organization."
    ),
    listEl(
      [
        "Open to roles that align with my background and growth goals",
        "Motivated by collaborative teams, clear goals, and opportunities to make an impact",
        "Ready to discuss how my experience maps to your current priorities",
      ],
      { marginTop: GAP.sm }
    ),
  ];
}

function buildSummarySection(user: ProfileResponse["user"]): CVElement {
  return createSection(null, [createBlock(buildCareerSummaryParts(user))]);
}

function buildEducationSection(): CVElement {
  return createSection(null, [createBlock(buildEducationBlock())]);
}

function buildCareerObjectivesSection(): CVElement {
  return createSection(null, [createBlock(buildCareerObjectivesParts())]);
}

function buildRoleAnalysisParts(summaryBlocks: SummaryBlock[]): CVElement[] {
  const summaryElements = summaryBlocksToCvElements(summaryBlocks);
  if (summaryElements.length === 0) return [];

  return [
    sectionHeader("How I Match This Role"),
    textEl(
      "I reviewed this opportunity and summarized the expectations below to show how my background aligns with the role.",
      {
        fontSize: 12,
        fontWeight: "normal",
        textAlign: "start",
        color: "#64748b",
        marginTop: GAP.sm,
        marginBottom: GAP.sm,
      }
    ),
    ...summaryElements,
  ];
}

function buildRoleAnalysisSection(summaryBlocks: SummaryBlock[]): CVElement | null {
  const roleParts = buildRoleAnalysisParts(summaryBlocks);
  if (roleParts.length === 0) return null;

  return createSection(null, [createBlock(roleParts)]);
}

function buildSkillsSection(summary: string, summaryBlocks: SummaryBlock[]): CVElement | null {
  const skillsParts = buildSkillsBlock(summary, summaryBlocks);
  if (skillsParts.length === 0) return null;

  return createSection(null, [createBlock(skillsParts)]);
}

export const CV_BUILD_PHASES = [
  "contact",
  "summary",
  "experience",
  "education",
  "parse-job",
  "role",
  "skills",
  "layout",
] as const;

export type CvBuildPhase = (typeof CV_BUILD_PHASES)[number];

export type SummarizeCvBuildResult = {
  elements: CVElement[];
  pageProperties: PageProperties;
  skippedPhases?: CvBuildPhase[];
};

async function yieldBuildPhase(
  onPhase: ((phase: CvBuildPhase) => void | Promise<void>) | undefined,
  phase: CvBuildPhase
) {
  await onPhase?.(phase);
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export async function buildSummarizeCvAsync(
  user: ProfileResponse["user"],
  summary: string,
  onPhase?: (phase: CvBuildPhase) => void | Promise<void>
): Promise<SummarizeCvBuildResult> {
  const trimmedSummary = summary.trim();
  const hasJobSummary = trimmedSummary.length > 0;
  const skippedPhases: CvBuildPhase[] = [];

  await yieldBuildPhase(onPhase, "contact");
  const contactSection = buildContactSection(user);

  await yieldBuildPhase(onPhase, "summary");
  const summarySection = buildSummarySection(user);

  await yieldBuildPhase(onPhase, "experience");
  const experienceSections = buildExperienceSections(user);

  await yieldBuildPhase(onPhase, "education");
  const educationSection = buildEducationSection();

  const sections: CVElement[] = [contactSection, summarySection, ...experienceSections, educationSection];

  if (!hasJobSummary) {
    sections.push(buildCareerObjectivesSection());
    skippedPhases.push("parse-job", "role", "skills");
  } else {
    await yieldBuildPhase(onPhase, "parse-job");
    const summaryBlocks = parseSummaryBlocks(trimmedSummary);

    await yieldBuildPhase(onPhase, "role");
    const roleSection = buildRoleAnalysisSection(summaryBlocks);
    if (roleSection) sections.push(roleSection);

    await yieldBuildPhase(onPhase, "skills");
    const skillsSection = buildSkillsSection(trimmedSummary, summaryBlocks);
    if (skillsSection) sections.push(skillsSection);
  }

  await yieldBuildPhase(onPhase, "layout");

  const paginatedElements = paginateCvElements([
    {
      id: crypto.randomUUID(),
      type: "page",
      children: sections,
    },
  ]);

  return {
    elements: paginatedElements,
    pageProperties: PAGE_PROPERTIES,
    skippedPhases: skippedPhases.length > 0 ? skippedPhases : undefined,
  };
}

export function buildSummarizeCv(user: ProfileResponse["user"], summary: string): SummarizeCvBuildResult {
  const trimmedSummary = summary.trim();
  const summaryBlocks = trimmedSummary ? parseSummaryBlocks(trimmedSummary) : [];
  const hasJobSummary = trimmedSummary.length > 0;

  const sections: CVElement[] = [
    buildContactSection(user),
    buildSummarySection(user),
    ...buildExperienceSections(user),
    buildEducationSection(),
    ...(hasJobSummary ? [] : [buildCareerObjectivesSection()]),
    ...(hasJobSummary ? [buildRoleAnalysisSection(summaryBlocks), buildSkillsSection(trimmedSummary, summaryBlocks)] : []),
  ].filter((section): section is CVElement => section !== null);

  const paginatedElements = paginateCvElements([
    {
      id: crypto.randomUUID(),
      type: "page",
      children: sections,
    },
  ]);

  return {
    elements: paginatedElements,
    pageProperties: PAGE_PROPERTIES,
  };
}

function findPrimaryBlock(elements: CVElement[]): CVElement | null {
  const page = elements.find((node) => node.type === "page");
  const section = page?.children?.find((node) => node.type === "section");
  return section?.children?.find((node) => node.type === "block") ?? null;
}

/** @deprecated Prefer buildSummarizeCv for summarize flow */
export function appendJobSummaryToCv(elements: CVElement[], summary: string): CVElement[] {
  const trimmed = summary.trim();
  if (!trimmed) return elements;

  const blocks = parseSummaryBlocks(trimmed);
  const summaryElements = summaryBlocksToCvElements(blocks);
  if (summaryElements.length === 0) return elements;

  const clone = structuredClone(elements);
  const block = findPrimaryBlock(clone);
  if (!block) return clone;

  const existingChildren = block.children ?? [];
  if (existingChildren.length > 0) {
    summaryElements[0] = {
      ...summaryElements[0],
      properties: {
        ...summaryElements[0].properties,
        marginTop: GAP.section,
      },
    };
  }

  block.children = [...existingChildren, ...summaryElements];
  return clone;
}
