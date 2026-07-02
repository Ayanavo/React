import { CSSProperties } from "react";

export const DEFAULT_PICKER_COLOR = "#ffffff";

export type HsvaColor = {
  h: number;
  s: number;
  v: number;
  a: number;
};

export type ColorFormat = "hex" | "rgb" | "hsl";

export type NoteThemeColors = {
  text: string;
  muted: string;
  placeholder: string;
  border: string;
};

export const DEFAULT_SAVED_COLORS = [
  "#22c55e",
  "#1d4ed8",
  "#4f46e5",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#c4b5fd",
];

export const SAVED_COLORS_STORAGE_KEY = "color-picker-saved-colors";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function componentToHex(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0] + normalized[0], 16),
      g: parseInt(normalized[1] + normalized[1], 16),
      b: parseInt(normalized[2] + normalized[2], 16),
    };
  }
  if (normalized.length === 6 || normalized.length === 8) {
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }
  return null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function hsvaToRgb({ h, s, v }: HsvaColor): { r: number; g: number; b: number } {
  const saturation = s / 100;
  const value = v / 100;
  const chroma = value * saturation;
  const huePrime = h / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (huePrime >= 0 && huePrime < 1) [r1, g1, b1] = [chroma, x, 0];
  else if (huePrime < 2) [r1, g1, b1] = [x, chroma, 0];
  else if (huePrime < 3) [r1, g1, b1] = [0, chroma, x];
  else if (huePrime < 4) [r1, g1, b1] = [0, x, chroma];
  else if (huePrime < 5) [r1, g1, b1] = [x, 0, chroma];
  else [r1, g1, b1] = [chroma, 0, x];

  const m = value - chroma;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function rgbToHsva(r: number, g: number, b: number, alpha = 100): HsvaColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return { h, s, v, a: alpha };
}

export function hexToHsva(hex?: string): HsvaColor {
  const normalized = hex?.replace("#", "").trim() ?? "";
  const alpha =
    normalized.length === 8 ? Math.round((parseInt(normalized.slice(6, 8), 16) / 255) * 100) : 100;
  const rgb = hexToRgb(hex ?? "");
  if (!rgb) return { h: 0, s: 0, v: 100, a: alpha };
  return rgbToHsva(rgb.r, rgb.g, rgb.b, alpha);
}

export function hsvaToHex(hsva: HsvaColor): string {
  const { r, g, b } = hsvaToRgb(hsva);
  const hex = rgbToHex(r, g, b);
  if (hsva.a >= 100) return hex;
  return `${hex}${componentToHex((hsva.a / 100) * 255)}`;
}

export function hsvaToHsl({ h, s, v, a }: HsvaColor): { h: number; s: number; l: number; a: number } {
  const saturation = s / 100;
  const value = v / 100;
  const l = value * (1 - saturation / 2);
  const sl = l === 0 || l === 1 ? 0 : (value - l) / Math.min(l, 1 - l);
  return { h, s: sl * 100, l: l * 100, a };
}

export function hslToHsva(h: number, s: number, l: number, a = 100): HsvaColor {
  const saturation = s / 100;
  const lightness = l / 100;
  const value = lightness + saturation * Math.min(lightness, 1 - lightness);
  const sv = value === 0 ? 0 : 2 * (1 - lightness / value);
  return { h, s: sv * 100, v: value * 100, a };
}

export function getColorChannels(hsva: HsvaColor, format: ColorFormat): [string, string, string] {
  if (format === "hex") {
    return [hsvaToHex(hsva).replace("#", "").toUpperCase(), "", ""];
  }

  if (format === "rgb") {
    const { r, g, b } = hsvaToRgb(hsva);
    return [String(r), String(g), String(b)];
  }

  const { h, s, l } = hsvaToHsl(hsva);
  return [String(Math.round(h)), String(Math.round(s)), String(Math.round(l))];
}

export function parseColorChannels(
  channels: [string, string, string],
  format: ColorFormat,
  fallback: HsvaColor
): HsvaColor | null {
  if (format === "hex") {
    const hex = channels[0].trim();
    if (!hex) return null;
    const normalized = hex.startsWith("#") ? hex : `#${hex}`;
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(normalized)) return null;
    return hexToHsva(normalized);
  }

  if (format === "rgb") {
    const values = channels.map((channel) => Number(channel.trim()));
    if (values.some((value) => Number.isNaN(value))) return null;
    const [r, g, b] = values.map((value) => clamp(value, 0, 255));
    return rgbToHsva(r, g, b, fallback.a);
  }

  const values = channels.map((channel) => Number(channel.trim().replace("%", "")));
  if (values.some((value) => Number.isNaN(value))) return null;
  const [h, s, l] = values.map((value, index) => clamp(value, 0, index === 0 ? 360 : 100));
  return hslToHsva(h, s, l, fallback.a);
}

export function formatHsva(hsva: HsvaColor, format: ColorFormat): string {
  const [first, second, third] = getColorChannels(hsva, format);
  if (format === "hex") return first;
  if (format === "rgb") return `${first}, ${second}, ${third}`;
  return `${first}, ${second}%, ${third}%`;
}

export function parseColorInput(value: string, format: ColorFormat, fallback: HsvaColor): HsvaColor | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (format === "hex") {
    return parseColorChannels([trimmed, "", ""], format, fallback);
  }

  if (format === "rgb") {
    const match = trimmed.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/);
    if (!match) return null;
    return parseColorChannels([match[1], match[2], match[3]], format, fallback);
  }

  const match = trimmed.match(/^(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%$/);
  if (!match) return null;
  return parseColorChannels([match[1], match[2], match[3]], format, fallback);
}

export function getHueColor(hue: number): string {
  return `hsl(${hue}, 100%, 50%)`;
}

export function loadSavedColors(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_SAVED_COLORS];
  try {
    const stored = window.localStorage.getItem(SAVED_COLORS_STORAGE_KEY);
    if (!stored) return [...DEFAULT_SAVED_COLORS];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [...DEFAULT_SAVED_COLORS];
    return parsed.filter((color): color is string => typeof color === "string" && !!hexToRgb(color));
  } catch {
    return [...DEFAULT_SAVED_COLORS];
  }
}

export function persistSavedColors(colors: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_COLORS_STORAGE_KEY, JSON.stringify(colors));
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
