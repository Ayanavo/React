import { useCallback, useEffect, useState } from "react";
import { ColorResult } from "react-color";
import { colorResultToHex } from "./color-picker-utils";

export function useColorPicker(initialColor?: string) {
  const [color, setColor] = useState<string | undefined>(initialColor || undefined);

  useEffect(() => {
    setColor(initialColor || undefined);
  }, [initialColor]);

  const onColorResultChange = useCallback((result: ColorResult) => {
    setColor(colorResultToHex(result));
  }, []);

  const onHexChange = useCallback((hex?: string) => {
    setColor(hex || undefined);
  }, []);

  return {
    color,
    setColor,
    onColorResultChange,
    onHexChange,
  };
}
