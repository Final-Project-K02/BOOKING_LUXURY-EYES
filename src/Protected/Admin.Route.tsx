import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface User {
  role?: "admin" | "user";
}

export default function AdminRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("accessToken");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/auth/login" replace />;
  }

  const user: User = JSON.parse(userStr);

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
