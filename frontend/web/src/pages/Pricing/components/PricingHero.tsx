import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Fade,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckIcon,
  Savings as SavingsIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import { tmGradients } from '../../../theme/designTokens';
import { PricingBillingToggle } from './PricingBillingToggle';
import { PricingHeroTierCard } from './PricingHeroTierCard';

const HERO_STATS = [
  { icon: <CheckIcon fontSize="small" />, label: 'Free for up to 5 employees' },
  { icon: <SavingsIcon fontSize="small" />, label: 'From R59 / user / month' },
  { icon: <VerifiedIcon fontSize="small" />, label: '30-day trial on paid plans' },
];

type PricingHeroProps = {
  visible: boolean;
  isAnnual: boolean;
  onBillingChange: (annual: boolean) => void;
  isAuthenticated: boolean;
  currentPlanName?: string;
};

export const PricingHero: React.FC<PricingHeroProps> = ({
  visible,
  isAnnual,
  onBillingChange,
  isAuthenticated,
  currentPlanName,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      aria-label="Pricing hero"
      sx={{
        position: 'relative',
        background: tmGradients.heroDark,
        color: '#fff',
        pt: { xs: 6, sm: 8, md: 10 },
        pb: { xs: 8, sm: 10, md: 12 },
        overflow: 'hidden',
      }}
    >
      {/* Decorative orbs */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: { xs: 180, md: 280 },
              height: { xs: 180, md: 280 },
              borderRadius: '50%',
              background: alpha('#fff', 0.04),
              top: `${15 + i * 18}%`,
              left: `${5 + i * 22}%`,
              animation: `pricingFloat ${6 + i}s ease-in-out infinite`,
              '@keyframes pricingFloat': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-16px)' },
              },
            }}
          />
        ))}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '50%',
            height: '80%',
            background: `radial-gradient(circle, ${alpha('#38bdf8', 0.25)} 0%, transparent 70%)`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-30%',
            left: '-15%',
            width: '45%',
            height: '70%',
            background: `radial-gradient(circle, ${alpha('#34d399', 0.15)} 0%, transparent 70%)`,
          }}
        />
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid item xs={12} md={7}>
            <Fade in={visible} timeout={700}>
              <Box>
                <Chip
                  icon={<SparkleIcon sx={{ fontSize: '16px !important', color: '#fff !important' }} />}
                  label="Simple, transparent pricing"
                  sx={{
                    mb: 2.5,
                    fontWeight: 600,
                    color: '#fff',
                    bgcolor: alpha('#fff', 0.12),
                    border: `1px solid ${alpha('#fff', 0.25)}`,
                    backdropFilter: 'blur(8px)',
                  }}
                />

                <Typography
                  component="h1"
                  variant="h1"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem', lg: '3.75rem' },
                    lineHeight: 1.08,
                    letterSpacing: '-0.04em',
                    mb: 2.5,
                    background: 'linear-gradient(to right, #ffffff 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Plans that scale with your workforce
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.92,
                    fontWeight: 400,
                    fontSize: { xs: '1.05rem', md: '1.2rem' },
                    lineHeight: 1.65,
                    maxWidth: 560,
                    mb: 3.5,
                  }}
                >
                  One platform for time tracking, projects, HR, and field operations. Start free,
                  upgrade as your team grows — no hidden fees.
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  {!isAuthenticated ? (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate('/signup')}
                        sx={{
                          py: 1.5,
                          px: 3,
                          borderRadius: 2.5,
                          fontWeight: 700,
                          textTransform: 'none',
                          bgcolor: '#fff',
                          color: theme.palette.primary.dark,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                          '&:hover': { bgcolor: alpha('#fff', 0.92) },
                        }}
                      >
                        Start free
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => {
                          document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        sx={{
                          py: 1.5,
                          px: 3,
                          borderRadius: 2.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          borderColor: alpha('#fff', 0.5),
                          color: '#fff',
                          '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.08) },
                        }}
                      >
                        Compare plans
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => {
                        document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 2.5,
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: '#fff',
                        color: theme.palette.primary.dark,
                      }}
                    >
                      {currentPlanName ? `View plans · on ${currentPlanName}` : 'View plans'}
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mb: 1.5,
                      opacity: 0.75,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Billing period
                  </Typography>
                  <PricingBillingToggle isAnnual={isAnnual} onChange={onBillingChange} variant="hero" />
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 3 }} flexWrap="wrap">
                  {HERO_STATS.map((stat) => (
                    <Stack key={stat.label} direction="row" spacing={1} alignItems="center">
                      <Box sx={{ color: alpha('#fff', 0.9), display: 'flex' }}>{stat.icon}</Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Fade>
          </Grid>

          <Grid item xs={12} md={5}>
            <Fade in={visible} timeout={1000}>
              <Box>
                <PricingHeroTierCard isAnnual={isAnnual} />
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* Wave transition to page body */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          lineHeight: 0,
          transform: 'translateY(1px)',
        }}
      >
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ width: '100%', height: 56, display: 'block' }}
          aria-hidden
        >
          <path
            fill={theme.palette.mode === 'dark' ? '#080a0f' : '#eef1f7'}
            d="M0,32 C360,80 720,0 1080,32 C1260,48 1380,56 1440,48 L1440,80 L0,80 Z"
          />
        </svg>
      </Box>
    </Box>
  );
};
