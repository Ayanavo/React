import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function protectedRoute() {
  const isLoggedIn = !!localStorage.getItem("user");
  return isLoggedIn ? <Outlet /> : <Navigate to={"/login"} />;
}

export default protectedRoute;
