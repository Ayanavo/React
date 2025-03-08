import LoginComponent from "@/pages/auth/login/login";
import RegistrationComponent from "@/pages/auth/registration/registration";
import ActivityComponent from "@/pages/layout/activity/activity";
import DashboardComponent from "@/pages/layout/dashboard/dashboard";
import ProfileComponent from "@/pages/profile/profile";
import SettingsComponent from "@/pages/settings/settings";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/pages/layout/layout";
import DetailComponent from "@/pages/layout/logs/details/details";
import TableComponent from "@/pages/layout/logs/table/table";
import CreateComponent from "@/pages/layout/logs/update/create";
import UpdateComponent from "@/pages/layout/logs/update/update";
import NoteComponent from "@/pages/layout/notes/notes-layout";
import WhiteboardComponent from "@/pages/layout/whiteboard/whiteboard";
import NoPageComponent from "@/pages/nopage";
import ForgotPasswordComponent from "@/pages/auth/forgot-password/forgot-password";
import ProtectedRouteComponent from "./protectedRoute";

export const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginComponent />} />
      <Route path="/register" element={<RegistrationComponent />} />
      <Route path="/forgot-password" element={<ForgotPasswordComponent />} />
      <Route element={<ProtectedRouteComponent />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route caseSensitive path="/dashboard" element={<DashboardComponent />} />
          <Route caseSensitive path="table" element={<TableComponent />} />
          <Route caseSensitive path="activities" element={<ActivityComponent />} />
          <Route caseSensitive path="whiteboard" element={<WhiteboardComponent />} />
          <Route caseSensitive path="profile" element={<ProfileComponent />} />
          <Route caseSensitive path="notes" element={<NoteComponent />} />
          <Route caseSensitive path="settings" element={<SettingsComponent />} />
          <Route caseSensitive path="table/create" element={<CreateComponent />} />
          <Route caseSensitive path="table/details/:id" element={<DetailComponent />} />
          <Route caseSensitive path="table/update/:id" element={<UpdateComponent />} />
        </Route>
      </Route>
      <Route path="*" element={<NoPageComponent />} />
    </Routes>
  );
};
