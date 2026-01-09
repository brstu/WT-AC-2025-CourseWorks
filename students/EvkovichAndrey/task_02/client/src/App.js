import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Страницы
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Calendar from './pages/Calendar';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#4CAF50',
        },
        secondary: {
            main: '#2196F3',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="habits" element={<Habits />} />
                        <Route path="calendar" element={<Calendar />} />
                        <Route path="goals" element={<Goals />} />
                        <Route path="stats" element={<Statistics />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;