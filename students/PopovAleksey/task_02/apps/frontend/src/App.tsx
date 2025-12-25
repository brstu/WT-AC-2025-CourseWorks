import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicOnly } from "./components/Protected";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RoomsPage } from "./pages/RoomsPage";
import { BookingsPage } from "./pages/BookingsPage";
import { SchedulePage } from "./pages/SchedulePage";
import { AuthProvider } from "./auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
