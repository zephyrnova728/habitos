import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Habit, HabitCompletion, HabitWithStatus, RepeatType } from '@/types/habit';
import { format, isToday, parseISO, isAfter, startOfDay, isSameDay, differenceInDays, getDay, getDate, addDays, isBefore } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Platform, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/contexts/ProfileContext';

interface HabitContextProps {
  habits: Habit[];
  completions: HabitCompletion[];
  getTodayHabits: () => HabitWithStatus[];
  getHabitsForDate: (date: Date) => HabitWithStatus[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: Date, completed: boolean) => Promise<void>;
  getHabitCompletionRate: (habitId: string) => number;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  loading: boolean;
}

const HabitContext = createContext<HabitContextProps | undefined>(undefined);

const generateFallbackId = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}`;
};

const generateId = () => {
  try {
    return uuidv4();
  } catch (error) {
    console.warn('UUID generation failed, using fallback:', error);
    return generateFallbackId();
  }
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    if (profile) {
      loadHabits();
    } else {
      setHabits([]);
      setCompletions([]);
    }
  }, [profile]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      if (!profile) return;

      // Carregar hábitos do usuário do Supabase
      const { data: habitsData, error: habitsError } = await supabase
        .from('habitos')
        .select('*')
        .eq('usuario_id', profile.id)
        .order('horario', { ascending: true });

      if (habitsError) throw habitsError;

      // Converter os dados do Supabase para o formato do app
      const formattedHabits: Habit[] = habitsData.map(habit => ({
        id: habit.id.toString(),
        name: habit.habito,
        time: habit.horario,
        repeatType: 'daily' as RepeatType,
        repeatValue: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      console.log('Hábitos carregados:', formattedHabits);
      setHabits(formattedHabits);
    } catch (error) {
      console.error('Erro ao carregar hábitos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      if (!profile) {
        Alert.alert(
          'Autenticação Necessária',
          'Você precisa estar logado para criar hábitos. Por favor, faça login ou crie uma conta.',
          [
            {
              text: 'OK',
              onPress: () => {
                // You can add navigation to login screen here if needed
              }
            }
          ]
        );
        throw new Error('Usuário não autenticado');
      }

      // Inserir no Supabase
      const { data: newHabit, error } = await supabase
        .from('habitos')
        .insert([
          {
            usuario_id: profile.id,
            habito: habitData.name,
            horario: habitData.time
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Adicionar ao estado local
      const formattedHabit: Habit = {
        id: newHabit.id.toString(),
        name: newHabit.habito,
        time: newHabit.horario,
        repeatType: 'daily',
        repeatValue: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setHabits(prevHabits => [...prevHabits, formattedHabit]);
    } catch (error) {
      console.error('Erro ao adicionar hábito:', error);
      throw error;
    }
  };

  const updateHabit = async (updatedHabit: Habit): Promise<void> => {
    try {
      if (!profile) throw new Error('Usuário não autenticado');

      // Atualizar no Supabase
      const { error } = await supabase
        .from('habitos')
        .update({
          habito: updatedHabit.name,
          horario: updatedHabit.time
        })
        .eq('id', updatedHabit.id)
        .eq('usuario_id', profile.id);

      if (error) throw error;

      // Atualizar estado local
      setHabits(prevHabits =>
        prevHabits.map(habit =>
          habit.id === updatedHabit.id ? updatedHabit : habit
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
      throw error;
    }
  };

  const deleteHabit = async (id: string): Promise<void> => {
    try {
      if (!profile) throw new Error('Usuário não autenticado');

      // Deletar do Supabase
      const { error } = await supabase
        .from('habitos')
        .delete()
        .eq('id', id)
        .eq('usuario_id', profile.id);

      if (error) throw error;

      // Atualizar estado local
      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
      setCompletions(prevCompletions =>
        prevCompletions.filter(completion => completion.habitId !== id)
      );
    } catch (error) {
      console.error('Erro ao deletar hábito:', error);
      throw error;
    }
  };

  const shouldScheduleHabit = (habit: Habit, date: Date): boolean => {
    const dayOfWeek = getDay(date);
    const dayOfMonth = getDate(date);
    
    switch (habit.repeatType) {
      case 'daily':
        return true;
      case 'weekly':
        return habit.repeatDays?.includes(dayOfWeek) || false;
      case 'monthly':
        return habit.repeatDates?.includes(dayOfMonth) || false;
      default:
        return false;
    }
  };

  const getTodayHabits = (): HabitWithStatus[] => {
    return getHabitsForDate(new Date());
  };

  const getHabitsForDate = (date: Date): HabitWithStatus[] => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    return habits
      .filter(habit => shouldScheduleHabit(habit, date))
      .map(habit => {
        const completion = completions.find(
          c => c.habitId === habit.id && c.date === formattedDate
        );
        
        return {
          ...habit,
          isCompleted: completion?.completed || false,
          completionId: completion?.id,
          isScheduledForToday: shouldScheduleHabit(habit, date)
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const toggleHabitCompletion = async (habitId: string, date: Date, completed: boolean): Promise<void> => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const existingCompletion = completions.find(
        c => c.habitId === habitId && c.date === formattedDate
      );
      
      if (existingCompletion) {
        setCompletions(prevCompletions => 
          prevCompletions.map(completion => 
            completion.id === existingCompletion.id
              ? { ...completion, completed, completedAt: new Date().toISOString() }
              : completion
          )
        );
      } else {
        const newCompletion: HabitCompletion = {
          id: generateId(),
          habitId,
          date: formattedDate,
          completed,
          completedAt: new Date().toISOString()
        };
        
        setCompletions(prevCompletions => [...prevCompletions, newCompletion]);
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw error;
    }
  };

  const getHabitCompletionRate = (habitId: string): number => {
    const habitCompletions = completions.filter(c => c.habitId === habitId);
    
    if (habitCompletions.length === 0) {
      return 0;
    }
    
    const completedCount = habitCompletions.filter(c => c.completed).length;
    return (completedCount / habitCompletions.length) * 100;
  };

  const contextValue: HabitContextProps = {
    habits,
    completions,
    getTodayHabits,
    getHabitsForDate,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitCompletionRate,
    selectedDate,
    setSelectedDate,
    loading
  };

  return (
    <HabitContext.Provider value={contextValue}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};