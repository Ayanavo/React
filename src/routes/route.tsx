import React from "react";
import { Route, Routes } from "react-router-dom";
import DetailComponent from "../pages/layout/details/details";
import { Layout } from "../pages/layout/layout";
import TableComponent from "../pages/layout/table/table";
import NoPageComponent from "../pages/nopage";
import LoginComponent from "@/pages/auth/login/login";
import DashboardComponent from "@/pages/dashboard/dashboard";
import ActivityComponent from "@/pages/activity/activity";
import ProfileComponent from "@/pages/profile/profile";

export const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginComponent />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardComponent />} />
        <Route path="table" element={<TableComponent />} />
        <Route path="activities" element={<ActivityComponent />} />
        <Route path="profile" element={<ProfileComponent />} />
        <Route path="details/:id" element={<DetailComponent />} />
      </Route>
      <Route path="*" element={<NoPageComponent />} />
    </Routes>
  );
};
