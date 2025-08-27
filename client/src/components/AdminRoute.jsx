import { Outlet, Navigate } from "react-router-dom";

export default function AdminRoute() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  return role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
