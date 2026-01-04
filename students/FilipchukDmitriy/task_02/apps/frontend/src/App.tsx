import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setAuthHelpers } from './api';
import { ToastProvider } from './components/ui';
import { Layout } from './components/layout';
import { ProtectedRoute, GuestRoute } from './components/auth';
import {
  LoginPage,
  RegisterPage,
  NotebooksPage,
  NotebookDetailPage,
  NoteDetailPage,
  LabelsPage,
  SharedNotebooksPage,
  UsersPage,
} from './pages';
import './styles.css';

function AppRoutes() {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  useEffect(() => {
    setAuthHelpers({
      getAccessToken: () => accessToken,
      refreshAccessToken,
      onUnauthorized: () => {
        logout();
      },
    });
  }, [accessToken, refreshAccessToken, logout]);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      {/* Protected routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/notebooks" element={<NotebooksPage />} />
        <Route path="/notebooks/:id" element={<NotebookDetailPage />} />
        <Route path="/notes/:id" element={<NoteDetailPage />} />
        <Route path="/labels" element={<LabelsPage />} />
        <Route path="/shared" element={<SharedNotebooksPage />} />
        
        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect */}
      <Route path="/" element={<Navigate to="/notebooks" replace />} />
      <Route path="*" element={<Navigate to="/notebooks" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
