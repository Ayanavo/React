import React from "react";
import { Outlet } from "react-router-dom";
import MenuComponent from "../menu/menu";
export const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      <MenuComponent />
      <div className="flex-grow p-4 md:p-7 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
