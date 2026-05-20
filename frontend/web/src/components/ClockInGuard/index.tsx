import { ReactNode, useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { AccessTime, Lock } from '@mui/icons-material';
import { Department } from '../../types/auth';
import { TESTING_MODE_UNLOCK_ALL } from '../../config/testingMode';

interface ClockInGuardProps {
  children: ReactNode;
}

/** Routes reachable without clock-in (department home pages where users clock in). */
const CLOCK_IN_EXEMPT_ROUTES = [
  '/dashboard',
  '/projects',
  '/hr',
  '/expense-tracking',
  '/procurement',
];

const ClockInGuard: React.FC<ClockInGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [showClockInRequired, setShowClockInRequired] = useState(false);

  // Determine the user's designated dashboard route
  const getDashboardRoute = (role: string, department: Department | undefined): string => {
    if (role === 'admin') {
      return '/dashboard';
    }
    if (!department) {
      return '/dashboard';
    }
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

  const dashboardRoute = useMemo(() => {
    if (!user) return '/dashboard';
    return getDashboardRoute(user.role, user.department);
  }, [user]);
  
  useEffect(() => {
    const hasClockInToday = localStorage.getItem('clockInToday') === new Date().toDateString();
    
    // Allow admin users to bypass clock-in requirement
    if (user?.role === 'admin') {
      setShowClockInRequired(false);
      return;
    }

    // Department home pages — user can clock in there without the guard blocking
    if (CLOCK_IN_EXEMPT_ROUTES.includes(location.pathname)) {
      setShowClockInRequired(false);
      return;
    }

    // Not clocked in: block content on the requested URL (do not redirect away —
    // redirecting made dashboard quick-action / sidebar links look broken).
    if (!hasClockInToday) {
      setShowClockInRequired(true);
    } else {
      setShowClockInRequired(false);
    }
  }, [location.pathname, user?.role]);

  if (TESTING_MODE_UNLOCK_ALL) {
    return <>{children}</>;
  }

  // Show clock-in required screen if user hasn't clocked in
  if (showClockInRequired) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Lock sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold" color="error.main">
              Clock-In Required
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              You must clock in before accessing this feature
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please clock in on the dashboard to start your workday and access all app features.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AccessTime />}
            onClick={() => {
              setShowClockInRequired(false);
              navigate(dashboardRoute);
            }}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Go to Dashboard & Clock In
          </Button>
        </Paper>
      </Container>
    );
  }

  return <>{children}</>;
};

export default ClockInGuard; 