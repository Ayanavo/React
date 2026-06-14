import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import showToast from "@/hooks/toast";
import { usePersistedState } from "@/hooks/usePersistedState";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/shared/confirmation";
import { logoutAPI } from "@/shared/services/auth";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IconsComponent from "../../common/icons";
import { Skeleton } from "@/components/ui/skeleton";

type NavItem = { label: string; icon: string; route: string };
function menu({
  NavList,
  isExpanded,
  isLoadingPermissions = false,
}: {
  NavList: Array<NavItem>;
  isExpanded: boolean;
  setIsExpanded: Function;
  isLoadingPermissions?: boolean;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state } = usePersistedState<"left" | "right">("vite-ui-sidebar", "left");
  const { confirm } = useConfirmDialog();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobileMenu = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleNavigate = (route: string) => {
    navigate(route);
    closeMobileMenu();
  };

  const isRouteActive = (route: string) => {
    return pathname === route || pathname.startsWith(`${route}/`);
  };

  const handleConfirmation = async () => {
    confirm({
      message: "Are you sure you want to log out?",
      title: "Logout Confirmation",
    }).then((res: boolean) => {
      if (res) {
        logoutAPI()
          .then((res) => {
            showToast({
              title: res.message,
              variant: "success",
            });
            closeMobileMenu();
            navigate("/login");
          })
          .catch((error) => {
            showToast({
              title: error.message,
              variant: "error",
            });
          });
      }
    });
  };

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} variant="floating" side={state}>
      <SidebarHeader>
        <SidebarMenu className={cn(!isMobile && "items-end")}>
          <SidebarMenuItem>
            {isMobile ?
              <div className="flex w-full items-center justify-between gap-2 px-1 py-1">
                <SidebarGroupLabel className="px-0 text-sm font-semibold">Menu</SidebarGroupLabel>
                <SidebarTrigger className="hover:text-primary" />
              </div>
            : <div className="flex w-full justify-end p-2">
                <SidebarTrigger className="hover:text-primary" />
              </div>
            }
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {isLoadingPermissions ?
              Array.from({ length: 7 }).map((_, index) => (
                <SidebarMenuItem key={index}>
                  <div className="flex items-center gap-2 px-2 py-2">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    {(!isExpanded && !isMobile) ? null : <Skeleton className="h-4 flex-1 max-w-[120px]" />}
                  </div>
                </SidebarMenuItem>
              ))
            : NavList.map(({ label, icon, route }: NavItem) => {
                const isActive = isRouteActive(route);

                return (
                  <SidebarMenuItem key={route}>
                    <SidebarMenuButton
                      className={cn("text-secondary hover:text-primary", isActive && "text-primary")}
                      isActive={isActive}
                      tooltip={isMobile ? undefined : label}
                      onClick={() => handleNavigate(route)}>
                      <IconsComponent customClass="h-6 w-6" icon={icon} />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })
            }
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-secondary hover:text-primary" onClick={handleConfirmation}>
              <IconsComponent customClass="h-6 w-6" icon="LogOutIcon" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default menu;
