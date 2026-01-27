import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hook";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, accessToken, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  if (!user || !accessToken || !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }


  //ts
  return children;
}
