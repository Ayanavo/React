import { useCallback, useEffect, useState } from "react";

export function useColorPicker(initialColor?: string) {
  const [color, setColor] = useState<string | undefined>(initialColor || undefined);

  useEffect(() => {
    setColor(initialColor || undefined);
  }, [initialColor]);

  const onHexChange = useCallback((hex?: string) => {
    setColor(hex || undefined);
  }, []);

  return {
    color,
    setColor,
    onHexChange,
  };
}
