import { tmColors, tmGradients } from '../../theme/designTokens';

export const SIDEBAR_WIDTH_EXPANDED = 272;
export const SIDEBAR_WIDTH_COLLAPSED = 72;

export const sidebarTokens = {
  bg: tmColors.charcoal950,
  bgElevated: tmColors.charcoal900,
  border: tmColors.borderSubtle,
  borderStrong: tmColors.borderStrong,
  text: tmColors.textSecondary,
  textBright: tmColors.textPrimary,
  muted: tmColors.textMuted,
  accent: tmColors.emerald,
  accentBlue: tmColors.neonBlue,
  accentBlueBright: tmColors.neonBlueBright,
  hoverBg: 'rgba(255, 255, 255, 0.06)',
  activeBg: 'rgba(56, 189, 248, 0.12)',
  activeBorder: 'rgba(52, 211, 153, 0.55)',
  brandGradient: tmGradients.sidebarAccent,
  itemRadius: '3px',
  iconBoxSize: 32,
  navItemPy: 1.125,
  navItemPx: 1.25,
  groupGap: 2.5,
  sectionLabelSize: '0.6875rem',
} as const;

export const NAV_TOUR_ATTR: Record<string, string> = {
  '/dashboard': 'nav-dashboard',
  '/hr': 'nav-hr',
  '/projects': 'nav-projects',
  '/messages': 'nav-messages',
};

export const SIDEBAR_GROUPS_STORAGE_KEY = 'tm-nav-groups-expanded';
export const SIDEBAR_COLLAPSED_STORAGE_KEY = 'tm-sidebar-collapsed';
