import { cn } from "@/lib/utils";
import * as RadixIcons from "@radix-ui/react-icons";
import React from "react";

function icons({ icon, color, customClass }: { icon: string; color: string; customClass?: string }) {
  const IconComponent = RadixIcons[icon as keyof typeof RadixIcons] as React.ElementType;

  // Return a fallback if the icon doesn't exist
  if (!IconComponent) {
    return <RadixIcons.Cross1Icon />;
  }

  return (
    <div className={cn("flex gap-2", customClass)}>
      <IconComponent className="transition-colors duration-300 group-hover:text-white" style={{ color }} />
    </div>
  );
}

export default icons;
