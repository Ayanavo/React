import type { CSSProperties } from "react";
import type { CVElement } from "@/lib/useCV";

export const ELEMENT_GAP_MAX = 32;
export const TEXT_INDENT_MAX = 72;

export const SPACED_ELEMENT_TYPES = new Set([
  "text",
  "list",
  "date",
  "token",
  "image",
  "icon",
  "location",
  "quote",
]);

export function getElementSpacingStyle(properties?: CVElement["properties"]): CSSProperties {
  return {
    marginTop: properties?.marginTop ? `${properties.marginTop}px` : undefined,
    marginBottom: properties?.marginBottom ? `${properties.marginBottom}px` : undefined,
  };
}

export function isSpacedElementType(type: string): boolean {
  return SPACED_ELEMENT_TYPES.has(type);
}
