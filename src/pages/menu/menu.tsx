import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, ExitIcon } from "@radix-ui/react-icons";
import IconsComponent from "../../common/icons";

function closeDrawer(): void {
  console.log("clicked");
}
function menu() {
  type NavItem = { label: string; icon: string; route: string };
  const NavList: Array<NavItem> = [
    { label: "Dasboard", icon: "DashboardIcon", route: "/" },
    { label: "Log", icon: "TableIcon", route: "/table" },
    { label: "Activity", icon: "CalendarIcon", route: "/activities" },
    { label: "Profile", icon: "AvatarIcon", route: "/profile" },
  ];
  return (
    <div className="{`w-96 bg-violet-900 ` }">
      <div className="pointer-events-auto relative w-fit max-w-md">
        <div className="absolute cursor-pointer rounded-full -right-3 top-4 z-10 border-2 p-1 bg-[#BAA7FF]" onClick={closeDrawer}>
          <ArrowLeftIcon />
        </div>
        <div className="mt-6 flex flex-col justify-between h-screen">
          <div>
            {NavList.map(({ route, icon, label }, i: number) => {
              return (
                <Link
                  key={i}
                  to={route}
                  className="flex transform items-center rounded-lg mx-4 px-3 py-2 text-white-600 transition-colors duration-300 hover:bg-violet-400 hover:text-gray-700 ">
                  <IconsComponent icon={icon} color={"#EEEEEE"} />
                  <span className="mx-2 text-sm font-medium text-[#EEEEEE]">{label}</span>
                </Link>
              );
            })}
          </div>
          <Link
            className="flex transform items-center rounded-lg mx-4 px-3 py-2 text-white-600 transition-colors duration-300 hover:bg-violet-400 hover:text-gray-700 "
            to="/login">
            <div className="flex gap-2">
              <ExitIcon className="text-[#EEEEEE]" />
            </div>
            <span className="mx-2 text-sm font-medium  text-[#EEEEEE]">Sign Out</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default menu;
