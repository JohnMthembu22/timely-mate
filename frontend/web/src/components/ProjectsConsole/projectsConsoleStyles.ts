import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

/** Shared motion — subtle, enterprise-grade */
export const consoleTransition = '180ms cubic-bezier(0.4, 0, 0.2, 1)';
export const consoleTransitionSlow = '280ms cubic-bezier(0.4, 0, 0.2, 1)';

export const consolePageSx: SxProps<Theme> = {
  bgcolor: '#f4f6f9',
  py: { xs: 1.25, sm: 1.5, md: 2 },
  px: { xs: 1.25, sm: 1.5, md: 2 },
  minHeight: '100%',
};

export const consoleInnerSx: SxProps<Theme> = {
  maxWidth: 1760,
  mx: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 1.25, sm: 1.5, md: 1.75 },
};

/** Main workspace + right rail */
export const consoleSplitLayoutSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    lg: 'minmax(0, 1fr) minmax(280px, 32%)',
    xl: 'minmax(0, 1fr) minmax(300px, 30%)',
  },
  gap: { xs: 1.25, sm: 1.5, md: 1.75 },
  alignItems: 'start',
};

export const sidebarStackSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 1.25, md: 1.5 },
  minWidth: 0,
  position: { lg: 'sticky' },
  top: { lg: 12 },
  maxHeight: { lg: 'calc(100vh - 88px)' },
  overflow: { lg: 'hidden' },
};

export const workspaceGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    lg: 'repeat(2, minmax(0, 1fr))',
    xl: 'repeat(3, minmax(0, 1fr))',
  },
  gap: { xs: 1.25, sm: 1.5 },
  p: { xs: 1.25, sm: 1.5, md: 1.75 },
  alignContent: 'start',
};

export const analyticsGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: {
    xs: 'repeat(2, minmax(0, 1fr))',
    sm: 'repeat(4, minmax(0, 1fr))',
    lg: 'repeat(4, minmax(0, 1fr))',
    xl: 'repeat(8, minmax(0, 1fr))',
  },
  gap: { xs: 1, sm: 1.25 },
};

export const sectionShellSx: SxProps<Theme> = {
  borderRadius: 2.5,
  border: '1px solid',
  borderColor: '#e5eaf1',
  bgcolor: '#fff',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)',
  overflow: 'hidden',
  transition: `box-shadow ${consoleTransition}, border-color ${consoleTransition}`,
};

export const sectionHeaderSx: SxProps<Theme> = {
  px: { xs: 1.25, sm: 1.5, md: 1.75 },
  py: { xs: 1.1, md: 1.35 },
  borderBottom: '1px solid',
  borderColor: '#f1f5f9',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 1.25,
  flexWrap: 'wrap',
};

export const sectionTitleSx: SxProps<Theme> = {
  fontSize: { xs: '0.8125rem', md: '0.875rem' },
  fontWeight: 800,
  color: '#0f172a',
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
};

export const sectionSubtitleSx: SxProps<Theme> = {
  fontSize: '0.6875rem',
  color: '#64748b',
  mt: 0.25,
  lineHeight: 1.4,
  maxWidth: 480,
};

export const analyticsTileSx = (accent: string): SxProps<Theme> => ({
  p: { xs: 1.15, sm: 1.35 },
  height: '100%',
  minHeight: { xs: 108, sm: 118 },
  borderRadius: 2,
  border: '1px solid #e8edf4',
  bgcolor: '#fff',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
  position: 'relative',
  overflow: 'hidden',
  transition: `box-shadow ${consoleTransition}, transform ${consoleTransition}, border-color ${consoleTransition}`,
  '&:hover': {
    boxShadow: `0 8px 24px rgba(15, 23, 42, 0.07), 0 0 0 1px ${alpha('#6366f1', 0.08)}`,
    transform: 'translateY(-1px)',
    borderColor: '#d4dcf0',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: accent,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -40,
    right: -40,
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha('#6366f1', 0.06)} 0%, transparent 70%)`,
    pointerEvents: 'none',
    opacity: 0,
    transition: `opacity ${consoleTransition}`,
  },
  '&:hover::after': {
    opacity: 1,
  },
});

export const insightCardSx = (tone: string): SxProps<Theme> => ({
  p: 1.5,
  borderRadius: 2,
  border: '1px solid',
  borderColor: alpha(tone, 0.22),
  bgcolor: alpha(tone, 0.06),
  minWidth: { xs: 220, sm: 240 },
  maxWidth: 320,
  flex: '0 0 auto',
  scrollSnapAlign: 'start',
});

export const projectCardSx: SxProps<Theme> = {
  position: 'relative',
  p: { xs: 1.35, sm: 1.5 },
  pt: { xs: 1.65, sm: 1.85 },
  borderRadius: 2.5,
  border: '1px solid #e5eaf1',
  bgcolor: '#fff',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.02)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  cursor: 'pointer',
  transition: `box-shadow ${consoleTransitionSlow}, border-color ${consoleTransition}, transform ${consoleTransitionSlow}`,
  '&:hover': {
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.09), 0 0 0 1px rgba(99, 102, 241, 0.12)',
    borderColor: '#c7d2fe',
    transform: 'translateY(-2px)',
    '& .project-title': { color: '#2563eb' },
    '& .card-glow': { opacity: 1 },
  },
};

export const milestoneRailSx: SxProps<Theme> = {
  position: 'relative',
  pl: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 6,
    top: 6,
    bottom: 6,
    width: 2,
    borderRadius: 1,
    bgcolor: '#e2e8f0',
  },
};

export const aiBadgeSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.4,
  px: 0.75,
  py: 0.25,
  borderRadius: 99,
  fontSize: '0.5625rem',
  fontWeight: 800,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  bgcolor: 'rgba(99, 102, 241, 0.1)',
  color: '#4f46e5',
  border: '1px solid rgba(99, 102, 241, 0.2)',
};

export const livePulseKeyframes = {
  '@keyframes console-live-pulse': {
    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 0.45, transform: 'scale(1.2)' },
  },
};

export const shimmerKeyframes = {
  '@keyframes console-shimmer': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
};
