/**
 * Bluebell Pro - TypeScript Design Tokens
 * Provides type-safe access to Design System tokens and scales
 */

export const PRIMITIVE_COLORS = {
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  emerald: {
    50: '#ecfdf5',
    500: '#10b981',
    600: '#059669',
  },
  amber: {
    50: '#fffbeb',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  rose: {
    50: '#fff1f2',
    500: '#f43f5e',
    600: '#e11d48',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  }
} as const;

export const SPACING = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const;

export const RADII = {
  sm: '0.375rem',
  md: '0.625rem',
  lg: '0.875rem',
  xl: '1.125rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
