import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import MenuComponent from "../menu/menu";
import HeaderComponent from "../layout/header";

export const Layout = () => {
  type NavItem = { label: string; icon: string; route: string };
  const NavList: Array<NavItem> = [
    { label: "Dashboard", icon: "DashboardIcon", route: "/dashboard" },
    { label: "Logs", icon: "TableIcon", route: "/table" },
    { label: "Activities", icon: "CalendarIcon", route: "/activities" },
    { label: "Profile", icon: "AvatarIcon", route: "/profile" },
    { label: "Settings", icon: "GearIcon", route: "/settings" },
  ];
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="flex min-h-screen">
      <MenuComponent NavList={NavList} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div className={cn("flex-1 overflow-hidden transition-all duration-300 ease-in-out", isExpanded ? "ml-40" : "ml-16")}>
        <HeaderComponent NavList={NavList} />
        <main className="h-full w-full">
          <Outlet />
          <Toaster />
        </main>
      </div>
    </div>
  );
};
