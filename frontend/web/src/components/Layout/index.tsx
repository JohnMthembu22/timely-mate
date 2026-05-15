import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, useTheme, useMediaQuery } from '@mui/material';
import Navigation from '../Navigation';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - 240px)` },
          ml: { xs: 0, md: '240px' },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          zIndex: theme.zIndex.drawer + 1,
          pl: isMobile ? '52px' : 0,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Timely Mate
          </Typography>
          <IconButton 
            sx={{ 
              p: { xs: 0.5, sm: 1 },
              '& .MuiAvatar-root': {
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
              }
            }}
          >
            <Avatar alt={user?.fullName} sx={{ bgcolor: 'primary.main' }}>
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Navigation />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - 240px)` },
          ml: { xs: 0, md: '240px' },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: '56px', sm: '64px' },
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 3 },
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: { sm: '600px', md: '900px', lg: '1200px', xl: '1400px' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
