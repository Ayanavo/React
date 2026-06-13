import { CSSProperties } from "react";
import { ColorResult } from "react-color";

export const DEFAULT_PICKER_COLOR = "#ffffff";

export type NoteThemeColors = {
  text: string;
  muted: string;
  placeholder: string;
  border: string;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0] + normalized[0], 16),
      g: parseInt(normalized[1] + normalized[1], 16),
      b: parseInt(normalized[2] + normalized[2], 16),
    };
  }
  if (normalized.length !== 6) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function isDarkNoteBackground(backgroundColor?: string): boolean {
  const rgb = backgroundColor ? hexToRgb(backgroundColor) : null;
  if (!rgb) return false;
  return getRelativeLuminance(rgb.r, rgb.g, rgb.b) < 0.5;
}

export function hasExplicitNoteBackground(backgroundColor?: string): boolean {
  return !!backgroundColor?.trim();
}

export function getNoteThemeColors(backgroundColor?: string): NoteThemeColors | null {
  if (!hasExplicitNoteBackground(backgroundColor)) return null;

  if (isDarkNoteBackground(backgroundColor)) {
    return {
      text: "rgba(255, 255, 255, 0.92)",
      muted: "rgba(255, 255, 255, 0.62)",
      placeholder: "rgba(255, 255, 255, 0.45)",
      border: "rgba(255, 255, 255, 0.24)",
    };
  }

  return {
    text: "rgba(0, 0, 0, 0.87)",
    muted: "rgba(0, 0, 0, 0.62)",
    placeholder: "rgba(0, 0, 0, 0.42)",
    border: "rgba(0, 0, 0, 0.12)",
  };
}

export function getNoteThemeStyle(backgroundColor?: string): CSSProperties | undefined {
  const colors = getNoteThemeColors(backgroundColor);
  if (!colors) return undefined;

  return {
    backgroundColor,
    color: colors.text,
    ["--note-text" as string]: colors.text,
    ["--note-muted" as string]: colors.muted,
    ["--note-placeholder" as string]: colors.placeholder,
    ["--note-border" as string]: colors.border,
  };
}

export const PRESET_PICKER_COLORS = [
  "#111827",
  "#4b5563",
  "#9ca3af",
  "#d1d5db",
  "#ffffff",
  "#7c3aed",
  "#a855f7",
  "#ef4444",
  "#fb923c",
  "#f59e0b",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#2563eb",
];

export function colorResultToHex(color: ColorResult): string {
  return color.hex;
}
