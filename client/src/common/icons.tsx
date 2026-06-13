import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";
import React from "react";

function icons({
  icon,
  customClass,
  style,
  size,
}: {
  icon: string;
  customClass?: string;
  style?: React.CSSProperties;
  size?: number;
}) {
  const IconComponent = Lucide[icon as keyof typeof Lucide] as React.ElementType;

  // Return a fallback if the icon doesn't exist
  if (!IconComponent) {
    return <Lucide.XIcon />;
  }

  return <IconComponent className={cn(customClass)} style={style} size={size} />;
}

export default icons;
