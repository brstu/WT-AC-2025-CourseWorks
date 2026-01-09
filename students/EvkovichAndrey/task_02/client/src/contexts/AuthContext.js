import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/profile`);
            setUser(response.data.user);
        } catch (error) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            toast.success('Вход выполнен успешно!');
            navigate('/');
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка входа');
            return { success: false, error: error.response?.data };
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            toast.success('Регистрация успешна!');
            navigate('/');
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка регистрации');
            return { success: false, error: error.response?.data };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        toast.success('Вы вышли из системы');
        navigate('/login');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        fetchUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};