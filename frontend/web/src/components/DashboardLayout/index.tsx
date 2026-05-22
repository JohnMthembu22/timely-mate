import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import FloatingStatusBar from '../FloatingStatusBar';
import { DashboardSidebar } from './DashboardSidebar';
import {
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_COLLAPSED_STORAGE_KEY,
  sidebarTokens,
} from './dashboardSidebarTokens';
import { MOBILE_APP_BAR_HEIGHT } from '../../theme/layout';
import { tmColors } from '../../theme/designTokens';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const drawerWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false);
    }
  }, [isMobile]);

  const handleToggleCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen((open) => !open);
  };

  const closeMobileDrawer = () => {
    setMobileOpen(false);
  };

  const sidebarSurfaceSx = {
    boxSizing: 'border-box' as const,
    width: drawerWidth,
    bgcolor: sidebarTokens.bg,
    borderRight: `1px solid ${sidebarTokens.border}`,
    display: 'flex',
    flexDirection: 'column' as const,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  };

  const sidebar = (
    <DashboardSidebar
      collapsed={!isMobile && sidebarCollapsed}
      onToggleCollapsed={handleToggleCollapsed}
      onAfterNavigate={isMobile ? closeMobileDrawer : undefined}
      showCollapseControl={!isMobile}
    />
  );

  return (
    <Box sx={{ minHeight: '100dvh', width: '100%', maxWidth: '100vw' }}>
      {/* Mobile overlay drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiBackdrop-root': {
            bgcolor: alpha('#000', 0.55),
            backdropFilter: 'blur(4px)',
          },
          '& .MuiDrawer-paper': {
            ...sidebarSurfaceSx,
            width: SIDEBAR_WIDTH_EXPANDED,
            overflowY: 'auto',
          },
          zIndex: (t) => t.zIndex.drawer + 2,
        }}
      >
        <DashboardSidebar
          collapsed={false}
          onToggleCollapsed={handleToggleCollapsed}
          onAfterNavigate={closeMobileDrawer}
          showCollapseControl={false}
        />
      </Drawer>

      {/* Desktop fixed sidebar */}
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{
          ...sidebarSurfaceSx,
          display: { xs: 'none', md: 'flex' },
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: theme.zIndex.drawer,
          height: '100dvh',
          maxHeight: '100dvh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {sidebar}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          minWidth: 0,
          ml: { xs: 0, md: `${drawerWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          maxWidth: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          transition: theme.transitions.create(['margin-left', 'width', 'max-width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
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
              gap: 1.25,
              px: 1.5,
              bgcolor: sidebarTokens.bg,
              borderBottom: `1px solid ${sidebarTokens.border}`,
              boxShadow: `0 4px 24px ${alpha('#000', 0.35)}`,
            }}
          >
            <IconButton
              aria-label="Open navigation menu"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{
                color: tmColors.neonBlueBright,
                border: `1px solid ${alpha(tmColors.neonBlue, 0.35)}`,
                borderRadius: '3px',
                bgcolor: alpha(tmColors.neonBlue, 0.1),
                '&:hover': {
                  bgcolor: alpha(tmColors.neonBlue, 0.18),
                  borderColor: tmColors.neonBlue,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '3px',
                flexShrink: 0,
                background: sidebarTokens.brandGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
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
                color: sidebarTokens.textBright,
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
