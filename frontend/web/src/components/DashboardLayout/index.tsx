import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  ListItemAvatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Timer,
  Work,
  Schedule,
  People,
  Construction,
  Extension,
  Receipt,
  Assessment,
  Settings as SettingsIcon,
  School,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Group as GroupIcon,
  Person,
  VideoCall,
  BusinessCenter,
  Notifications,
  NotificationsActive,
  MarkEmailRead,
  Assignment,
  CalendarMonth,
  AccessTime,
  Message,
  Cloud as CloudIcon,
  ShoppingCart,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
// import UserStatusIndicator from '../UserStatusIndicator';
import FloatingStatusBar from '../FloatingStatusBar';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from '../PermissionGuard';
import { UserPermissions } from '../../types/auth';

const DRAWER_WIDTH = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { icon: <DashboardIcon />, text: 'Dashboard', path: '/dashboard', permission: 'canAccessTimeTracking' },
  { icon: <Timer />, text: 'Time Tracking', path: '/time-tracking', permission: 'canAccessTimeTracking' },
  { 
    icon: <Work />, 
    text: 'Projects', 
    path: '/projects',
    description: 'View and manage project tasks',
    permission: 'canAccessProjects',
    restricted: true // This will show role-based restrictions
  },
  { icon: <Schedule />, text: 'Calendar', path: '/calendar', permission: 'canAccessTimeTracking' },
  { icon: <VideoCall />, text: 'Meetings', path: '/meetings', permission: 'canAccessTimeTracking' },
  { icon: <People />, text: 'Team', path: '/team', permission: 'canManageTeam' },
  { icon: <BusinessCenter />, text: 'Freelancers', path: '/freelancers', permission: 'canManageTeam' },
  { icon: <GroupIcon />, text: 'HR', path: '/hr', permission: 'canAccessHR', restricted: true },
  { icon: <NotificationsActive />, text: 'Messages and Notifications', path: '/messages', permission: 'canAccessTimeTracking' },
  { icon: <Assessment />, text: 'Reports', path: '/reports', permission: 'canAccessTimeTracking' },
  { icon: <Construction />, text: 'Offsite Work', path: '/offsite-work', permission: 'canAccessTimeTracking' },
  { icon: <Extension />, text: 'Industry Modules', path: '/industry-modules', permission: 'canAccessTimeTracking' },
  { icon: <Receipt />, text: 'Expense Tracking', path: '/expense-tracking', permission: 'canAccessExpenses', restricted: true },
  { icon: <ShoppingCart />, text: 'Procurement', path: '/procurement', permission: 'canAccessProcurement', restricted: true },
  { icon: <School />, text: 'Learning Portal', path: '/learning-portal', permission: 'canAccessLearning' },

  { icon: <Person />, text: 'Profile', path: '/profile', permission: 'canAccessTimeTracking' },
  { icon: <SettingsIcon />, text: 'Settings', path: '/settings', permission: 'canModifySettings', restricted: true },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Get user from Redux to check if loaded
  const { user, loading } = useAppSelector((state) => state.auth);
  
  // Check if user is clocked in
  const isClockedIn = localStorage.getItem('clockInToday') === new Date().toDateString();
  const { canCreateTasks, canEditTasks, isEmployee, hasPermission, isAdmin } = usePermissions();
  
  // Real-time notifications from context
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    getUnreadCountByType 
  } = useNotifications();
  
  // Calculate unread counts for navigation
  const unreadMessageCount = getUnreadCountByType('message');
  const unreadNotificationCount = unreadCount - unreadMessageCount;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };
  
  // Notification state
  const [notificationEl, setNotificationEl] = useState<null | HTMLElement>(null);
  
  // Notification handlers
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationEl(event.currentTarget);
  };
  
  const handleNotificationClose = () => {
    setNotificationEl(null);
  };
  
  const handleNotificationRead = (notification: any) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Close menu
    handleNotificationClose();
    
    // Navigate to appropriate page based on notification type or actionUrl
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else {
      switch(notification.type) {
        case 'message':
          navigate('/messages');
          break;
        case 'task':
          navigate('/projects');
          break;
        case 'calendar':
          navigate('/calendar');
          break;
        case 'timesheet':
          navigate('/time-tracking');
          break;
        case 'procurement':
          navigate('/procurement');
          break;
        case 'hr':
          navigate('/hr');
          break;
        default:
          navigate('/messages');
      }
    }
  };
  
  const handleMarkAllRead = () => {
    markAllAsRead();
    handleNotificationClose();
  };

  const drawer = (
    <Box>
      <Box sx={{ 
        p: 2, 
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Timely Mate
          </Typography>
          {!isClockedIn && (
            <Tooltip title="Clock in required to access app features">
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'error.main',
                  animation: 'pulse 2s infinite'
                }} 
              />
            </Tooltip>
          )}
        </Box>
        <IconButton 
          size="small" 
          onClick={handleLogout}
          sx={{ 
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <LogoutIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navigationItems
          .filter((item) => {
            // CRITICAL: In production, ensure navigation never disappears
            // Check if we have auth token in localStorage (even if Redux hasn't loaded yet)
            const hasAuthToken = localStorage.getItem('timelymate_token') || localStorage.getItem('auth');
            const isAuthenticated = !!user || !!hasAuthToken;
            
            // PRODUCTION FIX: If we have auth token but user isn't loaded yet, show all items
            // This handles the case where Redux store hasn't synced yet in production
            if (hasAuthToken && !user) {
              return true;
            }
            
            // If user is authenticated but still loading, show all items
            if (isAuthenticated && loading) {
              return true;
            }
            
            // If user is not loaded yet, show all items (will be filtered once loaded)
            if (!isAuthenticated || !user) {
              return true;
            }
            
            // Admin, Manager, and Executive users always see all navigation items
            const isManager = user.role === 'team_leader';
            const isExecutive = user.department === 'executive';
            if (isAdmin() || isManager || isExecutive) {
              return true;
            }
            
            // If no permission specified, show the item
            if (!item.permission) return true;
            
            // Check if user has the required permission
            // Use try-catch to ensure we don't hide items if permission check fails
            try {
              const hasAccess = hasPermission(item.permission as keyof UserPermissions);
              // If permission check returns false, still show basic navigation items
              // Only hide items if we're certain the user doesn't have permission AND it's not a basic item
              if (!hasAccess) {
                // Always show basic navigation items (Dashboard, Profile, etc.)
                const basicPermissions = ['canAccessTimeTracking'];
                if (basicPermissions.includes(item.permission)) {
                  return true;
                }
                return false;
              }
              return true;
            } catch (error) {
              // If there's any error checking permissions, show the item to be safe
              console.warn('Error checking permission:', error);
              return true;
            }
          })
          .map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              selected={location.pathname === item.path}
              sx={{
                py: { xs: 1, md: 1.1 },
                '&.Mui-selected': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.08)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{
                minWidth: 40,
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
                '& svg': {
                  fontSize: { xs: '1.2rem', md: '1.3rem' },
                },
              }}>
                {item.icon}
              </ListItemIcon>
              
              <Box sx={{ flexGrow: 1 }}>
                <ListItemText 
                  primary={item.text}
                  secondary={
                    item.restricted && item.path === '/projects' && isEmployee() ? (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        View only - Limited permissions
                      </Typography>
                    ) : item.description && item.path === '/projects' ? (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {canCreateTasks() ? 'Create & manage tasks' : 'View assigned tasks'}
                      </Typography>
                    ) : undefined
                  }
                  primaryTypographyProps={{
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                    fontWeight: 400,
                  }}
                  sx={{
                    '& .MuiListItemText-secondary': {
                      marginTop: '2px',
                    },
                  }}
                />
              </Box>
              
              {/* Role indicator for Projects */}
              {item.path === '/projects' && isEmployee() && (
                <Tooltip title="You can only view and update tasks assigned to you">
                  <Box 
                    sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      bgcolor: 'warning.main',
                      ml: 1
                    }} 
                  />
                </Tooltip>
              )}
              
              {/* Show clock-in required indicator for disabled items */}
              {!isClockedIn && item.path !== '/dashboard' && (
                <Tooltip title="Clock in required to access this feature">
                  <Box 
                    sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      bgcolor: 'error.main',
                      ml: 1
                    }} 
                  />
                </Tooltip>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              bgcolor: 'background.default',
            },
            zIndex: (theme) => theme.zIndex.drawer + 2,
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              bgcolor: 'background.default',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* App Bar */}
        <Box 
          component="header"
          sx={{ 
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            backdropFilter: 'none',
            color: 'text.primary',
            borderBottom: 0,
            borderColor: 'transparent',
            bgcolor: 'transparent !important',
            boxShadow: 'none',
            background: 'none',
          }}
        >
          <Toolbar disableGutters sx={{ minHeight: 0, py: 0, px: 0 }}>
            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Spacer to push content to right */}
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Right side items */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Theme toggle removed */}
              {/* Old notifications and user status removed; using FloatingStatusBar */}
            </Box>
          </Toolbar>
        </Box>

        {/* Page Content */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        {/* Floating status bar */}
        <Box sx={{ position: 'relative', zIndex: 1500 }}>
          <FloatingStatusBar />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
