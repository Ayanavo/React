import type { CVElement } from "@/lib/useCV";

/** Usable content height inside an A4 page (px). */
export const CV_PAGE_USABLE_HEIGHT = 1060;

const BLOCK_PADDING_PX = 32;
const SECTION_GAP_PX = 4;
const CHARS_PER_LINE = 82;

function lineCount(text: string, charsPerLine = CHARS_PER_LINE): number {
  const normalized = text.trim();
  if (!normalized) return 0;
  return Math.max(1, Math.ceil(normalized.length / charsPerLine));
}

function estimateElementHeightPx(element: CVElement): number {
  const marginTop = element.properties?.marginTop ?? 0;
  const marginBottom = element.properties?.marginBottom ?? 0;
  const fontSize = element.properties?.fontSize ?? 13;
  const lineHeight = Math.max(15, fontSize * 1.35);

  if (element.type === "header") {
    const headerFontSize = element.properties?.headerStyle?.fontSize ?? 15;
    const underlineGap = element.properties?.headerStyle?.underline?.enabled ? 8 : 0;
    return marginTop + 32 + Math.max(18, headerFontSize * 1.35) + underlineGap + 2 + marginBottom;
  }

  if (element.type === "text") {
    return marginTop + lineCount(String(element.content ?? "")) * lineHeight + marginBottom;
  }

  if (element.type === "list") {
    const items = Array.isArray(element.content) ? element.content : [];
    const itemsHeight = items.reduce((sum, item) => sum + lineCount(String(item)) * lineHeight, 0);
    return marginTop + itemsHeight + Math.max(0, items.length - 1) * 2 + marginBottom + 4;
  }

  if (element.type === "quote") {
    return marginTop + lineCount(String(element.content ?? "")) * lineHeight + marginBottom + 16;
  }

  if (element.type === "token") {
    const tokens = Array.isArray(element.content) ? element.content : [];
    const rows = Math.max(1, Math.ceil(tokens.length / 4));
    return marginTop + rows * 30 + marginBottom + 4;
  }

  if (element.type === "date" || element.type === "location") {
    return marginTop + 20 + marginBottom;
  }

  return marginTop + 22 + marginBottom;
}

function estimateBlockHeightPx(block: CVElement): number {
  const children = block.children ?? [];
  if (children.length === 0) return BLOCK_PADDING_PX;

  return BLOCK_PADDING_PX + children.reduce((sum, child) => sum + estimateElementHeightPx(child), 0);
}

export function estimateSectionHeightPx(section: CVElement): number {
  const header = section.children?.find((child) => child.type === "header");
  const blocks = section.children?.filter((child) => child.type === "block") ?? [];

  let height = SECTION_GAP_PX;

  if (header) {
    height += estimateElementHeightPx(header);
  }

  if (blocks.length === 0) {
    return height;
  }

  if (blocks.length === 1) {
    height += estimateBlockHeightPx(blocks[0]);
    return height;
  }

  height += Math.max(...blocks.map((block) => estimateBlockHeightPx(block)));
  return height;
}

function cloneSection(section: CVElement, blockChildren: CVElement[], includeHeader: boolean): CVElement {
  const header = section.children?.find((child) => child.type === "header");
  const blocks = section.children?.filter((child) => child.type === "block") ?? [];
  const blockWidth = blocks[0]?.width;

  const children: CVElement[] = [];

  if (includeHeader && header) {
    children.push(header);
  }

  children.push({
    id: crypto.randomUUID(),
    type: "block",
    ...(typeof blockWidth === "number" ? { width: blockWidth } : {}),
    children: blockChildren,
  });

  return {
    id: crypto.randomUUID(),
    type: "section",
    children,
  };
}

function splitOversizedSection(section: CVElement, maxPx: number): CVElement[] {
  if (estimateSectionHeightPx(section) <= maxPx) {
    return [section];
  }

  const header = section.children?.find((child) => child.type === "header");
  const blocks = section.children?.filter((child) => child.type === "block") ?? [];
  const flatChildren = blocks.flatMap((block) => block.children ?? []);

  if (flatChildren.length <= 1) {
    return [section];
  }

  const parts: CVElement[] = [];
  let chunk: CVElement[] = [];
  let chunkHeight = BLOCK_PADDING_PX + (header ? estimateElementHeightPx(header) : 0);

  const flush = (includeHeader: boolean) => {
    if (chunk.length === 0) return;
    parts.push(cloneSection(section, chunk, includeHeader));
    chunk = [];
    chunkHeight = BLOCK_PADDING_PX;
  };

  for (const child of flatChildren) {
    const childHeight = estimateElementHeightPx(child);

    if (chunk.length > 0 && chunkHeight + childHeight > maxPx) {
      flush(parts.length === 0);
    }

    chunk.push(child);
    chunkHeight += childHeight;
  }

  flush(parts.length === 0);

  return parts.length > 0 ? parts : [section];
}

function collectSections(elements: CVElement[]): CVElement[] {
  return elements
    .filter((node) => node.type === "page")
    .flatMap((page) => page.children?.filter((child) => child.type === "section") ?? []);
}

export function paginateCvElements(
  elements: CVElement[],
  pageHeight = CV_PAGE_USABLE_HEIGHT
): CVElement[] {
  const sections = collectSections(elements);
  if (sections.length === 0) return elements;

  const expandedSections = sections.flatMap((section) => splitOversizedSection(section, pageHeight));

  const pageGroups: CVElement[][] = [];
  let currentPage: CVElement[] = [];
  let currentHeight = 0;

  for (const section of expandedSections) {
    const sectionHeight = Math.ceil(estimateSectionHeightPx(section) * 1.04);

    if (currentPage.length > 0 && currentHeight + sectionHeight > pageHeight) {
      pageGroups.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }

    currentPage.push(section);
    currentHeight += sectionHeight;
  }

  if (currentPage.length > 0) {
    pageGroups.push(currentPage);
  }

  if (pageGroups.length === 0) {
    return elements;
  }

  return pageGroups.map((pageSections) => ({
    id: crypto.randomUUID(),
    type: "page" as const,
    children: pageSections,
  }));
}
