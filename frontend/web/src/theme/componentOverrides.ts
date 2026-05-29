import type { Components, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { tmColors, tmGradients, tmMotion, tmShadows, tmShape, tmTypography } from './designTokens';

/**
 * Global MUI component overrides — cards, buttons, inputs, tables, badges, loading, etc.
 */
export function getDesignSystemComponentOverrides(theme: Theme): Components {
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;

  const glassPaper = isDark
    ? {
        backgroundColor: tmColors.glassBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${tmColors.borderSubtle}`,
        boxShadow: tmShadows.card,
        backgroundImage: `linear-gradient(180deg, ${tmColors.glassHighlight} 0%, transparent 100%)`,
      }
    : {
        backgroundColor: tmColors.lightPaper,
        border: `1px solid ${tmColors.lightBorder}`,
        boxShadow: tmShadows.lightCard,
      };

  const inputTextColor = theme.palette.text.primary;
  const inputPlaceholder = theme.palette.text.secondary;

  const inputRoot = {
    borderRadius: tmShape.borderRadiusSm,
    transition: `border-color ${tmMotion.durationFast} ${tmMotion.easeOut}, box-shadow ${tmMotion.durationFast} ${tmMotion.easeOut}`,
    '& fieldset': {
      borderColor: isDark ? tmColors.borderSubtle : '#e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: isDark ? tmColors.borderStrong : '#cbd5e1',
    },
    '&.Mui-focused fieldset': {
      borderColor: primary,
      borderWidth: 1,
    },
    '&.Mui-focused': {
      boxShadow: isDark ? tmShadows.neonFocus : `0 0 0 3px ${alpha(primary, 0.15)}`,
    },
    ...(isDark && {
      bgcolor: alpha(tmColors.charcoal800, 0.6),
      '&.Mui-focused': {
        bgcolor: alpha(tmColors.charcoal750, 0.85),
      },
    }),
  };

  return {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          overflowX: 'hidden',
        },
        body: {
          overflowX: 'hidden',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '#root': {
          overflowX: 'hidden',
          maxWidth: '100vw',
          minHeight: '100vh',
        },
        '::selection': {
          backgroundColor: alpha(primary, 0.35),
          color: isDark ? '#fff' : tmColors.lightText,
        },
        'input, textarea, select': {
          color: inputTextColor,
        },
        'input::placeholder, textarea::placeholder': {
          color: inputPlaceholder,
          opacity: 1,
        },
        'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, textarea:-webkit-autofill':
          {
            WebkitTextFillColor: inputTextColor,
            caretColor: primary,
            transition: 'background-color 99999s ease-out 0s',
          },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 16,
          paddingRight: 16,
          '@media (min-width:600px)': {
            paddingLeft: 24,
            paddingRight: 24,
          },
          '@media (min-width:900px)': {
            paddingLeft: 32,
            paddingRight: 32,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: `${tmShape.cardRadius}px`,
        },
        elevation1: { ...glassPaper, borderRadius: `${tmShape.cardRadius}px` },
        elevation2: isDark
          ? { ...glassPaper, borderRadius: `${tmShape.cardRadius}px`, boxShadow: tmShadows.cardHover }
          : { borderRadius: `${tmShape.cardRadius}px`, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: `${tmShape.cardRadius}px`,
          ...glassPaper,
          transition: `box-shadow ${tmMotion.durationNormal} ${tmMotion.easeOut}, border-color ${tmMotion.durationNormal} ${tmMotion.easeOut}, transform ${tmMotion.durationFast} ${tmMotion.easeOut}`,
          '&:hover': {
            ...(isDark
              ? {
                  borderColor: tmColors.borderStrong,
                  boxShadow: tmShadows.cardHover,
                }
              : {
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                }),
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: tmShape.borderRadiusSm,
          padding: '8px 18px',
          transition: `background ${tmMotion.durationNormal} ${tmMotion.easeOut}, box-shadow ${tmMotion.durationNormal} ${tmMotion.easeOut}, transform ${tmMotion.durationFast} ${tmMotion.easeOut}, border-color ${tmMotion.durationNormal} ${tmMotion.easeOut}`,
        },
        contained: {
          background: isDark ? tmGradients.buttonPrimary : undefined,
          boxShadow: isDark ? `0 4px 20px ${alpha(primary, 0.35)}` : `0 4px 14px ${alpha(primary, 0.25)}`,
          '&:hover': {
            background: isDark ? tmGradients.buttonPrimaryHover : undefined,
            boxShadow: isDark
              ? `0 8px 28px ${alpha(primary, 0.45)}`
              : `0 6px 20px ${alpha(primary, 0.3)}`,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedSecondary: {
          background: isDark
            ? `linear-gradient(135deg, ${tmColors.emeraldDeep} 0%, ${tmColors.emerald} 100%)`
            : undefined,
          boxShadow: isDark ? `0 4px 20px ${tmColors.emeraldGlow}` : undefined,
          '&:hover': {
            background: isDark
              ? `linear-gradient(135deg, ${tmColors.emeraldDeep} 0%, ${tmColors.emeraldBright} 100%)`
              : undefined,
          },
        },
        outlined: {
          borderColor: isDark ? tmColors.borderStrong : '#cbd5e1',
          color: isDark ? tmColors.textPrimary : theme.palette.text.primary,
          '&:hover': {
            borderColor: primary,
            bgcolor: isDark ? alpha(primary, 0.08) : alpha(primary, 0.04),
          },
        },
        text: {
          '&:hover': {
            bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
          },
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: tmShape.borderRadiusSm,
          transition: `background-color ${tmMotion.durationFast} ${tmMotion.easeOut}, color ${tmMotion.durationFast} ${tmMotion.easeOut}`,
          '&:hover': {
            bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: inputRoot,
        notchedOutline: {
          transition: `border-color ${tmMotion.durationNormal} ${tmMotion.easeOut}`,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.9375rem',
        },
        input: {
          color: inputTextColor,
          WebkitTextFillColor: inputTextColor,
          caretColor: primary,
          '&::placeholder': {
            color: inputPlaceholder,
            opacity: 1,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          fontWeight: 500,
          letterSpacing: '0.01em',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: `${tmShape.cardRadius}px`,
          border: '1px solid',
          borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          ...glassPaper,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: theme.palette.text.secondary,
            bgcolor: isDark ? alpha(tmColors.charcoal750, 0.85) : '#f8fafc',
            borderBottom: '1px solid',
            borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: `background-color ${tmMotion.durationFast} ${tmMotion.easeOut}`,
          '&:hover': {
            bgcolor: isDark ? alpha(primary, 0.06) : alpha(primary, 0.04),
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
          fontSize: '0.875rem',
          py: 1.5,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: tmShape.borderRadiusSm,
          transition: `background-color ${tmMotion.durationFast} ${tmMotion.easeOut}`,
        },
        filled: {
          border: '1px solid transparent',
        },
        colorSuccess: {
          ...(isDark && {
            bgcolor: alpha(success, 0.15),
            color: tmColors.emeraldBright,
            borderColor: alpha(success, 0.35),
          }),
        },
        colorPrimary: {
          ...(isDark && {
            bgcolor: alpha(primary, 0.15),
            color: tmColors.neonBlueBright,
            borderColor: alpha(primary, 0.35),
          }),
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 700,
          fontSize: '0.65rem',
          minWidth: 18,
          height: 18,
          boxShadow: isDark ? `0 0 8px ${alpha(primary, 0.5)}` : undefined,
        },
        colorPrimary: {
          background: isDark ? tmGradients.buttonPrimary : undefined,
        },
        colorSuccess: {
          background: isDark ? tmColors.emerald : undefined,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          background: isDark ? tmGradients.heroAccent : primary,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 44,
          transition: `color ${tmMotion.durationFast} ${tmMotion.easeOut}`,
          '&.Mui-selected': {
            color: isDark ? tmColors.neonBlueBright : primary,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: tmShape.borderRadiusSm,
          transition: `background-color ${tmMotion.durationFast} ${tmMotion.easeOut}`,
          '&.Mui-selected': {
            bgcolor: isDark ? alpha(primary, 0.12) : alpha(primary, 0.08),
            '&:hover': {
              bgcolor: isDark ? alpha(primary, 0.16) : alpha(primary, 0.12),
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          ...(isDark && {
            bgcolor: alpha(tmColors.charcoal900, 0.92),
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${tmColors.borderSubtle}`,
            boxShadow: 'none',
          }),
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: tmShape.borderRadiusSm,
          ...(isDark && {
            bgcolor: tmColors.charcoal700,
            border: `1px solid ${tmColors.borderSubtle}`,
            boxShadow: tmShadows.card,
          }),
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: tmShape.borderRadiusSm,
          ...(isDark && {
            bgcolor: alpha('#fff', 0.06),
          }),
        },
        wave: {
          '&::after': {
            background: isDark
              ? `linear-gradient(90deg, transparent, ${alpha('#fff', 0.08)}, transparent)`
              : undefined,
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          ...(isDark && {
            color: tmColors.neonBlue,
          }),
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
        },
        bar: {
          borderRadius: 4,
          ...(isDark && {
            background: tmGradients.heroAccent,
          }),
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tmShape.borderRadius,
          border: '1px solid',
        },
        standardSuccess: {
          ...(isDark && {
            bgcolor: alpha(success, 0.12),
            borderColor: alpha(success, 0.3),
            color: tmColors.emeraldBright,
          }),
        },
        standardInfo: {
          ...(isDark && {
            bgcolor: alpha(primary, 0.12),
            borderColor: alpha(primary, 0.3),
            color: tmColors.neonBlueBright,
          }),
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: isDark ? tmColors.borderSubtle : theme.palette.divider,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: tmShape.borderRadius,
          ...(isDark && {
            ...glassPaper,
            mt: 0.5,
          }),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
  };
}
