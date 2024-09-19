import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import React from "react";
import { Link } from "react-router-dom";
import IconsComponent from "../../common/icons";

function menu({ isExpanded, setIsExpanded }: { isExpanded: boolean; setIsExpanded: Function }) {
  type NavItem = { label: string; icon: string; route: string };
  const NavList: Array<NavItem> = [
    { label: "Dashboard", icon: "DashboardIcon", route: "/" },
    { label: "Log", icon: "TableIcon", route: "/table" },
    { label: "Activity", icon: "CalendarIcon", route: "/activities" },
    { label: "Profile", icon: "AvatarIcon", route: "/profile" },
  ];

  return (
    <div className={cn("fixed left-0 top-0 h-full bg-gray-100 transition-all duration-300 ease-in-out z-10", isExpanded ? "w-64" : "w-16")}>
      <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setIsExpanded(!isExpanded)}>
        <HamburgerMenuIcon className="h-6 w-6" />
      </Button>

      <nav className="mt-16 flex flex-col space-y-2 p-2">
        {NavList.map(({ label, icon: icon, route }, i: number) => (
          <Link
            key={i}
            to={route}
            className={cn(
              "group flex items-center rounded-lg px-3 py-2 text-gray-700  hover:bg-black hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            )}>
            <IconsComponent icon={icon} color={"currentColor"} />
            <span className={cn("ml-3 text-sm font-medium", isExpanded ? "opacity-100 transition-opacity duration-300" : "opacity-0 w-0")}>{label}</span>
          </Link>
        ))}
      </nav>
      <nav className="absolute bottom-4 left-0 right-0 mt-16 flex flex-col space-y-2 p-2">
        <Link
          className={cn(
            "group flex items-center rounded-lg px-3 py-2 text-gray-700  hover:bg-black hover:text-white",
            "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          )}
          to="/login">
          <IconsComponent icon={"ExitIcon"} color={"currentColor"} />
          <span className={cn("ml-3 text-sm font-medium", isExpanded ? "opacity-100 transition-opacity duration-300" : "opacity-0 w-0")}>Sign Out</span>
        </Link>
      </nav>
    </div>
  );
}

export default menu;
