import React from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { usePermissions, useHasAuthToken } from "@/shared/context/PermissionsContext";
import { isAuthenticated } from "@/shared/utils/auth-token";
import { LoaderCircleIcon } from "lucide-react";
import ForgotPasswordComponent from "@/pages/auth/forgot-password/forgot-password";
import LoginComponent from "@/pages/auth/login/login";
import RegistrationComponent from "@/pages/auth/registration/registration";
import TermsAndConditionsComponent from "@/pages/layout/terms/terms";
import CVAccessGrid from "@/pages/cv-builder/cv-access-grid";
import CVBuilder from "@/pages/cv-builder/cv-builder";
import CoverLetterAccessGrid from "@/pages/cover-letter/cover-letter-access-grid";
import CoverLetterBuilder from "@/pages/cover-letter/cover-letter-builder";
import ActivityComponent from "@/pages/layout/activity/activity";
import DashboardComponent from "@/pages/layout/dashboard/dashboard";
import { Layout } from "@/pages/layout/layout";
import NoteComponent from "@/pages/layout/notes/notes-layout";
import TagsLayoutComponent from "@/pages/layout/tags/tags-layout";
import TagsCreateComponent from "@/pages/layout/tags/tags-create";
import TagsUpdateComponent from "@/pages/layout/tags/tags-update";
import WhiteboardComponent from "@/pages/layout/whiteboard/whiteboard";
import SummarizeComponent from "@/pages/layout/summarize/summarize";
import MasterAccessComponent from "@/pages/master-access/master-access";
import NoPageComponent from "@/pages/nopage";
import ProfileComponent from "@/pages/profile/profile";
import SettingsComponent from "@/pages/settings/settings";
export type RouteConfig = {
  path?: string;
  element?: React.ReactNode;
  children?: RouteConfig[];
  index?: boolean;
};

const AppLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-transparent">
    <LoaderCircleIcon className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
  </div>
);

const GuestOnly = ({ children }: { children: React.ReactNode }) => {
  const hasToken = useHasAuthToken();
  if (hasToken) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isInitialized } = usePermissions();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isInitialized || isLoading) {
    return <AppLoader />;
  }

  return <>{children}</>;
};

/** Static routes - Always available regardless of permissions */

const STATIC_ROUTES: RouteConfig[] = [
  {
    path: "/login",
    element: (
      <GuestOnly>
        <LoginComponent />
      </GuestOnly>
    ),
  },

  {
    path: "/register",
    element: (
      <GuestOnly>
        <RegistrationComponent />
      </GuestOnly>
    ),
  },

  {
    path: "/forgot-password",
    element: (
      <GuestOnly>
        <ForgotPasswordComponent />
      </GuestOnly>
    ),
  },

];

/** Protected layout routes */

const PROTECTED_LAYOUT_ROUTES: RouteConfig[] = [
  { index: true, element: <Navigate to="/dashboard" replace /> },
  { path: "dashboard", element: <DashboardComponent /> },
  { path: "profile", element: <ProfileComponent /> },
  { path: "settings", element: <SettingsComponent /> },
  { path: "terms", element: <TermsAndConditionsComponent /> },
];

/** Dynamic routes - permission based */

const DYNAMIC_ROUTES: RouteConfig[] = [
  { path: "master-access", element: <MasterAccessComponent /> },
  { path: "activities", element: <ActivityComponent /> },
  { path: "cv-builder", element: <CVAccessGrid /> },
  { path: "cv-builder/create", element: <CVBuilder /> },
  { path: "cv-builder/:id", element: <CVBuilder /> },
  { path: "cover-letter", element: <CoverLetterAccessGrid /> },
  { path: "cover-letter/create", element: <CoverLetterBuilder /> },
  { path: "cover-letter/:id", element: <CoverLetterBuilder /> },
  { path: "whiteboard", element: <WhiteboardComponent /> },
  { path: "notes", element: <NoteComponent /> },
  { path: "tags", element: <TagsLayoutComponent /> },
  { path: "tags/create", element: <TagsCreateComponent /> },
  { path: "tags/update/:id", element: <TagsUpdateComponent /> },
  { path: "summarize", element: <SummarizeComponent /> },
];

const filterRoutesByPermissions = (permissions: string[]): RouteConfig[] => {
  return DYNAMIC_ROUTES.filter((route) => {
    if (!route.path) return false;

    const base = `/${route.path}`.split("/")[1];

    return permissions.some((perm) => perm === `/${base}` || perm.startsWith(`/${base}`));
  });
};

const getRouteConfiguration = (permissions: string[]): RouteConfig[] => {
  const permittedDynamicRoutes = filterRoutesByPermissions(permissions);

  return [
    ...STATIC_ROUTES,

    {
      path: "/",

      element: (
        <RequireAuth>
          <Layout />
        </RequireAuth>
      ),

      children: [...PROTECTED_LAYOUT_ROUTES, ...permittedDynamicRoutes, { path: "*", element: <NoPageComponent /> }],
    },
  ];
};

export const Router = () => {
  const { permissions } = usePermissions();
  const routeConfiguration = getRouteConfiguration(permissions);
  return useRoutes(routeConfiguration as any);
};
