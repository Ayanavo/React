import React from "react";
import { ColorResult, SketchPicker } from "react-color";
import { DEFAULT_PICKER_COLOR, colorResultToHex } from "./color-picker-utils";

export type ColorPickerPanelProps = {
  color?: string;
  onChange: (hex: string) => void;
  onChangeComplete?: (hex: string) => void;
};

export function ColorPickerPanel({ color, onChange, onChangeComplete }: ColorPickerPanelProps) {
  const handleChange = (result: ColorResult) => {
    const hex = colorResultToHex(result);
    onChange(hex);
  };

  const handleChangeComplete = (result: ColorResult) => {
    const hex = colorResultToHex(result);
    onChangeComplete?.(hex);
  };

  return <SketchPicker color={color || DEFAULT_PICKER_COLOR} onChange={handleChange} onChangeComplete={onChangeComplete ? handleChangeComplete : undefined} />;
}
