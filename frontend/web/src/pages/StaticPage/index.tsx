import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, alpha, useTheme } from '@mui/material';
import LandingLayout from '../../components/LandingLayout';
import StaticPageLayout from './StaticPageLayout';
import { PAGES, pathToKey } from './staticPageContent';
import { tmColors, tmGradients } from '../../theme/designTokens';

const StaticPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const content = useMemo(() => {
    const key = pathToKey(location.pathname);
    return key ? PAGES[key] : null;
  }, [location.pathname]);

  if (!content) {
    return (
      <LandingLayout showFooter navVariant="marketing">
        <Box
          sx={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            background: tmGradients.heroDark,
            color: '#fff',
            pt: 12,
            pb: 8,
          }}
        >
          <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              fontWeight={800}
              gutterBottom
              sx={{
                letterSpacing: '-0.03em',
                background: 'linear-gradient(to right, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Page not found
            </Typography>
            <Typography sx={{ mb: 4, lineHeight: 1.7, opacity: 0.9 }}>
              The page you are looking for does not exist or may have moved.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2.5,
                bgcolor: '#fff',
                color: isDark ? tmColors.neonBlueDeep : theme.palette.primary.dark,
                '&:hover': { bgcolor: alpha('#fff', 0.92) },
              }}
            >
              Back to home
            </Button>
          </Container>
        </Box>
      </LandingLayout>
    );
  }

  return <StaticPageLayout content={content} />;
};

export default StaticPage;
