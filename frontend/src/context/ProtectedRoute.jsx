// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const ProtectedRoute = ({ children, role }) => {
//     const { user, loadingAuth } = useAuth();
//     const location = useLocation();

//     console.log(user, 'user')
//     // 1. Show a loading indicator while authentication status is being checked.
//     // This is the most important check and must come first.
//     if (loadingAuth) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <p>🔒 Verifying access...</p>
//             </div>
//         );
//     }

//     // 2. After loading is complete, check if a user exists.
//     // If not, redirect to the login page.
//     if (!user) {
//         console.warn("⛔ No user found — redirecting to /login");
//         // We pass the original location in state so we can redirect back after login.
//         return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     // 3. If a user exists, check if their role matches the required role.
//     if (role && user.role !== role) {
//         console.warn(`🔐 Authorization failed. Required role: '${role}', User role: '${user.role}'`);
//         // Redirect to a dedicated "unauthorized" page for a better user experience.
//         return <Navigate to="/unauthorized" replace />;
//     }

//     // 4. If all checks pass, render the protected component.
//     console.log("✅ User is authorized");
//     return children;
// };

// export default ProtectedRoute;

import { useAuth } from "../context/AuthContext";
import { useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ProtectedRoute = ({ children, role }) => {
    const { user, loadingAuth, logout } = useAuth();
    const location = useLocation();

    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuthWithServer = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token");

                const endpoint = role === "admin"
                    ? "/api/auth/admin/check-auth"
                    : "/api/auth/check-auth";

                const { data } = await axios.get(`${backendUrl}${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });

                console.log("✅ Server auth check passed:", data.user);
                setAuthorized(true);
            } catch (err) {
                console.error("⛔ Server auth check failed:", err.response?.data || err.message);
                logout(); // Optional: clear local data
                setAuthorized(false);
            } finally {
                setChecking(false);
            }
        };

        checkAuthWithServer();
    }, [role]);

    if (loadingAuth || checking) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>🔒 Verifying access...</p>
            </div>
        );
    }

    if (!authorized) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
