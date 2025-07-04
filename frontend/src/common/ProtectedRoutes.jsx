import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getCurrentUserType, hasUserType } from '../utils/authUtils';

// Enhanced ProtectedRoute component
export const ProtectedRoute = ({ allowedUserType, children }) => {
    const isAuthenticated = hasUserType(allowedUserType);

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
  allowedUserType: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

// Component to handle guest-only routes (redirect if already logged in)
export const GuestRoute = ({ children }) => {
  const userType = getCurrentUserType();
  
  if (userType === 'attendee') {
    return <Navigate to="/" replace />;
  } else if (userType === 'organizer') {
    return <Navigate to="/organizer-dashboard" replace />;
  }
  
  return children;
};

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired
};