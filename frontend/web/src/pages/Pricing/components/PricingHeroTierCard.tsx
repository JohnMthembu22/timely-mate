import React from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Diamond as DiamondIcon,
  People as PeopleIcon,
  Public as PublicIcon,
  RocketLaunch as RocketLaunchIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  VerifiedUser as VerifiedIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import { SUBSCRIPTION_PLANS } from '../../../types/subscription';
import { PLAN_ACCENT } from '../pricingData';
import { tmColors } from '../../../theme/designTokens';

const PLAN_ICONS: Record<string, React.ReactElement> = {
  enterprise: <DiamondIcon sx={{ fontSize: 20 }} />,
  professional: <WorkspacePremiumIcon sx={{ fontSize: 20 }} />,
  starter: <RocketLaunchIcon sx={{ fontSize: 20 }} />,
  free: <PeopleIcon sx={{ fontSize: 20 }} />,
};

const TRUST_POINTS = [
  { icon: <BankIcon sx={{ fontSize: 16 }} />, label: 'EFT & card payments' },
  { icon: <VerifiedIcon sx={{ fontSize: 16 }} />, label: 'POPIA-ready' },
  { icon: <PublicIcon sx={{ fontSize: 16 }} />, label: 'ZAR-native billing' },
];

type PricingHeroTierCardProps = {
  isAnnual: boolean;
};

const formatTierPrice = (price: number, isAnnual: boolean) => {
  if (price === 0) return { display: 'R0', original: null as string | null };
  const monthly = isAnnual ? Math.round(price * 0.85) : price;
  return {
    display: `R${monthly.toLocaleString('en-ZA')}`,
    original: isAnnual ? `R${price.toLocaleString('en-ZA')}` : null,
  };
};

export const PricingHeroTierCard: React.FC<PricingHeroTierCardProps> = ({ isAnnual }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 4,
        p: '1px',
        background: `linear-gradient(145deg, ${alpha('#fff', 0.45)} 0%, ${alpha('#38bdf8', 0.35)} 45%, ${alpha('#34d399', 0.25)} 100%)`,
        boxShadow: '0 32px 80px -24px rgba(0,0,0,0.45)',
      }}
    >
      <Box
        sx={{
          borderRadius: 3.75,
          overflow: 'hidden',
          bgcolor: alpha('#0f172a', 0.55),
          backdropFilter: 'blur(24px)',
          border: `1px solid ${alpha('#fff', 0.12)}`,
        }}
      >
        {/* Header band */}
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: 2.5,
            background: `linear-gradient(135deg, ${alpha('#fff', 0.1)} 0%, ${alpha('#38bdf8', 0.08)} 100%)`,
            borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
            <Chip
              size="small"
              icon={<PublicIcon sx={{ fontSize: '15px !important', color: '#fff !important' }} />}
              label="Built for SA teams"
              sx={{
                height: 26,
                fontWeight: 700,
                color: '#fff',
                bgcolor: alpha('#fff', 0.1),
                border: `1px solid ${alpha('#fff', 0.22)}`,
                '& .MuiChip-icon': { ml: 0.75 },
              }}
            />
            {isAnnual && (
              <Chip
                size="small"
                label="15% annual savings"
                sx={{
                  height: 26,
                  fontWeight: 700,
                  color: tmColors.emeraldBright,
                  bgcolor: alpha(tmColors.emerald, 0.16),
                  border: `1px solid ${alpha(tmColors.emerald, 0.35)}`,
                }}
              />
            )}
          </Stack>

          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              mb: 0.75,
              fontSize: { xs: '1.35rem', md: '1.5rem' },
            }}
          >
            Pay per person, not per feature
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.82, lineHeight: 1.6, maxWidth: 360 }}>
            One seat price covers the full platform — time, projects, HR, and field ops. Scale
            headcount without unlocking add-ons.
          </Typography>
        </Box>

        {/* Tier ladder */}
        <Box sx={{ p: { xs: 2, md: 2.5 }, position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 34, md: 38 },
              top: 28,
              bottom: 28,
              width: 2,
              borderRadius: 99,
              background: `linear-gradient(to bottom, ${alpha('#94a3b8', 0.5)}, ${alpha('#38bdf8', 0.6)}, ${alpha('#f59e0b', 0.5)})`,
              opacity: 0.45,
            }}
          />

          <Stack spacing={1.25}>
            {SUBSCRIPTION_PLANS.map((plan) => {
              const accent = PLAN_ACCENT[plan.id] ?? PLAN_ACCENT.starter;
              const { display, original } = formatTierPrice(plan.price, isAnnual);
              const isFeatured = Boolean(plan.isPopular);

              return (
                <Box
                  key={plan.id}
                  sx={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 1.5,
                    alignItems: 'center',
                    p: 1.5,
                    pl: 1.25,
                    borderRadius: 2.5,
                    bgcolor: isFeatured ? alpha('#fff', 0.1) : alpha('#fff', 0.04),
                    border: '1px solid',
                    borderColor: isFeatured ? alpha(accent.glow, 0.65) : alpha('#fff', 0.08),
                    boxShadow: isFeatured ? `0 12px 32px -16px ${accent.glow}` : 'none',
                    transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      bgcolor: alpha('#fff', 0.08),
                      borderColor: alpha(accent.glow, 0.5),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: accent.gradient,
                      color: '#fff',
                      boxShadow: `0 6px 16px -6px ${accent.glow}`,
                      zIndex: 1,
                    }}
                  >
                    {PLAN_ICONS[plan.id] ?? PLAN_ICONS.starter}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ mb: 0.25 }}>
                      <Typography variant="body2" fontWeight={800} noWrap>
                        {plan.name}
                      </Typography>
                      {isFeatured && (
                        <Chip
                          size="small"
                          icon={<StarIcon sx={{ fontSize: '14px !important', color: '#fbbf24 !important' }} />}
                          label="Popular"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: alpha('#fbbf24', 0.15),
                            color: '#fde68a',
                            border: `1px solid ${alpha('#fbbf24', 0.35)}`,
                            '& .MuiChip-icon': { ml: 0.5 },
                          }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ opacity: 0.72, display: 'block' }}>
                      {plan.targetAudience} employees
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Stack direction="row" spacing={0.5} alignItems="baseline" justifyContent="flex-end">
                      {original && (
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.55,
                            textDecoration: 'line-through',
                            fontWeight: 600,
                          }}
                        >
                          {original}
                        </Typography>
                      )}
                      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1 }}>
                        {display}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ opacity: 0.65, whiteSpace: 'nowrap' }}>
                      {plan.price === 0 ? 'forever' : '/ user / mo'}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: 2,
            borderTop: `1px solid ${alpha('#fff', 0.1)}`,
            background: alpha('#000', 0.15),
          }}
        >
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <TrendingUpIcon sx={{ fontSize: 18, color: tmColors.emeraldBright }} />
            <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.9 }}>
              Every tier includes mobile & web apps — no feature gates
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} flexWrap="wrap">
            {TRUST_POINTS.map((point) => (
              <Stack key={point.label} direction="row" spacing={0.75} alignItems="center">
                <Box
                  sx={{
                    color: alpha('#fff', 0.85),
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {point.icon}
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.78, fontWeight: 600 }}>
                  {point.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
