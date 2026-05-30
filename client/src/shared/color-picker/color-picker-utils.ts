import { ColorResult } from "react-color";

export const DEFAULT_PICKER_COLOR = "#ffffff";

export const PRESET_PICKER_COLORS = ["#111827", "#4b5563", "#9ca3af", "#d1d5db", "#ffffff", "#7c3aed", "#a855f7", "#ef4444", "#fb923c", "#f59e0b", "#22c55e", "#14b8a6", "#06b6d4", "#2563eb"];

export function colorResultToHex(color: ColorResult): string {
  return color.hex;
}
