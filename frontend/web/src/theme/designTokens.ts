/**
 * TimelyMate design tokens — premium dark enterprise SaaS.
 * Consumed by MUI theme, popup surfaces, and shared layout components.
 */

export const tmColors = {
  /** Charcoal scale */
  charcoal950: '#080a0f',
  charcoal900: '#0c0e14',
  charcoal850: '#11141c',
  charcoal800: '#161b26',
  charcoal750: '#1c2333',
  charcoal700: '#232d3f',

  /** Neon blue (primary accent) */
  neonBlue: '#38bdf8',
  neonBlueBright: '#4dabff',
  neonBlueDeep: '#2563eb',
  neonBlueGlow: 'rgba(56, 189, 248, 0.45)',

  /** Emerald (success / highlights) */
  emerald: '#34d399',
  emeraldBright: '#6ee7b7',
  emeraldDeep: '#10b981',
  emeraldGlow: 'rgba(52, 211, 153, 0.35)',

  /** Text */
  textPrimary: '#e8ecf4',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  /** Borders & glass */
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  glassBg: 'rgba(22, 27, 38, 0.72)',
  glassBgHover: 'rgba(28, 34, 48, 0.82)',
  glassHighlight: 'rgba(255, 255, 255, 0.06)',

  /** Light mode counterparts */
  lightBg: '#eef1f7',
  lightPaper: '#ffffff',
  lightBorder: '#e2e8f0',
  lightText: '#0f172a',
  lightTextSecondary: '#475569',
} as const;

export const tmTypography = {
  fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  fontFamilyMono: '"JetBrains Mono", "Fira Code", monospace',
} as const;

export const tmShape = {
  /** Cards, Paper, table containers */
  borderRadius: 3,
  cardRadius: 3,
  borderRadiusSm: 3,
  borderRadiusLg: 6,
} as const;

export const tmSpacing = {
  pageGutter: { xs: 2, sm: 3, md: 4 },
  sectionY: { xs: 3, md: 5 },
  cardPadding: 3,
} as const;

/** Brand gradients */
export const tmGradients = {
  heroDark: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #0ea5e9 100%)',
  heroAccent: 'linear-gradient(90deg, #38bdf8 0%, #34d399 100%)',
  buttonPrimary: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
  buttonPrimaryHover: 'linear-gradient(135deg, #1d4ed8 0%, #4dabff 100%)',
  dialogTitle: 'linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #0891b2 100%)',
  sidebarAccent: 'linear-gradient(to top right, #2563eb, #34d399)',
} as const;

export const tmShadows = {
  card: '0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
  cardHover:
    '0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(56, 189, 248, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  modal: '0 24px 64px rgba(0, 0, 0, 0.55), 0 0 40px rgba(37, 99, 235, 0.08)',
  neonFocus: '0 0 0 3px rgba(56, 189, 248, 0.25)',
  lightCard: '0 4px 16px rgba(15, 23, 42, 0.08)',
} as const;

export const tmMotion = {
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  durationFast: '0.15s',
  durationNormal: '0.22s',
} as const;
