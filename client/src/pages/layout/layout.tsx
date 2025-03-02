import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderComponent from "./header/header";
import MenuComponent from "../menu/menu";

export const Layout = () => {
  type NavItem = { label: string; icon: string; route: string };
  const NavList: Array<NavItem> = [
    { label: "Dashboard", icon: "LayoutDashboardIcon", route: "/dashboard" },
    { label: "Logs", icon: "TableIcon", route: "/table" },
    { label: "Activities", icon: "CalendarDaysIcon", route: "/activities" },
    {
      label: "Notes",
      icon: "NotebookPenIcon",
      route: "/notes",
    },
    {
      label: "Whiteboard",
      icon: "WorkflowIcon",
      route: "/whiteboard",
    },
    { label: "Profile", icon: "UserIcon", route: "/profile" },
    { label: "Settings", icon: "SettingsIcon", route: "/settings" },
  ];
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <SidebarProvider defaultOpen={false}>
      <MenuComponent NavList={NavList} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <SidebarInset>
        <HeaderComponent NavList={NavList} />
        <main>
          <Outlet />
          <Toaster />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
