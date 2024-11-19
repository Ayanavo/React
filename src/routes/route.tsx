import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DetailComponent from "../pages/layout/details/details";
import { Layout } from "../pages/layout/layout";
import TableComponent from "../pages/layout/table/table";
import NoPageComponent from "../pages/nopage";
import LoginComponent from "@/pages/auth/login/login";
import DashboardComponent from "@/pages/dashboard/dashboard";
import ActivityComponent from "@/pages/activity/activity";
import ProfileComponent from "@/pages/profile/profile";
import SettingsComponent from "@/pages/settings/settings";
import UpdateComponent from "../pages/layout/update/update";
import CreateComponent from "../pages/layout/update/create";

export const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginComponent />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route caseSensitive path="/dashboard" element={<DashboardComponent />} />
        <Route caseSensitive path="table" element={<TableComponent />} />
        <Route caseSensitive path="activities" element={<ActivityComponent />} />
        <Route caseSensitive path="profile" element={<ProfileComponent />} />
        <Route caseSensitive path="settings" element={<SettingsComponent />} />
        <Route caseSensitive path="create" element={<CreateComponent />} />
        <Route caseSensitive path="details/:id" element={<DetailComponent />} />
        <Route caseSensitive path="update/:id" element={<UpdateComponent />} />
      </Route>
      <Route path="*" element={<NoPageComponent />} />
    </Routes>
  );
};
