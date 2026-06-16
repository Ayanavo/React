import type { CVElement } from "@/lib/useCV";

function cloneWithNewIds(node: CVElement): CVElement {
  const cloned: CVElement = {
    ...node,
    id: crypto.randomUUID(),
    properties: node.properties ? structuredClone(node.properties) : undefined,
    content: Array.isArray(node.content) ? [...node.content] : node.content,
    children: node.children?.map(cloneWithNewIds),
  };

  return cloned;
}

export function regenerateElementIds(elements: CVElement[]): CVElement[] {
  return elements.map(cloneWithNewIds);
}

function hasTextContent(element: CVElement): boolean {
  if (element.type === "text" || element.type === "date" || element.type === "location" || element.type === "token") {
    return typeof element.content === "string" && element.content.trim().length > 0;
  }

  if (element.type === "list" && Array.isArray(element.content)) {
    return element.content.some((item) => typeof item === "string" && item.trim().length > 0);
  }

  if (element.type === "header") {
    const headerContent = element.properties?.headerStyle?.content;
    return typeof headerContent === "string" && headerContent.trim().length > 0;
  }

  return false;
}

export function hasMeaningfulCvContent(elements: CVElement[]): boolean {
  const queue = [...elements];

  while (queue.length) {
    const element = queue.shift();
    if (!element) continue;

    if (hasTextContent(element)) {
      return true;
    }

    if (element.children?.length) {
      queue.push(...element.children);
    }
  }

  return false;
}

export function getTemplateSectionPreview(elements: CVElement[]): string[] {
  const headers: string[] = [];
  const queue = [...elements];

  while (queue.length) {
    const element = queue.shift();
    if (!element) continue;

    if (element.type === "header") {
      const title = element.properties?.headerStyle?.content?.trim();
      if (title) headers.push(title);
    }

    if (element.children?.length) {
      queue.push(...element.children);
    }
  }

  return headers;
}
