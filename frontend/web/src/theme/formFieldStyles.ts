import type { SxProps, Theme } from '@mui/material/styles';
import { tmColors } from './designTokens';

/** Explicit dark text for inputs on white / light-gray surfaces (e.g. custom dialogs in dark app theme). */
export const lightSurfaceFormSx: SxProps<Theme> = {
  '& .MuiInputBase-input, & .MuiOutlinedInput-input, & textarea, & .MuiSelect-select': {
    color: '#0f172a',
    WebkitTextFillColor: '#0f172a',
    caretColor: '#2563eb',
  },
  '& .MuiInputLabel-root': {
    color: '#475569',
    '&.Mui-focused': { color: '#1d4ed8' },
  },
  '& .MuiInputLabel-root.Mui-disabled': { color: '#94a3b8' },
  '& input::placeholder, & textarea::placeholder': {
    color: '#64748b',
    opacity: 1,
  },
};

/** Theme-aware legible text inside standard MUI dialog content. */
export function getDialogFormInputSx(isLight: boolean): Record<string, unknown> {
  const text = isLight ? '#0f172a' : tmColors.textPrimary;
  const placeholder = isLight ? '#64748b' : tmColors.textMuted;
  const caret = isLight ? '#2563eb' : tmColors.neonBlue;

  return {
    '& .MuiOutlinedInput-input, & .MuiInputBase-input, & textarea, & .MuiSelect-select': {
      color: text,
      WebkitTextFillColor: text,
      caretColor: caret,
    },
    '& input::placeholder, & textarea::placeholder': {
      color: placeholder,
      opacity: 1,
    },
    '& .MuiInputLabel-root': {
      color: isLight ? '#475569' : tmColors.textSecondary,
      '&.Mui-focused': { color: isLight ? '#1d4ed8' : tmColors.neonBlueBright },
    },
  };
}
