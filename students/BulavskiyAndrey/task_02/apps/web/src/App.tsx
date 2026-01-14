import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage, RegisterPage } from "./pages";
import { Announcements } from "./components/Announcements";
import { Events } from "./components/Events";
import { Polls } from "./components/Polls";
import { Files } from "./components/Files";
import { Chats } from "./components/Chats";

const GROUP_ID = "demo-group-id"; // Используйте ID группы из seed данных

function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <header>
        <h1>Органайзер группы — Вариант 33</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p>Добро пожаловать, {user?.name || user?.email}!</p>
          <button onClick={logout} style={{ padding: "8px 16px" }}>
            Выйти
          </button>
        </div>
      </header>
      <main>
        <Announcements groupId={GROUP_ID} />
        <Files groupId={GROUP_ID} />
        <Events groupId={GROUP_ID} />
        <Polls groupId={GROUP_ID} />
        <Chats groupId={GROUP_ID} />
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}


