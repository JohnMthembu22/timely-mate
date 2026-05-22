import { alpha, type Theme } from '@mui/material/styles';

/** Shared surfaces for Week Runway / ops timeline (enterprise card look). */
export const weekRunwayCardSx = (theme: Theme) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: '8px',
    border: '1px solid',
    borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
    bgcolor: isDark ? alpha('#1e293b', 0.65) : '#ffffff',
    boxShadow: isDark
      ? '0 4px 24px rgba(0,0,0,0.25)'
      : '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04)',
  };
};

export const weekRunwayPanelSx = (theme: Theme) => ({
  ...weekRunwayCardSx(theme),
  overflow: 'hidden',
});
