/**
 * html2canvas cannot parse modern CSS color functions (color(), oklch(), color-mix(), etc.)
 * emitted by Tailwind v4. Before capture, strip global stylesheets from the clone and inline
 * resolved computed styles from the live source tree.
 */

const CAPTURE_STYLE_PROPS = [
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-align",
  "text-indent",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-style",
  "text-transform",
  "white-space",
  "word-break",
  "color",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-radius",
  "box-shadow",
  "text-shadow",
  "display",
  "flex",
  "flex-direction",
  "flex-wrap",
  "align-items",
  "align-self",
  "justify-content",
  "gap",
  "column-gap",
  "row-gap",
  "grid-template-columns",
  "grid-template-rows",
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "overflow",
  "overflow-x",
  "overflow-y",
  "opacity",
  "visibility",
  "box-sizing",
  "list-style-type",
  "list-style-position",
  "object-fit",
  "vertical-align",
] as const;

function collectElements(root: HTMLElement): HTMLElement[] {
  return [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
}

function snapshotStyles(el: HTMLElement): Record<string, string> {
  const computed = window.getComputedStyle(el);
  const snapshot: Record<string, string> = {};

  for (const prop of CAPTURE_STYLE_PROPS) {
    const value = computed.getPropertyValue(prop);
    if (value) snapshot[prop] = value;
  }

  return snapshot;
}

function applySnapshot(el: HTMLElement, snapshot: Record<string, string>) {
  for (const [prop, value] of Object.entries(snapshot)) {
    el.style.setProperty(prop, value);
  }
}

export function prepareHtml2CanvasClone(
  clonedDoc: Document,
  clonedRoot: HTMLElement,
  sourceRoot: HTMLElement,
) {
  clonedDoc.querySelectorAll("[data-cv-capture-ignore]").forEach((node) => node.remove());

  const sourceElements = collectElements(sourceRoot);
  const cloneElements = collectElements(clonedRoot);
  const snapshots = sourceElements.map((el) => snapshotStyles(el));

  clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => node.remove());

  const count = Math.min(cloneElements.length, snapshots.length);
  for (let i = 0; i < count; i += 1) {
    applySnapshot(cloneElements[i], snapshots[i]);
  }
}
