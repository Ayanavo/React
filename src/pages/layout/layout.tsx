import React from "react";
import { Outlet } from "react-router-dom";
import MenuComponent from "../menu/menu";
export const Layout = () => {
  return (
    <div className="flex">
      <MenuComponent />
      <div className="p-7 text-2xl font-semibold h-screen">
        <Outlet />
      </div>
    </div>
  );
};
