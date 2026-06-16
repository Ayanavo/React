import type { CVTemplateElement } from "./types.js";

const A4_HEIGHT = 1123;

type TextProps = {
  fontSize?: number;
  fontWeight?: string;
  textAlign?: "start" | "center" | "end";
  color?: string;
  fontStyle?: { strikethrough?: boolean; italic?: boolean; underline?: boolean };
};

export type BlockConfig = {
  id: string;
  width?: number;
  children: CVTemplateElement[];
};

export function text(id: string, content: string, props: TextProps = {}): CVTemplateElement {
  return {
    id,
    type: "text",
    content,
    editable: true,
    properties: {
      fontSize: 14,
      fontWeight: "normal",
      textAlign: "start",
      ...props,
    },
  };
}

export function list(id: string, items: string[], props: TextProps = {}): CVTemplateElement {
  return {
    id,
    type: "list",
    content: items,
    editable: true,
    properties: {
      fontSize: 13,
      fontWeight: "normal",
      listStyle: { direction: "column" },
      ...props,
    },
  };
}

export function tokens(
  id: string,
  labels: string[],
  options: { chipColor?: string; textColor?: string; borderColor?: string } = {},
): CVTemplateElement {
  const chipColor = options.chipColor ?? "#e2e8f0";
  const textColor = options.textColor ?? "#0f172a";
  const borderColor = options.borderColor ?? "#94a3b8";

  return {
    id,
    type: "token",
    content: labels,
    editable: true,
    properties: {
      fontSize: 11,
      fontWeight: "medium",
      color: textColor,
      tokenStyle: {
        backgroundColor: chipColor,
        borderColor,
        radius: 9999,
      },
    },
  };
}

/** @deprecated Prefer `tokens()` with a label array for chip groups. */
export function token(id: string, content: string, color = "#e2e8f0"): CVTemplateElement {
  return tokens(id, [content], { chipColor: color });
}

export function dateField(id: string, content: string, props: TextProps = {}): CVTemplateElement {
  return {
    id,
    type: "date",
    content,
    editable: true,
    properties: {
      fontSize: 12,
      fontWeight: "normal",
      dateFormat: "MMM_YYYY",
      includeTime: false,
      textAlign: "start",
      ...props,
    },
  };
}

export function locationField(id: string, content: string): CVTemplateElement {
  return {
    id,
    type: "location",
    content,
    editable: true,
    properties: { fontSize: 13, fontWeight: "normal" },
  };
}

export function header(id: string, title: string, color = "#1e293b"): CVTemplateElement {
  return {
    id,
    type: "header",
    properties: {
      headerStyle: {
        content: title,
        color,
        fontSize: 15,
        backgroundColor: "transparent",
        textAlign: "start",
        underline: { enabled: true, width: "fullWidth", gap: 4 },
      },
    },
  };
}

export function block(id: string, children: CVTemplateElement[], width?: number): CVTemplateElement {
  return { id, type: "block", width, children };
}

export function column(id: string, width: number, children: CVTemplateElement[]): BlockConfig {
  return { id, width, children };
}

/** Single full-width block for sections that do not need side-by-side layout. */
export function singleBlock(id: string, children: CVTemplateElement[]): BlockConfig[] {
  return [{ id, children }];
}

/** Education row: degree & institute on the left, graduation date on the right. */
export function degreeAndDate(
  prefix: string,
  degreeInstitute: string,
  graduationDate: string,
  options: { note?: string; leftWidth?: number; rightWidth?: number } = {},
): BlockConfig[] {
  const leftChildren: CVTemplateElement[] = [
    text(`${prefix}-degree`, degreeInstitute, { fontSize: 14, fontWeight: "semi-bold" }),
  ];

  if (options.note) {
    leftChildren.push(text(`${prefix}-note`, options.note, { fontSize: 12, color: "#64748b" }));
  }

  return twoColumns(
    `${prefix}-left`,
    leftChildren,
    `${prefix}-right`,
    [dateField(`${prefix}-date`, graduationDate, { textAlign: "end" })],
    options.leftWidth ?? 72,
    options.rightWidth ?? 28,
  );
}

/** Two-column layout helper — left sidebar + main content. */
export function twoColumns(
  leftId: string,
  leftChildren: CVTemplateElement[],
  rightId: string,
  rightChildren: CVTemplateElement[],
  leftWidth = 38,
  rightWidth = 62,
): BlockConfig[] {
  return [
    { id: leftId, width: leftWidth, children: leftChildren },
    { id: rightId, width: rightWidth, children: rightChildren },
  ];
}

export function section(
  id: string,
  sectionHeight: number,
  headerTitle: string | null,
  blocks: BlockConfig[],
  headerColor?: string,
): CVTemplateElement {
  const children: CVTemplateElement[] = [];

  if (headerTitle) {
    children.push(header(`${id}-header`, headerTitle, headerColor));
  }

  for (const blockConfig of blocks) {
    children.push(block(blockConfig.id, blockConfig.children, blockConfig.width));
  }

  return {
    id,
    type: "section",
    height: sectionHeight,
    children,
  };
}

export function page(id: string, sections: CVTemplateElement[]): CVTemplateElement {
  return {
    id,
    type: "page",
    children: sections,
  };
}

export function buildPage(sections: CVTemplateElement[]): CVTemplateElement[] {
  return [page("tpl-page-1", sections)];
}

type BalancedSectionConfig = {
  id: string;
  headerTitle: string | null;
  blocks: BlockConfig[];
  headerColor?: string;
  weight?: number;
};

function buildBalancedSections(configs: BalancedSectionConfig[]): CVTemplateElement[] {
  const totalWeight = configs.reduce((sum, config) => sum + (config.weight ?? 1), 0);

  return configs.map((config) =>
    section(
      config.id,
      ((config.weight ?? 1) / totalWeight) * 100,
      config.headerTitle,
      config.blocks,
      config.headerColor,
    ),
  );
}

export function buildBalancedPage(configs: BalancedSectionConfig[]): CVTemplateElement[] {
  return buildPage(buildBalancedSections(configs));
}

/** Spread sections across multiple A4 pages to avoid block overflow. */
export function buildBalancedPages(pages: BalancedSectionConfig[][]): CVTemplateElement[] {
  return pages.map((configs, index) => page(`tpl-page-${index + 1}`, buildBalancedSections(configs)));
}

export { A4_HEIGHT };
