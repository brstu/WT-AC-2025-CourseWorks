import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, ProtectedRoute, MainLayout } from './components';
import {
  LoginPage,
  RegisterPage,
  TimerPage,
  TasksPage,
  TagsPage,
  ReportsPage,
  SettingsPage,
} from './pages';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Защищённые маршруты */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/timer" element={<TimerPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Редирект на главную */}
            <Route path="/" element={<Navigate to="/timer" replace />} />
            <Route path="*" element={<Navigate to="/timer" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
