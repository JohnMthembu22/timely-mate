import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import authService from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give time for auth state to restore from localStorage
    const checkAuth = async () => {
      // Check if we have auth data in localStorage
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      // If we have auth data but Redux hasn't loaded it yet, wait a bit
      if (token && user && !isAuthenticated && !loading) {
        // Wait for Redux to sync
        setTimeout(() => setIsChecking(false), 100);
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, loading]);

  // Show loading while checking auth state
  if (isChecking || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
