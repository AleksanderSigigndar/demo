import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ user, userRole, children }) => {
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default AdminRoute;