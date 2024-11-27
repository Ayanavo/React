import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React from "react";
import { useNavigate } from "react-router-dom";

import IconsComponent from "../../common/icons";
type NavItem = { label: string; icon: string; route: string };
function menu({ NavList, isExpanded }: { NavList: Array<NavItem>; isExpanded: boolean; setIsExpanded: Function }) {
  const navigate = useNavigate();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center justify-center">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NavList.map(({ label, icon, route }: NavItem) => (
              <TooltipProvider disableHoverableContent key={route}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => navigate(route)}>
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
                  <SidebarMenuButton onClick={() => navigate("/login")}>
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
      <SidebarRail />
    </Sidebar>
  );
}

export default menu;
