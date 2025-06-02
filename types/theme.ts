export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  border: string;
  primary: string;
  secondary: string;
  success: string;
  error: string;
  accent: string;
  inactive: string;
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
}