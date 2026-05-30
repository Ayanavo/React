import { useCallback, useEffect, useState } from "react";
import { ColorResult } from "react-color";
import { DEFAULT_PICKER_COLOR, colorResultToHex } from "./color-picker-utils";

export function useColorPicker(initialColor?: string) {
  const [color, setColor] = useState(initialColor || DEFAULT_PICKER_COLOR);

  useEffect(() => {
    setColor(initialColor || DEFAULT_PICKER_COLOR);
  }, [initialColor]);

  const onColorResultChange = useCallback((result: ColorResult) => {
    setColor(colorResultToHex(result));
  }, []);

  const onHexChange = useCallback((hex?: string) => {
    setColor(hex || DEFAULT_PICKER_COLOR);
  }, []);

  return {
    color,
    setColor,
    onColorResultChange,
    onHexChange,
  };
}
