// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // 🔄 Clear auth state completely
    const clearAuth = useCallback(() => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    }, []);

    // ✅ Verify token + fetch fresh user from backend
    const loadUser = useCallback(async () => {
        setLoadingAuth(true);
        try {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) throw new Error("No token found");

            const decoded = jwtDecode(storedToken);
            const isExpired = decoded.exp * 1000 < Date.now();
            if (isExpired) {
                throw new Error("Token expired");
            }

            // 🛡️ Verify with backend
            const { data } = await axios.get(`${backendUrl}/api/auth/check-auth`, {
                headers: { Authorization: `Bearer ${storedToken}` },
                withCredentials: true,
            });
            console.log(data, 'data')
            // 👤 Set verified user
            setToken(storedToken);
            setUser(data.user);
            setIsAuthenticated(true);
        } catch (err) {
            console.warn("🔒 Auth validation failed:", err.message || err.response?.data?.message);
            clearAuth();
        } finally {
            setLoadingAuth(false);
        }
    }, [clearAuth]);

    // Call on mount
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // 👋 Logout function
    const logout = () => {
        clearAuth();
        navigate("/login");
        toast.info("Logged out successfully");
    };

    // 📦 Optional login function (e.g. after successful login API)
    const login = (userObj, token) => {
        localStorage.setItem("token", token);
        setUser(userObj);
        setToken(token);
        setIsAuthenticated(true);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loadingAuth,
            isAuthenticated, setUser,
            login,
            logout,
            revalidate: loadUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);