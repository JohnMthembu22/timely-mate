import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  Diamond as DiamondIcon,
  People as PeopleIcon,
  RocketLaunch as RocketLaunchIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Cancel as CloseIcon,
} from '@mui/icons-material';
import type { SubscriptionPlan } from '../../../types/subscription';
import { PLAN_ACCENT, PRICING_FEATURE_ROWS } from '../pricingData';
import { tmColors } from '../../../theme/designTokens';

const PLAN_ICONS: Record<string, React.ReactElement> = {
  enterprise: <DiamondIcon sx={{ fontSize: 28 }} />,
  professional: <WorkspacePremiumIcon sx={{ fontSize: 28 }} />,
  starter: <RocketLaunchIcon sx={{ fontSize: 28 }} />,
  free: <PeopleIcon sx={{ fontSize: 28 }} />,
};

const CTA_ICONS: Record<string, React.ReactElement> = {
  enterprise: <BusinessIcon />,
  professional: <TrendingUpIcon />,
  starter: <RocketLaunchIcon />,
  free: <PeopleIcon />,
};

type PricingPlanCardProps = {
  plan: SubscriptionPlan;
  isAnnual: boolean;
  isCurrent: boolean;
  isHighlighted: boolean;
  isSelecting: boolean;
  buttonLabel: string;
  onSelect: () => void;
  formatPrice: (plan: SubscriptionPlan) => string;
  billingSuffix: (plan: SubscriptionPlan) => string;
};

export const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
  plan,
  isAnnual,
  isCurrent,
  isHighlighted,
  isSelecting,
  buttonLabel,
  onSelect,
  formatPrice,
  billingSuffix,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = PLAN_ACCENT[plan.id] ?? PLAN_ACCENT.starter;
  const isFeatured = Boolean(plan.isPopular) || isHighlighted;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 4,
        overflow: 'visible',
        bgcolor: isDark ? alpha(tmColors.charcoal850, 0.65) : alpha('#fff', 0.92),
        backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: isFeatured
          ? alpha(accent.glow, 0.8)
          : isDark
            ? tmColors.borderSubtle
            : tmColors.lightBorder,
        boxShadow: isFeatured
          ? `0 24px 64px -16px ${accent.glow}, inset 0 1px 0 ${alpha('#fff', isDark ? 0.08 : 0.6)}`
          : isDark
            ? '0 12px 40px rgba(0,0,0,0.25)'
            : '0 12px 40px rgba(15, 23, 42, 0.06)',
        transform: isFeatured ? { xs: 'none', lg: 'scale(1.03)' } : 'none',
        zIndex: isFeatured ? 2 : 1,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease',
        '&:hover': {
          transform: isFeatured ? { xs: 'translateY(-4px)', lg: 'scale(1.05)' } : 'translateY(-6px)',
          boxShadow: `0 28px 72px -12px ${accent.glow}`,
        },
        '&::before': isFeatured
          ? {
              content: '""',
              position: 'absolute',
              inset: -1,
              borderRadius: 4,
              padding: 1,
              background: accent.gradient,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
            }
          : undefined,
      }}
    >
      {(plan.isPopular || isHighlighted) && (
        <Box
          sx={{
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 2,
            py: 0.5,
            borderRadius: 999,
            background: accent.gradient,
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            boxShadow: `0 8px 24px ${accent.glow}`,
            zIndex: 3,
          }}
        >
          <StarIcon sx={{ fontSize: 16 }} />
          {isHighlighted ? 'Recommended' : 'Most popular'}
        </Box>
      )}

      <Box
        sx={{
          pt: isFeatured ? 4 : 3,
          pb: 2,
          px: 3,
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: isDark ? tmColors.borderSubtle : 'divider',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            background: isFeatured ? accent.gradient : accent.iconBg,
            color: isFeatured ? '#fff' : theme.palette.primary.main,
            boxShadow: isFeatured ? `0 12px 32px ${accent.glow}` : 'none',
          }}
        >
          {PLAN_ICONS[plan.id] ?? <PeopleIcon sx={{ fontSize: 28 }} />}
        </Box>
        <Typography variant="overline" sx={{ letterSpacing: '0.14em', color: 'text.secondary' }}>
          {plan.targetAudience}
        </Typography>
        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em', mt: 0.5 }}>
          {plan.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 40, lineHeight: 1.5 }}>
          {plan.description}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, px: 3, py: 3 }}>
        <Box textAlign="center" mb={2.5}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              letterSpacing: '-0.03em',
              background: isFeatured ? accent.gradient : 'none',
              WebkitBackgroundClip: isFeatured ? 'text' : 'unset',
              WebkitTextFillColor: isFeatured ? 'transparent' : 'unset',
            }}
          >
            {formatPrice(plan)}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {billingSuffix(plan)}
          </Typography>
          {isAnnual && plan.price > 0 && (
            <Chip
              label={`Save R${(plan.price * 12 * 0.15).toFixed(0)} / year`}
              size="small"
              sx={{
                mt: 1.5,
                fontWeight: 600,
                bgcolor: alpha(tmColors.emerald, 0.12),
                color: tmColors.emeraldDeep,
                border: `1px solid ${alpha(tmColors.emerald, 0.3)}`,
              }}
            />
          )}
        </Box>

        <Divider sx={{ mb: 2, borderColor: isDark ? tmColors.borderSubtle : undefined }} />

        <List dense disablePadding>
          {PRICING_FEATURE_ROWS.map((row) => {
            const enabled = Boolean(plan.features[row.key]);
            return (
              <ListItem key={row.key} disableGutters sx={{ py: 0.4 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {enabled ? (
                    <CheckIcon sx={{ fontSize: 18, color: tmColors.emerald }} />
                  ) : (
                    <CloseIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={row.label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: enabled ? 'text.primary' : 'text.disabled',
                    fontWeight: enabled ? 500 : 400,
                  }}
                />
              </ListItem>
            );
          })}
        </List>

        <Box
          sx={{
            mt: 2.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: isDark ? alpha(tmColors.charcoal800, 0.8) : alpha(theme.palette.primary.main, 0.04),
            border: '1px solid',
            borderColor: isDark ? tmColors.borderSubtle : 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            Up to {plan.maxEmployees === -1 ? 'unlimited' : plan.maxEmployees} employees
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {plan.features.storageGB === -1 ? 'Unlimited' : `${plan.features.storageGB} GB`} storage
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button
          variant={isFeatured ? 'contained' : 'outlined'}
          fullWidth
          size="large"
          disabled={isSelecting || isCurrent}
          onClick={onSelect}
          startIcon={CTA_ICONS[plan.id]}
          sx={{
            py: 1.5,
            borderRadius: 2.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            ...(isFeatured && {
              background: accent.gradient,
              boxShadow: `0 8px 28px ${accent.glow}`,
              '&:hover': {
                background: accent.gradient,
                filter: 'brightness(1.08)',
                boxShadow: `0 12px 36px ${accent.glow}`,
              },
            }),
          }}
        >
          {buttonLabel}
        </Button>
      </CardActions>
    </Card>
  );
};
