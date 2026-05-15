import React, { useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { Department } from '../../types/auth';
import { Box, CircularProgress } from '@mui/material';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

const REDIRECT_FLAG_KEY = 'timelymate_role_redirect_done';

const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const hasCheckedRef = useRef(false);

  // If not authenticated, let ProtectedRoute handle the redirect
  // Don't redirect here to avoid loops
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If authenticated but user data is still loading, show loading state
  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Determine the appropriate dashboard based on role and department
  const getDashboardRoute = (role: string, department: Department | undefined): string => {
    // Admin users always go to main dashboard
    if (role === 'admin') {
      return '/dashboard';
    }

    // If no department is set, default to main dashboard
    if (!department) {
      return '/dashboard';
    }

    // Department-specific dashboards
    switch (department) {
      case 'hr':
        return '/hr';
      case 'finance':
        return '/expense-tracking';
      case 'engineering':
      case 'design':
        return '/projects';
      case 'operations':
        return '/procurement';
      case 'marketing':
      case 'sales':
        return '/projects';
      case 'executive':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  const dashboardRoute = getDashboardRoute(user.role, user.department);
  
  // Only redirect on initial load when user first lands on /dashboard
  // Use sessionStorage to track if we've already done the initial redirect
  // This allows users to manually navigate to /dashboard after the initial redirect
  if (location.pathname === '/dashboard') {
    const hasRedirected = sessionStorage.getItem(REDIRECT_FLAG_KEY) === 'true';
    
    // Only redirect if:
    // 1. User should be on a different dashboard route
    // 2. We haven't already done the initial redirect in this session
    if (dashboardRoute !== '/dashboard' && !hasRedirected && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      sessionStorage.setItem(REDIRECT_FLAG_KEY, 'true');
      return <Navigate to={dashboardRoute} replace />;
    }
    
    // Mark as checked to prevent re-checking
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
    }
    
    // Allow access to /dashboard (either it's their correct route, or they manually navigated)
    return <>{children}</>;
  }

  // For all other routes, just render children (don't interfere with navigation)
  return <>{children}</>;
};

export default RoleBasedRedirect;





