import type { CVElement, PageProperties } from "@/lib/useCV";

function addColor(colors: Set<string>, value?: string) {
  if (!value) return;
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "transparent" || normalized === "inherit") return;
  colors.add(value.trim());
}

function collectElementText(element: CVElement, lines: string[]) {
  const props = element.properties;

  if (element.type === "text" && typeof element.content === "string" && element.content.trim()) {
    lines.push(element.content.trim());
  }

  if (element.type === "list" && Array.isArray(element.content)) {
    element.content.forEach((item) => {
      if (typeof item === "string" && item.trim()) {
        lines.push(item.trim());
      }
    });
  }

  if ((element.type === "date" || element.type === "location" || element.type === "token") && typeof element.content === "string") {
    if (element.content.trim()) {
      lines.push(element.content.trim());
    }
  }

  if (element.type === "header" && props?.headerStyle?.content?.trim()) {
    lines.push(props.headerStyle.content.trim());
  }

  element.children?.forEach((child) => collectElementText(child, lines));
}

function collectElementColors(element: CVElement, colors: Set<string>) {
  const props = element.properties;

  addColor(colors, props?.color);
  addColor(colors, props?.tokenStyle?.backgroundColor);
  addColor(colors, props?.tokenStyle?.borderColor);
  addColor(colors, props?.headerStyle?.color);
  addColor(colors, props?.headerStyle?.backgroundColor);
  addColor(colors, props?.listStyle?.iconColor);
  addColor(colors, props?.imageBorder?.borderColor);

  element.children?.forEach((child) => collectElementColors(child, colors));
}

export type ExtractedCVContent = {
  text: string;
  colors: string[];
  pageProperties: PageProperties;
};

export function extractCVContent(elements: CVElement[], pageProperties: PageProperties): ExtractedCVContent {
  const lines: string[] = [];
  const colors = new Set<string>();

  elements.forEach((element) => {
    collectElementText(element, lines);
    collectElementColors(element, colors);
  });

  addColor(colors, pageProperties.backgroundColor);
  addColor(colors, pageProperties.color);
  addColor(colors, pageProperties.dividerColor);

  return {
    text: lines.join("\n"),
    colors: Array.from(colors),
    pageProperties,
  };
}
