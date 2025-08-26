import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const isTokenValid = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now(); // token not expired
    } catch (err) {
        return false;
    }
};

const PrivateRoute = () => {
    return isTokenValid() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
