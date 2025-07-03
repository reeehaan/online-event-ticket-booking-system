import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ allowedUserType }) => {
const token = localStorage.getItem('accessToken');

const isAuthenticated = () => {
    return true;
    if (!token) return false;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return decodedToken.exp > currentTime && decodedToken.role === allowedUserType;
};

// No need for try/catch since jwtDecode will throw if token is invalid
// and we want to redirect to login in that case anyway
try {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
    } catch {
    return <Navigate to="/login" replace />;
    }
};

ProtectedRoute.propTypes = {
    userType: PropTypes.string.isRequired
};

export default ProtectedRoute;