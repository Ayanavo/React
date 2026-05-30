import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import MenuComponent from "../menu/menu";
import HeaderComponent from "./header/header";
import { NavList, NavExclusionList } from "@/config/nav";

export const Layout = () => {
  // NavList and exclusion config moved to shared config/nav.ts
  const exclutionList = NavExclusionList;
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <SidebarProvider defaultOpen={false}>
      <MenuComponent NavList={NavList} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <SidebarInset>
        <HeaderComponent NavList={NavList} exclutionList={exclutionList} />
        <main>
          <Outlet />
          <Toaster />
          {/* <ChatbotWidget /> */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
