import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function protectedRoute() {
  const isLoggedIn = !!localStorage.getItem("auth_token");
  return isLoggedIn ? <Outlet /> : <Navigate to={"/login"} />;
}

export default protectedRoute;
