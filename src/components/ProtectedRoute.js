import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useApp();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If not authorized for this role, redirect to their default home
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
