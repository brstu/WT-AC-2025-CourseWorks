import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div style={{ padding: 24 }}>Загрузка сессии...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Загрузка...</div>;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
