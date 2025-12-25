import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RequestsPage from "./pages/RequestsPage";
import CategoriesPage from "./pages/CategoriesPage";
import VolunteersPage from "./pages/VolunteersPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import ReviewsPage from "./pages/ReviewsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/requests" replace />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
