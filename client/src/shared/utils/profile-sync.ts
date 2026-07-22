import type { CVElement } from "@/lib/useCV";
import type { ProfileResponse } from "@/shared/services/auth";
import {
  buildContactSection,
  buildExperienceSections,
  buildSummarySection,
} from "@/pages/cv-builder/cv-summary-seed";
import { applyProfileToCoverLetterHeader } from "@/pages/cover-letter/cover-letter-template";
import {
  mapProfileUserToContactInfo,
  normalizeCoverLetterClosing,
  type UserContactInfo,
} from "@/shared/utils/profile-contact";

export type ProfileSyncResult = {
  elements: CVElement[];
  updatedSections: string[];
};

function getSectionTitle(section: CVElement): string {
  const header = section.children?.find((child) => child.type === "header");
  const content = header?.properties?.headerStyle?.content;
  return typeof content === "string" ? content.trim() : "";
}

function mergeElementPreservingId(existing: CVElement, source: CVElement): CVElement {
  const merged: CVElement = {
    ...structuredClone(source),
    id: existing.id,
  };

  if (existing.children && source.children) {
    merged.children = source.children.map((sourceChild, index) => {
      const existingChild = existing.children?.[index];
      if (existingChild && existingChild.type === sourceChild.type) {
        return mergeElementPreservingId(existingChild, sourceChild);
      }
      return sourceChild;
    });
  }

  return merged;
}

function isContactSection(section: CVElement, index: number): boolean {
  const title = getSectionTitle(section).toLowerCase();
  if (title.includes("contact") || title.includes("personal")) return true;
  return index === 0 && !title;
}

function isSummarySection(section: CVElement): boolean {
  const title = getSectionTitle(section).toLowerCase();
  return title.includes("professional summary") || title === "summary";
}

function isExperienceSection(section: CVElement): boolean {
  const title = getSectionTitle(section).toLowerCase();
  if (!title) return false;
  if (title.includes("role") || title.includes("objective") || title.includes("education")) return false;
  return title.includes("work experience") || title === "experience";
}

function syncSimpleContactBlock(page: CVElement, user: ProfileResponse["user"]): boolean {
  const section = page.children?.find((child) => child.type === "section");
  const block = section?.children?.find((child) => child.type === "block");
  if (!block?.children?.length) return false;

  const info = mapProfileUserToContactInfo(user);
  const contactLine = [info.email, info.mobile].filter(Boolean).join("  |  ");
  const locationLine = [info.city, info.state].filter(Boolean).join(", ");
  let updated = false;

  const textElements = block.children.filter((child) => child.type === "text");
  const locationElements = block.children.filter((child) => child.type === "location");

  if (textElements[0] && info.fullName) {
    textElements[0].content = info.fullName;
    updated = true;
  }

  if (info.designation) {
    const designationElement = textElements.find(
      (element) =>
        element !== textElements[0] &&
        (element.properties?.fontWeight === "medium" || element.properties?.color === "#2563eb")
    );

    if (designationElement) {
      designationElement.content = info.designation;
      updated = true;
    } else if (textElements[1] && textElements[1] !== textElements[0]) {
      textElements[1].content = info.designation;
      updated = true;
    }
  }

  const contactElement = textElements.find(
    (element) => typeof element.content === "string" && (element.content.includes("|") || element.content.includes("@"))
  );
  if (contactElement && contactLine) {
    contactElement.content = contactLine;
    updated = true;
  }

  if (locationElements[0] && locationLine) {
    locationElements[0].content = locationLine;
    updated = true;
  }

  return updated;
}

function syncPageSections(page: CVElement, user: ProfileResponse["user"], updatedSections: string[]): CVElement {
  const sections = page.children?.filter((child) => child.type === "section") ?? [];
  if (sections.length === 0) {
    if (syncSimpleContactBlock(page, user)) {
      updatedSections.push("contact");
    }
    return page;
  }

  let nextSections = [...sections];
  let changed = false;

  const contactIndex = nextSections.findIndex((section, index) => isContactSection(section, index));
  if (contactIndex >= 0) {
    nextSections[contactIndex] = mergeElementPreservingId(
      nextSections[contactIndex],
      buildContactSection(user)
    );
    updatedSections.push("contact");
    changed = true;
  }

  const summaryIndex = nextSections.findIndex((section) => isSummarySection(section));
  if (summaryIndex >= 0) {
    nextSections[summaryIndex] = mergeElementPreservingId(
      nextSections[summaryIndex],
      buildSummarySection(user)
    );
    updatedSections.push("summary");
    changed = true;
  }

  const experienceIndices = nextSections
    .map((section, index) => (isExperienceSection(section) ? index : -1))
    .filter((index) => index >= 0);

  if (experienceIndices.length > 0) {
    const start = experienceIndices[0];
    const end = experienceIndices[experienceIndices.length - 1];
    const oldExperienceSections = nextSections.slice(start, end + 1);
    const newExperienceSections = buildExperienceSections(user);
    const mergedExperienceSections = newExperienceSections.map((section, index) =>
      oldExperienceSections[index] ? mergeElementPreservingId(oldExperienceSections[index], section) : section
    );

    nextSections = [
      ...nextSections.slice(0, start),
      ...mergedExperienceSections,
      ...nextSections.slice(end + 1),
    ];
    updatedSections.push("experience");
    changed = true;
  }

  if (!changed && contactIndex < 0) {
    if (syncSimpleContactBlock(page, user)) {
      updatedSections.push("contact");
    }
  }

  const nonSectionChildren = page.children?.filter((child) => child.type !== "section") ?? [];
  return {
    ...page,
    children: [...nonSectionChildren, ...nextSections],
  };
}

export function syncCvWithProfile(elements: CVElement[], user: ProfileResponse["user"]): ProfileSyncResult {
  const clone = structuredClone(elements);
  const updatedSections: string[] = [];

  const pages = clone.filter((element) => element.type === "page");
  if (pages.length === 0) {
    return { elements: clone, updatedSections };
  }

  pages[0] = syncPageSections(pages[0], user, updatedSections);

  return {
    elements: clone,
    updatedSections: [...new Set(updatedSections)],
  };
}

function findFirstByType(elements: CVElement[], type: CVElement["type"]): CVElement | null {
  const queue = [...elements];

  while (queue.length > 0) {
    const element = queue.shift();
    if (!element) continue;
    if (element.type === type) return element;
    if (element.children?.length) {
      queue.push(...element.children);
    }
  }

  return null;
}

function findClosingTextElement(block: CVElement): CVElement | null {
  const textElements = block.children?.filter((child) => child.type === "text") ?? [];

  for (let index = textElements.length - 1; index >= 0; index -= 1) {
    const content = textElements[index].content;
    if (typeof content === "string" && /^sincerely[,.!\s]/i.test(content.trim())) {
      return textElements[index];
    }
  }

  return textElements[textElements.length - 1] ?? null;
}

export function syncCoverLetterWithProfile(elements: CVElement[], profile: UserContactInfo): ProfileSyncResult {
  const clone = structuredClone(elements);
  const updatedSections: string[] = [];

  const header = findFirstByType(clone, "header");
  if (header?.properties?.headerStyle) {
    header.properties.headerStyle = applyProfileToCoverLetterHeader(header.properties.headerStyle, profile);
    updatedSections.push("header");
  }

  const block = findFirstByType(clone, "block");
  const closingElement = block ? findClosingTextElement(block) : null;
  if (closingElement && typeof closingElement.content === "string") {
    closingElement.content = normalizeCoverLetterClosing(closingElement.content, profile);
    updatedSections.push("closing");
  }

  return {
    elements: clone,
    updatedSections: [...new Set(updatedSections)],
  };
}
