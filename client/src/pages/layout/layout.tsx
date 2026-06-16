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
  const { permissions, isLoading } = usePermissions();

  const filteredNavList = useMemo(() => {
    return NavList.filter((item) => (permissions ?? []).includes(item.route));
  }, [permissions]);

  return (
    <SidebarProvider
      defaultOpen={false}
      className="app-layout-shell h-svh overflow-hidden [&_.app-sidebar-panel]:overflow-visible">
      <MenuComponent
        NavList={filteredNavList}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isLoadingPermissions={isLoading}
      />

      <SidebarInset className="app-layout-shell__main min-h-0 flex-1 overflow-hidden">
        <HeaderComponent NavList={filteredNavList} exclutionList={exclutionList} />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
          <Toaster />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
