import { ColorResult } from "react-color";

export const DEFAULT_PICKER_COLOR = "#ffffff";

export function colorResultToHex(color: ColorResult): string {
  return color.hex;
}
