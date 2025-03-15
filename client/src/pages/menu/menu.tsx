import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { usePersistedState } from "@/hooks/usePersistedState";
import { cn } from "@/lib/utils";
import { useConfirmationDialog } from "@/shared/confirmation";
import { logoutAPI } from "@/shared/services/auth";
import React from "react";
import { useNavigate } from "react-router-dom";
import IconsComponent from "../../common/icons";

type NavItem = { label: string; icon: string; route: string };
function menu({ NavList, isExpanded }: { NavList: Array<NavItem>; isExpanded: boolean; setIsExpanded: Function }) {
  const navigate = useNavigate();
  const { state } = usePersistedState<"left" | "right">("vite-ui-sidebar", "left");
  const { openDialog, ConfirmationDialog } = useConfirmationDialog();

  const handleConfirmation = async () => {
    openDialog("Are you sure you want to log out?").then((res: boolean) => {
      if (res) {
        logoutAPI()
          .then((res) => {
            showToast({
              title: res.message,
              variant: "success",
            });
            sessionStorage.removeItem("auth_token");
            // openCloseCallback(false);
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
    <>
      {ConfirmationDialog}
      <Sidebar collapsible="icon" variant="floating" side={state}>
        <SidebarHeader>
          <SidebarMenu className="items-end">
            <SidebarMenuItem>
              <div className="text-secondary hover:text-secondary peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0">
                <SidebarTrigger className="hover:text-primary" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {NavList.map(({ label, icon, route }: NavItem) => (
                <TooltipProvider disableHoverableContent key={route}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="text-secondary hover:text-primary" onClick={() => navigate(route)}>
                          <IconsComponent customClass="h-6 w-6" icon={icon} />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </TooltipTrigger>
                    <TooltipContent className={cn(!isExpanded && "sr-only")} side="right">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <TooltipProvider disableHoverableContent>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-secondary hover:text-primary" onClick={handleConfirmation}>
                      <IconsComponent customClass="h-6 w-6" icon="LogOutIcon" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </TooltipTrigger>
                <TooltipContent className={cn(!isExpanded && "sr-only")} side="right">
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

export default menu;
