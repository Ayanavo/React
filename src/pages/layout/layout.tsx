import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderComponent from "../layout/header";
import MenuComponent from "../menu/menu";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Layout = () => {
  type NavItem = { label: string; icon: string; route: string };
  const NavList: Array<NavItem> = [
    { label: "Dashboard", icon: "LayoutDashboardIcon", route: "/dashboard" },
    { label: "Logs", icon: "TableIcon", route: "/table" },
    { label: "Activities", icon: "CalendarDaysIcon", route: "/activities" },
    { label: "Profile", icon: "UserIcon", route: "/profile" },
    { label: "Settings", icon: "SettingsIcon", route: "/settings" },
  ];
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <SidebarProvider>
      <MenuComponent NavList={NavList} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div className={cn("flex-1 overflow-hidden transition-all duration-300 ease-in-out")}>
        <HeaderComponent NavList={NavList} />
        <main className="h-full w-full">
          <Outlet />
          <Toaster />
        </main>
      </div>
    </SidebarProvider>
  );
};
