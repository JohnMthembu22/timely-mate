import type { SxProps, Theme } from '@mui/material/styles';

/** Fixed header height on phones/tablets (dashboard shell). */
export const MOBILE_APP_BAR_HEIGHT = 56;

/** Brand blue — visible on light headers and gradient pages. */
export const MOBILE_MENU_COLOR = '#2196f3';

export const mobileMenuButtonSx: SxProps<Theme> = {
  color: MOBILE_MENU_COLOR,
  bgcolor: 'rgba(33, 150, 243, 0.1)',
  border: '1px solid rgba(33, 150, 243, 0.35)',
  borderRadius: 2,
  '&:hover': {
    bgcolor: 'rgba(33, 150, 243, 0.18)',
    borderColor: MOBILE_MENU_COLOR,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 28,
  },
};
