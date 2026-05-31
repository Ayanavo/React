import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { NavExclusionList, NavList } from "@/config/nav";
import { usePermissions } from "@/shared/context/PermissionsContext";
import React, { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import MenuComponent from "../menu/menu";
import HeaderComponent from "./header/header";

export const Layout = () => {
  const exclutionList = NavExclusionList;
  const [isExpanded, setIsExpanded] = useState(false);
  const { isInitialized, permissions } = usePermissions();

  const filteredNavList = useMemo(() => {
    return NavList.filter((item) => (permissions ?? []).includes(item.route));
  }, [permissions]);

  return (
    <SidebarProvider defaultOpen={false}>
      <MenuComponent
        NavList={filteredNavList}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isInitialized={isInitialized}
      />

      <SidebarInset>
        <HeaderComponent
          NavList={filteredNavList}
          exclutionList={exclutionList}
        />
        <main>
          <Outlet />
          <Toaster />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};