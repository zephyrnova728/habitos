import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { HabitWithStatus } from '@/types/habit';
import HabitItem from './HabitItem';
import EmptyState from './EmptyState';

interface HabitListProps {
  habits: HabitWithStatus[];
  onToggleStatus: (habitId: string, completed: boolean) => void;
  onHabitPress: (habit: HabitWithStatus) => void;
  isHistoryMode?: boolean;
}

const HabitList: React.FC<HabitListProps> = ({ 
  habits, 
  onToggleStatus, 
  onHabitPress,
  isHistoryMode = false 
}) => {
  const { theme } = useTheme();
  
  // Sort habits by time
  const sortedHabits = [...habits].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  if (sortedHabits.length === 0) {
    return (
      <EmptyState
        title={isHistoryMode ? "Sem hábitos neste dia" : "Sem hábitos para hoje"}
        description={isHistoryMode ? "Não há hábitos programados para este dia" : "Adicione novos hábitos usando o botão abaixo"}
      />
    );
  }

  return (
    <FlatList
      data={sortedHabits}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <HabitItem
          habit={item}
          onToggleStatus={(completed) => onToggleStatus(item.id, completed)}
          onPress={() => onHabitPress(item)}
          disabled={isHistoryMode}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
});

export default HabitList;