import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeType } from '@/types/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#F7F9FC',
    card: '#FFFFFF',
    text: '#1A1F36',
    border: '#E4E9F2',
    primary: '#3A86FF',
    secondary: '#8BB2FF',
    success: '#2DCE89',
    error: '#F5365C',
    accent: '#FF9F1C',
    inactive: '#A0AEC0'
  }
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#1A1F36',
    card: '#252D43',
    text: '#F7F9FC',
    border: '#323A4E',
    primary: '#3A86FF',
    secondary: '#8BB2FF',
    success: '#2DCE89',
    error: '#F5365C',
    accent: '#FF9F1C',
    inactive: '#718096'
  }
};

interface ThemeContextProps {
  theme: Theme;
  themeType: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved theme from AsyncStorage
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme');
        if (savedTheme) {
          setThemeType(savedTheme as ThemeType);
        } else {
          // If no saved theme, use system preference
          setThemeType(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Error loading theme', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newTheme);
    try {
      await AsyncStorage.setItem('@theme', newTheme);
    } catch (error) {
      console.error('Error saving theme', error);
    }
  };

  const theme = themeType === 'dark' ? darkTheme : lightTheme;

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};