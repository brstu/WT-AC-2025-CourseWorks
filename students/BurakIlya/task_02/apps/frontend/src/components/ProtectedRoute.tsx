import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute() {
  const { user, initializing } = useAuth();
  if (initializing) return <div style={{ padding: 24 }}>Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
