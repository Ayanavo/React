import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import IconsComponent from "../../common/icons";

function closeDrawer(): void {
  console.log("clicked");
}
function menu() {
  type NavItem = { label: string; icon: string; route: string };
  const NavList: Array<NavItem> = [
    { label: "Dasboard", icon: "DashboardIcon", route: "/" },
    { label: "Table", icon: "TableIcon", route: "/table" },
  ];
  return (
    <div className="pointer-events-auto relative w-fit max-w-md">
      <div className="absolute cursor-pointer rounded-full -right-3 top-4 z-10 border-2 p-1 " style={{ backgroundColor: "#BAA7FF" }} onClick={closeDrawer}>
        <ArrowLeftIcon />
      </div>
      <div className="mt-6 flex flex-1 flex-col justify-between">
        {NavList.map(({ route, icon, label }) => {
          return (
            <Link to={route}>
              <a className="flex transform items-center rounded-lg mx-4 px-3 py-2 text-white-600 transition-colors duration-300 hover:bg-violet-400 hover:text-gray-700 " href="#">
                <IconsComponent icon={icon} color={"#EEEEEE"} />
                <span className="mx-2 text-sm font-medium" style={{ color: "#EEEEEE" }}>
                  {label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default menu;
