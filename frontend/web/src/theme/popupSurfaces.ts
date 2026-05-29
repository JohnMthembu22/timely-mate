import type { Components, SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { tmColors, tmGradients, tmShadows, tmShape } from './designTokens';
import { getDialogFormInputSx } from './formFieldStyles';

/** Brand hero gradient — dialogs, primary popup actions */
export const POPUP_BRAND_GRADIENT = tmGradients.dialogTitle;
export const POPUP_BRAND_GRADIENT_HOVER = tmGradients.buttonPrimaryHover;
export const POPUP_ACCENT_GRADIENT = tmGradients.heroAccent;

const roundedLg = '8px';

/** Primary CTA inside popup footers — gradient matches operational hero */
export const popupPrimaryButtonSx = {
  textTransform: 'none' as const,
  fontWeight: 700,
  borderRadius: tmShape.borderRadiusSm,
  px: 3,
  py: 1.25,
  background: tmGradients.buttonPrimary,
  boxShadow: `0 8px 24px ${tmColors.neonBlueGlow}`,
  '&:hover': {
    background: POPUP_BRAND_GRADIENT_HOVER,
    boxShadow: `0 12px 28px ${alpha(tmColors.neonBlue, 0.4)}`,
  },
  '&:disabled': {
    background: `linear-gradient(135deg, ${alpha(tmColors.neonBlueDeep, 0.35)}, ${alpha(tmColors.emeraldDeep, 0.35)})`,
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
  bgcolor: tmColors.charcoal850,
  borderRadius: roundedLg,
  px: 2.5,
  py: 1,
  boxShadow: 'none',
  '&:hover': { bgcolor: tmColors.charcoal750, boxShadow: 'none' },
  '&:disabled': { bgcolor: tmColors.textMuted, color: 'rgba(255,255,255,0.95)' },
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
  borderRadius: '3px',
  bgcolor: 'rgba(248, 250, 252, 0.6)',
  border: '1px solid #f1f5f9',
};

function getDialogFieldRootSx(isLight: boolean) {
  return {
    borderRadius: roundedLg,
    bgcolor: isLight ? 'rgba(248, 250, 252, 0.65)' : alpha(tmColors.charcoal750, 0.85),
    fontSize: '0.9375rem',
    transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
    '& fieldset': { borderColor: isLight ? '#e2e8f0' : tmColors.borderSubtle },
    '&:hover fieldset': { borderColor: isLight ? '#cbd5e1' : tmColors.borderStrong },
    '&.Mui-focused': {
      bgcolor: isLight ? '#fff' : alpha(tmColors.charcoal700, 0.95),
      boxShadow: isLight ? '0 0 0 1px #0f172a' : `0 0 0 1px ${tmColors.neonBlue}`,
    },
    '&.Mui-focused fieldset': {
      borderColor: isLight ? '#0f172a' : tmColors.neonBlue,
      borderWidth: '1px',
    },
  };
}

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
  '&.MuiInputBase-adornedStart, &.MuiInputBase-adornedEnd': {
    minHeight: 48,
    height: 'auto',
    py: 0.5,
    pr: 1,
  },
};

/** Keep outlined labels above the border notch inside dialogs */
export const popupDialogFieldLabelProps = { shrink: true as const };

const dialogLabelBg = (isLight: boolean) => (isLight ? '#ffffff' : 'background.paper');

/** Outlined fields in custom dialog bodies (e.g. Meetings schedule form) */
export const popupDialogAdornedFieldSx: SxProps<Theme> = {
  '& .MuiInputLabel-root': {
    bgcolor: '#ffffff',
    px: 0.75,
    zIndex: 1,
  },
  '& .MuiOutlinedInput-root': {
    minHeight: 48,
    height: 'auto',
    alignItems: 'center',
  },
  '& .MuiOutlinedInput-input': {
    py: 1.25,
  },
};

export const popupDialogMultilineFieldSx: SxProps<Theme> = {
  '& .MuiInputLabel-root': {
    bgcolor: '#ffffff',
    px: 0.75,
    zIndex: 1,
  },
  '& .MuiOutlinedInput-root': {
    minHeight: 'auto',
    height: 'auto',
    alignItems: 'flex-start',
    py: 0.75,
  },
  '& .MuiOutlinedInput-input': {
    py: 1,
  },
};

/** Multiline fields inside dialog bodies */
export function getPopupMultilineFieldSx(isLight: boolean) {
  return {
    '.MuiDialogContent-root &': {
      ...getDialogFieldRootSx(isLight),
      py: 1.25,
      alignItems: 'flex-start',
    },
  };
}

/**
 * Global MUI overrides for modal dialogs, popovers, poppers, and form controls inside dialogs.
 * Merged in ThemeContext via createTheme(base, { components: getPopupSurfaceComponentOverrides(base) }).
 */
export function getPopupSurfaceComponentOverrides(theme: Theme): Components {
  const isLight = theme.palette.mode === 'light';
  const borderSubtle = isLight ? tmColors.lightBorder : tmColors.borderSubtle;
  const borderFaint = isLight ? '#f1f5f9' : tmColors.borderSubtle;

  const dialogPaper = {
    borderRadius: `${tmShape.cardRadius}px`,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: borderSubtle,
    boxShadow: isLight ? '0 25px 50px -12px rgba(15, 23, 42, 0.22)' : tmShadows.modal,
    background: isLight
      ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
      : `linear-gradient(180deg, ${alpha(tmColors.charcoal800, 0.95)} 0%, ${alpha(tmColors.charcoal900, 0.98)} 100%)`,
    ...(isLight
      ? {}
      : {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }),
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
    bgcolor: isLight ? '#fff' : alpha(tmColors.charcoal850, 0.6),
    borderTop: `1px solid ${borderFaint}`,
  };

  const dialogActions = {
    px: theme.spacing(3),
    py: theme.spacing(2),
    bgcolor: isLight ? '#fff' : alpha(tmColors.charcoal800, 0.85),
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

  const dialogFieldRootSx = getDialogFieldRootSx(isLight);
  const dialogFormInputSx = getDialogFormInputSx(isLight);

  const dialogScopedField = {
    '.MuiDialogContent-root &': {
      ...dialogFieldRootSx,
      ...dialogFieldInputSx,
      ...dialogFormInputSx,
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
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '.MuiDialogContent-root &': {
            bgcolor: dialogLabelBg(isLight),
            px: 0.5,
            zIndex: 1,
          },
        },
        outlined: {
          '.MuiDialogContent-root &.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          ...dialogScopedField,
          ...getPopupMultilineFieldSx(isLight),
        },
        notchedOutline: {
          '.MuiDialogContent-root &': {
            borderColor: isLight ? '#e2e8f0' : tmColors.borderSubtle,
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
          '.MuiDialogContent-root &': {
            ...dialogFieldRootSx,
            ...dialogFormInputSx,
          },
        },
      },
    },
  };
}
