/**
 * html2canvas cannot parse modern CSS color functions (color(), oklch(), color-mix(), etc.)
 * emitted by Tailwind v4. Before capture, strip global stylesheets from the clone and inline
 * resolved computed styles from the live source tree.
 */

/** Pixel ratio for CV/cover-letter canvas captures (preview overlay & PDF export). */
export function getHtml2CanvasCaptureScale(): number {
  if (typeof window === "undefined") return 4;
  const dpr = window.devicePixelRatio || 1;
  return Math.min(6, Math.max(4, Math.round(dpr * 3)));
}

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

function measureCaptureBounds(root: HTMLElement): { width: number; height: number } {
  const rootRect = root.getBoundingClientRect();
  let maxBottom = rootRect.height;
  let maxRight = rootRect.width;

  for (const el of collectElements(root)) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) continue;

    maxBottom = Math.max(maxBottom, rect.bottom - rootRect.top);
    maxRight = Math.max(maxRight, rect.right - rootRect.left);
  }

  return {
    width: Math.ceil(Math.max(maxRight, root.scrollWidth, root.offsetWidth)),
    height: Math.ceil(Math.max(maxBottom, root.scrollHeight, root.offsetHeight)),
  };
}

function applyCaptureExpansionStyles(root: HTMLElement): Map<HTMLElement, string> {
  const original = new Map<HTMLElement, string>();

  const setStyle = (el: HTMLElement, styles: Record<string, string>) => {
    if (!original.has(el)) {
      original.set(el, el.style.cssText);
    }
    for (const [property, value] of Object.entries(styles)) {
      el.style.setProperty(property, value);
    }
  };

  const minPageHeight = root.offsetHeight;
  setStyle(root, {
    height: "auto",
    "min-height": `${minPageHeight}px`,
    overflow: "visible",
    "overflow-x": "visible",
    "overflow-y": "visible",
  });

  for (const el of collectElements(root)) {
    const computed = window.getComputedStyle(el);

    if (
      computed.overflow !== "visible" ||
      computed.overflowX === "hidden" ||
      computed.overflowX === "auto" ||
      computed.overflowX === "scroll" ||
      computed.overflowY === "hidden" ||
      computed.overflowY === "auto" ||
      computed.overflowY === "scroll"
    ) {
      setStyle(el, {
        overflow: "visible",
        "overflow-x": "visible",
        "overflow-y": "visible",
      });
    }

    if (computed.maxHeight !== "none" && computed.maxHeight !== "") {
      setStyle(el, { "max-height": "none" });
    }

    if (computed.height.endsWith("%")) {
      setStyle(el, { height: "auto" });
    }

    if (computed.flexGrow !== "0" && (computed.minHeight === "0px" || el.classList.contains("min-h-0"))) {
      setStyle(el, {
        flex: "0 0 auto",
        "min-height": "0",
        height: "auto",
      });
    }
  }

  void root.offsetHeight;

  for (const el of collectElements(root)) {
    if (el.scrollHeight > el.clientHeight + 1) {
      setStyle(el, {
        height: `${el.scrollHeight}px`,
        "min-height": `${el.scrollHeight}px`,
        overflow: "visible",
        "overflow-y": "visible",
      });
    }
  }

  void root.offsetHeight;

  const bounds = measureCaptureBounds(root);
  setStyle(root, {
    height: `${bounds.height}px`,
    "min-height": `${bounds.height}px`,
    width: `${bounds.width}px`,
  });

  return original;
}

export type CaptureExpansionResult = {
  width: number;
  height: number;
  restore: () => void;
};

/** Temporarily expand clipped layout so preview/PDF capture the full document content. */
export function applyCaptureExpansion(root: HTMLElement): CaptureExpansionResult {
  const original = applyCaptureExpansionStyles(root);
  const bounds = measureCaptureBounds(root);

  return {
    width: bounds.width,
    height: bounds.height,
    restore: () => {
      for (const [el, cssText] of original) {
        el.style.cssText = cssText;
      }
    },
  };
}

export function prepareHtml2CanvasClone(
  clonedDoc: Document,
  clonedRoot: HTMLElement,
  sourceRoot: HTMLElement,
  captureDimensions?: { width: number; height: number },
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

  if (captureDimensions) {
    clonedRoot.style.width = `${captureDimensions.width}px`;
    clonedRoot.style.height = `${captureDimensions.height}px`;
    clonedRoot.style.overflow = "visible";
    clonedRoot.style.overflowY = "visible";
  }

  for (const cloneEl of cloneElements) {
    cloneEl.style.overflow = "visible";
    cloneEl.style.overflowY = "visible";
    cloneEl.style.maxHeight = "none";
  }
}
