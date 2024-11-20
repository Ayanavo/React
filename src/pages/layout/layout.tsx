import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import MenuComponent from "../menu/menu";

export const Layout = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="flex min-h-screen overflow-hidden">
      <MenuComponent isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div className={cn("flex-1 overflow-auto transition-all duration-300 ease-in-out", isExpanded ? "ml-40" : "ml-16")}>
        <main className="h-full w-full">
          <Outlet />
          <Toaster />
        </main>
      </div>
    </div>
  );
};
