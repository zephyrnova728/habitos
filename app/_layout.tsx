import 'react-native-get-random-values';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { HabitProvider } from '@/contexts/HabitContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <HabitProvider>
        <AppLayout />
      </HabitProvider>
    </ThemeProvider>
  );
}

function AppLayout() {
  const { theme } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
    </>
  );
}