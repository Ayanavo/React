import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";
import React from "react";

function icons({ icon, customClass }: { icon: string; customClass?: string }) {
  const IconComponent = Lucide[icon as keyof typeof Lucide] as React.ElementType;

  // Return a fallback if the icon doesn't exist
  if (!IconComponent) {
    return <Lucide.XIcon />;
  }

  return <IconComponent className={cn(customClass)} />;
}

export default icons;
