import React from "react";
import { Route, Routes } from "react-router-dom";
import DetailComponent from "../pages/layout/details/details";
import { Layout } from "../pages/layout/layout";
import TableComponent from "../pages/layout/table/table";
import MenuComponent from "../pages/menu/menu";
import NoPageComponent from "../pages/nopage";
import DashboardComponent from "@/pages/dashboard/dashboard";

export const Router = () => {
  return (
    <div className="flex">
      <div className="{`w-96 h-screen bg-violet-900 ` }">
        <MenuComponent />
      </div>
      <div className="p-7 text-2xl font-semibold h-screen">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardComponent />} />
            <Route path="table" element={<TableComponent />} />
            <Route path="details" element={<DetailComponent />} />
          </Route>

          <Route path="*" element={<NoPageComponent />} />
        </Routes>
      </div>
    </div>
  );
};
