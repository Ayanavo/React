import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PanelLeftDashedIcon } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import IconsComponent from "../../common/icons";

function menu({ isExpanded, setIsExpanded }: { isExpanded: boolean; setIsExpanded: Function }) {
  type NavItem = { label: string; icon: string; route: string };
  const NavList: Array<NavItem> = [
    { label: "Dashboard", icon: "DashboardIcon", route: "/dashboard" },
    { label: "Logs", icon: "TableIcon", route: "/table" },
    { label: "Activities", icon: "CalendarIcon", route: "/activities" },
    { label: "Profile", icon: "AvatarIcon", route: "/profile" },
    { label: "Settings", icon: "GearIcon", route: "/settings" },
  ];

  return (
    <div className={cn("fixed left-0 top-0 h-full bg-gray-100 transition-all duration-300 ease-in-out z-10", isExpanded ? "w-40" : "w-16")}>
      <Button variant="ghost" size="icon" className="absolute top-4 left-2" onClick={() => setIsExpanded(!isExpanded)}>
        <PanelLeftDashedIcon strokeWidth={1.25} className="h-6 w-6" />
      </Button>

      <nav className="mt-16 flex flex-col space-y-2 p-2">
        {NavList.map(({ label, icon: icon, route }, i: number) => (
          <TooltipProvider disableHoverableContent key={i}>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  className={cn("group flex items-center rounded-lg p-2 text-gray-700  hover:bg-gray-200 hover:text-black", isExpanded ? "space-x-5" : "justify-center h-10 w-10")}
                  to={route}
                  state={label}>
                  <IconsComponent customClass="h-5 w-5 hover:text-black" icon={icon} />
                  <span className={cn("font-semibold", isExpanded ? "opacity-100 transition-opacity duration-300" : "opacity-0 w-0")}>{label}</span>
                </NavLink>
              </TooltipTrigger>
              {!isExpanded && (
                <TooltipContent side="right">
                  <p>{label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>
      <nav className="absolute bottom-4 left-0 right-0 mt-16 flex flex-col space-y-2 px-2">
        <TooltipProvider disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                className={cn("group flex items-center rounded-lg p-2 text-gray-700 hover:bg-gray-200 hover:text-black", isExpanded ? "space-x-5" : "justify-center h-10 w-10")}
                to="/login">
                <IconsComponent customClass="h-5 w-5 hover:text-black" icon="ExitIcon" />
                <span className={cn("font-semibold", isExpanded ? "opacity-100 transition-opacity duration-300" : "opacity-0 w-0")}>Sign Out</span>
              </NavLink>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent side="right">
                <p>Logout</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </nav>
    </div>
  );
}

export default menu;
