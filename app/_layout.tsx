import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { HabitProvider } from '@/contexts/HabitContext';
import { useProfile } from '@/contexts/ProfileContext';

// Auth guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { profile, isLoading } = useProfile();

  useEffect(() => {
    if (isLoading) {
      console.log('Auth guard: Still loading...');
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';
    console.log('Auth guard:', { 
      inAuthGroup, 
      hasProfile: !!profile, 
      currentSegment: segments[0] 
    });

    if (!profile && inAuthGroup) {
      console.log('Auth guard: Redirecting to login (no profile)');
      router.replace('/login');
    } else if (profile && !inAuthGroup && segments[0] !== 'login') {
      console.log('Auth guard: Redirecting to tabs (has profile)');
      router.replace('/(tabs)');
    }
  }, [profile, segments, isLoading]);

  if (isLoading) {
    // You might want to show a loading indicator here
    return null;
  }

  return <>{children}</>;
}

function AppLayout() {
  const { theme } = useTheme();
  useFrameworkReady();

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="login" 
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <HabitProvider>
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        </HabitProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}