import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import ClientsList from "./pages/Clients/ClientsList";
import ClientForm from "./pages/Clients/ClientForm";
import ClientDetails from "./pages/Clients/ClientDetails";
import DealsList from "./pages/Deals/DealsList";
import DealForm from "./pages/Deals/DealForm";
import { StagesList } from "./pages/Stages";
import { TasksList, TaskForm } from "./pages/Tasks";
import { InvoicesList } from "./pages/Invoices";
import InvoiceForm from "./pages/Invoices/InvoiceForm";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./components/RequireAuth";
import PageTransition from "./components/UI/PageTransition";

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <PageTransition>
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />

            <Route
              path="/clients"
              element={
                <RequireAuth>
                  <ClientsList />
                </RequireAuth>
              }
            />
            <Route
              path="/clients/new"
              element={
                <RequireAuth>
                  <ClientForm />
                </RequireAuth>
              }
            />
            <Route
              path="/clients/:id"
              element={
                <RequireAuth>
                  <ClientDetails />
                </RequireAuth>
              }
            />
            <Route
              path="/deals"
              element={
                <RequireAuth>
                  <DealsList />
                </RequireAuth>
              }
            />
            <Route
              path="/deals/new"
              element={
                <RequireAuth>
                  <DealForm />
                </RequireAuth>
              }
            />
            <Route
              path="/deals/:id"
              element={
                <RequireAuth>
                  <DealForm />
                </RequireAuth>
              }
            />
            <Route
              path="/stages"
              element={
                <RequireAuth>
                  <StagesList />
                </RequireAuth>
              }
            />
            <Route
              path="/tasks"
              element={
                <RequireAuth>
                  <TasksList />
                </RequireAuth>
              }
            />
            <Route
              path="/tasks/new"
              element={
                <RequireAuth>
                  <TaskForm />
                </RequireAuth>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <RequireAuth>
                  <TaskForm />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices"
              element={
                <RequireAuth>
                  <InvoicesList />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices/new"
              element={
                <RequireAuth>
                  <InvoiceForm />
                </RequireAuth>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <RequireAuth>
                  <InvoiceForm />
                </RequireAuth>
              }
            />

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </PageTransition>
      </Layout>
    </AuthProvider>
  );
}
