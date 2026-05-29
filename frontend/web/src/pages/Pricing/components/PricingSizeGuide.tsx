import React from 'react';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Diamond as DiamondIcon,
  Groups as GroupsIcon,
  People as PeopleIcon,
  RocketLaunch as RocketLaunchIcon,
  TrendingUp as TrendingUpIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import { COMPANY_SIZE_TIERS, PLAN_ACCENT } from '../pricingData';
import { tmColors, tmGradients } from '../../../theme/designTokens';

const TIER_ICONS: Record<string, React.ReactElement> = {
  free: <PeopleIcon sx={{ fontSize: 22 }} />,
  starter: <RocketLaunchIcon sx={{ fontSize: 22 }} />,
  professional: <WorkspacePremiumIcon sx={{ fontSize: 22 }} />,
  enterprise: <DiamondIcon sx={{ fontSize: 22 }} />,
};

export const PricingSizeGuide: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      component="section"
      aria-label="Company size pricing guide"
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        bgcolor: isDark ? alpha(tmColors.charcoal850, 0.75) : '#fff',
        border: '1px solid',
        borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
        boxShadow: isDark
          ? '0 24px 64px rgba(0,0,0,0.35)'
          : '0 24px 64px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Box sx={{ height: 4, background: tmGradients.heroAccent }} />

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 5 }}
          alignItems={{ md: 'flex-start' }}
          sx={{ mb: { xs: 4, md: 5 } }}
        >
          <Box sx={{ flex: 1, maxWidth: { md: 420 } }}>
            <Chip
              icon={<GroupsIcon sx={{ fontSize: '16px !important' }} />}
              label="Team size guide"
              size="small"
              sx={{
                mb: 2,
                fontWeight: 700,
                bgcolor: isDark ? alpha(tmColors.neonBlue, 0.12) : alpha(theme.palette.primary.main, 0.08),
                color: isDark ? tmColors.neonBlue : theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            />
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                mb: 1.5,
                fontSize: { xs: '1.75rem', md: '2.125rem' },
              }}
            >
              Right-sized for every stage
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2.5 }}>
              Pricing follows team size so you only pay for the capacity you need — from your first
              five hires to enterprise scale.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendingUpIcon sx={{ fontSize: 18, color: isDark ? tmColors.emeraldBright : tmColors.emeraldDeep }} />
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Upgrade only when headcount grows — no wasted seats.
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              gap: 1,
              minWidth: 200,
              p: 2.5,
              borderRadius: 3,
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha(theme.palette.primary.main, 0.04),
              border: '1px solid',
              borderColor: isDark ? tmColors.borderSubtle : alpha(theme.palette.primary.main, 0.12),
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em', fontWeight: 700 }}>
              How it works
            </Typography>
            {['Count active employees', 'Match to a tier', 'Pay per seat'].map((step, i) => (
              <Stack key={step} direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
                    color: isDark ? tmColors.neonBlue : theme.palette.primary.main,
                  }}
                >
                  {i + 1}
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {step}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Stack>

        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: 36,
              left: '12.5%',
              right: '12.5%',
              height: 2,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${alpha('#94a3b8', 0.4)}, ${alpha('#38bdf8', 0.6)}, ${alpha('#818cf8', 0.5)}, ${alpha('#f59e0b', 0.5)})`,
            }}
          />

          <Grid container spacing={2}>
            {COMPANY_SIZE_TIERS.map((tier, index) => {
              const accent = PLAN_ACCENT[tier.id] ?? PLAN_ACCENT.starter;
              const isLast = index === COMPANY_SIZE_TIERS.length - 1;

              return (
                <Grid item xs={12} sm={6} md={3} key={tier.id}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: '100%',
                      p: 2.5,
                      borderRadius: 3,
                      textAlign: 'center',
                      bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.85),
                      border: '1px solid',
                      borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        borderColor: alpha(accent.glow, 0.55),
                        boxShadow: `0 20px 48px -16px ${accent.glow}`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: accent.gradient,
                        color: '#fff',
                        boxShadow: `0 8px 24px -8px ${accent.glow}`,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {TIER_ICONS[tier.id] ?? TIER_ICONS.starter}
                    </Box>

                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        display: 'inline-block',
                        px: 1.25,
                        py: 0.25,
                        mb: 1,
                        borderRadius: 99,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        bgcolor: alpha(accent.glow, isDark ? 0.15 : 0.1),
                        color: isDark ? '#e2e8f0' : theme.palette.text.primary,
                      }}
                    >
                      {tier.label}
                    </Typography>

                    <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                      {tier.range}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                      {tier.plan}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      from {tier.price}/user
                    </Typography>

                    {!isLast && (
                      <Box
                        sx={{
                          display: { xs: 'block', md: 'none' },
                          position: 'absolute',
                          bottom: -14,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 2,
                          height: 20,
                          bgcolor: alpha(accent.glow, 0.5),
                          borderRadius: 99,
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};
