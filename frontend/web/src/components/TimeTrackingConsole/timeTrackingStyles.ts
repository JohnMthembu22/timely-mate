import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

import { wfPageSx, wfPremiumSx, wfGlowPulse, wfIntelDarkSx, wfSectionLabelSx } from '../WorkforceOps/workforceOpsStyles';

export { wfGlowPulse as ttGlowPulse, wfIntelDarkSx as ttIntelShellSx, wfSectionLabelSx as ttSectionLabelSx };

export const ttPageSx: SxProps<Theme> = {
  ...wfPageSx,
  bgcolor: '#f6f7f9',
  py: { xs: 2.5, md: 3 },
};

export const ttPremiumSx: SxProps<Theme> = {
  ...wfPremiumSx,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
    borderColor: '#e2e8f0',
  },
};

export const ttMetricTileSx = (accent: string): SxProps<Theme> => ({
  p: 1.25,
  borderRadius: 2,
  border: '1px solid rgba(255,255,255,0.08)',
  bgcolor: alpha('#0f172a', 0.5),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: accent,
  },
});

/** Premium minimal typography & color tokens for Time Tracking */
export const ttType = {
  title: { fontSize: '1rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.2 },
  meta: { fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8', lineHeight: 1.3 },
  metric: { fontSize: '0.8125rem', fontWeight: 700, color: '#475569', fontVariantNumeric: 'tabular-nums' },
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
} as const;

export function ttAssignmentCardSx(opts: {
  isRunning: boolean;
  accent: string;
}): SxProps<Theme> {
  const { isRunning, accent } = opts;
  return {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 3,
    border: '1px solid',
    borderColor: isRunning ? alpha(accent, 0.22) : '#e8ecf1',
    bgcolor: '#fff',
    boxShadow: isRunning
      ? `0 1px 2px rgba(15,23,42,0.04), 0 12px 32px ${alpha(accent, 0.08)}`
      : '0 1px 2px rgba(15,23,42,0.03)',
    transition: 'box-shadow 200ms ease, border-color 200ms ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 3,
      bgcolor: isRunning ? accent : alpha(accent, 0.35),
    },
    '&:hover': {
      borderColor: alpha(accent, 0.28),
      boxShadow: `0 4px 20px ${alpha('#0f172a', 0.06)}`,
    },
  };
}
