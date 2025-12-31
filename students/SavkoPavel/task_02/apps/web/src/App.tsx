import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/AuthProvider";
import { IncidentsPage } from "./pages/IncidentsPage";
import { IncidentDetailsPage } from "./pages/IncidentDetailsPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminQueueIncidentsPage } from "./pages/AdminQueueIncidentsPage";
import { MyQueuesPage } from "./pages/MyQueuesPage";
import { QueueIncidentsPage } from "./pages/QueueIncidentsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { QueuesPage } from "./pages/QueuesPage";
import { SlaPage } from "./pages/SlaPage";
import { UsersPage } from "./pages/UsersPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  if (!auth.token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/incidents"
        element={
          <RequireAuth>
            <IncidentsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/incidents/:id"
        element={
          <RequireAuth>
            <IncidentDetailsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/queues"
        element={
          <RequireAuth>
            <QueuesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/queues/:queueId/incidents"
        element={
          <RequireAuth>
            <AdminQueueIncidentsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/me"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/my-queues"
        element={
          <RequireAuth>
            <MyQueuesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/my-queues/:queueId/incidents"
        element={
          <RequireAuth>
            <QueueIncidentsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/users"
        element={
          <RequireAuth>
            <UsersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/sla"
        element={
          <RequireAuth>
            <SlaPage />
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/incidents" replace />} />
      <Route path="*" element={<Navigate to="/incidents" replace />} />
    </Routes>
  );
}
