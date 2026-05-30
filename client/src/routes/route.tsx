import ForgotPasswordComponent from "@/pages/auth/forgot-password/forgot-password";
import LoginComponent from "@/pages/auth/login/login";
import RegistrationComponent from "@/pages/auth/registration/registration";
import CVAccessGrid from "@/pages/cv-builder/cv-access-grid";
import CVBuilder from "@/pages/cv-builder/cv-builder";
import ActivityComponent from "@/pages/layout/activity/activity";
import DashboardComponent from "@/pages/layout/dashboard/dashboard";
import DetailComponent from "@/pages/layout/grid/details/details";
import CreateComponent from "@/pages/layout/grid/update/create";
import UpdateComponent from "@/pages/layout/grid/update/update";
import { Layout } from "@/pages/layout/layout";
import NoteComponent from "@/pages/layout/notes/notes-layout";
import TagsLayoutComponent from "@/pages/layout/tags/tags-layout";
import TagsCreateComponent from "@/pages/layout/tags/tags-create";
import TagsUpdateComponent from "@/pages/layout/tags/tags-update";
import WhiteboardComponent from "@/pages/layout/whiteboard/whiteboard";
import MasterAccessComponent from "@/pages/master-access/master-access";
import NoPageComponent from "@/pages/nopage";
import ProfileComponent from "@/pages/profile/profile";
import SettingsComponent from "@/pages/settings/settings";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

export const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginComponent />} />
      <Route path="/register" element={<RegistrationComponent />} />
      <Route path="/forgot-password" element={<ForgotPasswordComponent />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route caseSensitive path="/dashboard" element={<DashboardComponent />} />
        {/* <Route caseSensitive path="table" element={<TableComponent />} /> */}
        <Route caseSensitive path="activities" element={<ActivityComponent />} />
        <Route caseSensitive path="cv-builder" element={<CVAccessGrid />} />
        <Route caseSensitive path="cv-builder/create" element={<CVBuilder />} />
        <Route caseSensitive path="cv-builder/:id" element={<CVBuilder />} />
        <Route caseSensitive path="whiteboard" element={<WhiteboardComponent />} />
        <Route caseSensitive path="profile" element={<ProfileComponent />} />
        <Route caseSensitive path="notes" element={<NoteComponent />} />
        <Route caseSensitive path="tags" element={<TagsLayoutComponent />} />
        <Route caseSensitive path="tags/create" element={<TagsCreateComponent />} />
        <Route caseSensitive path="tags/update/:id" element={<TagsUpdateComponent />} />
        <Route caseSensitive path="settings" element={<SettingsComponent />} />
        <Route caseSensitive path="master-access" element={<MasterAccessComponent />} />
        <Route caseSensitive path="table/create" element={<CreateComponent />} />
        <Route caseSensitive path="table/details/:id" element={<DetailComponent />} />
        <Route caseSensitive path="table/update/:id" element={<UpdateComponent />} />
      </Route>
      <Route path="*" element={<NoPageComponent />} />
    </Routes>
  );
};
