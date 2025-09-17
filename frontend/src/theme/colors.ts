// theme/colors.ts - Color system for gamified learning platform

export interface ColorShade {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
}

export interface ColorPalette {
  primary: ColorShade;
  secondary: ColorShade;
  success: ColorShade;
  warning: ColorShade;
  error: ColorShade;
  info: ColorShade;
  gray: ColorShade;
}

export interface GamificationColors {
  xp: {
    bronze: string;
    silver: string;
    gold: string;
    platinum: string;
    diamond: string;
  };
  levels: {
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
    master: string;
  };
  progress: {
    notStarted: string;
    inProgress: string;
    completed: string;
    perfect: string;
  };
  badges: {
    common: string;
    uncommon: string;
    rare: string;
    epic: string;
    legendary: string;
  };
  achievements: {
    bronze: string;
    silver: string;
    gold: string;
    platinum: string;
  };
  streak: {
    fire: string;
    ice: string;
    perfect: string;
  };
}

export interface SemanticColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
    modal: string;
    card: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
    link: string;
    linkHover: string;
  };
  border: {
    light: string;
    medium: string;
    strong: string;
    focus: string;
    error: string;
    success: string;
  };
  surface: {
    elevated: string;
    pressed: string;
    hover: string;
    selected: string;
    disabled: string;
  };
}

export interface Theme {
  colors: ColorPalette;
  gamification: GamificationColors;
  semantic: SemanticColors;
}

// Color palette definitions[84][86]
export const colors: ColorPalette = {
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
    950: '#172554',
  },
  secondary: {
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
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
};

// Gamification-specific colors[84][85]
export const gamificationColors: GamificationColors = {
  xp: {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
    diamond: '#b9f2ff',
  },
  levels: {
    beginner: colors.success[500],    // Green
    intermediate: colors.warning[500], // Amber
    advanced: colors.error[500],      // Red
    expert: '#8b5cf6',               // Purple
    master: '#f97316',               // Orange
  },
  progress: {
    notStarted: colors.gray[300],
    inProgress: colors.primary[500],
    completed: colors.success[500],
    perfect: colors.warning[500],
  },
  badges: {
    common: colors.gray[400],
    uncommon: colors.success[500],
    rare: colors.primary[500],
    epic: '#8b5cf6',
    legendary: colors.warning[500],
  },
  achievements: {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
  },
  streak: {
    fire: '#ff6b35',
    ice: '#4fc3f7',
    perfect: '#ffd700',
  },
};

// Light theme semantic colors[83][85]
export const lightTheme: SemanticColors = {
  background: {
    primary: '#ffffff',
    secondary: colors.gray[50],
    tertiary: colors.gray[100],
    overlay: 'rgba(0, 0, 0, 0.5)',
    modal: '#ffffff',
    card: '#ffffff',
  },
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[400],
    inverse: '#ffffff',
    disabled: colors.gray[400],
    link: colors.primary[600],
    linkHover: colors.primary[700],
  },
  border: {
    light: colors.gray[200],
    medium: colors.gray[300],
    strong: colors.gray[400],
    focus: colors.primary[500],
    error: colors.error[500],
    success: colors.success[500],
  },
  surface: {
    elevated: '#ffffff',
    pressed: colors.gray[100],
    hover: colors.gray[50],
    selected: colors.primary[50],
    disabled: colors.gray[100],
  },
};

// Dark theme semantic colors[83][85]
export const darkTheme: SemanticColors = {
  background: {
    primary: colors.gray[900],
    secondary: colors.gray[800],
    tertiary: colors.gray[700],
    overlay: 'rgba(0, 0, 0, 0.8)',
    modal: colors.gray[800],
    card: colors.gray[800],
  },
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[300],
    tertiary: colors.gray[400],
    inverse: colors.gray[900],
    disabled: colors.gray[500],
    link: colors.primary[400],
    linkHover: colors.primary[300],
  },
  border: {
    light: colors.gray[700],
    medium: colors.gray[600],
    strong: colors.gray[500],
    focus: colors.primary[500],
    error: colors.error[500],
    success: colors.success[500],
  },
  surface: {
    elevated: colors.gray[800],
    pressed: colors.gray[700],
    hover: colors.gray[800],
    selected: colors.primary[900],
    disabled: colors.gray[700],
  },
};

// Complete theme objects[84][86]
export const lightModeTheme: Theme = {
  colors,
  gamification: gamificationColors,
  semantic: lightTheme,
};

export const darkModeTheme: Theme = {
  colors,
  gamification: gamificationColors,
  semantic: darkTheme,
};

// Theme variants enum[86]
export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

// Function to get theme by mode[85][86]
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === ThemeMode.Light ? lightModeTheme : darkModeTheme;
};

// Color utility functions
export const rgba = (color: string, alpha: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const lighten = (color: string, amount: number): string => {
  // Utility to lighten a color (simplified implementation)
  return color; // You can implement a proper color manipulation library
};

export const darken = (color: string, amount: number): string => {
  // Utility to darken a color (simplified implementation)
  return color; // You can implement a proper color manipulation library
};

// Component-specific color maps
export const buttonColors = {
  primary: {
    background: colors.primary[500],
    backgroundHover: colors.primary[600],
    backgroundPressed: colors.primary[700],
    text: '#ffffff',
  },
  secondary: {
    background: 'transparent',
    backgroundHover: colors.gray[100],
    backgroundPressed: colors.gray[200],
    text: colors.gray[700],
  },
  success: {
    background: colors.success[500],
    backgroundHover: colors.success[600],
    backgroundPressed: colors.success[700],
    text: '#ffffff',
  },
  warning: {
    background: colors.warning[500],
    backgroundHover: colors.warning[600],
    backgroundPressed: colors.warning[700],
    text: '#ffffff',
  },
  error: {
    background: colors.error[500],
    backgroundHover: colors.error[600],
    backgroundPressed: colors.error[700],
    text: '#ffffff',
  },
};

// Status colors for different states
export const statusColors = {
  online: colors.success[500],
  offline: colors.gray[400],
  away: colors.warning[500],
  busy: colors.error[500],
  invisible: colors.gray[300],
};

// Export everything for easy importing
export default {
  colors,
  gamificationColors,
  lightTheme,
  darkTheme,
  lightModeTheme,
  darkModeTheme,
  ThemeMode,
  getTheme,
  rgba,
  lighten,
  darken,
  buttonColors,
  statusColors,
};

// Type exports for TypeScript consumers

