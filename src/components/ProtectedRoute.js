import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useApp();
  return token ? children : <Navigate to="/login" replace />;
};
export default ProtectedRoute;

