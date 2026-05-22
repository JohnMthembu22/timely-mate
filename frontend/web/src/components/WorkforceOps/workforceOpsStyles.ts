import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const wfPageSx: SxProps<Theme> = {
  bgcolor: '#f4f6f9',
  py: { xs: 2, md: 2.5 },
  px: { xs: 1.25, sm: 1.5, md: 2.5 },
  pb: { xs: 11, sm: 10, md: 2.5 },
};

export const wfShellSx: SxProps<Theme> = {
  borderRadius: 2.5,
  border: '1px solid #e5eaf1',
  bgcolor: '#fff',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 28px rgba(15, 23, 42, 0.05)',
  overflow: 'hidden',
  transition: 'box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), border-color 280ms ease, transform 280ms ease',
};

export const wfPremiumSx: SxProps<Theme> = {
  ...wfShellSx,
  '&:hover': {
    boxShadow: `0 4px 6px rgba(15, 23, 42, 0.04), 0 16px 40px ${alpha('#6366f1', 0.1)}`,
    borderColor: '#d0d9e6',
  },
};

export const wfExecutiveSx: SxProps<Theme> = {
  borderRadius: 3,
  border: '1px solid rgba(99, 102, 241, 0.2)',
  background: 'linear-gradient(165deg, #fafbff 0%, #ffffff 42%, #f8fafc 100%)',
  boxShadow: `0 8px 32px ${alpha('#6366f1', 0.08)}, inset 0 1px 0 rgba(255,255,255,0.9)`,
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, #4f46e5, #06b6d4, #8b5cf6)',
  },
};

export const wfIntelDarkSx: SxProps<Theme> = {
  borderRadius: 2.5,
  border: '1px solid rgba(99, 102, 241, 0.28)',
  background: 'linear-gradient(165deg, #020617 0%, #0f172a 48%, #1e1b4b 100%)',
  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
};

export const wfSectionLabelSx: SxProps<Theme> = {
  fontSize: '0.625rem',
  fontWeight: 800,
  color: '#64748b',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

export const wfGlowPulse: SxProps<Theme> = {
  '@keyframes wf-glow': {
    '0%, 100%': { boxShadow: `0 0 0 0 ${alpha('#6366f1', 0.25)}` },
    '50%': { boxShadow: `0 0 20px 4px ${alpha('#6366f1', 0.12)}` },
  },
  animation: 'wf-glow 3s ease-in-out infinite',
};
