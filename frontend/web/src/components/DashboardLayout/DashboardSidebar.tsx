import React, { useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Badge,
  Collapse,
  alpha,
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  ExpandMore,
  ChevronRight,
} from '@mui/icons-material';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { usePermissions } from '../../hooks/usePermissions';
import { UserPermissions } from '../../types/auth';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  dashboardNavigationGroups,
  type DashboardNavItem,
  type DashboardNavGroup,
} from './dashboardNavigation';
import { TESTING_MODE_UNLOCK_ALL } from '../../config/testingMode';
import {
  NAV_TOUR_ATTR,
  sidebarTokens as T,
} from './dashboardSidebarTokens';

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

function isNavItemActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Called after navigation (e.g. close mobile drawer). */
  onAfterNavigate?: () => void;
  showCollapseControl?: boolean;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  onToggleCollapsed,
  onAfterNavigate,
  showCollapseControl = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { unreadCount } = useNotifications();
  const isClockedIn = localStorage.getItem('clockInToday') === new Date().toDateString();
  const { canCreateTasks, isEmployee, hasPermission, isAdmin } = usePermissions();

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('tm-nav-groups-expanded');
      if (raw) return JSON.parse(raw) as Record<string, boolean>;
    } catch {
      /* ignore */
    }
    return {};
  });

  const persistGroups = useCallback((next: Record<string, boolean>) => {
    try {
      localStorage.setItem('tm-nav-groups-expanded', JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [groupName]: !(prev[groupName] ?? true) };
      persistGroups(next);
      return next;
    });
  };

  const isGroupExpanded = (groupName: string) => expandedGroups[groupName] ?? true;

  const shouldShowNavItem = useCallback(
    (item: DashboardNavItem): boolean => {
      const hasAuthToken = localStorage.getItem('timelymate_token') || localStorage.getItem('auth');
      const isAuthenticated = !!user || !!hasAuthToken;

      if (hasAuthToken && !user) return true;
      if (isAuthenticated && loading) return true;
      if (!isAuthenticated || !user) return true;

      const isManager = user.role === 'team_leader';
      const isExecutive = user.department === 'executive';
      if (isAdmin() || isManager || isExecutive) return true;
      if (TESTING_MODE_UNLOCK_ALL) return true;
      if (!item.permission) return true;

      try {
        const hasAccess = hasPermission(item.permission as keyof UserPermissions);
        if (!hasAccess) {
          const basicPermissions = ['canAccessTimeTracking'];
          if (basicPermissions.includes(item.permission)) return true;
          return false;
        }
        return true;
      } catch (error) {
        console.warn('Error checking permission:', error);
        return true;
      }
    },
    [user, loading, isAdmin, hasPermission]
  );

  const visibleGroups = useMemo(
    () =>
      dashboardNavigationGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => shouldShowNavItem(item)),
        }))
        .filter((g) => g.items.length > 0),
    [shouldShowNavItem]
  );

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'TimelyMate';
  const accountLabel = user?.role ? String(user.role).replace(/_/g, ' ') : 'Account';

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const goTo = (path: string) => {
    navigate(path);
    onAfterNavigate?.();
  };

  const renderNavItem = (item: DashboardNavItem) => {
    const Icon = item.icon;
    const selected = isNavItemActive(location.pathname, item.path);
    const showMessagesBadge = item.path === '/messages' && unreadCount > 0;

    const button = (
      <ListItemButton
        data-tour={NAV_TOUR_ATTR[item.path]}
        onClick={() => goTo(item.path)}
        selected={selected}
        sx={{
          borderRadius: T.itemRadius,
          py: T.navItemPy,
          px: collapsed ? 1 : T.navItemPx,
          minHeight: 44,
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'background-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease',
          position: 'relative',
          overflow: 'hidden',
          '&::before': selected
            ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 6,
                bottom: 6,
                width: 3,
                borderRadius: '0 2px 2px 0',
                background: T.brandGradient,
                boxShadow: `0 0 12px ${alpha(T.accentBlue, 0.5)}`,
              }
            : undefined,
          '&.Mui-selected': {
            bgcolor: T.activeBg,
            boxShadow: `inset 0 0 0 1px ${alpha(T.accentBlue, 0.2)}`,
            '&:hover': { bgcolor: T.activeBg },
          },
          '&:hover': {
            bgcolor: selected ? T.activeBg : T.hoverBg,
            transform: collapsed ? 'none' : 'translateX(2px)',
            '& .nav-icon-wrap': {
              bgcolor: selected ? alpha(T.accent, 0.2) : alpha(T.accentBlue, 0.12),
              color: selected ? T.accent : T.accentBlueBright,
            },
          },
        }}
      >
        <Box
          className="nav-icon-wrap"
          sx={{
            width: T.iconBoxSize,
            height: T.iconBoxSize,
            borderRadius: T.itemRadius,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mr: collapsed ? 0 : 1.25,
            bgcolor: selected ? alpha(T.accent, 0.18) : 'transparent',
            color: selected ? T.accent : T.text,
            transition: 'background-color 0.18s ease, color 0.18s ease',
          }}
        >
          <Icon size={collapsed ? 20 : 18} strokeWidth={selected ? 2.25 : 2} />
        </Box>

        {!collapsed && (
          <Box sx={{ flex: 1, minWidth: 0, pr: 0.5 }}>
            <ListItemText
              primary={item.text}
              secondary={
                item.restricted && item.path === '/projects' && isEmployee() ? (
                  <Typography component="span" variant="caption" sx={{ fontSize: '0.65rem', color: T.muted, lineHeight: 1.2 }}>
                    View only
                  </Typography>
                ) : item.description && item.path === '/projects' ? (
                  <Typography component="span" variant="caption" sx={{ fontSize: '0.65rem', color: T.muted, lineHeight: 1.2 }}>
                    {canCreateTasks() ? 'Create & manage' : 'Assigned tasks'}
                  </Typography>
                ) : undefined
              }
              primaryTypographyProps={{
                fontSize: '0.8125rem',
                fontWeight: selected ? 600 : 500,
                color: selected ? T.textBright : T.text,
                lineHeight: 1.3,
                noWrap: true,
              }}
            />
          </Box>
        )}

        {!collapsed && showMessagesBadge && (
          <Badge
            badgeContent={unreadCount > 99 ? '99+' : unreadCount}
            color="primary"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.625rem',
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                bgcolor: T.accentBlue,
                color: '#fff',
                boxShadow: `0 0 10px ${alpha(T.accentBlue, 0.45)}`,
              },
            }}
          />
        )}

        {collapsed && showMessagesBadge && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 10,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: T.accentBlue,
              boxShadow: `0 0 8px ${alpha(T.accentBlue, 0.6)}`,
            }}
          />
        )}

        {!collapsed && item.path === '/projects' && isEmployee() && (
          <Tooltip title="Limited to assigned tasks">
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main', flexShrink: 0 }} />
          </Tooltip>
        )}

        {!collapsed && !isClockedIn && item.path !== '/dashboard' && (
          <Tooltip title="Clock in required">
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0, ml: 0.25 }} />
          </Tooltip>
        )}
      </ListItemButton>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path} title={item.text} placement="right" arrow>
          <ListItem disablePadding sx={{ mb: 0.35, display: 'block' }}>
            {button}
          </ListItem>
        </Tooltip>
      );
    }

    return (
      <ListItem key={item.path} disablePadding sx={{ mb: 0.35 }}>
        {button}
      </ListItem>
    );
  };

  const renderGroup = (group: DashboardNavGroup & { items: DashboardNavItem[] }) => {
    const expanded = isGroupExpanded(group.group);

    if (collapsed) {
      return (
        <Box key={group.group} sx={{ mb: 1.5 }}>
          <List dense disablePadding>
            {group.items.map((item) => renderNavItem(item))}
          </List>
        </Box>
      );
    }

    return (
      <Box key={group.group} sx={{ mb: T.groupGap }}>
        <Box
          component="button"
          type="button"
          onClick={() => toggleGroup(group.group)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            px: 1.5,
            py: 0.5,
            mb: 0.75,
            color: T.muted,
            borderRadius: T.itemRadius,
            transition: 'color 0.15s ease, background-color 0.15s ease',
            '&:hover': {
              color: T.text,
              bgcolor: T.hoverBg,
            },
          }}
        >
          {expanded ? (
            <ExpandMore sx={{ fontSize: 18, mr: 0.5, opacity: 0.7 }} />
          ) : (
            <ChevronRight sx={{ fontSize: 16, mr: 0.5, opacity: 0.7 }} />
          )}
          <Typography
            component="span"
            sx={{
              fontSize: T.sectionLabelSize,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              flex: 1,
              textAlign: 'left',
            }}
          >
            {group.group}
          </Typography>
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List dense disablePadding sx={{ px: 0.5 }}>
            {group.items.map((item) => renderNavItem(item))}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: T.bg,
        color: T.text,
      }}
    >
      {/* Brand header */}
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 1.75,
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 1,
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 0,
            flex: collapsed ? 0 : 1,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Box
            sx={{
              width: collapsed ? 36 : 34,
              height: collapsed ? 36 : 34,
              borderRadius: T.itemRadius,
              flexShrink: 0,
              background: T.brandGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
              fontSize: collapsed ? '1rem' : '0.875rem',
              boxShadow: `0 4px 14px ${alpha(T.accentBlue, 0.35)}`,
            }}
          >
            T
          </Box>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.0625rem',
                  color: T.textBright,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
                noWrap
              >
                TimelyMate
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: T.muted, letterSpacing: '0.04em' }}>
                Enterprise workspace
              </Typography>
            </Box>
          )}
          {!collapsed && !isClockedIn && (
            <Tooltip title="Clock in required for full access">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  flexShrink: 0,
                  boxShadow: '0 0 8px rgba(248, 113, 113, 0.6)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.45 },
                  },
                }}
              />
            </Tooltip>
          )}
        </Box>
        {showCollapseControl && !collapsed && (
          <Tooltip title="Collapse sidebar">
            <IconButton
              size="small"
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              sx={{
                color: T.text,
                border: `1px solid ${T.border}`,
                borderRadius: T.itemRadius,
                '&:hover': { bgcolor: T.hoverBg, borderColor: T.borderStrong },
              }}
            >
              <PanelLeftClose size={18} strokeWidth={2} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {showCollapseControl && collapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, borderBottom: `1px solid ${T.border}` }}>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              size="small"
              onClick={onToggleCollapsed}
              aria-label="Expand sidebar"
              sx={{
                color: T.text,
                border: `1px solid ${T.border}`,
                borderRadius: T.itemRadius,
                '&:hover': { bgcolor: T.hoverBg },
              }}
            >
              <PanelLeftOpen size={18} strokeWidth={2} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Navigation */}
      <Box
        component="nav"
        aria-label="Dashboard"
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 2,
          px: collapsed ? 0.75 : 1,
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: alpha('#fff', 0.12),
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
        {visibleGroups.map((group) => renderGroup(group))}
      </Box>

      {/* Profile footer */}
      <Box
        sx={{
          borderTop: `1px solid ${T.border}`,
          p: collapsed ? 1 : 1.5,
          bgcolor: T.bgElevated,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 1.25,
            flexDirection: collapsed ? 'column' : 'row',
          }}
        >
          <Tooltip title={displayName} placement="right" disableHoverListener={!collapsed}>
            <Box
              component="button"
              type="button"
              onClick={() => goTo('/profile')}
              aria-label="Open profile"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                p: collapsed ? 0.5 : 0.75,
                borderRadius: T.itemRadius,
                flex: collapsed ? 0 : 1,
                minWidth: 0,
                textAlign: 'left',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: T.hoverBg },
              }}
            >
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  sx={{
                    width: collapsed ? 40 : 38,
                    height: collapsed ? 40 : 38,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    bgcolor: alpha(T.accentBlue, 0.2),
                    color: T.accentBlueBright,
                    border: `2px solid ${alpha(T.accent, 0.5)}`,
                  }}
                >
                  {getUserInitials(user)}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: isClockedIn ? T.accent : '#fbbf24',
                    border: `2px solid ${T.bgElevated}`,
                    boxShadow: isClockedIn ? `0 0 6px ${alpha(T.accent, 0.6)}` : undefined,
                  }}
                />
              </Box>
              {!collapsed && (
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: '0.8125rem', fontWeight: 600, color: T.textBright }}>
                    {displayName}
                  </Typography>
                  <Typography
                    noWrap
                    sx={{ fontSize: '0.6875rem', color: T.muted, textTransform: 'capitalize' }}
                  >
                    {accountLabel}
                  </Typography>
                </Box>
              )}
            </Box>
          </Tooltip>

          {!collapsed && (
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              <Tooltip title="Settings">
                <IconButton
                  size="small"
                  onClick={() => goTo('/settings')}
                  aria-label="Settings"
                  sx={{
                    color: T.text,
                    borderRadius: T.itemRadius,
                    border: `1px solid ${T.border}`,
                    '&:hover': { bgcolor: T.hoverBg, color: T.accentBlueBright },
                  }}
                >
                  <SettingsIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Log out">
                <IconButton
                  size="small"
                  onClick={handleLogout}
                  aria-label="Log out"
                  sx={{
                    color: T.text,
                    borderRadius: T.itemRadius,
                    border: `1px solid ${T.border}`,
                    '&:hover': { bgcolor: alpha('#f87171', 0.12), color: '#fca5a5', borderColor: alpha('#f87171', 0.35) },
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {collapsed && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, alignItems: 'center' }}>
            <Tooltip title="Settings" placement="right">
              <IconButton size="small" onClick={() => goTo('/settings')} sx={{ color: T.text }}>
                <SettingsIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Log out" placement="right">
              <IconButton size="small" onClick={handleLogout} sx={{ color: T.text }}>
                <LogoutIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
};
