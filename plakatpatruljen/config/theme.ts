export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
  },
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  /** Danish party colors */
  party: {
    socialdemokratiet: '#c8032b',
    venstre: '#003d7c',
    moderaterne: '#6b2e8a',
    konservative: '#00583c',
    sf: '#e4002b',
    radikale: '#733280',
    enhedslisten: '#e6801a',
    danmarksdemokraterne: '#0f4d92',
    liberal_alliance: '#13567d',
    alternativet: '#2d8e36',
    nye_borgerlige: '#004450',
    dansk_folkeparti: '#003366',
  },
} as const;

/**
 * Titani Design System — premium titanium aesthetic
 */
export const titani = {
  // Core palette
  text: '#1E293B',
  textSecondary: '#8494A7',
  navy: '#1A365D',
  slate: '#334155',
  success: '#38A169',
  warning: '#ECC94B',
  error: '#E53E3E',
  disabled: '#CBD5E1',

  // Backgrounds
  bg: {
    top: '#F4F5F7',
    middle: '#ECEEF1',
    lower: '#F7F8FA',
    bottom: '#FFFFFF',
    gradient: ['#F4F5F7', '#ECEEF1', '#F7F8FA', '#FFFFFF'] as const,
  },

  // Cards & Surfaces
  card: {
    bgStart: 'rgba(255,255,255,0.85)',
    bgEnd: 'rgba(248,249,252,0.9)',
    border: 'rgba(255,255,255,0.9)',
    shadow1: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
    shadow2: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
    insetHighlight: 'rgba(255,255,255,0.8)',
    radius: 16,
  },

  // Icon containers
  icon: {
    small: { size: 44, radius: 12 },
    large: { size: 64, radius: 18 },
    bgStart: '#F1F3F6',
    bgEnd: '#E8ECF0',
    insetHighlight: 'rgba(255,255,255,0.7)',
  },

  // Form inputs
  input: {
    bg: '#FFFFFF',
    border: '#E2E8F0',
    radius: 12,
    focusBorder: '#1A365D',
    errorBorder: '#E53E3E',
    placeholder: '#94A3B8',
  },

  // Status badges
  badge: {
    active: { bg: '#ECFDF5', text: '#22C55E', border: '#BBF7D0' },
    pending: { bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A' },
    error: { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' },
    draft: { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
    inProgress: { bg: '#EFF6FF', text: '#3B82F6', border: '#BFDBFE' },
  },

  // Tab bar
  tabBar: {
    bg: '#FFFFFF',
    border: '#F1F5F9',
    active: '#1A365D',
    inactive: '#94A3B8',
  },

  // Bottom sheet
  sheet: {
    bg: '#FFFFFF',
    radius: 24,
    dragIndicator: '#E2E8F0',
  },

  // Button
  button: {
    primaryBg: '#1A365D',
    primaryText: '#FFFFFF',
    secondaryBorder: '#E2E8F0',
    secondaryText: '#334155',
  },
} as const;

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  /** Titanium card shadow — layered and soft */
  titanium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
} as const;

export const theme = {
  colors,
  titani,
  spacing,
  fontSizes,
  fontWeights,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
