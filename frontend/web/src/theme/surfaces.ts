import type { SxProps, Theme } from '@mui/material/styles';
import { tmColors, tmMotion, tmShadows, tmShape } from './designTokens';

/** Glassmorphism card surface — theme-aware */
export function glassCardSx(theme: Theme): SxProps<Theme> {
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: `${tmShape.cardRadius}px`,
    bgcolor: isDark ? tmColors.glassBg : tmColors.lightPaper,
    border: '1px solid',
    borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
    boxShadow: isDark ? tmShadows.card : tmShadows.lightCard,
    backdropFilter: isDark ? 'blur(16px)' : 'none',
    WebkitBackdropFilter: isDark ? 'blur(16px)' : 'none',
    transition: `box-shadow ${tmMotion.durationNormal} ${tmMotion.easeOut}, border-color ${tmMotion.durationNormal} ${tmMotion.easeOut}, background-color ${tmMotion.durationNormal} ${tmMotion.easeOut}, transform ${tmMotion.durationFast} ${tmMotion.easeOut}`,
    '&:hover': {
      bgcolor: isDark ? tmColors.glassBgHover : tmColors.lightPaper,
      borderColor: isDark ? tmColors.borderStrong : '#cbd5e1',
      boxShadow: isDark ? tmShadows.cardHover : '0 8px 24px rgba(15, 23, 42, 0.12)',
    },
  };
}

/** Interactive glass card (clickable tiles) */
export function glassCardInteractiveSx(theme: Theme): SxProps<Theme> {
  const isDark = theme.palette.mode === 'dark';
  return {
    ...glassCardSx(theme),
    cursor: 'pointer',
    '&:hover': {
      bgcolor: isDark ? tmColors.glassBgHover : tmColors.lightPaper,
      borderColor: isDark ? tmColors.borderStrong : '#cbd5e1',
      boxShadow: isDark ? tmShadows.cardHover : '0 8px 24px rgba(15, 23, 42, 0.12)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  };
}

export function metricLabelSx(theme: Theme): SxProps<Theme> {
  return {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    mb: 0.25,
  };
}

export function metricValueSx(theme: Theme): SxProps<Theme> {
  return {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  };
}
