import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Button, 
  Container, 
  Toolbar, 
  Typography, 
  useTheme,
  Stack,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

interface LandingLayoutProps {
  children: React.ReactNode;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { text: 'Features', href: '#features' },
    { text: 'How It Works', href: '#how-it-works' },
    { text: 'Testimonials', href: '#testimonials' },
    { text: 'Pricing', href: '/pricing', isRoute: true }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (href: string, isRoute?: boolean) => {
    if (isRoute) {
      // Navigate with state to allow access to pricing page
      navigate(href, { state: { fromLandingPage: true } });
      if (isMobile) {
        setMobileMenuOpen(false);
      }
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: { xs: 1, md: 1 } }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
              }}
            >
              Timely Mate
            </Typography>

            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="end"
                onClick={toggleMobileMenu}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                <Stack direction="row" spacing={4} sx={{ mx: 4 }}>
                  {navigationItems.map((item, index) => (
                    <Typography 
                      key={index}
                      variant="body1" 
                      sx={{ 
                        cursor: 'pointer', 
                        color: 'primary.main',
                        '&:hover': { color: 'primary.dark' },
                        fontWeight: 500,
                        fontSize: { sm: '0.9rem', md: '1rem' }
                      }}
                      onClick={() => handleNavigation(item.href, (item as any).isRoute)}
                    >
                      {item.text}
                    </Typography>
                  ))}
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Button 
                    color="primary" 
                    onClick={() => navigate('/login')}
                    sx={{ 
                      fontWeight: 500,
                      fontSize: { sm: '0.85rem', md: '0.9rem' },
                      color: 'primary.main',
                      '&:hover': { color: 'primary.dark' }
                    }}
                  >
                    Log In
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/signup')}
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 500,
                      fontSize: { sm: '0.85rem', md: '0.9rem' }
                    }}
                  >
                    Sign Up
                  </Button>
                </Stack>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: '75%',
            maxWidth: '300px',
            boxSizing: 'border-box',
            paddingTop: 2
          },
        }}
      >
        <Box sx={{ textAlign: 'center', px: 2, py: 3 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: 2
            }}
          >
            Timely Mate
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {navigationItems.map((item, index) => (
              <ListItem 
                button 
                key={index} 
                onClick={() => handleNavigation(item.href, (item as any).isRoute)}
              >
                <ListItemText 
                  primary={item.text} 
                  sx={{ textAlign: 'center', color: 'primary.main' }}
                />
              </ListItem>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2 }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                sx={{ color: 'primary.main', borderColor: 'primary.main', '&:hover': { borderColor: 'primary.dark', color: 'primary.dark' } }}
              >
                Log In
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={() => {
                  navigate('/signup');
                  setMobileMenuOpen(false);
                }}
                sx={{ borderRadius: 2 }}
              >
                Sign Up
              </Button>
            </Box>
          </List>
        </Box>
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          pt: { xs: '56px', sm: '64px' } // Offset for fixed AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default LandingLayout; 