import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { fontWeight } from "./useCV";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fontWeightMap: Record<fontWeight, number> = {
  light: 300,
  normal: 400,
  medium: 500,
  "semi-bold": 600,
  bold: 700,
};
