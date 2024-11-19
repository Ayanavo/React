import { cn } from "@/lib/utils";
import * as RadixIcons from "@radix-ui/react-icons";
import React from "react";

function icons({ icon, customClass }: { icon: string; customClass?: string }) {
  const IconComponent = RadixIcons[icon as keyof typeof RadixIcons] as React.ElementType;

  // Return a fallback if the icon doesn't exist
  if (!IconComponent) {
    return <RadixIcons.Cross1Icon />;
  }

  return <IconComponent className={cn("transition-colors duration-300", customClass)} />;
}

export default icons;
