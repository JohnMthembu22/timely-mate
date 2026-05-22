import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const fieldPageContentSx: SxProps<Theme> = {
  bgcolor: '#f4f6f9',
  pt: { xs: 2, md: 2.5 },
  pb: { xs: 10, sm: 9, md: 2 },
  px: { xs: 1.25, sm: 1.5, md: 2 },
};

export const fieldInnerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 1.35, md: 1.65 },
};

export const fieldShellSx: SxProps<Theme> = {
  borderRadius: 2.5,
  border: '1px solid #e5eaf1',
  bgcolor: '#fff',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)',
  overflow: 'hidden',
  transition: 'box-shadow 220ms ease, border-color 220ms ease',
};

export const fieldPremiumShellSx: SxProps<Theme> = {
  ...fieldShellSx,
  transition: 'box-shadow 220ms ease, border-color 220ms ease, transform 220ms ease',
  '&:hover': {
    boxShadow: '0 4px 6px rgba(15, 23, 42, 0.04), 0 12px 28px rgba(14, 165, 233, 0.08)',
    borderColor: '#d0d9e6',
  },
};

export const fieldLiveGlowSx: SxProps<Theme> = {
  '@keyframes fieldPulse': {
    '0%, 100%': { opacity: 1, boxShadow: `0 0 0 0 ${alpha('#10b981', 0.4)}` },
    '50%': { opacity: 0.85, boxShadow: `0 0 0 6px ${alpha('#10b981', 0)}` },
  },
  animation: 'fieldPulse 2s ease-in-out infinite',
};

export const fieldSectionLabelSx: SxProps<Theme> = {
  fontSize: '0.625rem',
  fontWeight: 800,
  color: '#64748b',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

export const fieldHeaderSx: SxProps<Theme> = {
  px: { xs: 1.25, sm: 1.5 },
  py: { xs: 1.1, md: 1.25 },
  borderBottom: '1px solid #f1f5f9',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 1,
  flexWrap: 'wrap',
};

export const fieldTitleSx: SxProps<Theme> = {
  fontSize: '0.875rem',
  fontWeight: 800,
  color: '#0f172a',
  letterSpacing: '-0.02em',
};

export const fieldSubtitleSx: SxProps<Theme> = {
  fontSize: '0.6875rem',
  color: '#64748b',
  mt: 0.25,
  lineHeight: 1.4,
};

export const fieldMetricGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: {
    xs: 'repeat(2, minmax(0, 1fr))',
    sm: 'repeat(4, minmax(0, 1fr))',
    lg: 'repeat(8, minmax(0, 1fr))',
  },
  gap: { xs: 1, sm: 1.15 },
};

export const fieldSplitSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    lg: 'minmax(0, 1fr) minmax(280px, 32%)',
  },
  gap: { xs: 1.25, md: 1.5 },
  alignItems: 'start',
};

export const fieldSiteGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    md: 'repeat(2, minmax(0, 1fr))',
  },
  gap: 1.25,
  p: { xs: 1.25, sm: 1.5 },
};

export const fieldMetricTileSx = (accent: string): SxProps<Theme> => ({
  p: { xs: 1.1, sm: 1.25 },
  borderRadius: 2,
  border: '1px solid #e8edf4',
  bgcolor: '#fff',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 180ms ease, box-shadow 180ms ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 20px rgba(15,23,42,0.06)',
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
});

export const fieldAiPanelSx: SxProps<Theme> = {
  ...fieldShellSx,
  background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 48%, #0f172a 100%)',
  border: '1px solid rgba(14, 165, 233, 0.25)',
  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
};

export const fieldToolBtnSx: SxProps<Theme> = ({
  p: 1.25,
  borderRadius: 2,
  border: '1px solid #e8edf4',
  bgcolor: '#fafbfc',
  textTransform: 'none',
  justifyContent: 'flex-start',
  transition: 'all 180ms ease',
  '&:hover': {
    borderColor: '#7dd3fc',
    bgcolor: '#f0f9ff',
    boxShadow: `0 0 0 1px ${alpha('#0ea5e9', 0.15)}`,
  },
});

export const fieldExecutionGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.05fr) minmax(0, 1fr)' },
  gap: { xs: 1.25, md: 1.5 },
};

export const fieldActionCardSx = (accent: string): SxProps<Theme> => ({
  p: { xs: 1.25, sm: 1.35 },
  borderRadius: 2,
  border: '1px solid #e8edf4',
  bgcolor: '#fff',
  textAlign: 'left',
  textTransform: 'none',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    borderColor: alpha(accent, 0.45),
    boxShadow: `0 10px 24px ${alpha(accent, 0.12)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${accent}, ${alpha(accent, 0.55)})`,
  },
});

export const fieldExecutionRailSx: SxProps<Theme> = {
  borderTop: '1px solid #f1f5f9',
  bgcolor: '#fafbfc',
  px: { xs: 1.25, sm: 1.5 },
  py: { xs: 1.15, sm: 1.25 },
};
