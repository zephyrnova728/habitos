import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { HabitWithStatus } from '@/types/habit';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Clock } from 'lucide-react-native';

interface HabitListProps {
  habits: HabitWithStatus[];
  onToggleStatus: (habitId: string, completed: boolean) => void;
  onHabitPress: (habit: HabitWithStatus) => void;
}

export default function HabitList({ habits, onToggleStatus, onHabitPress }: HabitListProps) {
  const { theme } = useTheme();

  if (habits.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          Sem hábitos para hoje
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.inactive }]}>
          Adicione novos hábitos usando o botão abaixo
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {habits.map((habit) => (
        <TouchableOpacity
          key={habit.id}
          style={[
            styles.habitCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              ...theme.shadows.sm,
            },
          ]}
          onPress={() => onHabitPress(habit)}
          activeOpacity={0.7}
        >
          <View style={styles.habitInfo}>
            <Text style={[styles.habitName, { color: theme.colors.text }]}>
              {habit.name}
            </Text>
            <View style={styles.timeContainer}>
              <Clock size={14} color={theme.colors.inactive} />
              <Text style={[styles.habitTime, { color: theme.colors.inactive }]}>
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
            onPress={() => onToggleStatus(habit.id, !habit.isCompleted)}
          >
            {habit.isCompleted && <Check size={16} color="#FFF" />}
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  habitInfo: {
    flex: 1,
    marginRight: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitTime: {
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