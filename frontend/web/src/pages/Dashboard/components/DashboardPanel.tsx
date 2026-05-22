import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { glassCardSx } from '../../../theme/surfaces';
import { tmColors } from '../../../theme/designTokens';
import { alpha } from '@mui/material/styles';

export interface DashboardPanelProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Accent stripe color for command-center panels */
  accent?: 'blue' | 'emerald' | 'amber' | 'none';
  noPadding?: boolean;
  sx?: object;
}

export function DashboardPanel({
  title,
  subtitle,
  action,
  children,
  accent = 'none',
  noPadding = false,
  sx = {},
}: DashboardPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accentColor =
    accent === 'emerald'
      ? tmColors.emerald
      : accent === 'amber'
        ? '#fbbf24'
        : accent === 'blue'
          ? tmColors.neonBlue
          : 'transparent';

  return (
    <Box
      sx={{
        ...glassCardSx(theme),
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {accent !== 'none' && (
        <Box
          sx={{
            height: 3,
            background:
              accent === 'blue'
                ? `linear-gradient(90deg, ${tmColors.neonBlueDeep}, ${tmColors.neonBlue})`
                : accent === 'emerald'
                  ? `linear-gradient(90deg, ${tmColors.emeraldDeep}, ${tmColors.emerald})`
                  : `linear-gradient(90deg, #d97706, #fbbf24)`,
          }}
        />
      )}
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: subtitle || action ? 1.25 : 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          borderBottom: `1px solid ${isDark ? tmColors.borderSubtle : theme.palette.divider}`,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary', letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.35, lineHeight: 1.4 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      <Box sx={{ flex: 1, p: noPadding ? 0 : 2, minHeight: 0 }}>{children}</Box>
    </Box>
  );
}

export function panelScrollSx(theme: ReturnType<typeof useTheme>) {
  const isDark = theme.palette.mode === 'dark';
  return {
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    maxHeight: { xs: 280, md: 320 },
    pr: 0.5,
    '&::-webkit-scrollbar': { width: 5 },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 3,
      bgcolor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
    },
  };
}
