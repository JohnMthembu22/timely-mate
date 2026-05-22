import { createTheme, Theme } from '@mui/material/styles';
import { getDesignSystemComponentOverrides } from './theme/componentOverrides';
import { tmColors, tmShape, tmTypography } from './theme/designTokens';
import { getPopupSurfaceComponentOverrides } from './theme/popupSurfaces';

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1600,
  },
};

const typography = {
  fontFamily: tmTypography.fontFamily,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    lineHeight: 1.2,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.25,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.3,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.45,
  },
  body1: {
    fontSize: '0.9375rem',
    lineHeight: 1.55,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
};

const darkShadows = [
  'none',
  '0 2px 8px rgba(0,0,0,0.35)',
  '0 4px 16px rgba(0,0,0,0.4)',
  '0 6px 20px rgba(0,0,0,0.45)',
  '0 8px 28px rgba(0,0,0,0.5)',
  '0 10px 32px rgba(0,0,0,0.52)',
  '0 12px 36px rgba(0,0,0,0.55)',
  '0 14px 40px rgba(0,0,0,0.58)',
  '0 16px 44px rgba(0,0,0,0.6)',
  '0 18px 48px rgba(0,0,0,0.62)',
  '0 20px 52px rgba(0,0,0,0.64)',
  '0 22px 56px rgba(0,0,0,0.66)',
  '0 24px 60px rgba(0,0,0,0.68)',
  '0 26px 64px rgba(0,0,0,0.7)',
  '0 28px 68px rgba(0,0,0,0.72)',
  '0 30px 72px rgba(0,0,0,0.74)',
  '0 32px 76px rgba(0,0,0,0.76)',
  '0 34px 80px rgba(0,0,0,0.78)',
  '0 36px 84px rgba(0,0,0,0.8)',
  '0 38px 88px rgba(0,0,0,0.82)',
  '0 40px 92px rgba(0,0,0,0.84)',
  '0 42px 96px rgba(0,0,0,0.86)',
  '0 44px 100px rgba(0,0,0,0.88)',
  '0 46px 104px rgba(0,0,0,0.9)',
  '0 48px 108px rgba(0,0,0,0.92)',
];

const lightShadows = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.08),0px 1px 1px 0px rgba(0,0,0,0.06),0px 1px 3px 0px rgba(0,0,0,0.05)',
  '0px 3px 1px -2px rgba(0,0,0,0.08),0px 2px 2px 0px rgba(0,0,0,0.06),0px 1px 5px 0px rgba(0,0,0,0.05)',
  '0px 3px 3px -2px rgba(0,0,0,0.08),0px 3px 4px 0px rgba(0,0,0,0.06),0px 1px 8px 0px rgba(0,0,0,0.05)',
  '0px 2px 4px -1px rgba(0,0,0,0.08),0px 4px 5px 0px rgba(0,0,0,0.06),0px 1px 10px 0px rgba(0,0,0,0.05)',
  '0px 3px 5px -1px rgba(0,0,0,0.08),0px 5px 8px 0px rgba(0,0,0,0.06),0px 1px 14px 0px rgba(0,0,0,0.05)',
  '0px 3px 5px -1px rgba(0,0,0,0.08),0px 6px 10px 0px rgba(0,0,0,0.06),0px 1px 18px 0px rgba(0,0,0,0.05)',
  '0px 4px 5px -2px rgba(0,0,0,0.08),0px 7px 10px 1px rgba(0,0,0,0.06),0px 2px 16px 1px rgba(0,0,0,0.05)',
  '0px 5px 5px -3px rgba(0,0,0,0.08),0px 8px 10px 1px rgba(0,0,0,0.06),0px 3px 14px 2px rgba(0,0,0,0.05)',
  '0px 5px 6px -3px rgba(0,0,0,0.08),0px 9px 12px 1px rgba(0,0,0,0.06),0px 3px 16px 2px rgba(0,0,0,0.05)',
  '0px 6px 6px -3px rgba(0,0,0,0.08),0px 10px 14px 1px rgba(0,0,0,0.06),0px 4px 18px 3px rgba(0,0,0,0.05)',
  '0px 6px 7px -4px rgba(0,0,0,0.08),0px 11px 15px 1px rgba(0,0,0,0.06),0px 4px 20px 3px rgba(0,0,0,0.05)',
  '0px 7px 8px -4px rgba(0,0,0,0.08),0px 12px 17px 2px rgba(0,0,0,0.06),0px 5px 22px 4px rgba(0,0,0,0.05)',
  '0px 7px 8px -4px rgba(0,0,0,0.08),0px 13px 19px 2px rgba(0,0,0,0.06),0px 5px 24px 4px rgba(0,0,0,0.05)',
  '0px 7px 9px -4px rgba(0,0,0,0.08),0px 14px 21px 2px rgba(0,0,0,0.06),0px 5px 26px 4px rgba(0,0,0,0.05)',
  '0px 8px 9px -5px rgba(0,0,0,0.08),0px 15px 22px 2px rgba(0,0,0,0.06),0px 6px 28px 5px rgba(0,0,0,0.05)',
  '0px 8px 10px -5px rgba(0,0,0,0.08),0px 16px 24px 2px rgba(0,0,0,0.06),0px 6px 30px 5px rgba(0,0,0,0.05)',
  '0px 8px 11px -5px rgba(0,0,0,0.08),0px 17px 26px 2px rgba(0,0,0,0.06),0px 6px 32px 5px rgba(0,0,0,0.05)',
  '0px 9px 11px -5px rgba(0,0,0,0.08),0px 18px 28px 2px rgba(0,0,0,0.06),0px 7px 34px 6px rgba(0,0,0,0.05)',
  '0px 9px 12px -6px rgba(0,0,0,0.08),0px 19px 29px 2px rgba(0,0,0,0.06),0px 7px 36px 6px rgba(0,0,0,0.05)',
  '0px 10px 13px -6px rgba(0,0,0,0.08),0px 20px 31px 3px rgba(0,0,0,0.06),0px 8px 38px 7px rgba(0,0,0,0.05)',
  '0px 10px 13px -6px rgba(0,0,0,0.08),0px 21px 33px 3px rgba(0,0,0,0.06),0px 8px 40px 7px rgba(0,0,0,0.05)',
  '0px 10px 14px -6px rgba(0,0,0,0.08),0px 22px 35px 3px rgba(0,0,0,0.06),0px 8px 42px 7px rgba(0,0,0,0.05)',
  '0px 11px 14px -7px rgba(0,0,0,0.08),0px 23px 36px 3px rgba(0,0,0,0.06),0px 9px 44px 8px rgba(0,0,0,0.05)',
  '0px 11px 15px -7px rgba(0,0,0,0.08),0px 24px 38px 3px rgba(0,0,0,0.06),0px 9px 46px 8px rgba(0,0,0,0.05)',
];

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  const isDark = mode === 'dark';

  const base = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? tmColors.neonBlue : tmColors.neonBlueDeep,
        light: isDark ? tmColors.neonBlueBright : '#60a5fa',
        dark: isDark ? tmColors.neonBlueDeep : '#1d4ed8',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? tmColors.emerald : tmColors.emeraldDeep,
        light: isDark ? tmColors.emeraldBright : '#6ee7b7',
        dark: '#059669',
        contrastText: isDark ? tmColors.charcoal950 : '#ffffff',
      },
      success: {
        main: tmColors.emerald,
        light: tmColors.emeraldBright,
        dark: tmColors.emeraldDeep,
        contrastText: '#ffffff',
      },
      error: {
        main: '#f87171',
        light: '#fca5a5',
        dark: '#dc2626',
      },
      warning: {
        main: '#fbbf24',
        light: '#fcd34d',
        dark: '#d97706',
      },
      info: {
        main: isDark ? tmColors.neonBlue : '#0ea5e9',
        light: tmColors.neonBlueBright,
        dark: '#0284c7',
      },
      background: {
        default: isDark ? tmColors.charcoal900 : tmColors.lightBg,
        paper: isDark ? tmColors.charcoal800 : tmColors.lightPaper,
      },
      text: {
        primary: isDark ? tmColors.textPrimary : tmColors.lightText,
        secondary: isDark ? tmColors.textSecondary : tmColors.lightTextSecondary,
        disabled: isDark ? tmColors.textMuted : '#94a3b8',
      },
      divider: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
      action: {
        hover: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)',
        selected: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(37, 99, 235, 0.08)',
        focus: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(37, 99, 235, 0.12)',
      },
    },
    typography,
    shape: {
      borderRadius: tmShape.borderRadius,
    },
    spacing: 8,
    breakpoints,
    shadows: isDark ? darkShadows : lightShadows,
  });

  return createTheme(
    base,
    { components: getDesignSystemComponentOverrides(base) },
    { components: getPopupSurfaceComponentOverrides(base) }
  );
};
