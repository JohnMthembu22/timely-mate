import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Divider, Grid, Link, Stack, Typography, useTheme } from '@mui/material';
import { tmColors } from '../../theme/designTokens';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', to: '/features' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Integrations', to: '/integrations' },
    { label: 'Updates', to: '/updates' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Contact', to: '/contact' },
  ],
  Resources: [
    { label: 'Documentation', to: '/documentation' },
    { label: 'Help Center', to: '/help-center' },
    { label: 'API', to: '/api' },
    { label: 'Community', to: '/community' },
  ],
  Legal: [
    { label: 'Privacy', to: '/privacy' },
    { label: 'Terms', to: '/terms' },
    { label: 'Security', to: '/security' },
    { label: 'Compliance', to: '/compliance' },
  ],
} as const;

const MarketingFooter: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: isDark ? tmColors.charcoal900 : 'background.paper',
        borderTop: '1px solid',
        borderColor: isDark ? tmColors.borderSubtle : 'divider',
        py: { xs: 5, md: 7 },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5, letterSpacing: '-0.02em' }}>
              Timely Mate
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, maxWidth: 320, lineHeight: 1.7 }}
            >
              The all-in-one platform for time tracking, project management, HR, and workforce
              operations.
            </Typography>
          </Grid>

          {(Object.entries(FOOTER_LINKS) as [keyof typeof FOOTER_LINKS, typeof FOOTER_LINKS.Product][]).map(
            ([title, links]) => (
              <Grid item xs={6} sm={3} md={2} key={title}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  {title}
                </Typography>
                <Stack spacing={1}>
                  {links.map((link) => (
                    <Link
                      key={link.to}
                      component={RouterLink}
                      to={link.to}
                      underline="hover"
                      color="text.secondary"
                      sx={{ fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            )
          )}
        </Grid>

        <Divider sx={{ my: { xs: 3, md: 4 } }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {year} Timely Mate. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            <Link
              component={RouterLink}
              to="/privacy"
              underline="hover"
              color="text.secondary"
              variant="body2"
            >
              Privacy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              underline="hover"
              color="text.secondary"
              variant="body2"
            >
              Terms
            </Link>
            <Link
              component={RouterLink}
              to="/security"
              underline="hover"
              color="text.secondary"
              variant="body2"
            >
              Security
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default MarketingFooter;
