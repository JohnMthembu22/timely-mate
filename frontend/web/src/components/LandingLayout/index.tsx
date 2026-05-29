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
  ListItemButton,
  ListItemText,
  Divider,
  alpha,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { mobileMenuButtonSx } from '../../theme/layout';
import MarketingFooter from '../MarketingFooter';
import { tmColors } from '../../theme/designTokens';
import { useAppSelector } from '../../store';

type NavItem = { text: string; href: string; isRoute?: boolean };

const LANDING_NAV: NavItem[] = [
  { text: 'Features', href: '#features' },
  { text: 'How It Works', href: '#how-it-works' },
  { text: 'Testimonials', href: '#testimonials' },
  { text: 'Pricing', href: '/pricing', isRoute: true },
];

const MARKETING_NAV: NavItem[] = [
  { text: 'Features', href: '/features', isRoute: true },
  { text: 'Pricing', href: '/pricing', isRoute: true },
  { text: 'About', href: '/about', isRoute: true },
  { text: 'Contact', href: '/contact', isRoute: true },
];

interface LandingLayoutProps {
  children: React.ReactNode;
  /** Show site footer with product/company links */
  showFooter?: boolean;
  /** Landing uses hash anchors; marketing pages use routes */
  navVariant?: 'landing' | 'marketing';
}

const LandingLayout: React.FC<LandingLayoutProps> = ({
  children,
  showFooter = false,
  navVariant = 'landing',
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme.palette.mode === 'dark';
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const navigationItems = navVariant === 'landing' ? LANDING_NAV : MARKETING_NAV;
  const isPricingPage = location.pathname === '/pricing';

  const toggleMobileMenu = () => setMobileMenuOpen((open) => !open);

  const handleNavigation = (href: string, isRoute?: boolean) => {
    if (isRoute) {
      navigate(href);
      if (isMobile) setMobileMenuOpen(false);
      return;
    }
    if (navVariant === 'landing') {
      const element = document.querySelector(href);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
    if (isMobile) setMobileMenuOpen(false);
  };

  const headerBg = isDark
    ? alpha(tmColors.charcoal900, 0.85)
    : alpha('#ffffff', 0.88);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <AppBar
        component="header"
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: headerBg,
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid',
          borderColor: isDark ? tmColors.borderSubtle : alpha('#000', 0.06),
          transition: 'all 0.3s',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: { xs: 0.5, md: 0.75 }, minHeight: { xs: 56, md: 64 } }}>
            <Typography
              variant="h6"
              component="button"
              onClick={() => navigate('/')}
              sx={{
                flexGrow: 1,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'primary.main',
                fontSize: { xs: '1.15rem', md: '1.35rem' },
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                p: 0,
              }}
            >
              Timely Mate
            </Typography>

            {isMobile ? (
              <IconButton aria-label="Open menu" edge="end" onClick={toggleMobileMenu} sx={mobileMenuButtonSx}>
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                <Stack direction="row" spacing={{ md: 3, lg: 4 }} sx={{ mx: 2 }}>
                  {navigationItems.map((item) => {
                    const active = item.isRoute && location.pathname === item.href;
                    return (
                      <Typography
                        key={item.text}
                        variant="body2"
                        sx={{
                          cursor: 'pointer',
                          color: active ? 'primary.main' : 'text.secondary',
                          fontWeight: active ? 700 : 500,
                          fontSize: { md: '0.9rem', lg: '0.95rem' },
                          position: 'relative',
                          '&:hover': { color: 'primary.main' },
                          ...(active && {
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              bottom: -6,
                              height: 2,
                              borderRadius: 1,
                              bgcolor: 'primary.main',
                            },
                          }),
                        }}
                        onClick={() => handleNavigation(item.href, item.isRoute)}
                      >
                        {item.text}
                      </Typography>
                    );
                  })}
                </Stack>

                <Stack direction="row" spacing={1.5}>
                  {isAuthenticated ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/dashboard')}
                      sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', px: 2.5 }}
                    >
                      Go to dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        color="primary"
                        onClick={() => navigate('/login')}
                        sx={{ fontWeight: 600, textTransform: 'none' }}
                      >
                        Log in
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/signup')}
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', px: 2.5 }}
                      >
                        {isPricingPage ? 'Start free' : 'Sign up'}
                      </Button>
                    </>
                  )}
                </Stack>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: 320,
            boxSizing: 'border-box',
            pt: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ mb: 2, textAlign: 'center' }}>
            Timely Mate
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            {navigationItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => handleNavigation(item.href, item.isRoute)}>
                  <ListItemText primary={item.text} sx={{ textAlign: 'center' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {isAuthenticated ? (
              <Button variant="contained" fullWidth onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button variant="outlined" fullWidth onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                  Log in
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
                  sx={{ borderRadius: 2 }}
                >
                  Sign up
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: '56px', sm: '64px' },
        }}
      >
        {children}
      </Box>

      {showFooter ? <MarketingFooter /> : null}
    </Box>
  );
};

export default LandingLayout;
