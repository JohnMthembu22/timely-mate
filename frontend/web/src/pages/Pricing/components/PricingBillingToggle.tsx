import React from 'react';
import { Box, Chip, Typography, alpha, useTheme } from '@mui/material';
import { tmColors } from '../../../theme/designTokens';

type PricingBillingToggleProps = {
  isAnnual: boolean;
  onChange: (annual: boolean) => void;
  /** Light styling for dark hero backgrounds */
  variant?: 'default' | 'hero';
};

export const PricingBillingToggle: React.FC<PricingBillingToggleProps> = ({
  isAnnual,
  onChange,
  variant = 'default',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const onHero = variant === 'hero';

  return (
    <Box
      role="group"
      aria-label="Billing period"
      sx={{
        display: 'inline-flex',
        p: 0.75,
        borderRadius: 999,
        bgcolor: onHero
          ? alpha('#fff', 0.12)
          : isDark
            ? alpha(tmColors.charcoal800, 0.9)
            : alpha('#fff', 0.85),
        border: '1px solid',
        borderColor: onHero ? alpha('#fff', 0.25) : isDark ? tmColors.borderSubtle : tmColors.lightBorder,
        boxShadow: onHero ? 'none' : isDark ? '0 8px 32px rgba(0,0,0,0.35)' : '0 8px 32px rgba(15, 23, 42, 0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {(['monthly', 'annual'] as const).map((mode) => {
        const selected = mode === 'annual' ? isAnnual : !isAnnual;
        return (
          <Box
            key={mode}
            component="button"
            type="button"
            onClick={() => onChange(mode === 'annual')}
            sx={{
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: { xs: 2, sm: 3 },
              py: 1.25,
              borderRadius: 999,
              transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
              bgcolor: selected
                ? onHero
                  ? alpha('#fff', 0.22)
                  : isDark
                    ? alpha(tmColors.neonBlue, 0.2)
                    : theme.palette.primary.main
                : 'transparent',
              color: selected
                ? onHero
                  ? '#fff'
                  : isDark
                    ? tmColors.neonBlue
                    : '#fff'
                : onHero
                  ? alpha('#fff', 0.75)
                  : 'text.secondary',
              boxShadow:
                selected && !isDark && !onHero
                  ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`
                  : 'none',
              '&:hover': {
                bgcolor: selected
                  ? undefined
                  : onHero
                    ? alpha('#fff', 0.1)
                    : isDark
                      ? alpha(tmColors.glassHighlight, 0.5)
                      : alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <Typography variant="body2" fontWeight={selected ? 700 : 500} sx={{ textTransform: 'capitalize' }}>
              {mode}
            </Typography>
            {mode === 'annual' && (
              <Chip
                label="Save 15%"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: selected
                    ? onHero
                      ? alpha('#34d399', 0.3)
                      : isDark
                        ? alpha(tmColors.emerald, 0.25)
                        : alpha('#fff', 0.25)
                    : onHero
                      ? alpha('#34d399', 0.2)
                      : alpha(tmColors.emerald, 0.15),
                  color: onHero || (selected && !isDark) ? '#fff' : tmColors.emeraldDeep,
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};
