export const lightTheme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    card: '#F9F9F9',
    text: '#000000',
    border: '#E5E5E5',
    notification: '#FF3B30',
    inactive: '#8E8E93',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 36,
      fontWeight: '700',
      letterSpacing: -1,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: -0.5,
    },
    subtitle1: {
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: 0,
    },
    subtitle2: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      letterSpacing: 0,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0,
      textTransform: 'none',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      letterSpacing: 0,
    },
    overline: {
      fontSize: 10,
      fontWeight: '500',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 5.46,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    inactive: '#636366',
  },
};

export type Theme = typeof lightTheme;
export type ThemeColors = typeof lightTheme.colors; 