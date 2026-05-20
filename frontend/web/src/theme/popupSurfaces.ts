import type { Components, SxProps, Theme } from '@mui/material/styles';

/** Brand hero gradient — dialogs, primary popup actions */
export const POPUP_BRAND_GRADIENT = 'linear-gradient(135deg, #2196f3 0%, #e91e63 100%)';
export const POPUP_BRAND_GRADIENT_HOVER =
  'linear-gradient(135deg, #1976d2 0%, #c2185b 100%)';
export const POPUP_ACCENT_GRADIENT = 'linear-gradient(90deg, #2196f3, #e91e63)';

const roundedLg = '8px';

/** Primary CTA inside popup footers — gradient matches operational hero */
export const popupPrimaryButtonSx = {
  textTransform: 'none' as const,
  fontWeight: 700,
  borderRadius: 2,
  px: 3,
  py: 1.25,
  background: POPUP_BRAND_GRADIENT,
  boxShadow: '0 8px 24px rgba(33, 150, 243, 0.35)',
  '&:hover': {
    background: POPUP_BRAND_GRADIENT_HOVER,
    boxShadow: '0 12px 28px rgba(233, 30, 99, 0.28)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, rgba(33,150,243,0.35), rgba(233,30,99,0.35))',
    color: 'rgba(255,255,255,0.85)',
  },
};

/** Dark submit (e.g. operational block create) — opt-in via class `popup-submit-dark` */
export const popupSubmitButtonSx = {
  textTransform: 'none' as const,
  fontWeight: 600,
  fontSize: '0.75rem',
  lineHeight: 1,
  color: '#fff',
  bgcolor: '#0f172a',
  borderRadius: roundedLg,
  px: 2.5,
  py: 1,
  boxShadow: 'none',
  '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
  '&:disabled': { bgcolor: '#94a3b8', color: 'rgba(255,255,255,0.95)' },
};

/** Secondary / cancel in popup footers (outlined) */
export const popupMutedButtonSx = {
  textTransform: 'none' as const,
  fontWeight: 600,
  borderRadius: 2,
  px: 2.5,
  py: 1,
  borderColor: '#cbd5e1',
  color: '#475569',
  '&:hover': {
    borderColor: '#94a3b8',
    bgcolor: '#f8fafc',
  },
};

/** Text cancel in popup footers */
export const popupCancelButtonSx = {
  textTransform: 'none' as const,
  fontWeight: 600,
  fontSize: '0.75rem',
  color: '#64748b',
  minWidth: 'auto',
  px: 1,
  py: 0.75,
  borderRadius: roundedLg,
  '&:hover': { bgcolor: 'transparent', color: '#475569' },
};

/** Stacked field labels inside popup forms */
export const popupFormLabelSx = {
  fontSize: '0.75rem',
  lineHeight: 1,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: '#64748b',
  display: 'block',
  mb: '6px',
};

/** Hover / preview card (Popper anchor) */
export const popupHoverCardPaperSx: SxProps<Theme> = {
  pointerEvents: 'none',
  maxWidth: 320,
  overflow: 'hidden',
  borderRadius: 2,
  border: '1px solid #e2e8f0',
  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.28)',
  bgcolor: '#fff',
};

export const popupAccentBarSx = {
  height: 3,
  background: POPUP_ACCENT_GRADIENT,
};

/** Nested panel inside dialog body (e.g. meeting specifics) */
export const popupNestedPanelSx = {
  p: 2,
  borderRadius: '12px',
  bgcolor: 'rgba(248, 250, 252, 0.6)',
  border: '1px solid #f1f5f9',
};

const dialogFieldRootSx = {
  borderRadius: roundedLg,
  bgcolor: 'rgba(248, 250, 252, 0.5)',
  fontSize: '0.875rem',
  transition: 'background-color 0.15s, border-color 0.15s, box-shadow 0.15s',
  '& fieldset': { borderColor: '#e2e8f0' },
  '&:hover fieldset': { borderColor: '#cbd5e1' },
  '&.Mui-focused': { bgcolor: '#fff', boxShadow: '0 0 0 1px #0f172a' },
  '&.Mui-focused fieldset': { borderColor: '#0f172a', borderWidth: '1px' },
};

const dialogFieldInputSx = {
  minHeight: 40,
  height: 40,
  boxSizing: 'border-box' as const,
  '& .MuiOutlinedInput-input': {
    py: '10px',
    px: '14px',
    height: 'auto',
    boxSizing: 'border-box' as const,
  },
};

/** Multiline fields inside dialog bodies */
export const popupMultilineFieldSx = {
  '.MuiDialogContent-root &': {
    ...dialogFieldRootSx,
    py: 1.25,
    alignItems: 'flex-start',
  },
};

/**
 * Global MUI overrides for modal dialogs, popovers, poppers, and form controls inside dialogs.
 * Merged in ThemeContext via createTheme(base, { components: getPopupSurfaceComponentOverrides(base) }).
 */
export function getPopupSurfaceComponentOverrides(theme: Theme): Components {
  const isLight = theme.palette.mode === 'light';
  const borderSubtle = isLight ? '#e2e8f0' : theme.palette.divider;
  const borderFaint = isLight ? '#f1f5f9' : theme.palette.divider;

  const dialogPaper = {
    borderRadius: 3,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: borderSubtle,
    boxShadow: isLight
      ? '0 25px 50px -12px rgba(15, 23, 42, 0.22)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.55)',
    background: isLight
      ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
      : `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  };

  const dialogTitle = {
    position: 'relative' as const,
    background: POPUP_BRAND_GRADIENT,
    color: '#fff',
    py: theme.spacing(3),
    px: theme.spacing(3),
    boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.15)',
    '& .MuiTypography-root': {
      color: 'inherit',
    },
    '& .MuiIconButton-root': {
      color: 'inherit',
    },
  };

  const dialogContent = {
    px: theme.spacing(3),
    pt: theme.spacing(3.5),
    pb: theme.spacing(3),
    bgcolor: isLight ? '#fff' : theme.palette.background.default,
    borderTop: `1px solid ${borderFaint}`,
  };

  const dialogActions = {
    px: theme.spacing(3),
    py: theme.spacing(2),
    bgcolor: isLight ? '#fff' : theme.palette.background.paper,
    borderTop: `1px solid ${borderFaint}`,
    gap: theme.spacing(1.5),
    justifyContent: 'flex-end' as const,
    flexWrap: 'wrap' as const,
    '& .MuiButton-root': {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.75rem',
      borderRadius: roundedLg,
    },
    '& .MuiButton-contained:not(.popup-submit-dark)': {
      ...popupPrimaryButtonSx,
      boxShadow: '0 4px 14px rgba(33, 150, 243, 0.28)',
    },
    '& .MuiButton-contained.popup-submit-dark': popupSubmitButtonSx,
    '& .MuiButton-outlined': popupMutedButtonSx,
    '& .MuiButton-text:not(.MuiButton-textPrimary)': popupCancelButtonSx,
  };

  const popoverPaper = {
    overflow: 'hidden',
    borderRadius: 2,
    border: `1px solid ${borderSubtle}`,
    boxShadow: isLight
      ? '0 20px 40px -10px rgba(15, 23, 42, 0.28)'
      : '0 20px 40px -10px rgba(0, 0, 0, 0.55)',
    bgcolor: theme.palette.background.paper,
  };

  const dialogScopedField = {
    '.MuiDialogContent-root &': {
      ...dialogFieldRootSx,
      ...dialogFieldInputSx,
    },
  };

  return {
    MuiDialog: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        paper: dialogPaper,
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: dialogTitle,
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: dialogContent,
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: dialogActions,
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: popoverPaper,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          ...dialogScopedField,
          ...popupMultilineFieldSx,
        },
        notchedOutline: {
          '.MuiDialogContent-root &': {
            borderColor: '#e2e8f0',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          '.MuiDialogContent-root &': {
            display: 'flex',
            alignItems: 'center',
            minHeight: 40,
            height: 40,
            py: 0,
            px: '14px',
            boxSizing: 'border-box',
          },
        },
        outlined: {
          '.MuiDialogContent-root &': dialogFieldRootSx,
        },
      },
    },
  };
}
