import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../DashboardLayout';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isClockIn = localStorage.getItem('clockInToday') === 'true';
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If not clocked in and not on dashboard, redirect to dashboard
  if (!isClockIn && location.pathname !== '/dashboard') {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  
  // Return authorized component with layout
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default PrivateRoute;
