import faviconUrl from "@/assets/favicon.svg?url";
import { cn } from "@/lib/utils";
import React from "react";

type AppLogoProps = {
  className?: string;
};

export function AppLogo({ className }: AppLogoProps) {
  return (
    <img
      src={faviconUrl}
      alt=""
      className={cn("block h-full w-full object-contain", className)}
      aria-hidden="true"
    />
  );
}
