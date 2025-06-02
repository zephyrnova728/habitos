import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, ProfileContextData } from '@/types/profile';
import { supabase } from '@/lib/supabase';

const ProfileContext = createContext<ProfileContextData>({} as ProfileContextData);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Iniciando ProfileProvider...');
    loadProfile();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setProfile(null);
        await AsyncStorage.removeItem('@HabitControl:profile');
      } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('User signed in or token refreshed');
        loadProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Loading profile...');
      const { data: session } = await supabase.auth.getSession();
      console.log('Current session:', session?.session?.user?.email);
      
      if (session?.session?.user) {
        // Buscar usuário na tabela usuarios
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', session.session.user.email)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          throw error;
        }
        
        if (userData) {
          console.log('User data found:', userData.email);
          const userProfile: UserProfile = {
            id: userData.id.toString(),
            email: userData.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setProfile(userProfile);
          await AsyncStorage.setItem('@HabitControl:profile', JSON.stringify(userProfile));
          console.log('Profile updated successfully');
        } else {
          console.log('No user data found');
        }
      } else {
        console.log('No active session, checking stored profile');
        const storedProfile = await AsyncStorage.getItem('@HabitControl:profile');
        if (storedProfile) {
          console.log('Found stored profile');
          setProfile(JSON.parse(storedProfile));
        } else {
          console.log('No stored profile found');
          setProfile(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('No authenticated user');
      }

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', session.session.user.email)
        .single();

      if (userError) throw userError;

      const updatedProfile: UserProfile = {
        id: userData.id.toString(),
        ...profileData,
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProfile(updatedProfile);
      await AsyncStorage.setItem('@HabitControl:profile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await AsyncStorage.removeItem('@HabitControl:profile');
      setProfile(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, isLoading, updateProfile, signOut }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile deve ser usado dentro de um ProfileProvider');
  }
  return context;
}; 