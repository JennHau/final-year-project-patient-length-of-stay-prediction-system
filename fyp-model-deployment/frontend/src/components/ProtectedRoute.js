import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [], redirectPath = '/' }) => {
  const { isLoggedIn, userRole } = useAuth();

  // If the user is logged in but doesn't have the required role
  if (isLoggedIn && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectPath} />;
  }

  // If the user is not logged in and trying to access a page that requires login
  if (!isLoggedIn && allowedRoles.length > 0) {
    return <Navigate to="/login" />; // Redirect to the login page
  }

  // If the user is logged in and has the correct role, or the route doesn't require login
  return children;
};

export default ProtectedRoute;
