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
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
} from '@mui/material';
import { ExitToApp as LogoutIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import FloatingStatusBar from '../FloatingStatusBar';
import { usePermissions } from '../../hooks/usePermissions';
import { UserPermissions } from '../../types/auth';
import { dashboardNavigationGroups, type DashboardNavItem } from './dashboardNavigation';
import { TESTING_MODE_UNLOCK_ALL } from '../../config/testingMode';
import { MOBILE_APP_BAR_HEIGHT, mobileMenuButtonSx } from '../../theme/layout';

const DRAWER_WIDTH = 256;

const NAV_TOUR_ATTR: Record<string, string> = {
  '/dashboard': 'nav-dashboard',
  '/hr': 'nav-hr',
  '/projects': 'nav-projects',
  '/messages': 'nav-messages',
};

const SLATE = {
  bg: '#0f172a',
  border: '#1e293b',
  muted: '#64748b',
  text: '#cbd5e1',
  icon: '#94a3b8',
  hoverBg: '#1e293b',
  accent: '#34d399',
};

function getUserInitials(user: { name?: string; email?: string } | null | undefined): string {
  if (!user) return '?';
  const name = user.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const email = user.email?.trim();
  return email ? email.slice(0, 2).toUpperCase() : '?';
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, loading } = useAppSelector((state) => state.auth);

  const isClockedIn = localStorage.getItem('clockInToday') === new Date().toDateString();
  const { canCreateTasks, isEmployee, hasPermission, isAdmin } = usePermissions();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const shouldShowNavItem = (item: DashboardNavItem): boolean => {
    const hasAuthToken = localStorage.getItem('timelymate_token') || localStorage.getItem('auth');
    const isAuthenticated = !!user || !!hasAuthToken;

    if (hasAuthToken && !user) {
      return true;
    }

    if (isAuthenticated && loading) {
      return true;
    }

    if (!isAuthenticated || !user) {
      return true;
    }

    const isManager = user.role === 'team_leader';
    const isExecutive = user.department === 'executive';
    if (isAdmin() || isManager || isExecutive) {
      return true;
    }

    if (TESTING_MODE_UNLOCK_ALL) {
      return true;
    }

    if (!item.permission) return true;

    try {
      const hasAccess = hasPermission(item.permission as keyof UserPermissions);
      if (!hasAccess) {
        const basicPermissions = ['canAccessTimeTracking'];
        if (basicPermissions.includes(item.permission)) {
          return true;
        }
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Error checking permission:', error);
      return true;
    }
  };

  const displayName =
    user?.name?.trim() || user?.email?.split('@')[0] || 'TimelyMate';
  const accountLabel = user?.role ? String(user.role).replace(/_/g, ' ') : 'Account';

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: SLATE.bg,
        color: SLATE.text,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 2,
          borderBottom: `1px solid ${SLATE.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              flexShrink: 0,
              background: 'linear-gradient(to top right, #3b82f6, #34d399)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff',
              fontSize: '0.875rem',
            }}
          >
            T
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              color: '#fff',
              letterSpacing: '-0.02em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            TimelyMate
          </Typography>
          {!isClockedIn && (
            <Tooltip title="Clock in required to access app features">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  flexShrink: 0,
                  animation: 'pulse 2s infinite',
                }}
              />
            </Tooltip>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={handleLogout}
          sx={{
            color: SLATE.text,
            '&:hover': { bgcolor: SLATE.hoverBg },
          }}
          aria-label="Log out"
        >
          <LogoutIcon />
        </IconButton>
      </Box>

      <Box
        component="nav"
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
          px: 1,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#334155',
            borderRadius: 3,
          },
        }}
      >
        {dashboardNavigationGroups.map((group) => {
          const visibleItems = group.items.filter((item) => shouldShowNavItem(item));
          if (visibleItems.length === 0) return null;

          return (
            <Box key={group.group} sx={{ mb: 3 }}>
              <Typography
                component="div"
                sx={{
                  px: 1.5,
                  mb: 0.75,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: SLATE.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {group.group}
              </Typography>
              <List dense disablePadding>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const selected = location.pathname === item.path;

                  return (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                      <ListItemButton
                        data-tour={NAV_TOUR_ATTR[item.path]}
                        onClick={() => {
                          navigate(item.path);
                          if (isMobile) {
                            setMobileOpen(false);
                          }
                        }}
                        selected={selected}
                        sx={{
                          borderRadius: 2,
                          py: 1,
                          px: 1.5,
                          '&.Mui-selected': {
                            bgcolor: SLATE.hoverBg,
                            borderRight: `3px solid ${SLATE.accent}`,
                            '&:hover': { bgcolor: SLATE.hoverBg },
                          },
                          '&:hover': {
                            bgcolor: SLATE.hoverBg,
                            '& .nav-icon': {
                              color: '#6ee7b7',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Icon
                            className="nav-icon"
                            size={18}
                            strokeWidth={2}
                            color={selected ? SLATE.accent : SLATE.icon}
                          />
                        </ListItemIcon>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <ListItemText
                            primary={item.text}
                            secondary={
                              item.restricted &&
                              item.path === '/projects' &&
                              isEmployee() ? (
                                <Typography component="span" variant="caption" sx={{ fontSize: '0.7rem', color: SLATE.icon }}>
                                  View only — limited permissions
                                </Typography>
                              ) : item.description && item.path === '/projects' ? (
                                <Typography component="span" variant="caption" sx={{ fontSize: '0.7rem', color: SLATE.icon }}>
                                  {canCreateTasks()
                                    ? 'Create & manage tasks'
                                    : 'View assigned tasks'}
                                </Typography>
                              ) : undefined
                            }
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: selected ? '#fff' : SLATE.text,
                              lineHeight: 1.25,
                            }}
                          />
                        </Box>

                        {item.path === '/projects' && isEmployee() && (
                          <Tooltip title="You can only view and update tasks assigned to you">
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'warning.main',
                                ml: 0.5,
                                flexShrink: 0,
                              }}
                            />
                          </Tooltip>
                        )}

                        {!isClockedIn && item.path !== '/dashboard' && (
                          <Tooltip title="Clock in required to access this feature">
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'error.main',
                                ml: 0.5,
                                flexShrink: 0,
                              }}
                            />
                          </Tooltip>
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          borderTop: `1px solid ${SLATE.border}`,
          pt: 2,
          pb: 2,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#334155',
            fontSize: '0.8125rem',
            fontWeight: 700,
          }}
        >
          {getUserInitials(user)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
            {displayName}
          </Typography>
          <Typography noWrap sx={{ fontSize: '0.75rem', color: SLATE.muted, textTransform: 'capitalize' }}>
            {accountLabel}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const drawerPaperSx = {
    boxSizing: 'border-box' as const,
    width: DRAWER_WIDTH,
    bgcolor: SLATE.bg,
    borderRight: `1px solid ${SLATE.border}`,
  };

  /** Fixed sidebar: paper stays on screen while main content scrolls. Drawer width is the only horizontal offset. */
  const permanentDrawerPaperSx = {
    ...drawerPaperSx,
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100dvh',
    overflowY: 'auto',
    overflowX: 'hidden',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': drawerPaperSx,
          zIndex: (t) => t.zIndex.drawer + 2,
        }}
      >
        {drawer}
      </Drawer>
      {/* Spacer reserves drawer width; paper is position:fixed and does not scroll away */}
      <Drawer
        variant="permanent"
        aria-label="Main navigation"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': permanentDrawerPaperSx,
        }}
        open
      >
        {drawer}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        {/* Mobile top bar — blue hamburger on light background */}
        {isMobile && (
          <Box
            component="header"
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: (t) => t.zIndex.appBar + 1,
              height: MOBILE_APP_BAR_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              bgcolor: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
            }}
          >
            <IconButton
              aria-label="Open navigation menu"
              onClick={handleDrawerToggle}
              edge="start"
              sx={mobileMenuButtonSx}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                flexShrink: 0,
                background: 'linear-gradient(to top right, #3b82f6, #34d399)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#fff',
                fontSize: '0.75rem',
              }}
            >
              T
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              TimelyMate
            </Typography>
          </Box>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            overflowX: 'hidden',
            pt: { xs: `${MOBILE_APP_BAR_HEIGHT}px`, md: 0 },
          }}
        >
          {children}
        </Box>
        <Box sx={{ position: 'relative', zIndex: (t) => t.zIndex.appBar + 2 }}>
          <FloatingStatusBar mobileAppBarOffset={isMobile ? MOBILE_APP_BAR_HEIGHT : 0} />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
