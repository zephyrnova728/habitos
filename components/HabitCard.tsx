import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HabitWithStatus } from '@/types/habit';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Clock } from 'lucide-react-native';

interface HabitCardProps {
  habit: HabitWithStatus;
  onPress: () => void;
  onToggleStatus: () => void;
}

export default function HabitCard({ habit, onPress, onToggleStatus }: HabitCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          ...theme.shadows.sm,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text 
          style={[
            styles.name, 
            { 
              color: theme.colors.text,
              textDecorationLine: habit.isCompleted ? 'line-through' : 'none',
              opacity: habit.isCompleted ? 0.7 : 1,
            }
          ]}
        >
          {habit.name}
        </Text>
        
        <View style={styles.timeContainer}>
          <Clock size={14} color={theme.colors.inactive} />
          <Text style={[styles.time, { color: theme.colors.inactive }]}>
            {format(new Date(`2000-01-01T${habit.time}`), 'HH:mm', { locale: ptBR })}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            backgroundColor: habit.isCompleted ? theme.colors.success : 'transparent',
            borderColor: habit.isCompleted ? theme.colors.success : theme.colors.border,
          },
        ]}
        onPress={onToggleStatus}
      >
        {habit.isCompleted && <Check size={16} color="#FFF" strokeWidth={3} />}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    marginLeft: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 