import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  Diamond as DiamondIcon,
  Groups as GroupsIcon,
  People as PeopleIcon,
  RocketLaunch as RocketLaunchIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import type { SubscriptionPlan } from '../../../types/subscription';
import { SUBSCRIPTION_PLANS } from '../../../types/subscription';
import { PLAN_ACCENT } from '../pricingData';
import { tmColors, tmGradients } from '../../../theme/designTokens';

const PLAN_ICONS: Record<string, React.ReactElement> = {
  enterprise: <DiamondIcon sx={{ fontSize: 32 }} />,
  professional: <WorkspacePremiumIcon sx={{ fontSize: 32 }} />,
  starter: <RocketLaunchIcon sx={{ fontSize: 32 }} />,
  free: <PeopleIcon sx={{ fontSize: 32 }} />,
};

type PricingCurrentSubscriptionProps = {
  plan: SubscriptionPlan;
  employeeCount: number;
  companyName?: string;
  isAnnual: boolean;
  visible: boolean;
};

export const PricingCurrentSubscription: React.FC<PricingCurrentSubscriptionProps> = ({
  plan,
  employeeCount,
  companyName,
  isAnnual,
  visible,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const accent = PLAN_ACCENT[plan.id] ?? PLAN_ACCENT.starter;

  const currentIdx = SUBSCRIPTION_PLANS.findIndex((p) => p.id === plan.id);
  const nextPlan = currentIdx >= 0 && currentIdx < SUBSCRIPTION_PLANS.length - 1
    ? SUBSCRIPTION_PLANS[currentIdx + 1]
    : null;

  const hasCapacityLimit = plan.maxEmployees > 0;
  const capacityPct = hasCapacityLimit
    ? Math.min(100, Math.round((employeeCount / plan.maxEmployees) * 100))
    : 0;
  const isNearCapacity = hasCapacityLimit && capacityPct >= 80;
  const isOverCapacity = hasCapacityLimit && employeeCount > plan.maxEmployees;

  const billingLabel =
    plan.price === 0
      ? 'Free forever'
      : isAnnual
        ? `R${Math.round(plan.price * 12 * 0.85).toLocaleString('en-ZA')} / user / year`
        : `R${plan.price.toLocaleString('en-ZA')} / user / month`;

  const scrollToPlans = () => {
    document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Paper
      component="section"
      aria-label="Your current subscription"
      elevation={0}
      sx={{
        mb: { xs: 5, md: 6 },
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        bgcolor: isDark ? alpha(tmColors.charcoal850, 0.85) : '#fff',
        border: '1px solid',
        borderColor: isDark ? alpha(accent.glow, 0.35) : alpha(theme.palette.primary.main, 0.18),
        boxShadow: isDark
          ? `0 24px 64px -24px ${accent.glow}, inset 0 1px 0 ${alpha('#fff', 0.06)}`
          : `0 24px 64px -20px ${alpha(accent.glow, 0.55)}, 0 1px 0 ${alpha('#fff', 0.8)} inset`,
      }}
    >
      {/* Top accent bar */}
      <Box
        sx={{
          height: 4,
          background: accent.gradient,
        }}
      />

      <Box sx={{ position: 'relative' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: { xs: 3, sm: 3.5, md: 4 },
            pt: { xs: 3, sm: 3.5, md: 4 },
            pb: 0,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography
              variant="overline"
              sx={{
                letterSpacing: '0.12em',
                fontWeight: 700,
                color: 'text.secondary',
                lineHeight: 1.2,
              }}
            >
              Your subscription
            </Typography>
            <Chip
              icon={<CheckIcon sx={{ fontSize: '16px !important' }} />}
              label="Active"
              size="small"
              sx={{
                height: 24,
                fontWeight: 700,
                bgcolor: alpha(tmColors.emerald, isDark ? 0.18 : 0.12),
                color: isDark ? tmColors.emeraldBright : tmColors.emeraldDeep,
                border: `1px solid ${alpha(tmColors.emerald, 0.35)}`,
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          </Stack>

          <Button
            variant="text"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/settings')}
            sx={{
              flexShrink: 0,
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.06) },
            }}
          >
            Manage
          </Button>
        </Stack>

      <Box
        sx={{
          p: { xs: 3, sm: 3.5, md: 4 },
          pt: { xs: 2, sm: 2.5 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr auto' },
          gap: { xs: 3, lg: 4 },
          alignItems: { lg: 'center' },
        }}
      >
        {/* Plan identity */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'flex-start' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: accent.gradient,
              color: '#fff',
              boxShadow: `0 12px 32px -8px ${accent.glow}`,
            }}
          >
            {PLAN_ICONS[plan.id] ?? PLAN_ICONS.starter}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                mb: 0.75,
                fontSize: { xs: '1.65rem', sm: '2rem' },
              }}
            >
              {plan.name}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mb: 1.5 }}>
              {plan.description}
            </Typography>

            {companyName && (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {companyName}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Metrics & actions */}
        <Stack spacing={2.5} sx={{ minWidth: { lg: 320 }, width: { xs: '100%', lg: 'auto' } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1.5,
            }}
          >
            <MetricTile
              icon={<GroupsIcon fontSize="small" />}
              label="Team size"
              value={`${employeeCount}${hasCapacityLimit ? ` / ${plan.maxEmployees}` : ''}`}
              sublabel={hasCapacityLimit ? 'employees on record' : 'unlimited capacity'}
              accent={accent.glow}
              isDark={isDark}
            />
            <MetricTile
              icon={<TrendingUpIcon fontSize="small" />}
              label="Billing"
              value={billingLabel}
              sublabel={plan.price === 0 ? 'No card required' : 'Per active user'}
              accent={accent.glow}
              isDark={isDark}
            />
          </Box>

          {hasCapacityLimit && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Seat usage
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: isOverCapacity
                      ? theme.palette.error.main
                      : isNearCapacity
                        ? theme.palette.warning.main
                        : 'text.secondary',
                  }}
                >
                  {capacityPct}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={capacityPct}
                sx={{
                  height: 8,
                  borderRadius: 99,
                  bgcolor: isDark ? alpha('#fff', 0.08) : alpha(theme.palette.primary.main, 0.08),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 99,
                    background: isOverCapacity
                      ? theme.palette.error.main
                      : isNearCapacity
                        ? theme.palette.warning.main
                        : accent.gradient,
                  },
                }}
              />
              {(isNearCapacity || isOverCapacity) && nextPlan && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {isOverCapacity
                    ? `You're over the ${plan.name} limit — consider ${nextPlan.name}.`
                    : `Approaching your limit — ${nextPlan.name} supports up to ${nextPlan.maxEmployees === -1 ? 'unlimited' : nextPlan.maxEmployees} employees.`}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </Box>

      {nextPlan && (
        <Box
          sx={{
            px: { xs: 3, sm: 3.5, md: 4 },
            pb: { xs: 3, sm: 3.5, md: 4 },
          }}
        >
          <Button
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            onClick={scrollToPlans}
            sx={{
              py: 1.5,
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              background: tmGradients.buttonPrimary,
              boxShadow: `0 8px 24px -8px ${accent.glow}`,
              '&:hover': {
                background: tmGradients.buttonPrimaryHover,
                filter: 'brightness(1.05)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Upgrade to {nextPlan.name}
          </Button>
        </Box>
      )}
      </Box>
    </Paper>
  );
};

type MetricTileProps = {
  icon: React.ReactElement;
  label: string;
  value: string;
  sublabel: string;
  accent: string;
  isDark: boolean;
};

const MetricTile: React.FC<MetricTileProps> = ({ icon, label, value, sublabel, accent, isDark }) => (
  <Box
    sx={{
      p: 1.75,
      borderRadius: 2.5,
      border: '1px solid',
      borderColor: isDark ? tmColors.borderSubtle : alpha('#0f172a', 0.08),
      bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#fff', 0.7),
    }}
  >
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(accent, isDark ? 0.2 : 0.12),
          color: isDark ? tmColors.neonBlue : tmColors.neonBlueDeep,
        }}
      >
        {icon}
      </Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: '0.04em' }}>
        {label}
      </Typography>
    </Stack>
    <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.25, mb: 0.25 }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {sublabel}
    </Typography>
  </Box>
);
