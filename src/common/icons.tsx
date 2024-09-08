import React from "react";
import * as RadixIcons from "@radix-ui/react-icons";

function icons({ icon, color }: { icon: string; color: string }) {
  const IconComponent = RadixIcons[icon as keyof typeof RadixIcons] as React.ElementType;

  // Return a fallback if the icon doesn't exist
  if (!IconComponent) {
    return <RadixIcons.Cross1Icon />;
  }

  return (
    <div className="flex gap-2" style={{ color: color ?? "000000" }}>
      <IconComponent />
    </div>
  );
}

export default icons;
