import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import MenuComponent from "../menu/menu";
import { cn } from "@/lib/utils";

export const Layout = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      <MenuComponent isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div className={cn("transition-all duration-300 ease-in-out", isExpanded ? "ml-64" : "ml-16")}>
        <div className="flex-grow p-4 md:p-7 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
